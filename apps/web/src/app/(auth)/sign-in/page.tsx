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
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setIsPending(true);

    const isEmail = identifier.includes("@");

    try {
      const commonOptions = {
        onSuccess: () => {
          window.location.href = "/";
        },
        onError: (ctx: { error: { message?: string } }) => {
          setError(ctx.error.message || "Failed to sign in");
          setIsPending(false);
        },
      };

      if (isEmail) {
        await authClient.signIn.email(
          {
            email: identifier,
            password,
          },
          commonOptions,
        );
      } else {
        await authClient.signIn.username(
          {
            username: identifier,
            password,
          },
          commonOptions,
        );
      }
    } catch {
      setError("An unexpected error occurred");
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your email or username below to sign in to your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Username</Label>
              <Input
                id="identifier"
                name="identifier"
                placeholder="m@example.com or johndoe"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
              disabled={isPending}
            >
              {isPending ? "Signing In..." : "Sign In"}
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
              onClick={async () => {
                await authClient.signIn.social({
                  provider: "github",
                  callbackURL: "/",
                });
              }}
            >
              <Github className="w-4 h-4" />
              Continue with GitHub
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
