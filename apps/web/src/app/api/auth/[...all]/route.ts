import { auth } from "@/lib/auth"; // Make sure this path is correct based on your aliases
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
