const UNICODE_FRACTIONS: Record<string, number> = {
  "½": 1 / 2,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "¼": 1 / 4,
  "¾": 3 / 4,
  "⅛": 1 / 8,
  "⅜": 3 / 8,
  "⅝": 5 / 8,
  "⅞": 7 / 8,
};

const NUM = String.raw`(?:\d+\s+\d+\/\d+|\d+\/\d+|\d*\.\d+|\d+[½⅓⅔¼¾⅛⅜⅝⅞]?|[½⅓⅔¼¾⅛⅜⅝⅞])`;
const LEADING = new RegExp(String.raw`^(${NUM})(\s*(?:-|–|to)\s*(${NUM}))?(?=\s|$|[a-zA-Z(])`);

function parseNumber(raw: string): number {
  const s = raw.trim();
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const withUnicode = s.match(/^(\d*)([½⅓⅔¼¾⅛⅜⅝⅞])$/);
  if (withUnicode) return Number(withUnicode[1] || 0) + UNICODE_FRACTIONS[withUnicode[2]];
  return Number(s);
}

const NICE: [number, string][] = [
  [0, ""],
  [1 / 8, "⅛"],
  [1 / 4, "¼"],
  [1 / 3, "⅓"],
  [3 / 8, "⅜"],
  [1 / 2, "½"],
  [5 / 8, "⅝"],
  [2 / 3, "⅔"],
  [3 / 4, "¾"],
  [7 / 8, "⅞"],
  [1, ""],
];

export function formatQuantity(n: number): string {
  if (n >= 20) return String(Math.round(n));
  if (n >= 10) return String(Math.round(n * 2) / 2).replace(".5", "½");
  let whole = Math.floor(n);
  const rest = n - whole;
  let best = NICE[0];
  for (const candidate of NICE) {
    if (Math.abs(candidate[0] - rest) < Math.abs(best[0] - rest)) best = candidate;
  }
  if (best[0] === 1) {
    whole += 1;
    best = NICE[0];
  }
  if (whole === 0 && best[1] === "") return "⅛";
  return `${whole || ""}${best[1]}`;
}

/** Scale the leading quantity of an ingredient line, e.g. "1 1/2 cups flour" × 2 → "3 cups flour". */
export function scaleIngredient(line: string, factor: number): string {
  if (factor === 1) return prettify(line);
  const m = line.match(LEADING);
  if (!m) return line;
  const first = formatQuantity(parseNumber(m[1]) * factor);
  const second = m[3] ? `–${formatQuantity(parseNumber(m[3]) * factor)}` : "";
  return first + second + line.slice(m[0].length);
}

/** Render ASCII fractions with nicer glyphs without changing the amount. */
function prettify(line: string): string {
  const m = line.match(LEADING);
  if (!m) return line;
  const first = formatQuantity(parseNumber(m[1]));
  const second = m[3] ? `–${formatQuantity(parseNumber(m[3]))}` : "";
  return first + second + line.slice(m[0].length);
}
