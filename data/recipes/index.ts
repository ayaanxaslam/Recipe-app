import type { Recipe } from "@/lib/types";
import breakfast from "./breakfast";
import appetizers from "./appetizers";
import soups from "./soups";
import salads from "./salads";
import mains from "./mains";
import seafood from "./seafood";
import meatless from "./meatless";
import pasta from "./pasta";
import rice from "./rice";
import sides from "./sides";
import desserts from "./desserts";
import baking from "./baking";
import drinks from "./drinks";

/**
 * Every recipe on the site. To add your own, append it to the matching
 * category file (or create a new file and add it here).
 */
export const recipes: Recipe[] = [
  ...breakfast,
  ...appetizers,
  ...soups,
  ...salads,
  ...mains,
  ...seafood,
  ...meatless,
  ...pasta,
  ...rice,
  ...sides,
  ...desserts,
  ...baking,
  ...drinks,
];
