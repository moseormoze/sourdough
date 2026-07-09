import { getSupabaseClient } from "@/lib/supabase/client";
import type { FeedRatio } from "@/lib/bake-timing";
import type { Feeding, FeedingInput } from "@/lib/types/feeding";

const TABLE = "sourdough_feedings";

interface FeedingRow {
  id: string;
  email: string;
  ratio: number;
  starter_grams: number | null;
  flour_grams: number | null;
  water_grams: number | null;
  fed_at: string;
  created_at: string;
}

function toFeeding(row: FeedingRow): Feeding {
  return {
    id: row.id,
    email: row.email,
    ratio: row.ratio as FeedRatio,
    starterGrams: row.starter_grams,
    flourGrams: row.flour_grams,
    waterGrams: row.water_grams,
    fedAt: row.fed_at,
    createdAt: row.created_at,
  };
}

function toRow(input: FeedingInput): Omit<FeedingRow, "id" | "created_at"> {
  return {
    email: input.email,
    ratio: input.ratio,
    starter_grams: input.starterGrams,
    flour_grams: input.flourGrams,
    water_grams: input.waterGrams,
    fed_at: input.fedAt,
  };
}

function assertNoError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export async function listFeedings(email: string): Promise<Feeding[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("email", email)
    .order("fed_at", { ascending: false });

  assertNoError(error);
  return ((data ?? []) as FeedingRow[]).map(toFeeding);
}

export async function createFeeding(input: FeedingInput): Promise<Feeding> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .insert(toRow(input))
    .select("*")
    .single();

  assertNoError(error);
  return toFeeding(data as FeedingRow);
}

export async function updateFeeding(id: string, input: FeedingInput): Promise<Feeding> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from(TABLE)
    .update(toRow(input))
    .eq("id", id)
    .eq("email", input.email)
    .select("*")
    .single();

  assertNoError(error);
  return toFeeding(data as FeedingRow);
}

export async function deleteFeeding(id: string, email: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client.from(TABLE).delete().eq("id", id).eq("email", email);

  assertNoError(error);
}
