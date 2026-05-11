import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const OWNER_EMAIL = "contact@klyronconsulting.com";
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
    attendees: [{ email: "quissicojr03@gmail.com" }, { email: record.email }],
    conferenceData: {
      createRequest: {
        requestId: `klyron-${record.id || Date.now()}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/quissicojr03@gmail.com/events?conferenceDataVersion=1&sendUpdates=none`,
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

function endTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const endH = h + 1;
  return `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function ownerEmailHtml(record: any, meetLink: string, calendarLink: string): string {
  const meetCode = meetLink ? meetLink.replace("https://", "") : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>New Meeting Request</title>
</head>
<body style="margin:0;padding:0;background:#F1F3F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F3F4;padding:24px 16px">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">

    <!-- Logo / Brand -->
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

        <!-- Header Banner -->
        <tr>
          <td style="background:linear-gradient(135deg,#0F172A 0%,#1E3A5F 100%);padding:32px 32px 28px">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <div style="display:inline-block;background:rgba(14,165,233,0.15);border:1px solid rgba(14,165,233,0.3);border-radius:20px;padding:4px 12px;margin-bottom:12px">
                    <span style="color:#0EA5E9;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase">New Booking</span>
                  </div>
                  <h1 style="margin:0;color:#F8FAFC;font-size:24px;font-weight:700;line-height:1.3">📅 ${record.name} booked a consultation</h1>
                  <p style="margin:8px 0 0;color:#94A3B8;font-size:14px">${formatDate(record.date)} · ${record.time} – ${endTime(record.time)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Meet Button Section -->
        ${meetLink ? `
        <tr>
          <td style="padding:28px 32px 0">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1a73e8;border-radius:10px;box-shadow:0 4px 12px rgba(26,115,232,0.35)">
                  <a href="${meetLink}" style="display:inline-table;text-decoration:none;padding:14px 28px">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:10px">
                          <img src="https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png" width="22" height="22" alt="Meet" style="display:block">
                        </td>
                        <td style="vertical-align:middle">
                          <span style="color:#ffffff;font-size:15px;font-weight:600">Join with Google Meet</span>
                        </td>
                      </tr>
                    </table>
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:8px 0 0;color:#94A3B8;font-size:12px">${meetCode}</p>
          </td>
        </tr>` : ""}

        <!-- Divider -->
        <tr><td style="padding:24px 32px 0"><div style="height:1px;background:#F1F3F4"></div></td></tr>

        <!-- Guest Info -->
        <tr>
          <td style="padding:20px 32px 0">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding-right:12px;vertical-align:top;padding-top:2px;width:20px">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </td>
                <td>
                  <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#374151">2 guests</p>
                  <p style="margin:0 0 2px;font-size:13px;color:#6B7280">contact@klyronconsulting.com <span style="color:#0EA5E9;font-weight:500">organiser</span></p>
                  <p style="margin:0;font-size:13px;color:#6B7280">${record.email} <span style="color:#F59E0B;font-weight:500">awaiting</span></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:20px 32px 0"><div style="height:1px;background:#F1F3F4"></div></td></tr>

        <!-- Client Details -->
        <tr>
          <td style="padding:20px 32px">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:1.5px;text-transform:uppercase">Client Details</p>
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#F8FAFC;border-radius:10px;border:1px solid #E2E8F0;overflow:hidden">
              <tr style="border-bottom:1px solid #E2E8F0">
                <td style="padding:10px 16px;font-size:13px;color:#64748B;width:90px">Name</td>
                <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#1E293B">${record.name}</td>
              </tr>
              <tr style="border-bottom:1px solid #E2E8F0">
                <td style="padding:10px 16px;font-size:13px;color:#64748B">Email</td>
                <td style="padding:10px 16px;font-size:13px"><a href="mailto:${record.email}" style="color:#0EA5E9;text-decoration:none;font-weight:500">${record.email}</a></td>
              </tr>
              <tr style="border-bottom:1px solid #E2E8F0">
                <td style="padding:10px 16px;font-size:13px;color:#64748B">Company</td>
                <td style="padding:10px 16px;font-size:13px;color:#1E293B">${record.company || "—"}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;font-size:13px;color:#64748B;vertical-align:top">Notes</td>
                <td style="padding:10px 16px;font-size:13px;color:#1E293B;line-height:1.5">${record.notes || "—"}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Calendar Link -->
        ${calendarLink ? `
        <tr>
          <td style="padding:0 32px 28px">
            <a href="${calendarLink}" style="display:inline-flex;align-items:center;gap:6px;color:#0EA5E9;font-size:13px;font-weight:500;text-decoration:none;border:1px solid #E0F2FE;border-radius:8px;padding:8px 14px;background:#F0F9FF">
              <span>📆</span> Open in Google Calendar
            </a>
          </td>
        </tr>` : ""}

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
}

function clientEmailHtml(record: any, meetLink: string): string {
  const meetCode = meetLink ? meetLink.replace("https://", "") : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Consultation Confirmed</title>
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
          <td style="background:linear-gradient(135deg,#064E3B 0%,#065F46 100%);padding:32px 32px 28px;text-align:center">
            <div style="width:56px;height:56px;background:rgba(52,211,153,0.2);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:28px;line-height:56px">✅</div>
            <h1 style="margin:0;color:#F8FAFC;font-size:22px;font-weight:700">Consultation Confirmed!</h1>
            <p style="margin:8px 0 0;color:#6EE7B7;font-size:14px">We look forward to speaking with you</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:28px 32px 0">
            <p style="margin:0;font-size:15px;color:#374151">Hi <strong>${record.name}</strong>,</p>
            <p style="margin:8px 0 0;font-size:14px;color:#6B7280;line-height:1.6">Your BIM consultation with <strong>Klyron Consulting</strong> has been scheduled. Here are your meeting details:</p>
          </td>
        </tr>

        <!-- Event Card -->
        <tr>
          <td style="padding:20px 32px 0">
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#F8FAFC;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden">
              <tr>
                <td style="padding:20px 20px 16px;border-bottom:1px solid #E2E8F0">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-right:12px;font-size:28px;vertical-align:top">📅</td>
                      <td>
                        <p style="margin:0;font-size:16px;font-weight:700;color:#1E293B">BIM Consultation</p>
                        <p style="margin:4px 0 0;font-size:13px;color:#64748B">${formatDate(record.date)}</p>
                        <p style="margin:2px 0 0;font-size:13px;color:#64748B">${record.time} – ${endTime(record.time)} · ${record.timezone}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${record.notes ? `
              <tr>
                <td style="padding:14px 20px">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#94A3B8;letter-spacing:1px;text-transform:uppercase">Your Notes</p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.5">${record.notes}</p>
                </td>
              </tr>` : ""}
            </table>
          </td>
        </tr>

        <!-- Meet Button -->
        ${meetLink ? `
        <tr>
          <td style="padding:24px 32px 0;text-align:center">
            <p style="margin:0 0 14px;font-size:13px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:1px">Join Your Meeting</p>
            <table cellpadding="0" cellspacing="0" align="center">
              <tr>
                <td style="background:#1a73e8;border-radius:12px;box-shadow:0 6px 20px rgba(26,115,232,0.4)">
                  <a href="${meetLink}" style="display:inline-table;text-decoration:none;padding:16px 36px">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:10px">
                          <img src="https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png" width="24" height="24" alt="Meet" style="display:block">
                        </td>
                        <td style="vertical-align:middle">
                          <span style="color:#ffffff;font-size:16px;font-weight:700">Join with Google Meet</span>
                        </td>
                      </tr>
                    </table>
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:10px 0 0;color:#94A3B8;font-size:12px">${meetCode}</p>
          </td>
        </tr>` : ""}

        <!-- Info Box -->
        <tr>
          <td style="padding:24px 32px">
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#EFF6FF;border-radius:10px;border:1px solid #BFDBFE">
              <tr>
                <td style="padding:14px 16px">
                  <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1D4ED8">💡 Before the meeting</p>
                  <p style="margin:0;font-size:13px;color:#3B82F6;line-height:1.6">Save the Google Meet link above. You can join from any device — computer, tablet or phone. No download required.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Contact -->
        <tr>
          <td style="padding:0 32px 28px;border-top:1px solid #F1F3F4">
            <p style="margin:16px 0 0;font-size:13px;color:#6B7280">Questions? Reply to this email or contact us at <a href="mailto:contact@klyronconsulting.com" style="color:#0EA5E9;text-decoration:none;font-weight:500">contact@klyronconsulting.com</a></p>
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
      `📅 New Booking: ${record.name} — ${record.date} at ${record.time}`,
      ownerEmailHtml(record, meetLink, calendarLink)
    );

    await sendEmail(
      record.email,
      `✅ Consultation Confirmed — ${record.date} at ${record.time} · Klyron Consulting`,
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
