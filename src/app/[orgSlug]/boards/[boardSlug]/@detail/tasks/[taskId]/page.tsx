import { TaskDetailSheet } from "@/components/task-detail-sheet";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ orgSlug: string; boardSlug: string; taskId: string }>;
}) {
  const { boardSlug, taskId } = await params;

  return <TaskDetailSheet taskId={taskId} boardSlug={boardSlug} />;
}
