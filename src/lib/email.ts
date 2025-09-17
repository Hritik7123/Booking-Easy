import { Resend } from "resend";

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  icsAttachmentContent?: string;
  icsFilename?: string;
}) {
  const { to, subject, html, icsAttachmentContent, icsFilename } = params;
  if (!process.env.RESEND_API_KEY) {
    console.log("[email:mock]", { to, subject });
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "noreply@example.com",
    to,
    subject,
    html,
    attachments: icsAttachmentContent
      ? [
          {
            content: Buffer.from(icsAttachmentContent).toString("base64"),
            filename: icsFilename || "invite.ics",
          },
        ]
      : undefined,
  });
}

export function buildICS(params: {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
}): string {
  const { uid, title, start, end, description, location } = params;
  const format = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Booking App//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${format(new Date())}`,
    `DTSTART:${format(start)}`,
    `DTEND:${format(end)}`,
    `SUMMARY:${escapeText(title)}`,
    description ? `DESCRIPTION:${escapeText(description)}` : undefined,
    location ? `LOCATION:${escapeText(location)}` : undefined,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

function escapeText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}


