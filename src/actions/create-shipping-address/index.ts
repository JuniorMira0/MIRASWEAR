"use server";

import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";

import {
  CreateShippingAddressSchema,
  createShippingAddressSchema,
} from "./schema";
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-middleware';

export const createShippingAddress = async (
  data: CreateShippingAddressSchema,
) => {
  createShippingAddressSchema.parse(data);


  const userId = await requireAuth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [shippingAddress] = await db
    .insert(shippingAddressTable)
    .values({
      userId: userId,
      recipientName: data.fullName,
      street: data.address,
      number: data.number,
      complement: data.complement || null,
      city: data.city,
      state: data.state,
      neighborhood: data.neighborhood,
      zipCode: data.zipCode,
      country: "Brasil",
      phone: data.phone,
      email: data.email,
      cpfOrCnpj: data.cpf,
    })
    .returning();

    revalidatePath("/cart/identification");

  return shippingAddress;
};