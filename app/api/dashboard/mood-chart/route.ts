import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getDashboardMoodChart } from "@/lib/dashboard";
import { dashboardMoodChartQuerySchema } from "@/lib/validators";

async function getUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET(request: Request) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const parsed = dashboardMoodChartQuerySchema.safeParse({
    days: searchParams.get("days") ?? undefined,
  });
  const query = parsed.success
    ? parsed.data
    : dashboardMoodChartQuerySchema.parse({});
  const dashboardData = await getDashboardMoodChart(userId, query.days);

  return NextResponse.json(dashboardData);
}
