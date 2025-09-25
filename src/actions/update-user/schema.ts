import z from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  cpf: z.string().min(11).max(14).optional(),
  phone: z.string().min(10).optional(),
  birthDate: z.string().optional().nullable(),
  gender: z.enum(['female', 'male', 'other']).optional().nullable(),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
