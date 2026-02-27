"use client";

import Link from "next/link";
import { Layout } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
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
import { useTRPC } from "@/trpc/client";
import { CreateBoardButton } from "./create-board-button";

type BoardsClientProps = {
  orgSlug: string;
};

export function BoardsClient({ orgSlug }: BoardsClientProps) {
  const trpc = useTRPC();

  const { data: boards } = useSuspenseQuery(
    trpc.kanban.boards.list.queryOptions(),
  );

  if (boards.length === 0) {
    return (
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
          <CreateBoardButton orgSlug={orgSlug} variant="outline" />
        </EmptyContent>
      </Empty>
    );
  }

  return (
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
  );
}
