import { inngest } from "./client";
import { sendEmail } from "../email";
import { InvitationEmail } from "../../components/emails/invitation-email";

export const sendInvitationEmail = inngest.createFunction(
  { id: "send-invitation-email" },
  { event: "workspace/member.invited" },
  async ({ event }) => {
    const { email, organizationName, inviterName, invitationId } = event.data;

    // We'll construct the invitation link based on the ID
    // In production, this should use the actual base URL
    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
    const invitationLink = `${baseUrl}/accept-invitation/${invitationId}`;

    await sendEmail({
      to: email,
      subject: `You've been invited to join ${organizationName}`,
      body: InvitationEmail({
        workspaceName: organizationName,
        inviterName,
        invitationLink,
      }),
    });

    return { success: true, email };
  },
);
