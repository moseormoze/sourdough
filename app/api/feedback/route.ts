import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

interface FeedbackBody {
  type: string;
  name?: string;
  description: string;
  imageBase64?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: FeedbackBody;

  try {
    body = (await request.json()) as FeedbackBody;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!body.type) {
    return NextResponse.json({ error: "type required" }, { status: 400 });
  }

  if (!body.description || body.description.trim() === "") {
    return NextResponse.json({ error: "description required" }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const imageHtml = body.imageBase64
    ? `<br/><img src="${body.imageBase64}" style="max-width:100%" />`
    : "";

  const htmlBody = `
    <p><strong>סוג:</strong> ${body.type}</p>
    ${body.name ? `<p><strong>שם:</strong> ${body.name}</p>` : ""}
    <p><strong>תיאור:</strong> ${body.description}</p>
    ${imageHtml}
  `;

  const { error } = await resend.emails.send({
    from: "כיכר פידבק <onboarding@resend.dev>",
    to: "eilon+sourdoughfeedback@mlamdovsly.com",
    subject: `[כיכר] ${body.type}: ${body.description.slice(0, 60)}`,
    html: htmlBody,
  });

  if (error) {
    console.error("[feedback] Resend error:", JSON.stringify(error));
    return NextResponse.json({ error: "send failed", detail: error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
