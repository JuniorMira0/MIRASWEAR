import { db } from "@/db";
import { reservationTable } from "@/db/schema";
import { lt } from "drizzle-orm";
import { NextResponse } from "next/server";

export const POST = async () => {
  await db
    .delete(reservationTable)
    .where(lt(reservationTable.expiresAt, new Date()));
  return NextResponse.json({ ok: true });
};
