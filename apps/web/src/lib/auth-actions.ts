"use server";

import { APIError } from "better-auth";
import { auth } from "./auth"; // Server-side auth instance
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type AuthFormState = { error: string };

export async function signInAction(
  prevState: AuthFormState,
  formData: FormData,
) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString().trim();

  if (!email || !password) {
    return { ...prevState, error: "Email and password are required" };
  }

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });
    redirect("/");
  } catch (error) {
    return handleError(error);
  }
}

export async function signUpAction(
  prevState: AuthFormState,
  formData: FormData,
) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { ...prevState, error: "All fields are required" };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      headers: await headers(),
    });
    redirect("/");
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown): AuthFormState {
  if (error instanceof APIError) {
    return { error: error.message };
  }
  if (error instanceof Error) {
    return { error: error.message };
  }
  return { error: "Something went wrong" };
}
