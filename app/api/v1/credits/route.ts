// ======================================================
// GET /api/v1/credits  -> current balance
// PUT /api/v1/credits  -> set the initial amount (admin action)
// ======================================================

import { NextRequest, NextResponse } from "next/server";
import { CreditService } from "@/lib/services/CreditService";

export async function GET() {
  try {
    const balance = await CreditService.getBalance();
    return NextResponse.json({ balance });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const amount = Number(body?.initialAmount);

  if (!body || Number.isNaN(amount)) {
    return NextResponse.json({ error: "initialAmount must be a number" }, { status: 400 });
  }

  try {
    const balance = await CreditService.setInitialAmount(amount, Boolean(body.resetConsumed));
    return NextResponse.json({ balance });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
