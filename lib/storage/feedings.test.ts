import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedingInput } from "@/lib/types/feeding";

interface FakeResult {
  data: unknown;
  error: { message: string } | null;
}

interface RecordedCall {
  method: string;
  args: unknown[];
}

class FakeQueryBuilder implements PromiseLike<FakeResult> {
  public calls: RecordedCall[] = [];

  constructor(private readonly result: FakeResult) {}

  private record(method: string, args: unknown[]): this {
    this.calls.push({ method, args });
    return this;
  }

  select(...args: unknown[]): this {
    return this.record("select", args);
  }

  eq(...args: unknown[]): this {
    return this.record("eq", args);
  }

  order(...args: unknown[]): this {
    return this.record("order", args);
  }

  insert(...args: unknown[]): this {
    return this.record("insert", args);
  }

  update(...args: unknown[]): this {
    return this.record("update", args);
  }

  delete(...args: unknown[]): this {
    return this.record("delete", args);
  }

  single(...args: unknown[]): this {
    return this.record("single", args);
  }

  then<TResult1 = FakeResult, TResult2 = never>(
    onfulfilled?: ((value: FakeResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.result).then(onfulfilled, onrejected);
  }
}

const getSupabaseClientMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseClient: getSupabaseClientMock,
}));

function mockClientReturning(builder: FakeQueryBuilder) {
  const fromMock = vi.fn(() => builder);
  getSupabaseClientMock.mockReturnValue({ from: fromMock } as unknown as SupabaseClient);
  return fromMock;
}

const row = {
  id: "feeding-1",
  email: "baker@example.com",
  ratio: 2,
  starter_grams: 50,
  flour_grams: 100,
  water_grams: 100,
  fed_at: "2026-07-09T05:00:00.000Z",
  created_at: "2026-07-09T05:00:01.000Z",
};

const feedingInput: FeedingInput = {
  email: "baker@example.com",
  ratio: 2,
  starterGrams: 50,
  flourGrams: 100,
  waterGrams: 100,
  fedAt: "2026-07-09T05:00:00.000Z",
};

beforeEach(() => {
  getSupabaseClientMock.mockReset();
});

describe("listFeedings", () => {
  it("queries the sourdough_feedings table filtered by email and ordered by fed_at desc", async () => {
    const builder = new FakeQueryBuilder({ data: [row], error: null });
    const fromMock = mockClientReturning(builder);

    const { listFeedings } = await import("./feedings");
    const result = await listFeedings("baker@example.com");

    expect(fromMock).toHaveBeenCalledWith("sourdough_feedings");
    expect(builder.calls).toContainEqual({ method: "eq", args: ["email", "baker@example.com"] });
    expect(builder.calls).toContainEqual({
      method: "order",
      args: ["fed_at", { ascending: false }],
    });

    expect(result).toEqual([
      {
        id: "feeding-1",
        email: "baker@example.com",
        ratio: 2,
        starterGrams: 50,
        flourGrams: 100,
        waterGrams: 100,
        fedAt: "2026-07-09T05:00:00.000Z",
        createdAt: "2026-07-09T05:00:01.000Z",
      },
    ]);
  });

  it("maps null gram fields through as null", async () => {
    const builder = new FakeQueryBuilder({
      data: [{ ...row, starter_grams: null, flour_grams: null, water_grams: null }],
      error: null,
    });
    mockClientReturning(builder);

    const { listFeedings } = await import("./feedings");
    const [feeding] = await listFeedings("baker@example.com");

    expect(feeding?.starterGrams).toBeNull();
    expect(feeding?.flourGrams).toBeNull();
    expect(feeding?.waterGrams).toBeNull();
  });

  it("throws when Supabase returns an error instead of swallowing it", async () => {
    const builder = new FakeQueryBuilder({ data: null, error: { message: "network down" } });
    mockClientReturning(builder);

    const { listFeedings } = await import("./feedings");
    await expect(listFeedings("baker@example.com")).rejects.toThrow(/network down/);
  });
});

describe("createFeeding", () => {
  it("inserts a row scoped to input.email and maps the created row back", async () => {
    const builder = new FakeQueryBuilder({ data: row, error: null });
    const fromMock = mockClientReturning(builder);

    const { createFeeding } = await import("./feedings");
    const result = await createFeeding(feedingInput);

    expect(fromMock).toHaveBeenCalledWith("sourdough_feedings");
    expect(builder.calls[0]).toEqual({
      method: "insert",
      args: [
        {
          email: "baker@example.com",
          ratio: 2,
          starter_grams: 50,
          flour_grams: 100,
          water_grams: 100,
          fed_at: "2026-07-09T05:00:00.000Z",
        },
      ],
    });
    expect(result.id).toBe("feeding-1");
    expect(result.email).toBe("baker@example.com");
  });

  it("throws on Supabase error", async () => {
    const builder = new FakeQueryBuilder({ data: null, error: { message: "insert failed" } });
    mockClientReturning(builder);

    const { createFeeding } = await import("./feedings");
    await expect(createFeeding(feedingInput)).rejects.toThrow(/insert failed/);
  });
});

describe("updateFeeding", () => {
  it("updates by id, scoped additionally to email, and maps the result", async () => {
    const builder = new FakeQueryBuilder({ data: row, error: null });
    const fromMock = mockClientReturning(builder);

    const { updateFeeding } = await import("./feedings");
    const result = await updateFeeding("feeding-1", feedingInput);

    expect(fromMock).toHaveBeenCalledWith("sourdough_feedings");
    expect(builder.calls[0]?.method).toBe("update");
    expect(builder.calls).toContainEqual({ method: "eq", args: ["id", "feeding-1"] });
    expect(builder.calls).toContainEqual({ method: "eq", args: ["email", "baker@example.com"] });
    expect(result.id).toBe("feeding-1");
  });

  it("throws on Supabase error", async () => {
    const builder = new FakeQueryBuilder({ data: null, error: { message: "update failed" } });
    mockClientReturning(builder);

    const { updateFeeding } = await import("./feedings");
    await expect(updateFeeding("feeding-1", feedingInput)).rejects.toThrow(/update failed/);
  });
});

describe("deleteFeeding", () => {
  it("deletes filtered by both id and email", async () => {
    const builder = new FakeQueryBuilder({ data: null, error: null });
    const fromMock = mockClientReturning(builder);

    const { deleteFeeding } = await import("./feedings");
    await deleteFeeding("feeding-1", "baker@example.com");

    expect(fromMock).toHaveBeenCalledWith("sourdough_feedings");
    expect(builder.calls[0]?.method).toBe("delete");
    expect(builder.calls).toContainEqual({ method: "eq", args: ["id", "feeding-1"] });
    expect(builder.calls).toContainEqual({ method: "eq", args: ["email", "baker@example.com"] });
  });

  it("throws on Supabase error", async () => {
    const builder = new FakeQueryBuilder({ data: null, error: { message: "delete failed" } });
    mockClientReturning(builder);

    const { deleteFeeding } = await import("./feedings");
    await expect(deleteFeeding("feeding-1", "baker@example.com")).rejects.toThrow(/delete failed/);
  });
});
