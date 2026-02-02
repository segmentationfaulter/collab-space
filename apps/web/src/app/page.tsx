export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
          CollabSpace
        </h1>
        <p className="text-lg text-muted-foreground">
          Project collaboration for high-performance teams.
        </p>
        <div className="flex gap-4">
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Get Started
          </button>
          <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Documentation
          </button>
        </div>
      </main>
    </div>
  );
}
