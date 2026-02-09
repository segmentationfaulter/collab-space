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
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { Github } from "lucide-react";
import { useState, useActionState } from "react";
import { signUpAction } from "../actions";

export default function SignUp() {
  const [state, action, isPending] = useActionState(signUpAction, null);
  const [isSocialPending, setIsSocialPending] = useState(false);
  const [socialError, setSocialError] = useState("");

  const error = (state?.error as string) || socialError;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <form action={action}>
          <CardContent className="space-y-4">
            <Field data-invalid={!!state?.fieldErrors?.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <FieldContent>
                <Input id="name" name="name" placeholder="John Doe" required />
                <FieldError>{state?.fieldErrors?.name?.[0]}</FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={!!state?.fieldErrors?.username}>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <FieldContent>
                <Input
                  id="username"
                  name="username"
                  placeholder="johndoe"
                  required
                />
                <FieldError>{state?.fieldErrors?.username?.[0]}</FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={!!state?.fieldErrors?.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
                <FieldError>{state?.fieldErrors?.email?.[0]}</FieldError>
              </FieldContent>
            </Field>

            <Field data-invalid={!!state?.fieldErrors?.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <FieldContent>
                <Input id="password" name="password" type="password" required />
                <FieldError>{state?.fieldErrors?.password?.[0]}</FieldError>
              </FieldContent>
            </Field>

            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
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
                setSocialError("");
                setIsSocialPending(true);
                try {
                  await authClient.signIn.social({
                    provider: "github",
                    callbackURL: "/",
                  });
                } catch {
                  setSocialError("An unexpected error occurred");
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
