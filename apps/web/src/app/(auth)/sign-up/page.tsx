"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { Github } from "lucide-react";
import { useState } from "react";

export default function SignUp() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isSocialPending, setIsSocialPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsPending(true);

    try {
      await authClient.signUp.email(
        {
          email,
          password,
          name,
          username,
        },
        {
          onSuccess: () => {
            window.location.href = "/";
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to create account");
            setIsPending(false);
          },
        },
      );
    } catch {
      setError("An unexpected error occurred");
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-4">
            <Button
              className="w-full cursor-pointer"
              type="submit"
              disabled={isPending || isSocialPending}
            >
              {isPending ? "Creating account..." : "Sign Up"}
            </Button>
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-100 px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 cursor-pointer"
              type="button"
              disabled={isPending || isSocialPending}
              onClick={async () => {
                setIsSocialPending(true);
                try {
                  await authClient.signIn.social({
                    provider: "github",
                    callbackURL: "/",
                  });
                } catch {
                  setError("An unexpected error occurred");
                  setIsSocialPending(false);
                }
              }}
            >
              {isSocialPending ? (
                "Connecting..."
              ) : (
                <>
                  <Github className="w-4 h-4" />
                  Continue with GitHub
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
