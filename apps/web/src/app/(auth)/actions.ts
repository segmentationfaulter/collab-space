"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const signInSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signInAction(_prevState: unknown, formData: FormData) {
  const validatedFields = signInSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { identifier, password } = validatedFields.data;
  const callbackUrl = formData.get("callbackUrl") as string | null;
  const isEmail = identifier.includes("@");

  try {
    if (isEmail) {
      await auth.api.signInEmail({
        body: {
          email: identifier,
          password,
        },
        headers: await headers(),
      });
    } else {
      await auth.api.signInUsername({
        body: {
          username: identifier,
          password,
        },
        headers: await headers(),
      });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sign in";
    return {
      error: message,
    };
  }

  redirect(callbackUrl || "/");
}

export async function signUpAction(_prevState: unknown, formData: FormData) {
  const validatedFields = signUpSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, username, email, password } = validatedFields.data;
  const callbackUrl = formData.get("callbackUrl") as string | null;

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        username,
      },
      headers: await headers(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create account";
    return {
      error: message,
    };
  }

  redirect(callbackUrl || "/");
}
