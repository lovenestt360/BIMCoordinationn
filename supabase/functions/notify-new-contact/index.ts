import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const OWNER_EMAIL = "contact@klyronconsulting.com";

const BASE_CSS = `
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
  img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}
  a{text-decoration:none}
  @media only screen and (max-width:600px){
    .wrap{padding:10px 8px!important}
    .card-pad{padding:22px 16px!important}
    .btn-a{display:block!important;padding:14px 16px!important;text-align:center!important;box-sizing:border-box!important}
    .btn-cell{width:100%!important;display:block!important}
    .fl{display:block!important;width:100%!important;text-align:center!important;padding:0 0 14px!important;border-right:none!important}
    .fr{display:block!important;width:100%!important;text-align:center!important;padding-left:0!important}
    .h1{font-size:20px!important;line-height:1.3!important}
  }
`;

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record) {
      return new Response(JSON.stringify({ error: "No record" }), { status: 400 });
    }

    const html = `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>New Contact Message</title>
<style>${BASE_CSS}</style>
</head>
<body style="margin:0;padding:0;background:#0F172A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
<div style="display:none;font-size:1px;color:#0F172A;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">New message from ${record.name}${record.company ? " · " + record.company : ""} — ${record.email}</div>

<table class="wrap" width="100%" cellpadding="0" cellspacing="0" style="background:#0F172A;padding:14px 10px">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" style="width:100%;max-width:600px">

  <!-- Top bar -->
  <tr><td style="padding:0 0 12px">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:11px;color:#475569;font-family:Arial,sans-serif">Official&nbsp;|&nbsp;Klyron Consulting</td>
      <td align="right"><a href="#" style="font-size:11px;color:#475569;text-decoration:none;font-family:Arial,sans-serif">View in browser</a></td>
    </tr></table>
  </td></tr>

  <!-- Logo -->
  <tr><td style="padding:0 0 18px;text-align:center">
    <p style="margin:0;font-size:24px;font-weight:800;letter-spacing:3px;color:#F8FAFC;line-height:1;font-family:Arial,sans-serif">KLYRON<span style="color:#22D3EE">.</span></p>
    <p style="margin:2px 0 0;font-size:9px;font-weight:700;letter-spacing:4px;color:#64748B;text-transform:uppercase;font-family:Arial,sans-serif">CONSULTING</p>
  </td></tr>

  <!-- Main Card -->
  <tr><td style="background:#1E293B;border-radius:16px;overflow:hidden;border:1px solid #334155">
  <table width="100%" cellpadding="0" cellspacing="0">

    <!-- Header -->
    <tr><td class="card-pad" style="padding:28px 30px;background:linear-gradient(135deg,#0F172A 0%,#1E3A5F 100%);border-bottom:1px solid #334155">
      <div style="display:inline-block;background:rgba(14,165,233,0.1);border:1px solid rgba(14,165,233,0.28);border-radius:20px;padding:4px 12px;margin-bottom:12px">
        <span style="color:#0EA5E9;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;font-family:Arial,sans-serif">New Message</span>
      </div>
      <h1 class="h1" style="margin:0 0 6px;color:#F8FAFC;font-size:22px;font-weight:700;line-height:1.3;font-family:Arial,sans-serif">&#9993; ${record.name} sent a message</h1>
      <p style="margin:0;font-size:13px;color:#94A3B8;font-family:Arial,sans-serif">${record.company ? record.company + " &middot; " : ""}${record.email}</p>
    </td></tr>

    <!-- Message -->
    <tr><td class="card-pad" style="padding:24px 30px 0">
      <p style="margin:0 0 10px;font-size:10px;font-weight:700;color:#475569;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif">Message</p>
      <table cellpadding="0" cellspacing="0" width="100%" style="background:#0F172A;border-radius:10px;border:1px solid #334155;border-left:4px solid #0EA5E9;overflow:hidden">
        <tr><td style="padding:18px">
          <p style="margin:0;font-size:14px;color:#CBD5E1;line-height:1.7;font-family:Arial,sans-serif">${record.message}</p>
        </td></tr>
      </table>
    </td></tr>

    <!-- Sender Details -->
    <tr><td class="card-pad" style="padding:22px 30px 0">
      <p style="margin:0 0 10px;font-size:10px;font-weight:700;color:#475569;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif">Sender</p>
      <table cellpadding="0" cellspacing="0" width="100%" style="background:#0F172A;border-radius:10px;border:1px solid #334155;overflow:hidden">
        <tr style="border-bottom:1px solid #334155">
          <td style="padding:10px 14px;font-size:13px;color:#64748B;width:80px;font-family:Arial,sans-serif">Name</td>
          <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#F8FAFC;font-family:Arial,sans-serif">${record.name}</td>
        </tr>
        <tr style="border-bottom:1px solid #334155">
          <td style="padding:10px 14px;font-size:13px;color:#64748B;font-family:Arial,sans-serif">Email</td>
          <td style="padding:10px 14px;font-size:13px;font-family:Arial,sans-serif"><a href="mailto:${record.email}" style="color:#22D3EE;text-decoration:none;font-weight:500">${record.email}</a></td>
        </tr>
        <tr>
          <td style="padding:10px 14px;font-size:13px;color:#64748B;font-family:Arial,sans-serif">Company</td>
          <td style="padding:10px 14px;font-size:13px;color:#CBD5E1;font-family:Arial,sans-serif">${record.company || "&#8212;"}</td>
        </tr>
      </table>
    </td></tr>

    <!-- Reply Button -->
    <tr><td class="card-pad" style="padding:22px 30px 28px">
      <table cellpadding="0" cellspacing="0" class="btn-cell">
        <tr>
          <td class="btn-cell" style="background:#0F172A;border:1px solid #334155;border-radius:8px">
            <a href="mailto:${record.email}?subject=Re: Your message to Klyron Consulting" class="btn-a" style="display:inline-block;padding:12px 22px;text-decoration:none">
              <span style="color:#0EA5E9;font-size:14px;font-weight:600;font-family:Arial,sans-serif">&#8617; Reply to ${record.name}</span>
            </a>
          </td>
        </tr>
      </table>
    </td></tr>

  </table>
  </td></tr>

  <!-- Footer Card -->
  <tr><td style="padding:18px 0 6px">
    <table cellpadding="0" cellspacing="0" width="100%" style="background:#1E293B;border-radius:12px;border:1px solid #334155">
      <tr><td style="padding:18px 22px">
        <table cellpadding="0" cellspacing="0" width="100%"><tr>
          <td class="fl" style="vertical-align:middle;padding-right:18px;border-right:1px solid #334155;width:1%;white-space:nowrap">
            <p style="margin:0;font-size:19px;font-weight:800;color:#F8FAFC;letter-spacing:2px;line-height:1;font-family:Arial,sans-serif">KLYRON<span style="color:#22D3EE">.</span></p>
            <p style="margin:2px 0 0;font-size:9px;font-weight:700;letter-spacing:3px;color:#64748B;text-transform:uppercase;font-family:Arial,sans-serif">CONSULTING</p>
          </td>
          <td class="fr" style="vertical-align:middle;padding-left:18px">
            <p style="margin:0 0 4px;font-size:12px;color:#64748B;font-family:Arial,sans-serif">&#9993; <a href="mailto:contact@klyronconsulting.com" style="color:#64748B;text-decoration:none">contact@klyronconsulting.com</a></p>
            <p style="margin:0 0 4px;font-size:12px;color:#64748B;font-family:Arial,sans-serif">&#127758; <a href="https://klyronconsulting.com" style="color:#64748B;text-decoration:none">klyronconsulting.com</a></p>
            <p style="margin:0;font-size:12px;color:#64748B;font-family:Arial,sans-serif">in&nbsp;LinkedIn: Klyron Consulting</p>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:10px 22px 14px;border-top:1px solid #334155;text-align:center">
        <p style="margin:0;font-size:12px;font-weight:600;color:#22C55E;font-family:Arial,sans-serif">Precision Before, During &amp; Beyond Construction.</p>
      </td></tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "Klyron Consulting <contact@klyronconsulting.com>",
        to: [OWNER_EMAIL],
        subject: `&#9993; New Message from ${record.name}${record.company ? " · " + record.company : ""}`,
        html,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
