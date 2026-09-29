# Diagnoses and repairs the booking/contact notification pipeline.
#
# Symptoms this fixes: a booking is saved (the site shows "scheduled
# successfully") but no owner email, no client email and no Google Meet
# event are ever produced.
#
# Requires $env:SUPABASE_ACCESS_TOKEN (https://supabase.com/dashboard/account/tokens).
# Safe to re-run: every step is idempotent.
#
# Usage (PowerShell):
#   $env:SUPABASE_ACCESS_TOKEN = "sbp_..."
#   .\scripts\fix-notifications.ps1

$ErrorActionPreference = "Continue"

$ProjectRef = $env:SUPABASE_PROJECT_REF
if ([string]::IsNullOrWhiteSpace($ProjectRef)) { $ProjectRef = "uvmdhmvuqznyuzafvsti" }

$Api = "https://api.supabase.com/v1/projects/$ProjectRef"
$RepoRoot = Split-Path -Parent $PSScriptRoot

if ([string]::IsNullOrWhiteSpace($env:SUPABASE_ACCESS_TOKEN)) {
    Write-Host "ERROR: SUPABASE_ACCESS_TOKEN is not set." -ForegroundColor Red
    Write-Host 'Create one at https://supabase.com/dashboard/account/tokens, then run:'
    Write-Host '  $env:SUPABASE_ACCESS_TOKEN = "sbp_..."'
    exit 1
}

$Headers = @{ Authorization = "Bearer $($env:SUPABASE_ACCESS_TOKEN)" }

