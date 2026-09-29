#!/usr/bin/env bash
# Diagnoses and repairs the booking/contact notification pipeline.
#
# Symptoms this fixes: a booking is saved (the site shows "scheduled
# successfully") but no owner email, no client email and no Google Meet
# event are ever produced — because the Edge Functions and/or the database
# triggers that invoke them were never deployed to the project.
#
# Requires SUPABASE_ACCESS_TOKEN (https://supabase.com/dashboard/account/tokens).
# Safe to re-run: every step is idempotent.

set -uo pipefail

PROJECT_REF="${SUPABASE_PROJECT_REF:-uvmdhmvuqznyuzafvsti}"
API="https://api.supabase.com/v1/projects/${PROJECT_REF}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "ERROR: SUPABASE_ACCESS_TOKEN is not set."
  echo "Create one at https://supabase.com/dashboard/account/tokens, then:"
  echo '  export SUPABASE_ACCESS_TOKEN="sbp_..."'
  exit 1
fi

auth=(-H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}")

run_sql() {
  # Runs SQL via the Management API and prints the raw JSON response.
  local sql="$1"
  local payload
  payload=$(node -e 'process.stdout.write(JSON.stringify({query: process.argv[1]}))' "$sql")
  curl -s -X POST "${API}/database/query" \
    "${auth[@]}" \
    -H "Content-Type: application/json" \
    -d "$payload"
}

echo "=============================================="
echo " Project: ${PROJECT_REF}"
echo "=============================================="

echo
echo "--- [1/6] Verifying token and project access ---"
project_info=$(curl -s "https://api.supabase.com/v1/projects" "${auth[@]}")
if echo "$project_info" | grep -q "${PROJECT_REF}"; then
  echo "OK: token can see this project."
  echo "$project_info" | node -e '
    let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{
      try{
        const p=JSON.parse(d).find(x=>x.id===process.argv[1]);
        if(p) console.log(`    name=${p.name} region=${p.region} status=${p.status}`);
      }catch(e){}
    })' "${PROJECT_REF}"
else
  echo "FAILED: token cannot see project ${PROJECT_REF}."
  echo "$project_info" | head -c 400
  exit 1
fi

echo
echo "--- [2/6] Edge Functions currently deployed ---"
functions_json=$(curl -s "${API}/functions" "${auth[@]}")
echo "$functions_json" | node -e '
  let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{
    try{
      const fns=JSON.parse(d);
      if(!Array.isArray(fns)||!fns.length){console.log("    (none deployed)");return;}
      fns.forEach(f=>console.log(`    ${f.slug}  status=${f.status}  verify_jwt=${f.verify_jwt}`));
    }catch(e){console.log("    could not parse:",d.slice(0,300));}
  })'

echo
echo "--- [3/6] Edge Function secrets currently set ---"
secrets_json=$(curl -s "${API}/secrets" "${auth[@]}")
echo "$secrets_json" | node -e '
  let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{
    try{
      const s=JSON.parse(d);
      if(!Array.isArray(s)||!s.length){console.log("    (none set)");return;}
      s.forEach(x=>console.log(`    ${x.name}`));
    }catch(e){console.log("    could not parse:",d.slice(0,300));}
  })'
has_resend=$(echo "$secrets_json" | grep -c "RESEND_API_KEY" || true)
if [ "$has_resend" -eq 0 ]; then
  echo "    >> RESEND_API_KEY is MISSING — emails cannot send without it."
fi

echo
echo "--- [4/6] Database triggers ---"
trigger_result=$(run_sql "select tgname from pg_trigger where tgname in ('on_meeting_request_insert','on_contact_message_insert');")
echo "    $trigger_result"
if echo "$trigger_result" | grep -q "on_meeting_request_insert"; then
  echo "    >> meeting trigger EXISTS"
else
  echo "    >> meeting trigger MISSING — this alone explains zero notifications."
fi

echo
echo "--- [5/6] Deploying Edge Functions ---"
cd "$REPO_ROOT"
for fn in notify-new-meeting notify-new-contact; do
  echo "  deploying ${fn}..."
  supabase functions deploy "$fn" --project-ref "$PROJECT_REF" --use-api 2>&1 | tail -4
done

echo
echo "--- [6/6] Installing database triggers ---"
anon_key=$(curl -s "${API}/api-keys" "${auth[@]}" | node -e '
  let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{
    try{
      const k=JSON.parse(d).find(x=>x.name==="anon");
      process.stdout.write(k?k.api_key:"");
    }catch(e){}
  })')

if [ -z "$anon_key" ]; then
  echo "FAILED: could not retrieve the anon key; triggers not installed."
  exit 1
fi
echo "  anon key retrieved (${#anon_key} chars)"

trigger_sql=$(cat <<SQLEOF
create extension if not exists pg_net with schema extensions;

create or replace function public.notify_new_contact()
returns trigger language plpgsql security definer as \$fn\$
begin
  perform net.http_post(
    url := 'https://${PROJECT_REF}.supabase.co/functions/v1/notify-new-contact',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ${anon_key}'),
    body := jsonb_build_object('record', to_jsonb(NEW))
  );
  return NEW;
end;
\$fn\$;

drop trigger if exists on_contact_message_insert on public.contact_messages;
create trigger on_contact_message_insert
  after insert on public.contact_messages
  for each row execute function public.notify_new_contact();

create or replace function public.notify_new_meeting()
returns trigger language plpgsql security definer as \$fn\$
begin
  perform net.http_post(
    url := 'https://${PROJECT_REF}.supabase.co/functions/v1/notify-new-meeting',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ${anon_key}'),
    body := jsonb_build_object('record', to_jsonb(NEW))
  );
  return NEW;
end;
\$fn\$;

drop trigger if exists on_meeting_request_insert on public.meeting_requests;
create trigger on_meeting_request_insert
  after insert on public.meeting_requests
  for each row execute function public.notify_new_meeting();
SQLEOF
)

install_result=$(run_sql "$trigger_sql")
echo "  $install_result"

echo
echo "--- Verifying triggers after install ---"
run_sql "select tgname from pg_trigger where tgname in ('on_meeting_request_insert','on_contact_message_insert');"
echo
echo "Done. Book a test consultation on the site, then check delivery with:"
echo "  supabase functions logs notify-new-meeting --project-ref ${PROJECT_REF}"
