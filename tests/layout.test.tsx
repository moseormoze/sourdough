import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import RootLayout from "@/app/layout";

describe("T1 scaffold — root layout", () => {
  const html = renderToStaticMarkup(
    <RootLayout>
      <div>child</div>
    </RootLayout>
  );

  it("sets lang=he on <html>", () => {
    expect(html).toMatch(/<html[^>]*\blang="he"/);
  });

  it("sets dir=rtl on <html>", () => {
    expect(html).toMatch(/<html[^>]*\bdir="rtl"/);
  });

  it("includes the Rubik font CSS variable on <html>", () => {
    expect(html).toMatch(/<html[^>]*class="[^"]*--font-rubik/);
  });

  it("includes the JetBrains Mono font CSS variable on <html>", () => {
    expect(html).toMatch(/<html[^>]*class="[^"]*--font-jetbrains-mono/);
  });

  it("renders children inside <body>", () => {
    expect(html).toContain("<body>");
    expect(html).toContain("child");
  });
});
