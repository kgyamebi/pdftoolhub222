import type { EmailMessage, EmailProvider, EmailProviderId } from "@/lib/email/types";

class ConsoleProvider implements EmailProvider {
  id: EmailProviderId = "console";
  async send(message: EmailMessage) {
    const id = `console_${Date.now()}`;
    console.info(`[email:${message.kind}] to=${message.to} subject=${message.subject} id=${id}`);
    return { id };
  }
}

class ResendProvider implements EmailProvider {
  id: EmailProviderId = "resend";
  async send(message: EmailMessage) {
    const key = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is missing");
    const from = process.env.EMAIL_FROM || "PDF Tools Hub <noreply@pdftoolshub.local>";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Resend failed (${res.status}): ${detail.slice(0, 200)}`);
    }
    const data = (await res.json()) as { id?: string };
    return { id: data.id || `resend_${Date.now()}` };
  }
}

export function getEmailProvider(): EmailProvider {
  const name = (process.env.EMAIL_PROVIDER || "").toLowerCase();
  const key = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
  if (name === "resend" || key) return new ResendProvider();
  return new ConsoleProvider();
}
