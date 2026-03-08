import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { InvitationEmail } from "@/components/emails/invitation-email";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not allowed in production", { status: 403 });
  }

  try {
    const { data } = await sendEmail({
      to: "delivered@resend.dev", // Resend test address
      subject: "Test Invitation",
      body: InvitationEmail({
        workspaceName: "Test Workspace",
        inviterName: "Gemini CLI",
        invitationLink: "http://localhost:3000/accept-invitation/test-id",
      }),
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
