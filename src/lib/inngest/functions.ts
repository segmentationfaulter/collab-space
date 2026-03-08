import { inngest } from "./client";
import { sendEmail } from "../email";
import { InvitationEmail } from "../../components/emails/invitation-email";
import { TaskAssignedEmail } from "../../components/emails/task-assigned-email";

export const sendInvitationEmail = inngest.createFunction(
  { id: "send-invitation-email" },
  { event: "workspace/member.invited" },
  async ({ event }) => {
    const { email, organizationName, inviterName, invitationId } = event.data;

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

export const sendTaskAssignmentEmail = inngest.createFunction(
  { id: "send-task-assignment-email" },
  { event: "task/assigned" },
  async ({ event }) => {
    const {
      taskTitle,
      assigneeEmail,
      assignerName,
      boardName,
      priority,
      taskId,
    } = event.data;

    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
    // Construct task link - we'll need the org slug for a real link,
    // but for now we'll use a generic placeholder or taskId
    const taskLink = `${baseUrl}/tasks/${taskId}`;

    await sendEmail({
      to: assigneeEmail,
      subject: `New task assigned: ${taskTitle}`,
      body: TaskAssignedEmail({
        taskTitle,
        assignerName,
        boardName,
        priority,
        taskLink,
      }),
    });

    return { success: true, email: assigneeEmail };
  },
);
