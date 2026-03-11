import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/session
 * Receives a JWT token in the body and sets it as an httpOnly cookie.
 */
export async function POST(req: NextRequest) {
    const { token } = await req.json();

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Token is required" },
            { status: 400 }
        );
    }

    const response = NextResponse.json({ success: true, message: "Session created" });

    response.cookies.set("trackflow_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
}

/**
 * DELETE /api/auth/session
 * Clears the session cookie (logout).
 */
export async function DELETE() {
    const response = NextResponse.json({ success: true, message: "Session cleared" });

    response.cookies.set("trackflow_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return response;
}
