import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const OWNER_EMAIL = "contact@klyronconsulting.com";
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const GOOGLE_REFRESH_TOKEN = Deno.env.get("GOOGLE_REFRESH_TOKEN");

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

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
  return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const BASE_CSS = `
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
  img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}
  a{text-decoration:none}
  @media only screen and (max-width:600px){
    .wrap{padding:10px 8px!important}
    .card-pad{padding:22px 16px!important}
    .hero-pad{padding:30px 16px!important}
    .btn-wrap{width:100%!important}
    .btn-cell{width:100%!important;display:block!important}
    .btn-a{display:block!important;padding:15px 16px!important;text-align:center!important;box-sizing:border-box!important}
    .stack{display:block!important;width:100%!important;padding:3px 0!important;border-left:none!important}
    .cal-icon{display:block!important;width:100%!important;text-align:center!important;padding:0 0 12px!important}
    .cal-info{display:block!important;width:100%!important;text-align:center!important}
    .fl{display:block!important;width:100%!important;text-align:center!important;padding:0 0 14px!important;border-right:none!important}
    .fr{display:block!important;width:100%!important;text-align:center!important;padding-left:0!important}
    .h1{font-size:22px!important;line-height:1.3!important}
    .h1g{font-size:22px!important;line-height:1.3!important}
    body,.wrap{background-color:#0F172A!important}
  }
`;

function topBar(): string {
  return `<tr><td style="padding:0 0 12px">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:11px;color:#475569;font-family:Arial,sans-serif">Official&nbsp;|&nbsp;Klyron Consulting</td>
      <td align="right"><a href="#" style="font-size:11px;color:#475569;text-decoration:none;font-family:Arial,sans-serif">View in browser</a></td>
    </tr></table>
  </td></tr>`;
}

function logoRow(): string {
  return `<tr><td style="padding:0 0 18px;text-align:center">
    <p style="margin:0;font-size:24px;font-weight:800;letter-spacing:3px;color:#F8FAFC;line-height:1;font-family:Arial,sans-serif">KLYRON<span style="color:#22D3EE">.</span></p>
    <p style="margin:2px 0 0;font-size:9px;font-weight:700;letter-spacing:4px;color:#64748B;text-transform:uppercase;font-family:Arial,sans-serif">CONSULTING</p>
  </td></tr>`;
}

function footerCard(): string {
  return `<tr><td style="padding:18px 0 6px">
    <table cellpadding="0" cellspacing="0" width="100%" style="background:#1E293B;border-radius:12px;border:1px solid #334155">
      <tr><td style="padding:18px 22px">
        <table cellpadding="0" cellspacing="0" width="100%"><tr>
          <td class="fl" style="vertical-align:middle;padding-right:18px;border-right:1px solid #334155;width:1%;white-space:nowrap">
            <p style="margin:0;font-size:19px;font-weight:800;color:#F8FAFC;letter-spacing:2px;line-height:1;font-family:Arial,sans-serif">KLYRON<span style="color:#22D3EE">.</span></p>
            <p style="margin:2px 0 0;font-size:9px;font-weight:700;letter-spacing:3px;color:#64748B;text-transform:uppercase;font-family:Arial,sans-serif">CONSULTING</p>
          </td>
          <td class="fr" style="vertical-align:middle;padding-left:18px">
            <p style="margin:0 0 4px;font-size:12px;color:#64748B;font-family:Arial,sans-serif">&#9993; <a href="mailto:contact@klyronconsulting.com" style="color:#64748B;text-decoration:none">contact@klyronconsulting.com</a></p>
            <p style="margin:0 0 4px;font-size:12px;color:#64748B;font-family:Arial,sans-serif">&#127758; <a href="https://www.klyronconsulting.com" style="color:#64748B;text-decoration:none">www.klyronconsulting.com</a></p>
            <p style="margin:0;font-size:12px;color:#64748B;font-family:Arial,sans-serif"><a href="https://www.linkedin.com/company/klyron-consulting" style="text-decoration:none;color:#64748B"><span style="display:inline-block;background:#0A66C2;border-radius:3px;padding:1px 5px 2px;font-size:12px;font-weight:800;color:#fff;font-family:Arial,sans-serif;line-height:1.5;vertical-align:middle;margin-right:5px">in</span>Klyron Consulting</a></p>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:10px 22px 14px;border-top:1px solid #334155;text-align:center">
        <p style="margin:0;font-size:12px;font-weight:600;color:#22C55E;font-family:Arial,sans-serif">Precision Before, During &amp; Beyond Construction.</p>
      </td></tr>
    </table>
  </td></tr>`;
}

