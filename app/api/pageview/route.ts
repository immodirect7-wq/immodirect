import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/pageview — record a page visit (fire-and-forget, no auth needed)
export async function POST(req: Request) {
    try {
        const { path } = await req.json();
        if (path) {
            await prisma.pageView.create({ data: { path } });
        }
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false });
    }
}
