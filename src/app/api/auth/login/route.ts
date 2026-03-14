import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "bedcave2026";
const ADMIN_PIN = process.env.ADMIN_PIN || "123456";
const SESSION_SECRET = process.env.SESSION_SECRET || "your-secret-key-change-in-production";

// Simple session token generation
function generateSessionToken(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { step, password, pin } = body;

    // Step 1: Verify password
    if (step === 1) {
      if (password === ADMIN_PASSWORD) {
        return NextResponse.json({ success: true, step: 2 });
      }
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    // Step 2: Verify PIN and create session
    if (step === 2) {
      if (pin === ADMIN_PIN) {
        // Create session cookie
        const token = generateSessionToken();
        
        const cookieStore = await cookies();
        cookieStore.set("admin_session", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        });

        return NextResponse.json({ success: true, authenticated: true });
      }
      return NextResponse.json(
        { success: false, error: "Invalid PIN" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Invalid step" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
