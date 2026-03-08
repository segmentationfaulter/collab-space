import { Resend } from "resend";
import { type ReactNode } from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  body: ReactNode;
}

export const sendEmail = async ({ to, subject, body }: SendEmailOptions) => {
  const { data, error } = await resend.emails.send({
    from: "CollabSpace <onboarding@resend.dev>", // Default for free/dev accounts
    to,
    subject,
    react: body,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return { data };
};
