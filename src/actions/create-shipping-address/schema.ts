import { z } from "zod";
import { isValidBRMobilePhone, isValidCPF } from "@/helpers/br-validators";

export const createShippingAddressSchema = z.object({
  fullName: z.string().min(1, "Por favor, digite seu nome completo"),
  cpf: z.string().refine((v) => isValidCPF(v), "Por favor, digite um CPF válido"),
  phone: z.string().refine((v) => isValidBRMobilePhone(v), "Por favor, digite um número de celular válido"),
  zipCode: z.string().min(9, "Por favor, digite um CEP válido"),
  address: z.string().min(1, "Por favor, digite seu endereço"),
  number: z.string().min(1, "Por favor, digite o número"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Por favor, digite o bairro"),
  city: z.string().min(1, "Por favor, digite a cidade"),
  state: z.string().min(1, "Por favor, digite o estado"),
});

export type CreateShippingAddressSchema = z.infer<
  typeof createShippingAddressSchema
>;