function Invoke-Sql {
    param([string]$Sql)
    $body = @{ query = $Sql } | ConvertTo-Json -Depth 5
    try {
        $r = Invoke-RestMethod -Method Post -Uri "$Api/database/query" -Headers $Headers `
             -ContentType "application/json" -Body $body
        return ($r | ConvertTo-Json -Depth 5 -Compress)
    } catch {
        return "SQL ERROR: $($_.Exception.Message)"
    }
}

Write-Host "=============================================="
Write-Host " Project: $ProjectRef"
Write-Host "=============================================="

Write-Host ""
Write-Host "--- [1/6] Verifying token and project access ---" -ForegroundColor Cyan
try {
    $projects = Invoke-RestMethod -Method Get -Uri "https://api.supabase.com/v1/projects" -Headers $Headers
    $p = $projects | Where-Object { $_.id -eq $ProjectRef }
    if ($p) {
        Write-Host "OK: token can see this project." -ForegroundColor Green
        Write-Host "    name=$($p.name) region=$($p.region) status=$($p.status)"
    } else {
        Write-Host "FAILED: token cannot see project $ProjectRef" -ForegroundColor Red
        Write-Host "    Projects visible: $(($projects | ForEach-Object { $_.id }) -join ', ')"
        exit 1
    }
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "--- [2/6] Edge Functions currently deployed ---" -ForegroundColor Cyan
try {
    $fns = Invoke-RestMethod -Method Get -Uri "$Api/functions" -Headers $Headers
    if (-not $fns -or $fns.Count -eq 0) {
        Write-Host "    (none deployed)"
    } else {
        foreach ($f in $fns) {
            Write-Host "    $($f.slug)  status=$($f.status)  verify_jwt=$($f.verify_jwt)  updated=$($f.updated_at)"
        }
    }
} catch {
    Write-Host "    could not list functions: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "--- [3/6] Edge Function secrets currently set ---" -ForegroundColor Cyan
$hasResend = $false
$hasGoogle = $false
try {
    $secrets = Invoke-RestMethod -Method Get -Uri "$Api/secrets" -Headers $Headers
    if (-not $secrets -or $secrets.Count -eq 0) {
        Write-Host "    (none set)"
    } else {
        foreach ($s in $secrets) {
            Write-Host "    $($s.name)"
            if ($s.name -eq "RESEND_API_KEY") { $hasResend = $true }
            if ($s.name -eq "GOOGLE_REFRESH_TOKEN") { $hasGoogle = $true }
        }
    }
} catch {
    Write-Host "    could not list secrets: $($_.Exception.Message)"
}
if (-not $hasResend) {
    Write-Host "    >> RESEND_API_KEY is MISSING - emails cannot send without it." -ForegroundColor Yellow
}
if (-not $hasGoogle) {
    Write-Host "    >> GOOGLE_REFRESH_TOKEN is MISSING - no Meet link can be created." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "--- [4/6] Database triggers (before) ---" -ForegroundColor Cyan
$before = Invoke-Sql "select tgname from pg_trigger where tgname in ('on_meeting_request_insert','on_contact_message_insert');"
Write-Host "    $before"
if ($before -match "on_meeting_request_insert") {
    Write-Host "    >> meeting trigger EXISTS" -ForegroundColor Green
} else {
    Write-Host "    >> meeting trigger MISSING - this alone explains zero notifications." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "--- [5/6] Deploying Edge Functions ---" -ForegroundColor Cyan
Push-Location $RepoRoot
foreach ($fn in @("notify-new-meeting", "notify-new-contact")) {
    Write-Host "  deploying $fn ..."
    supabase functions deploy $fn --project-ref $ProjectRef --use-api
}
Pop-Location

Write-Host ""
Write-Host "--- [6/6] Installing database triggers ---" -ForegroundColor Cyan
$anonKey = ""
try {
    $keys = Invoke-RestMethod -Method Get -Uri "$Api/api-keys" -Headers $Headers
    $anon = $keys | Where-Object { $_.name -eq "anon" }
    if ($anon) { $anonKey = $anon.api_key }
} catch {
    Write-Host "    could not fetch api keys: $($_.Exception.Message)" -ForegroundColor Red
}

if ([string]::IsNullOrWhiteSpace($anonKey)) {
    Write-Host "FAILED: could not retrieve the anon key; triggers not installed." -ForegroundColor Red
    exit 1
}
Write-Host "  anon key retrieved ($($anonKey.Length) chars)"

# Placeholders are substituted rather than interpolated so the plpgsql
# $fn$ delimiters survive untouched.
$triggerTemplate = @'
create extension if not exists pg_net with schema extensions;

create or replace function public.notify_new_contact()
returns trigger language plpgsql security definer as $fn$
begin
  perform net.http_post(
    url := 'https://__REF__.supabase.co/functions/v1/notify-new-contact',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer __ANON__'),
    body := jsonb_build_object('record', to_jsonb(NEW))
  );
  return NEW;
end;
$fn$;

drop trigger if exists on_contact_message_insert on public.contact_messages;
create trigger on_contact_message_insert
  after insert on public.contact_messages
  for each row execute function public.notify_new_contact();

create or replace function public.notify_new_meeting()
returns trigger language plpgsql security definer as $fn$
begin
  perform net.http_post(
    url := 'https://__REF__.supabase.co/functions/v1/notify-new-meeting',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer __ANON__'),
    body := jsonb_build_object('record', to_jsonb(NEW))
  );
  return NEW;
end;
$fn$;

drop trigger if exists on_meeting_request_insert on public.meeting_requests;
create trigger on_meeting_request_insert
  after insert on public.meeting_requests
  for each row execute function public.notify_new_meeting();
'@

$triggerSql = $triggerTemplate.Replace("__REF__", $ProjectRef).Replace("__ANON__", $anonKey)
$installResult = Invoke-Sql $triggerSql
Write-Host "  $installResult"

Write-Host ""
Write-Host "--- Verifying triggers after install ---" -ForegroundColor Cyan
$after = Invoke-Sql "select tgname from pg_trigger where tgname in ('on_meeting_request_insert','on_contact_message_insert');"
Write-Host "    $after"

Write-Host ""
Write-Host "Done. Book a test consultation on the site, then check delivery with:" -ForegroundColor Green
Write-Host "  supabase functions logs notify-new-meeting --project-ref $ProjectRef"
