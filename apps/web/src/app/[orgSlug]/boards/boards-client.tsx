"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Layout } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import { CreateBoardDialog } from "@/components/create-board-dialog";
import { useTRPC } from "@/trpc/client";

type BoardsClientProps = {
  orgSlug: string;
};

export function BoardsClient({ orgSlug }: BoardsClientProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const trpc = useTRPC();

  const { data: boards } = useSuspenseQuery(
    trpc.kanban.boards.list.queryOptions(),
  );

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Board
        </Button>
      </div>

      {boards.length === 0 ? (
        <Empty className="mt-8">
          <EmptyMedia variant="icon">
            <Layout className="h-6 w-6 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No boards found</EmptyTitle>
            <EmptyDescription>
              Create your first board to start managing tasks.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Board
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Link key={board.id} href={`/${orgSlug}/boards/${board.slug}`}>
              <Card className="hover:bg-accent/50 transition-colors h-full cursor-pointer">
                <CardHeader>
                  <CardTitle>{board.name}</CardTitle>
                  <CardDescription>
                    Created {new Date(board.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateBoardDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        orgSlug={orgSlug}
      />
    </>
  );
}
