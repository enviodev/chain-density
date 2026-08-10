import { NextResponse } from "next/server";

import { analyzeDensity, NoDataError } from "@/lib/analyze-density";
import type { AnalysisType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface AnalysisRequest {
  address?: unknown;
  type?: unknown;
  network?: unknown;
}

export async function POST(request: Request) {
  let body: AnalysisRequest;

  try {
    body = (await request.json()) as AnalysisRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    typeof body.address !== "string" ||
    !/^0x[a-fA-F0-9]{40}$/.test(body.address)
  ) {
    return NextResponse.json(
      { error: "Address must be a 20-byte hexadecimal EVM address" },
      { status: 400 }
    );
  }

  if (body.type !== "event" && body.type !== "transaction") {
    return NextResponse.json(
      { error: "Analysis type must be event or transaction" },
      { status: 400 }
    );
  }

  if (
    typeof body.network !== "string" ||
    !/^[a-zA-Z0-9-]+$/.test(body.network)
  ) {
    return NextResponse.json(
      { error: "A valid network is required" },
      { status: 400 }
    );
  }

  try {
    const result = await analyzeDensity({
      address: body.address,
      type: body.type as AnalysisType,
      network: body.network,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NoDataError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Density analysis failed", error);
    const message =
      error instanceof Error ? error.message : "Density analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
