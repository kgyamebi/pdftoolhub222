import { NextResponse } from "next/server";

type EventBody = { name?: string; tool?: string };

const events: { name: string; tool?: string; at: string }[] = [];

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as EventBody;
  if (!body.name) return NextResponse.json({ ok: false }, { status: 400 });
  events.push({ name: body.name, tool: body.tool, at: new Date().toISOString() });
  if (events.length > 500) events.shift();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const counts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.name] = (acc[e.name] ?? 0) + 1;
    return acc;
  }, {});
  return NextResponse.json({ counts, n: events.length });
}
