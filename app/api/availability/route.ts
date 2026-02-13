import { NextResponse } from "next/server";
import { getAvailabilityForRange } from "@/lib/availability";
import { isValidDateRange, parseDateOnly } from "@/lib/dates";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId")?.trim();
  const startInput = searchParams.get("startDate")?.trim();
  const endInput = searchParams.get("endDate")?.trim();

  if (!locationId || !startInput || !endInput) {
    return NextResponse.json({ error: "Missing locationId, startDate, or endDate." }, { status: 400 });
  }

  const startDate = parseDateOnly(startInput);
  const endDate = parseDateOnly(endInput);

  if (!isValidDateRange(startDate, endDate)) {
    return NextResponse.json({ error: "Invalid date range." }, { status: 400 });
  }

  try {
    const availability = await getAvailabilityForRange(locationId, startDate, endDate);
    return NextResponse.json(availability);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Availability check failed."
      },
      { status: 400 }
    );
  }
}