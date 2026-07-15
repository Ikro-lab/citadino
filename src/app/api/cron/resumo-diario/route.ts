import { NextResponse } from "next/server";
import { notifyResumoDiario } from "@/lib/push/notify";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const result = await notifyResumoDiario();
  return NextResponse.json(result);
}
