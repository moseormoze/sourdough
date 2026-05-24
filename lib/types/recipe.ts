import { z } from "zod";

export const FlourSchema = z
  .object({
    white: z.number().min(0).max(100),
    wholeWheat: z.number().min(0).max(100),
    rye: z.number().min(0).max(100),
    other: z.number().min(0).max(100),
  })
  .refine(
    (f) => Math.abs(f.white + f.wholeWheat + f.rye + f.other - 100) < 0.01,
    { message: "Flour percentages must sum to 100" }
  );

export const InclusionSchema = z.object({
  name: z.string().trim().min(1),
  amountGrams: z.number().positive(),
});

export const RecipeSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  flour: FlourSchema,
  hydration: z.number().min(50).max(100),
  salt: z.number().min(0).max(5),
  levain: z.number().min(0).max(40),
  kitchenTemp: z.number().min(10).max(40),
  inclusions: z.array(InclusionSchema),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

export const RecipeInputSchema = RecipeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  id: z.string().min(1).optional(),
});

export type Flour = z.infer<typeof FlourSchema>;
export type Inclusion = z.infer<typeof InclusionSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
export type RecipeInput = z.infer<typeof RecipeInputSchema>;
