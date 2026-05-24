import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

vi.mock("next/font/google", () => ({
  Rubik: () => ({ variable: "--font-rubik", className: "font-rubik-mock" }),
  JetBrains_Mono: () => ({ variable: "--font-jetbrains-mono", className: "font-mono-mock" }),
}));
