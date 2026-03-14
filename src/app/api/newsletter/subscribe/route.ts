import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY not configured" },
        { status: 500 }
      );
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (!audienceId) {
      return NextResponse.json(
        { error: "RESEND_AUDIENCE_ID not configured" },
        { status: 500 }
      );
    }

    // Add contact to Resend audience
    const { data, error } = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json(
        { error: `Failed to subscribe: ${error.message}` },
        { status: 500 }
      );
    }

    // Send welcome email
    try {
      await resend.emails.send({
        from: "BEDCAVE <newsletter@bedcave.com>",
        to: email,
        subject: "Welcome to BEDCAVE! 🔧",
        html: `
          <div style="font-family: monospace; background: #0a0a0f; color: #e2e8f0; padding: 20px; max-width: 600px;">
            <h1 style="color: #00d4ff;">Welcome to the Cave!</h1>
            <p>You've successfully subscribed to the BEDCAVE newsletter.</p>
            <p>Expect:</p>
            <ul>
              <li>🐳 Docker tutorials</li>
              <li>🔧 Homelab guides</li>
              <li>💻 Hardware reviews</li>
            </ul>
            <p style="color: #64748b; margin-top: 30px;">
              If this wasn't you, you can <a href="https://bedcave.com/unsubscribe?email=${encodeURIComponent(email)}" style="color: #ff006e;">unsubscribe here</a>.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Welcome email error:", emailError);
      // Don't fail the subscription if welcome email fails
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter!",
      data,
    });
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: `Failed to subscribe: ${error.message}` },
      { status: 500 }
    );
  }
}
