import { beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.hoisted(() => vi.fn(() => ({ __fake: "client" })));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

const ORIGINAL_ENV = process.env;

async function freshClientModule() {
  vi.resetModules();
  return import("./client");
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env = { ...ORIGINAL_ENV };
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
});

describe("getSupabaseClient", () => {
  it("throws a clear error when both env vars are missing", async () => {
    const { getSupabaseClient } = await freshClientModule();
    expect(() => getSupabaseClient()).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL.*NEXT_PUBLIC_SUPABASE_ANON_KEY/
    );
  });

  it("throws a clear error when only the URL is missing", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    const { getSupabaseClient } = await freshClientModule();
    expect(() => getSupabaseClient()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("throws a clear error when only the anon key is missing", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    const { getSupabaseClient } = await freshClientModule();
    expect(() => getSupabaseClient()).toThrow(
      /NEXT_PUBLIC_SUPABASE_ANON_KEY/
    );
  });

  it("returns a client instance when both env vars are present", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    const { getSupabaseClient } = await freshClientModule();

    const result = getSupabaseClient();

    expect(result).toBeDefined();
    expect(createClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key"
    );
  });

  it("returns the same instance on repeated calls (singleton)", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    const { getSupabaseClient } = await freshClientModule();

    const first = getSupabaseClient();
    const second = getSupabaseClient();

    expect(first).toBe(second);
    expect(createClientMock).toHaveBeenCalledTimes(1);
  });
});
