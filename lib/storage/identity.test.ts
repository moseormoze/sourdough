import { beforeEach, describe, expect, it } from "vitest";
import {
  IDENTITY_STORAGE_KEY,
  type Identity,
  isValidEmail,
  loadIdentity,
  normalizeEmail,
  saveIdentity,
} from "./identity";

const validIdentity: Identity = {
  name: "אילון",
  email: "moozly5@gmail.com",
  identifiedAt: "2026-07-05T10:00:00.000Z",
};

describe("identity storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses the versioned storage key", () => {
    expect(IDENTITY_STORAGE_KEY).toBe("sourdough:v1:identity");
  });

  it("returns null when nothing is stored", () => {
    expect(loadIdentity()).toBeNull();
  });

  it("round-trips a saved identity", () => {
    saveIdentity(validIdentity);
    expect(loadIdentity()).toEqual(validIdentity);
  });

  it("normalizes email and trims name on save", () => {
    saveIdentity({
      ...validIdentity,
      name: " אילון ",
      email: "  Moozly5@Gmail.COM ",
    });
    const loaded = loadIdentity();
    expect(loaded?.email).toBe("moozly5@gmail.com");
    expect(loaded?.name).toBe("אילון");
  });

  it("returns null on corrupt JSON", () => {
    localStorage.setItem(IDENTITY_STORAGE_KEY, "{not-json");
    expect(loadIdentity()).toBeNull();
  });

  it("returns null when the stored shape does not match the schema", () => {
    localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify({ name: "אילון" }));
    expect(loadIdentity()).toBeNull();
  });

  it("returns null when the stored email is not a valid email", () => {
    localStorage.setItem(
      IDENTITY_STORAGE_KEY,
      JSON.stringify({ ...validIdentity, email: "not-an-email" })
    );
    expect(loadIdentity()).toBeNull();
  });
});

describe("normalizeEmail", () => {
  it("trims whitespace and lowercases", () => {
    expect(normalizeEmail("  Moozly5@Gmail.COM ")).toBe("moozly5@gmail.com");
  });
});

describe("isValidEmail", () => {
  it("accepts a plain address, including un-normalized input", () => {
    expect(isValidEmail("moozly5@gmail.com")).toBe(true);
    expect(isValidEmail("  Moozly5@Gmail.COM ")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("moozly5")).toBe(false);
    expect(isValidEmail("moozly5@")).toBe(false);
    expect(isValidEmail("@gmail.com")).toBe(false);
    expect(isValidEmail("מייל בעברית")).toBe(false);
  });
});
