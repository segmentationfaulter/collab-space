import { relations } from "drizzle-orm";
import {
  user,
  session,
  account,
  organization,
  member,
  invitation,
} from "./schemas/auth-schema";
import {
  boards,
  columns,
  tasks,
  labels,
  taskLabels,
} from "./schemas/kanban-schema";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitations: many(invitation),
  tasks: many(tasks),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  boards: many(boards),
  labels: many(labels),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
  organization: one(organization, {
    fields: [boards.organizationId],
    references: [organization.id],
  }),
  columns: many(columns),
}));

export const columnsRelations = relations(columns, ({ one, many }) => ({
  board: one(boards, {
    fields: [columns.boardId],
    references: [boards.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  column: one(columns, {
    fields: [tasks.columnId],
    references: [columns.id],
  }),
  assignee: one(user, {
    fields: [tasks.assigneeId],
    references: [user.id],
  }),
  taskLabels: many(taskLabels),
}));

export const labelsRelations = relations(labels, ({ one, many }) => ({
  organization: one(organization, {
    fields: [labels.organizationId],
    references: [organization.id],
  }),
  taskLabels: many(taskLabels),
}));

export const taskLabelsRelations = relations(taskLabels, ({ one }) => ({
  task: one(tasks, {
    fields: [taskLabels.taskId],
    references: [tasks.id],
  }),
  label: one(labels, {
    fields: [taskLabels.labelId],
    references: [labels.id],
  }),
}));
