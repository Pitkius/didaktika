export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export interface EmailProvider {
  name: string;
  send(payload: EmailPayload): Promise<{ id: string }>;
}

/** Development provider — logs email instead of sending. */
export class ConsoleEmailProvider implements EmailProvider {
  name = "console";

  async send(payload: EmailPayload) {
    const id = `console_${Date.now()}`;
    console.info("[email:console]", {
      id,
      to: payload.to,
      subject: payload.subject,
      text: payload.text ?? payload.html.replace(/<[^>]+>/g, " ").slice(0, 500),
    });
    return { id };
  }
}

/** Resend provider — falls back to console logging when API key missing. */
export class ResendEmailProvider implements EmailProvider {
  name = "resend";

  async send(payload: EmailPayload) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("RESEND_API_KEY missing");
      }
      console.warn("[email:resend] RESEND_API_KEY missing — using console fallback");
      return new ConsoleEmailProvider().send(payload);
    }

    const from = process.env.EMAIL_FROM ?? "Didaktika <onboarding@resend.dev>";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend error: ${res.status} ${body}`);
    }

    const data = (await res.json()) as { id?: string };
    return { id: data.id ?? `resend_${Date.now()}` };
  }
}

export function isRequiredEmailOperational(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.EMAIL_PROVIDER?.toLowerCase() === "resend" && Boolean(process.env.RESEND_API_KEY);
}

export function createEmailProvider(): EmailProvider {
  const mode = (process.env.EMAIL_PROVIDER ?? "console").toLowerCase();
  if (mode === "resend") return new ResendEmailProvider();
  return new ConsoleEmailProvider();
}

export class EmailService {
  constructor(private provider: EmailProvider = createEmailProvider()) {}

  get providerName() {
    return this.provider.name;
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    return this.provider.send({
      to,
      subject: "Didaktika — slaptažodžio atkūrimas",
      html: `<p>Spustelėkite nuorodą slaptažodžiui atkurti:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Nuoroda galioja ribotą laiką.</p>`,
      text: `Atkurti slaptažodį: ${resetUrl}`,
    });
  }

  async sendEmailVerification(to: string, verifyUrl: string) {
    return this.provider.send({
      to,
      subject: "Didaktika — patvirtinkite el. paštą",
      html: `<p>Patvirtinkite paskyrą:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
      text: `Patvirtinti el. paštą: ${verifyUrl}`,
    });
  }

  async sendInvitation(to: string, inviteUrl: string, schoolName?: string) {
    return this.provider.send({
      to,
      subject: "Didaktika — kvietimas",
      html: `<p>Jūs pakviesti į ${schoolName ?? "Didaktika"}.</p><p><a href="${inviteUrl}">${inviteUrl}</a></p>`,
      text: `Kvietimas: ${inviteUrl}`,
    });
  }
}

export const emailService = new EmailService();
