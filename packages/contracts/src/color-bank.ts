// Ini untuk shared viewmodel yang dipakai di FE dan juga BE nya..
// Untuk validasi ZOD

import { z } from "zod";

export const createColorBankRequestSchema = z.object({
  brand: z.string().min(1),
  shadeName: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]),
});
export type CreateColorBankRequest = z.infer<
  typeof createColorBankRequestSchema
>;

export const colorBankItemSchema = z.object({
  id: z.string(),
  brand: z.string(),
  shadeName: z.string(),
  status: z.enum(["pending", "approved", "formulating", "closed"]),
});
export type ColorBankItem = z.infer<typeof colorBankItemSchema>;
