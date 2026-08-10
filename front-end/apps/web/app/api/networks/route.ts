import { NextResponse } from "next/server";

import { getActiveChains } from "@/lib/networks";

export const revalidate = 3600;

export async function GET() {
  try {
    const chains = await getActiveChains();
    return NextResponse.json({
      networks: chains.map((chain) => chain.name),
    });
  } catch (error) {
    console.error("Unable to load HyperSync networks", error);
    return NextResponse.json(
      { error: "Unable to load HyperSync networks" },
      { status: 502 }
    );
  }
}
