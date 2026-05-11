import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const OWNER_EMAIL = "contact@klyronconsulting.com";

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record) {
      return new Response(JSON.stringify({ error: "No record" }), { status: 400 });
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>New Contact Message</title>
</head>
<body style="margin:0;padding:0;background:#F1F3F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F3F4;padding:24px 16px">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">

    <!-- Brand -->
    <tr>
      <td style="padding:0 0 16px">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:#0F172A;border-radius:8px;padding:10px 18px">
              <span style="color:#0EA5E9;font-size:18px;font-weight:700;letter-spacing:1px">KLYRON</span><span style="color:#22D3EE;font-size:18px;font-weight:700">.</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Main Card -->
    <tr>
      <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0F172A 0%,#1E3A5F 100%);padding:28px 32px">
            <div style="display:inline-block;background:rgba(14,165,233,0.15);border:1px solid rgba(14,165,233,0.3);border-radius:20px;padding:4px 12px;margin-bottom:10px">
              <span style="color:#0EA5E9;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase">New Message</span>
            </div>
            <h1 style="margin:0;color:#F8FAFC;font-size:22px;font-weight:700">✉️ ${record.name} sent a message</h1>
            <p style="margin:6px 0 0;color:#94A3B8;font-size:13px">${record.company ? record.company + " · " : ""}${record.email}</p>
          </td>
        </tr>

        <!-- Message Box -->
        <tr>
          <td style="padding:28px 32px 0">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:1.5px;text-transform:uppercase">Message</p>
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#F8FAFC;border-radius:12px;border-left:4px solid #0EA5E9;border:1px solid #E2E8F0;border-left:4px solid #0EA5E9">
              <tr>
                <td style="padding:20px 20px 20px 20px">
                  <p style="margin:0;font-size:15px;color:#1E293B;line-height:1.7">${record.message}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Sender Details -->
        <tr>
          <td style="padding:24px 32px 0">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:1.5px;text-transform:uppercase">Sender</p>
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#F8FAFC;border-radius:10px;border:1px solid #E2E8F0;overflow:hidden">
              <tr style="border-bottom:1px solid #E2E8F0">
                <td style="padding:10px 16px;font-size:13px;color:#64748B;width:90px">Name</td>
                <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#1E293B">${record.name}</td>
              </tr>
              <tr style="border-bottom:1px solid #E2E8F0">
                <td style="padding:10px 16px;font-size:13px;color:#64748B">Email</td>
                <td style="padding:10px 16px;font-size:13px"><a href="mailto:${record.email}" style="color:#0EA5E9;text-decoration:none;font-weight:500">${record.email}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 16px;font-size:13px;color:#64748B">Company</td>
                <td style="padding:10px 16px;font-size:13px;color:#1E293B">${record.company || "—"}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Reply Button -->
        <tr>
          <td style="padding:24px 32px 28px">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#0F172A;border-radius:8px">
                  <a href="mailto:${record.email}?subject=Re: Your message to Klyron Consulting" style="display:inline-block;padding:12px 24px;text-decoration:none">
                    <span style="color:#0EA5E9;font-size:14px;font-weight:600">↩ Reply to ${record.name}</span>
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px 0 0;text-align:center">
        <p style="margin:0;font-size:12px;color:#94A3B8">Klyron Consulting · <a href="https://klyronconsulting.com" style="color:#94A3B8">klyronconsulting.com</a></p>
      </td>
    </tr>

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
        subject: `✉️ New Message from ${record.name}${record.company ? " · " + record.company : ""}`,
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
