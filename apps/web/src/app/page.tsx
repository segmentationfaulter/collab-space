"use client";

import { trpc } from "@/trpc/client";

export default function Home() {
  const hello = trpc.hello.useQuery({ text: "from tRPC" });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">CollabSpace</h1>
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-linear-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          {hello.data ? hello.data.greeting : "Loading tRPC..."}
        </p>
      </div>
    </main>
  );
}
