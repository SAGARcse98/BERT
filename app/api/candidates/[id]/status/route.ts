import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  return NextResponse.json({
    id,
    status: body.status,
    recruiter_notes: body.recruiter_notes ?? "",
    updated_at: new Date().toISOString(),
  });
}