function meetBtn(meetLink: string, meetCode: string, center = false): string {
  if (!meetLink) return "";
  const align = center ? "center" : "left";
  return `<table cellpadding="0" cellspacing="0" width="100%">
    <tr><td align="${align}">
      <table cellpadding="0" cellspacing="0" class="btn-wrap">
        <tr>
          <td class="btn-cell" style="background:#1a73e8;border-radius:10px;box-shadow:0 4px 16px rgba(26,115,232,0.4)">
            <a href="${meetLink}" class="btn-a" style="display:inline-table;text-decoration:none;padding:14px 28px">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:middle;padding-right:10px">
                  <img src="https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png" width="22" height="22" alt="Meet" style="display:block">
                </td>
                <td style="vertical-align:middle">
                  <span style="color:#fff;font-size:15px;font-weight:700;font-family:Arial,sans-serif">Join with Google Meet</span>
                </td>
              </tr></table>
            </a>
          </td>
        </tr>
      </table>
    </td></tr>
    <tr><td align="${align}" style="padding-top:8px">
      <a href="${meetLink}" style="font-size:12px;color:#22D3EE;text-decoration:none;font-family:Arial,sans-serif">${meetCode}</a>
    </td></tr>
  </table>`;
}

function ownerEmailHtml(record: any, meetLink: string, calendarLink: string): string {
  const meetCode = meetLink ? meetLink.replace("https://", "") : "";
  const fullDate = formatDate(record.date);
  const tz = record.timezone || "UTC";

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>New Meeting Booking</title>
<style>${BASE_CSS}</style>
</head>
<body bgcolor="#0F172A" style="margin:0;padding:0;background:#0F172A;background-color:#0F172A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
<div style="display:none;font-size:1px;color:#0F172A;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">New booking from ${record.name} — ${fullDate} at ${record.time}</div>

<table class="wrap" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0F172A" style="background:#0F172A;background-color:#0F172A;padding:14px 10px">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" style="width:100%;max-width:600px">

  ${topBar()}
  ${logoRow()}

  <!-- Main Card -->
  <tr><td style="background:#1E293B;border-radius:16px;overflow:hidden;border:1px solid #334155">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td class="card-pad" style="padding:28px 30px">

      <!-- Badge -->
      <div style="display:inline-block;background:rgba(34,211,238,0.08);border:1px solid rgba(34,211,238,0.25);border-radius:20px;padding:4px 12px;margin-bottom:14px">
        <span style="color:#22D3EE;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;font-family:Arial,sans-serif">New Booking</span>
      </div>

      <!-- Heading -->
      <h1 class="h1" style="margin:0 0 16px;color:#F8FAFC;font-size:24px;font-weight:700;line-height:1.3;font-family:Arial,sans-serif">${record.name} booked a consultation</h1>

      <!-- Date / Time / Timezone row -->
      <table cellpadding="0" cellspacing="0" style="margin-bottom:22px">
        <tr>
          <td class="stack" style="padding-right:14px;white-space:nowrap">
            <span style="font-size:13px;color:#94A3B8;font-family:Arial,sans-serif">&#128197; ${fullDate}</span>
          </td>
          <td class="stack" style="padding:0 14px;border-left:1px solid #334155;white-space:nowrap">
            <span style="font-size:13px;color:#94A3B8;font-family:Arial,sans-serif">&#128336; ${record.time} &#8211; ${endTime(record.time)}</span>
          </td>
          <td class="stack" style="padding-left:14px;border-left:1px solid #334155;white-space:nowrap">
            <span style="font-size:13px;color:#94A3B8;font-family:Arial,sans-serif">&#127758; ${tz}</span>
          </td>
        </tr>
      </table>

      <!-- Meet button -->
      ${meetLink ? `${meetBtn(meetLink, meetCode)}<div style="height:1px;background:#334155;margin:22px 0"></div>` : `<div style="height:1px;background:#334155;margin:0 0 22px"></div>`}

      <!-- Guests -->
      <table cellpadding="0" cellspacing="0" style="margin-bottom:6px">
        <tr>
          <td style="padding-right:10px;vertical-align:top;padding-top:2px">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </td>
          <td>
            <p style="margin:0 0 7px;font-size:13px;font-weight:600;color:#CBD5E1;font-family:Arial,sans-serif">2 guests</p>
            <p style="margin:0 0 5px;font-size:13px;color:#94A3B8;font-family:Arial,sans-serif">
              contact@klyronconsulting.com&nbsp;
              <span style="display:inline-block;background:rgba(34,211,238,0.1);border:1px solid rgba(34,211,238,0.28);border-radius:4px;padding:1px 7px;font-size:10px;font-weight:700;color:#22D3EE;letter-spacing:0.5px;text-transform:uppercase">Organiser</span>
            </p>
            <p style="margin:0;font-size:13px;color:#94A3B8;font-family:Arial,sans-serif">
              ${record.email}&nbsp;
              <span style="display:inline-block;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.28);border-radius:4px;padding:1px 7px;font-size:10px;font-weight:700;color:#F59E0B;letter-spacing:0.5px;text-transform:uppercase">Awaiting</span>
            </p>
          </td>
        </tr>
      </table>

      <div style="height:1px;background:#334155;margin:20px 0"></div>

      <!-- Client Details -->
      <p style="margin:0 0 12px;font-size:10px;font-weight:700;color:#475569;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif">Client Details</p>
      <table cellpadding="0" cellspacing="0" width="100%" style="background:#0F172A;border-radius:10px;border:1px solid #334155;overflow:hidden;margin-bottom:20px">
        <tr style="border-bottom:1px solid #334155">
          <td style="padding:10px 14px;font-size:13px;color:#64748B;width:85px;font-family:Arial,sans-serif">Name</td>
          <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#F8FAFC;font-family:Arial,sans-serif">${record.name}</td>
        </tr>
        <tr style="border-bottom:1px solid #334155">
          <td style="padding:10px 14px;font-size:13px;color:#64748B;font-family:Arial,sans-serif">Email</td>
          <td style="padding:10px 14px;font-size:13px;font-family:Arial,sans-serif"><a href="mailto:${record.email}" style="color:#22D3EE;text-decoration:none;font-weight:500">${record.email}</a></td>
        </tr>
        <tr style="border-bottom:1px solid #334155">
          <td style="padding:10px 14px;font-size:13px;color:#64748B;font-family:Arial,sans-serif">Company</td>
          <td style="padding:10px 14px;font-size:13px;color:#CBD5E1;font-family:Arial,sans-serif">${record.company || "&#8212;"}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;font-size:13px;color:#64748B;vertical-align:top;font-family:Arial,sans-serif">Notes</td>
          <td style="padding:10px 14px;font-size:13px;color:#CBD5E1;line-height:1.5;font-family:Arial,sans-serif">${record.notes || "&#8212;"}</td>
        </tr>
      </table>

      ${calendarLink ? `<a href="${calendarLink}" style="display:inline-block;font-size:13px;color:#22D3EE;text-decoration:none;font-weight:500;font-family:Arial,sans-serif">&#128198; Open in Google Calendar</a>` : ""}

    </td></tr>
  </table>
  </td></tr>

  ${footerCard()}

</table>
</td></tr>
</table>
</body>
</html>`;
}

function clientEmailHtml(record: any, meetLink: string): string {
  const meetCode = meetLink ? meetLink.replace("https://", "") : "";
  const [,month, day] = record.date.split("-").map(Number);
  const monthStr = MONTHS[month - 1];
  const fullDate = formatDate(record.date);
  const tz = record.timezone || "UTC";

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>Consultation Confirmed</title>
<style>${BASE_CSS}</style>
</head>
<body bgcolor="#0F172A" style="margin:0;padding:0;background:#0F172A;background-color:#0F172A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
<div style="display:none;font-size:1px;color:#0F172A;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">Your BIM consultation with Klyron Consulting is confirmed for ${fullDate} at ${record.time}. We look forward to speaking with you!</div>

<table class="wrap" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0F172A" style="background:#0F172A;background-color:#0F172A;padding:14px 10px">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" style="width:100%;max-width:600px">

  ${topBar()}
  ${logoRow()}

  <!-- Main Card -->
  <tr><td style="background:#1E293B;border-radius:16px;overflow:hidden;border:1px solid #334155">
  <table width="100%" cellpadding="0" cellspacing="0">

    <!-- Hero -->
    <tr><td class="hero-pad" style="background:linear-gradient(160deg,#0a1628 0%,#062318 50%,#0a1628 100%);padding:38px 30px;text-align:center;border-bottom:1px solid #334155">
      <!-- Checkmark circle -->
      <table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 18px">
        <tr>
          <td style="width:62px;height:62px;background:rgba(34,197,94,0.12);border:2px solid rgba(34,197,94,0.35);border-radius:50%;text-align:center;vertical-align:middle;font-size:30px;line-height:62px;color:#22C55E">&#10003;</td>
        </tr>
      </table>
      <h1 class="h1" style="margin:0;font-size:28px;font-weight:700;color:#F8FAFC;line-height:1.2;font-family:Arial,sans-serif">Consultation</h1>
      <h1 class="h1g" style="margin:2px 0 14px;font-size:28px;font-weight:700;color:#22C55E;line-height:1.2;font-family:Arial,sans-serif">Confirmed!</h1>
      <div style="width:36px;height:2px;background:#1E3A2F;margin:0 auto 14px"></div>
      <p style="margin:0;font-size:14px;color:#94A3B8;font-family:Arial,sans-serif">We look forward to speaking with you.</p>
    </td></tr>

    <!-- Greeting + Meeting Card -->
    <tr><td class="card-pad" style="padding:26px 30px;background:#1E293B">
      <p style="margin:0 0 8px;font-size:16px;color:#94A3B8;font-family:Arial,sans-serif">Hi <span style="color:#22D3EE;font-weight:600">${record.name}</span>,</p>
      <p style="margin:0 0 6px;font-size:14px;color:#CBD5E1;line-height:1.6;font-family:Arial,sans-serif">Your BIM consultation with Klyron Consulting has been scheduled.</p>
      <p style="margin:0 0 18px;font-size:14px;color:#94A3B8;font-family:Arial,sans-serif">Here are your meeting details:</p>

      <!-- Meeting card -->
      <table cellpadding="0" cellspacing="0" width="100%" style="background:#0F172A;border-radius:12px;border:1px solid #334155;overflow:hidden">
        <tr><td style="padding:18px 18px;${record.notes ? "border-bottom:1px solid #334155" : ""}">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <!-- Calendar icon -->
              <td class="cal-icon" style="width:56px;padding-right:14px;vertical-align:top">
                <table cellpadding="0" cellspacing="0" style="background:#1a2744;border-radius:8px;overflow:hidden;width:52px">
                  <tr><td style="background:#0EA5E9;padding:3px 4px;text-align:center;font-size:9px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.5px;font-family:Arial,sans-serif">${monthStr}</td></tr>
                  <tr><td style="padding:4px 4px 7px;text-align:center;font-size:26px;font-weight:700;color:#F8FAFC;line-height:1;font-family:Arial,sans-serif">${day}</td></tr>
                </table>
              </td>
              <!-- Details -->
              <td class="cal-info" style="vertical-align:top">
                <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#F8FAFC;font-family:Arial,sans-serif">BIM Consultation</p>
                <p style="margin:0 0 4px;font-size:13px;color:#94A3B8;font-family:Arial,sans-serif">&#128197; ${fullDate}</p>
                <p style="margin:0 0 4px;font-size:13px;color:#94A3B8;font-family:Arial,sans-serif">&#128336; ${record.time} &#8211; ${endTime(record.time)}</p>
                <p style="margin:0;font-size:13px;color:#94A3B8;font-family:Arial,sans-serif">&#127758; ${tz}</p>
              </td>
            </tr>
          </table>
        </td></tr>
        ${record.notes ? `
        <tr><td style="padding:14px 18px">
          <p style="margin:0 0 5px;font-size:10px;font-weight:700;color:#475569;letter-spacing:1.5px;text-transform:uppercase;font-family:Arial,sans-serif">Your Notes</p>
          <p style="margin:0;font-size:13px;color:#CBD5E1;line-height:1.6;font-family:Arial,sans-serif">${record.notes}</p>
        </td></tr>` : ""}
      </table>
    </td></tr>

    <!-- Meet Button -->
    ${meetLink ? `
    <tr><td class="card-pad" style="padding:0 30px 24px;text-align:center">
      <p style="margin:0 0 14px;font-size:10px;font-weight:700;color:#475569;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif">Join Your Meeting</p>
      ${meetBtn(meetLink, meetCode, true)}
    </td></tr>` : ""}

    <!-- Info box -->
    <tr><td class="card-pad" style="padding:0 30px 24px">
      <table cellpadding="0" cellspacing="0" width="100%" style="background:rgba(14,165,233,0.07);border-radius:10px;border:1px solid rgba(14,165,233,0.2)">
        <tr><td style="padding:14px 16px">
          <p style="margin:0 0 5px;font-size:13px;font-weight:600;color:#0EA5E9;font-family:Arial,sans-serif">&#128161; Before the meeting</p>
          <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.6;font-family:Arial,sans-serif">Save the Google Meet link above. You can join from any device &#8212; computer, tablet or phone. No download required.</p>
        </td></tr>
      </table>
    </td></tr>

    <!-- Questions -->
    <tr><td style="padding:0 30px 26px;border-top:1px solid #334155">
      <p style="margin:18px 0 0;font-size:13px;color:#64748B;line-height:1.7;font-family:Arial,sans-serif">Questions? Reply to this email or<br>contact us at <a href="mailto:contact@klyronconsulting.com" style="color:#0EA5E9;text-decoration:none;font-weight:500">contact@klyronconsulting.com</a></p>
    </td></tr>

  </table>
  </td></tr>

  ${footerCard()}

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
