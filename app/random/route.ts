import { NextResponse, type NextRequest } from "next/server";
import { getAllRecipes } from "@/lib/recipes";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const all = getAllRecipes();
  const pick = all[Math.floor(Math.random() * all.length)];
  return NextResponse.redirect(new URL(`/recipes/${pick.slug}`, request.url), 307);
}
