"use server";

import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getCategories = async () => {
  return await db.query.categoryTable.findMany({});
};

export const getCategoryBySlug = async (slug: string) => {
  return await db.query.categoryTable.findFirst({
    where: eq(categoryTable.slug, slug),
  });
};
