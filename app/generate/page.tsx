import type { Metadata } from "next";
import { AiKitchen } from "@/components/AiKitchen";
import { isAiEnabled } from "@/lib/ai";
import { usedCuisines } from "@/lib/recipes";

export const metadata: Metadata = { title: "AI Kitchen" };
// Read the env var at request time so adding a key in Vercel takes effect without a code change.
export const dynamic = "force-dynamic";

export default function GeneratePage() {
  return <AiKitchen enabled={isAiEnabled()} cuisines={usedCuisines()} />;
}
