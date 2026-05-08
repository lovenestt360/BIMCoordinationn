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

async function sendEmail(to: string, subject: string, html: string) {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: "Klyron Consulting <onboarding@resend.dev>", to: [to], subject, html }),
  });
}

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;
    if (!record) return new Response(JSON.stringify({ error: "No record" }), { status: 400 });

    // 1. Google Calendar event + Meet link
    const accessToken = await getAccessToken();
    const calendarEvent = await createCalendarEvent(record, accessToken);
    const meetLink = calendarEvent.conferenceData?.entryPoints?.find(
      (ep: any) => ep.entryPointType === "video"
    )?.uri || "";
    const calendarLink = calendarEvent.htmlLink || "";

    // 2. Email to owner
    await sendEmail(
      OWNER_EMAIL,
      `📅 New Meeting: ${record.name} — ${record.date} at ${record.time}`,
      `<div style="font-family:Arial,sans-serif;padding:24px;background:#0F172A;color:#F8FAFC;border-radius:8px">
        <h2 style="color:#0EA5E9;margin-top:0">New Meeting Request</h2>
        <p><b>Name:</b> ${record.name}</p>
        <p><b>Email:</b> <a href="mailto:${record.email}" style="color:#0EA5E9">${record.email}</a></p>
        <p><b>Company:</b> ${record.company || "—"}</p>
        <p><b>Date:</b> ${record.date} at ${record.time}</p>
        <p><b>Notes:</b> ${record.notes || "—"}</p>
        ${meetLink ? `<p><b>Google Meet:</b> <a href="${meetLink}" style="color:#22D3EE">${meetLink}</a></p>` : ""}
        ${calendarLink ? `<p><a href="${calendarLink}" style="color:#22D3EE">Ver no Google Calendar →</a></p>` : ""}
      </div>`
    );

    // 3. Confirmation email to client
    await sendEmail(
      record.email,
      `✅ Consultation Confirmed — ${record.date} at ${record.time}`,
      `<div style="font-family:Arial,sans-serif;padding:24px;background:#0F172A;color:#F8FAFC;border-radius:8px">
        <h2 style="color:#0EA5E9;margin-top:0">Your Meeting is Confirmed!</h2>
        <p>Hi ${record.name},</p>
        <p>Your BIM consultation with <b>Klyron Consulting</b> has been scheduled.</p>
        <p><b>Date:</b> ${record.date}</p>
        <p><b>Time:</b> ${record.time} (${record.timezone})</p>
        ${meetLink ? `
        <div style="margin:24px 0;padding:20px;background:#1E293B;border-radius:8px;text-align:center">
          <p style="color:#94A3B8;margin:0 0 8px 0">Google Meet Link</p>
          <a href="${meetLink}" style="color:#22D3EE;font-size:18px;font-weight:bold;word-break:break-all">${meetLink}</a>
        </div>` : ""}
        <p style="color:#94A3B8;font-size:12px;margin-top:24px">Questions? Contact us at contact@klyronconsulting.com</p>
      </div>`
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
