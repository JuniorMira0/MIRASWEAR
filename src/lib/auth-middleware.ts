import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const requireAuth = async (): Promise<string> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized: User must be logged in");
  }

  return session.user.id;
};

export const requireAdmin = async (): Promise<{ id: string; email: string } | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const userEmail = session.user.email?.toLowerCase();

  if (!userEmail) return null;

  if (adminEmails.includes(userEmail)) {
    return { id: session.user.id, email: session.user.email };
  }

  return null;
};
