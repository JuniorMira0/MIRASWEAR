import z from "zod";

export const deleteShippingAddressSchema = z.object({
  shippingAddressId: z.string().uuid(),
});

export type DeleteShippingAddressSchema = z.infer<
  typeof deleteShippingAddressSchema
>;
