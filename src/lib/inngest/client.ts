import { Inngest, EventSchemas } from "inngest";

type Events = {
  "workspace/member.invited": {
    data: {
      invitationId: string;
      email: string;
      role: string;
      organizationId: string;
      organizationName: string;
      inviterName: string;
    };
  };
};

export const inngest = new Inngest({
  id: "collab-space",
  schemas: new EventSchemas().fromRecord<Events>(),
});
