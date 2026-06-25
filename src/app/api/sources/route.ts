import { NextResponse } from "next/server";
import { sourceSchema } from "@/lib/validation/source";
import { createSource } from "@/lib/queries/createSource";
import { listSources } from "@/lib/queries/listSources";
import type {
  CreateSourceResponse,
  ListSourcesResponse,
} from "@/lib/types/source";

// GET /api/sources — list all registered sources (most recent first).
export async function GET() {
  try {
    const sources = await listSources();
    const body: ListSourcesResponse = { sources };
    return NextResponse.json(body);
  } catch (error) {
    console.error("[GET /api/sources] failed", error);
    return NextResponse.json({ sources: [] }, { status: 500 });
  }
}

// POST /api/sources — register a new source.
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    const body: CreateSourceResponse = {
      success: false,
      error: "Invalid request body.",
    };
    return NextResponse.json(body, { status: 400 });
  }

  const parsed = sourceSchema.safeParse(payload);
  if (!parsed.success) {
    const body: CreateSourceResponse = {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Validation failed.",
    };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const sourceId = await createSource(parsed.data);
    const body: CreateSourceResponse = { success: true, sourceId };
    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    console.error("[POST /api/sources] failed", error);
    const body: CreateSourceResponse = {
      success: false,
      error: "Could not save source. Please try again.",
    };
    return NextResponse.json(body, { status: 500 });
  }
}
