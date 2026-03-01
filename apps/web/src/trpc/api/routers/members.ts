import { createTRPCRouter, workspaceMemberProcedure } from "../init";
import { auth } from "@/lib/auth";

export const membersRouter = createTRPCRouter({
  list: workspaceMemberProcedure.query(async ({ ctx }) => {
    const { members } = await auth.api.listMembers({
      query: {
        organizationId: ctx.organizationId,
      },
      headers: ctx.headers,
    });

    return (
      members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
        role: m.role,
      })) || []
    );
  }),
});
