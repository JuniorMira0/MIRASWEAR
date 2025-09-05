"use server";

import { db } from "@/db";
import { userTable } from "@/db/schema";
import { requireAuth } from "@/lib/auth-middleware";
import { eq } from "drizzle-orm";

export const updateUser = async (data: { name?: string; email?: string }) => {
  const userId = await requireAuth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { name, email } = data;

  const updateData: Partial<typeof userTable.$inferInsert> = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;

  await db.update(userTable).set(updateData).where(eq(userTable.id, userId));

  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId));

  return { user };
};
