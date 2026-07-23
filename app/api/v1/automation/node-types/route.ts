// ======================================================
// GET /api/v1/automation/node-types
// ======================================================
// Feeds the canvas's node palette — the frontend never
// hardcodes what node types exist, it asks the registry.

import { NextResponse } from "next/server";
import { listNodeTypes } from "@/lib/automation/nodeTypes";

export async function GET() {
  const nodeTypes = listNodeTypes();
  return NextResponse.json({ nodeTypes });
}
