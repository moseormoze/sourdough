import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

const mockSend = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}));

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({ data: { id: "test-id" }, error: null });
  });

  it("returns 400 when type is missing", async () => {
    const req = makeRequest({ description: "some description" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "type required" });
  });

  it("returns 400 when description is missing", async () => {
    const req = makeRequest({ type: "באג" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "description required" });
  });

  it("returns 400 when description is empty string", async () => {
    const req = makeRequest({ type: "שאלה", description: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "description required" });
  });

  it("calls emails.send with correct fields and returns 200 { ok: true } for valid payload", async () => {
    const req = makeRequest({ type: "הצעה לפיצ׳ר", description: "אפשר להוסיף תזמון אוטומטי?" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true });

    expect(mockSend).toHaveBeenCalledOnce();
    const callArgs = mockSend.mock.calls[0]![0] as { to: string; subject: string; html: string; from: string };
    expect(callArgs.to).toBe("eilon+sourdoughfeedback@mlamdovsky.com");
    expect(callArgs.subject).toContain("הצעה לפיצ׳ר");
  });

  it("includes <img> in html when imageBase64 is provided", async () => {
    const req = makeRequest({
      type: "באג",
      description: "הכפתור לא עובד",
      imageBase64: "data:image/jpeg;base64,/9j/abc123",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const callArgs = mockSend.mock.calls[0]![0] as { html: string };
    expect(callArgs.html).toContain("<img");
  });

  it("returns 500 when emails.send returns an error", async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: "API error" } });
    const req = makeRequest({ type: "אחר", description: "בעיה כללית" });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: "send failed" });
  });
});
