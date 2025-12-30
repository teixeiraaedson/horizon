import { z } from "zod";

export const fundSchema = z.object({
  walletId: z.string().min(1, "Select a wallet"),
  amount: z.coerce.number().positive("Amount must be > 0"),
});

export const sendSchema = z.object({
  fromWalletId: z.string().min(1, "Select a source wallet"),
  toWalletId: z.string().min(1, "Select a destination wallet"),
  amount: z.coerce.number().positive("Amount must be > 0"),
}).refine((v) => v.fromWalletId !== v.toWalletId, {
  message: "Source and destination must differ",
  path: ["toWalletId"],
});

export const withdrawSchema = z.object({
  walletId: z.string().min(1, "Select a wallet"),
  amount: z.coerce.number().positive("Amount must be > 0"),
  bankReference: z.string().optional(),
});