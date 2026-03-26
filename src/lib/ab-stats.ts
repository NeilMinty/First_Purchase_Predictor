/**
 * ab-stats.ts
 *
 * Pure A/B test statistical functions shared between the frontend and
 * cro-agent-daily edge function.
 *
 * Stats model: two-proportion z-test (frequentist)
 *   Power  = 0.80 (z_β  = 0.842)
 *   α      = 0.05 two-tailed (z_α/2 = 1.96)
 *   MDE    = 10% relative lift from baseline CVR (default)
 *
 * NOTE: Confidence is two-tailed: (2 × Φ(|z|) − 1) × 100.
 * At z=1.96 this gives 95% — correct for α=0.05 two-tailed.
 * normalCDF(|z|) alone gives 97.5% which is the one-tailed value.
 */

// ─── NORMAL DISTRIBUTION ─────────────────────────────────────────────────────

/** Horner-form erf approximation (Abramowitz & Stegun 7.1.26, max error ≤1.5×10⁻⁷). */
export function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const poly =
    t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const result = 1 - poly * Math.exp(-x * x);
  return x >= 0 ? result : -result;
}

/** Cumulative distribution function of the standard normal distribution. */
export function normalCDF(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

// ─── A/B TEST STATS ───────────────────────────────────────────────────────────

export interface ABStatsResult {
  z: number;
  /** Two-tailed confidence percentage (0–100). At z=1.96 → 95%. */
  confidence: number;
  /** Relative lift as formatted string, e.g. "+12.5%" or "—". */
  lift: string;
}

/**
 * Two-proportion z-test.
 * Returns two-tailed confidence so the threshold `confidence >= 95` maps to α=0.05.
 */
export function abTestStats(
  controlSessions: number,
  controlConversions: number,
  variantSessions: number,
  variantConversions: number,
): ABStatsResult {
  if (controlSessions === 0 || variantSessions === 0) {
    return { z: 0, confidence: 0, lift: "—" };
  }

  const p1 = controlConversions / controlSessions;
  const p2 = variantConversions / variantSessions;
  const pooled =
    (controlConversions + variantConversions) / (controlSessions + variantSessions);
  const se = Math.sqrt(
    pooled * (1 - pooled) * (1 / controlSessions + 1 / variantSessions),
  );

  if (se === 0) return { z: 0, confidence: 0, lift: "—" };

  const z = (p2 - p1) / se;
  const confidence = (2 * normalCDF(Math.abs(z)) - 1) * 100;
  const lift =
    p1 > 0
      ? `${p2 > p1 ? "+" : ""}${(((p2 - p1) / p1) * 100).toFixed(1)}%`
      : "—";

  return { z, confidence, lift };
}

/**
 * Required sample size per variant.
 * Formula: n = (z_α/2 + z_β)² × (p1(1−p1) + p2(1−p2)) / (p2−p1)²
 * where z_α/2 = 1.96, z_β = 0.842, p2 = p1 × (1 + mde).
 */
export function requiredSampleSize(baselineCvrPct: number, mde = 0.1): number {
  const p1 = baselineCvrPct / 100;
  const p2 = p1 * (1 + mde);
  if (p1 <= 0 || p1 >= 1 || p2 <= 0 || p2 >= 1 || p1 === p2) return 1000;
  const zTerms = Math.pow(1.96 + 0.842, 2);
  const numerator = zTerms * (p1 * (1 - p1) + p2 * (1 - p2));
  const denominator = Math.pow(p2 - p1, 2);
  return Math.ceil(numerator / denominator);
}
