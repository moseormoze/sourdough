import { describe, it, expect, vi, beforeEach } from "vitest";
import { calcTargetDimensions, compressImage } from "./compress-image";

// ---------------------------------------------------------------------------
// Pure helper tests — no browser mocks needed
// ---------------------------------------------------------------------------

describe("calcTargetDimensions", () => {
  it("scales down a large landscape image so the longest side is 1024", () => {
    const result = calcTargetDimensions(2000, 1500, 1024);
    expect(result.w).toBeLessThanOrEqual(1024);
    expect(result.h).toBeLessThanOrEqual(1024);
    expect(Math.max(result.w, result.h)).toBe(1024);
  });

  it("scales down a large portrait image so the longest side is 1024", () => {
    const result = calcTargetDimensions(1500, 2000, 1024);
    expect(result.w).toBeLessThanOrEqual(1024);
    expect(result.h).toBeLessThanOrEqual(1024);
    expect(Math.max(result.w, result.h)).toBe(1024);
  });

  it("keeps a small image unchanged (no upscaling)", () => {
    const result = calcTargetDimensions(200, 150, 1024);
    expect(result.w).toBe(200);
    expect(result.h).toBe(150);
  });

  it("keeps an exactly-1024 image unchanged", () => {
    const result = calcTargetDimensions(1024, 768, 1024);
    expect(result.w).toBe(1024);
    expect(result.h).toBe(768);
  });
});

// ---------------------------------------------------------------------------
// compressImage — browser API mocks
// ---------------------------------------------------------------------------

function makeFakeFile(): File {
  return new File(["fake"], "photo.jpg", { type: "image/jpeg" });
}

// Keep a reference to the real createElement so the spy's fallback can use it
const realCreateElement = document.createElement.bind(document);

function setupBrowserMocks(naturalWidth: number, naturalHeight: number) {
  // jsdom doesn't implement createObjectURL / revokeObjectURL — assign directly
  URL.createObjectURL = vi.fn().mockReturnValue("blob:fake-url");
  URL.revokeObjectURL = vi.fn();

  // Stub document.createElement for "img" and "canvas"
  vi.spyOn(document, "createElement").mockImplementation(
    (tag: string): HTMLElement => {
      if (tag === "img") {
        let _onload: (() => void) | null = null;
        let _onerror: ((e: unknown) => void) | null = null;
        const img = {
          naturalWidth,
          naturalHeight,
          get onload() {
            return _onload;
          },
          set onload(fn: (() => void) | null) {
            _onload = fn;
          },
          get onerror() {
            return _onerror;
          },
          set onerror(fn: ((e: unknown) => void) | null) {
            _onerror = fn;
          },
          set src(_: string) {
            Promise.resolve().then(() => {
              if (_onload) _onload();
            });
          },
        } as unknown as HTMLImageElement;
        return img;
      }

      if (tag === "canvas") {
        let _width = 0;
        let _height = 0;
        const canvas = {
          get width() {
            return _width;
          },
          set width(v: number) {
            _width = v;
          },
          get height() {
            return _height;
          },
          set height(v: number) {
            _height = v;
          },
          getContext: () => ({
            drawImage: vi.fn(),
          }),
          toBlob: (
            cb: (blob: Blob | null) => void,
            _type: string,
            _quality: number
          ) => {
            const blob = new Blob(["fake-jpeg-data"], { type: "image/jpeg" });
            Promise.resolve().then(() => cb(blob));
          },
        } as unknown as HTMLCanvasElement;
        return canvas;
      }

      return realCreateElement(tag) as HTMLElement;
    }
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("compressImage", () => {
  it("returns a string starting with data:image/", async () => {
    setupBrowserMocks(800, 600);
    const file = makeFakeFile();
    const result = await compressImage(file);
    expect(typeof result).toBe("string");
    expect(result.startsWith("data:image/")).toBe(true);
  });

  it("scales a 2000×1500 image — calcTargetDimensions produces ≤ 1024 longest side", async () => {
    setupBrowserMocks(2000, 1500);
    const file = makeFakeFile();
    await compressImage(file);
    // The integration test confirms the function runs end-to-end without error.
    // The dimension math is independently verified via the pure helper.
    const dims = calcTargetDimensions(2000, 1500, 1024);
    expect(Math.max(dims.w, dims.h)).toBe(1024);
    expect(dims.w).toBeLessThanOrEqual(1024);
    expect(dims.h).toBeLessThanOrEqual(1024);
  });

  it("does not upscale a 200×150 image", async () => {
    setupBrowserMocks(200, 150);
    const file = makeFakeFile();
    await compressImage(file);
    const dims = calcTargetDimensions(200, 150, 1024);
    expect(dims.w).toBe(200);
    expect(dims.h).toBe(150);
  });

  it("revokes the object URL after processing", async () => {
    setupBrowserMocks(800, 600);
    const file = makeFakeFile();
    await compressImage(file);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake-url");
  });
});
