import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const OWNER_EMAIL = "quissicojr03@gmail.com";
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const GOOGLE_REFRESH_TOKEN = Deno.env.get("GOOGLE_REFRESH_TOKEN");

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get access token: " + JSON.stringify(data));
  return data.access_token;
}

async function createCalendarEvent(record: any, accessToken: string) {
  const [year, month, day] = record.date.split("-").map(Number);
  const [hour, minute] = record.time.split(":").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const event = {
    summary: `BIM Consultation: ${record.name}`,
    description: `Client: ${record.name}\nEmail: ${record.email}\nCompany: ${record.company || "—"}\nNotes: ${record.notes || "—"}\n\nBooked via Klyron Consulting website.`,
    start: { dateTime: start.toISOString(), timeZone: "UTC" },
    end: { dateTime: end.toISOString(), timeZone: "UTC" },
    attendees: [{ email: OWNER_EMAIL }, { email: record.email }],
    conferenceData: {
      createRequest: {
        requestId: `klyron-${record.id || Date.now()}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${OWNER_EMAIL}/events?conferenceDataVersion=1&sendUpdates=none`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(event),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error("Calendar error: " + JSON.stringify(data));
  return data;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

function ownerEmailHtml(record: any, meetLink: string, calendarLink: string): string {
  const meetCode = meetLink.replace("https://", "");
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f8fc;font-family:Google Sans,Roboto,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fc;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.12)">

        <!-- Header -->
        <tr>
          <td style="background:#1a73e8;padding:24px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;color:#ffffff;font-size:13px;font-weight:500;letter-spacing:.5px">KLYRON CONSULTING</p>
                  <h1 style="margin:4px 0 0;color:#ffffff;font-size:22px;font-weight:400">📅 New Meeting Request</h1>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Event Info -->
        <tr>
          <td style="padding:32px 32px 0">
            <h2 style="margin:0 0 4px;font-size:20px;color:#202124;font-weight:500">BIM Consultation: ${record.name}</h2>
            <p style="margin:0;color:#5f6368;font-size:15px">${formatDate(record.date)} · ${record.time} – ${record.time.split(":")[0]}:${String(Number(record.time.split(":")[1]) + 60).padStart(2,"0") === "60" ? String(Number(record.time.split(":")[0]) + 1).padStart(2,"0") + ":00" : record.time} (${record.timezone})</p>
          </td>
        </tr>

        <!-- Meet Button -->
        ${meetLink ? `
        <tr>
          <td style="padding:24px 32px">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1a73e8;border-radius:4px">
                  <a href="${meetLink}" style="display:inline-flex;align-items:center;gap:10px;padding:12px 24px;text-decoration:none">
                    <img src="https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png" width="20" height="20" alt="Meet" style="display:block">
                    <span style="color:#ffffff;font-size:14px;font-weight:500;font-family:Google Sans,Arial,sans-serif">Join with Google Meet</span>
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:8px 0 0;color:#5f6368;font-size:12px">${meetCode}</p>
          </td>
        </tr>` : ""}

        <!-- Divider -->
        <tr><td style="padding:0 32px"><hr style="border:none;border-top:1px solid #e0e0e0;margin:0"></td></tr>

        <!-- Guest Details -->
        <tr>
          <td style="padding:24px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;width:20px;padding-top:2px">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </td>
                <td style="padding-left:12px">
                  <p style="margin:0 0 4px;font-size:14px;color:#202124;font-weight:500">2 guests</p>
                  <p style="margin:0 0 2px;font-size:13px;color:#5f6368">${OWNER_EMAIL} <span style="color:#1a73e8">(organiser)</span></p>
                  <p style="margin:0;font-size:13px;color:#5f6368">${record.email} <span style="color:#f29900">· awaiting</span></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:0 32px"><hr style="border:none;border-top:1px solid #e0e0e0;margin:0"></td></tr>

        <!-- Client Notes -->
        <tr>
          <td style="padding:24px 32px">
            <table width="100%" cellpadding="6" cellspacing="0" style="background:#f8f9fa;border-radius:6px;border:1px solid #e0e0e0">
              <tr><td style="font-size:12px;color:#5f6368;font-weight:500;letter-spacing:.5px">CLIENT DETAILS</td></tr>
              <tr><td style="font-size:14px;color:#202124"><b>Name:</b> ${record.name}</td></tr>
              <tr><td style="font-size:14px;color:#202124"><b>Email:</b> <a href="mailto:${record.email}" style="color:#1a73e8">${record.email}</a></td></tr>
              <tr><td style="font-size:14px;color:#202124"><b>Company:</b> ${record.company || "—"}</td></tr>
              <tr><td style="font-size:14px;color:#202124"><b>Notes:</b> ${record.notes || "—"}</td></tr>
            </table>
          </td>
        </tr>

        <!-- Calendar Link -->
        ${calendarLink ? `
        <tr>
          <td style="padding:0 32px 32px">
            <a href="${calendarLink}" style="color:#1a73e8;font-size:13px;text-decoration:none">Open in Google Calendar →</a>
          </td>
        </tr>` : ""}

        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fa;padding:16px 32px;border-top:1px solid #e0e0e0">
            <p style="margin:0;color:#9aa0a6;font-size:12px">Klyron Consulting · klyronconsulting.com</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function clientEmailHtml(record: any, meetLink: string): string {
  const meetCode = meetLink.replace("https://", "");
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f8fc;font-family:Google Sans,Roboto,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fc;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.12)">

        <!-- Header -->
        <tr>
          <td style="background:#0f9d58;padding:24px 32px">
            <p style="margin:0;color:#ffffff;font-size:13px;font-weight:500;letter-spacing:.5px">KLYRON CONSULTING</p>
            <h1 style="margin:4px 0 0;color:#ffffff;font-size:22px;font-weight:400">✅ Consultation Confirmed</h1>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:32px 32px 0">
            <p style="margin:0;font-size:16px;color:#202124">Hi <b>${record.name}</b>,</p>
            <p style="margin:8px 0 0;color:#5f6368;font-size:14px">Your BIM consultation with Klyron Consulting has been confirmed.</p>
          </td>
        </tr>

        <!-- Event Card -->
        <tr>
          <td style="padding:24px 32px 0">
            <table width="100%" cellpadding="16" cellspacing="0" style="background:#f8f9fa;border-radius:8px;border:1px solid #e0e0e0">
              <tr>
                <td>
                  <p style="margin:0 0 4px;font-size:18px;font-weight:500;color:#202124">BIM Consultation</p>
                  <p style="margin:0;font-size:14px;color:#5f6368">${formatDate(record.date)}</p>
                  <p style="margin:4px 0 0;font-size:14px;color:#5f6368">${record.time} · 1 hour · ${record.timezone}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Meet Button -->
        ${meetLink ? `
        <tr>
          <td style="padding:24px 32px">
            <p style="margin:0 0 12px;font-size:14px;color:#202124;font-weight:500">Join the meeting:</p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1a73e8;border-radius:4px">
                  <a href="${meetLink}" style="display:inline-flex;align-items:center;gap:10px;padding:12px 24px;text-decoration:none">
                    <img src="https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png" width="20" height="20" alt="Meet" style="display:block">
                    <span style="color:#ffffff;font-size:14px;font-weight:500;font-family:Google Sans,Arial,sans-serif">Join with Google Meet</span>
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:8px 0 0;color:#5f6368;font-size:12px">${meetCode}</p>
          </td>
        </tr>` : ""}

        <!-- Divider -->
        <tr><td style="padding:0 32px"><hr style="border:none;border-top:1px solid #e0e0e0;margin:0"></td></tr>

        <!-- Footer note -->
        <tr>
          <td style="padding:24px 32px">
            <p style="margin:0;font-size:13px;color:#5f6368">If you have any questions before the meeting, reply to this email or contact us at <a href="mailto:contact@klyronconsulting.com" style="color:#1a73e8">contact@klyronconsulting.com</a></p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fa;padding:16px 32px;border-top:1px solid #e0e0e0">
            <p style="margin:0;color:#9aa0a6;font-size:12px">Klyron Consulting · klyronconsulting.com</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: "Klyron Consulting <contact@klyronconsulting.com>", to: [to], subject, html }),
  });
}

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;
    if (!record) return new Response(JSON.stringify({ error: "No record" }), { status: 400 });

    const accessToken = await getAccessToken();
    const calendarEvent = await createCalendarEvent(record, accessToken);
    const meetLink = calendarEvent.conferenceData?.entryPoints?.find(
      (ep: any) => ep.entryPointType === "video"
    )?.uri || "";
    const calendarLink = calendarEvent.htmlLink || "";

    await sendEmail(
      OWNER_EMAIL,
      `📅 New Meeting: ${record.name} — ${record.date} at ${record.time}`,
      ownerEmailHtml(record, meetLink, calendarLink)
    );

    await sendEmail(
      record.email,
      `✅ Consultation Confirmed — ${record.date} at ${record.time}`,
      clientEmailHtml(record, meetLink)
    );

    return new Response(JSON.stringify({ success: true, meetLink }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
