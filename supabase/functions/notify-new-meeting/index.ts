import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const OWNER_EMAIL = "dilson.quissico@gmail.com";

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record) {
      return new Response(JSON.stringify({ error: "No record" }), { status: 400 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Klyron Consulting <onboarding@resend.dev>",
        to: [OWNER_EMAIL],
        subject: `📅 New Meeting: ${record.name} — ${record.date} at ${record.time}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0F172A;color:#F8FAFC;padding:32px;border-radius:8px;">
            <h2 style="color:#0EA5E9;margin-top:0;">New Meeting Request</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr style="border-bottom:1px solid #1E293B;">
                <td style="padding:12px 8px;color:#94A3B8;width:120px;">Name</td>
                <td style="padding:12px 8px;font-weight:bold;">${record.name}</td>
              </tr>
              <tr style="border-bottom:1px solid #1E293B;">
                <td style="padding:12px 8px;color:#94A3B8;">Email</td>
                <td style="padding:12px 8px;"><a href="mailto:${record.email}" style="color:#0EA5E9;">${record.email}</a></td>
              </tr>
              <tr style="border-bottom:1px solid #1E293B;">
                <td style="padding:12px 8px;color:#94A3B8;">Company</td>
                <td style="padding:12px 8px;">${record.company || "—"}</td>
              </tr>
              <tr style="border-bottom:1px solid #1E293B;">
                <td style="padding:12px 8px;color:#94A3B8;">Date</td>
                <td style="padding:12px 8px;font-weight:bold;color:#22D3EE;">${record.date}</td>
              </tr>
              <tr style="border-bottom:1px solid #1E293B;">
                <td style="padding:12px 8px;color:#94A3B8;">Time</td>
                <td style="padding:12px 8px;font-weight:bold;color:#22D3EE;">${record.time} (${record.timezone})</td>
              </tr>
              <tr>
                <td style="padding:12px 8px;color:#94A3B8;">Notes</td>
                <td style="padding:12px 8px;">${record.notes || "—"}</td>
              </tr>
            </table>
            <p style="color:#64748B;font-size:12px;margin-top:24px;">Submitted via klyronconsulting.com</p>
          </div>
        `,
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
