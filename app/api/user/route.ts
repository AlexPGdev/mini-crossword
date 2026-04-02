export const dynamic = "force-dynamic";

import { prisma } from "../../lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function generateToken() {
    return crypto.randomUUID();
}

export async function GET() {
    const cookieStore = cookies();
    let token = (await cookieStore).get("user_token")?.value;

    let user;

    // If token exists → find user
    if (token) {
        user = await prisma.user.findUnique({
            where: { token }
        });
    }

    // If no user → create one
    if (!user) {

        console.log("No user found, creating one...");

        token = generateToken();

        user = await prisma.user.create({
            data: {
                token
            }
        });

        const response = NextResponse.json(user);

        // Set cookie
        response.cookies.set("user_token", token, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
        });

        return response;
    }

    return NextResponse.json(user);
}

export async function POST(request: Request) {
    const { token } = await request.json();

    let user;

    if (token) {
        user = await prisma.user.findUnique({
            where: { token }
        });
    }

    if (!user) {
        user = await prisma.user.create({
            data: {
                token
            }
        });
    }

    const response = NextResponse.json(user);

    console.log("Setting cookie with token:", token);
    response.cookies.set("user_token", token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
    });

    return response;
}