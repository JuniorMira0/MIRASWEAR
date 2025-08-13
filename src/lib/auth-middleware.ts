import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const requireAuth = async (): Promise<string> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized: User must be logged in");
  }

  return session.user.id;
};
