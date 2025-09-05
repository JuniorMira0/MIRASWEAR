"use server";

import { db } from "@/db";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const checkCpfExists = async (cpf: string) => {
  const clean = (cpf || "").replace(/\D/g, "");
  if (!clean) return false;
  const [user] = await db.select().from(userTable).where(eq(userTable.cpf, clean));
  return !!user;
};
