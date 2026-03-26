import { useMemo } from "react";
import { computeZScore } from "@/lib/z-score";
import type { ZClassification } from "@/lib/z-score";

// ─── INPUT TYPES ─────────────────────────────────────────────────────────────

export interface ProductFormRow {
  id: string;
  name: string;
  firstPurchaseVolume: string;
  repeatRate90d: string;
  avgSpend90d: string;
  avgSpend180d: string;
}

// ─── OUTPUT TYPES ─────────────────────────────────────────────────────────────

export type RetentionTier = "verified" | "signal" | "escalate";

export interface ProductAnalysis {
  id: string;
  name: string;
  firstPurchaseVolume: number;
  repeatRate90d: number;
  zScore: number;
  zClassification: ZClassification;
  avgSpend90d: number;
  avgSpend180d: number;
  retentionTier: RetentionTier;
}

export interface AnalysisResult {
  products: ProductAnalysis[];
  highestVolumeProduct: ProductAnalysis | null;
  highestRetentionProduct: ProductAnalysis | null;
  retentionGap: number;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function parseNum(s: string): number {
  const n = parseFloat(s.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function assignRetentionTier(index: number, total: number): RetentionTier {
  if (total <= 1) return "verified";
  if (total === 2) return index === 0 ? "verified" : "escalate";
  const third = total / 3;
  if (index < third) return "verified";
  if (index < 2 * third) return "signal";
  return "escalate";
}

// ─── ANALYSIS ─────────────────────────────────────────────────────────────────

export function computeAnalysis(rows: ProductFormRow[]): AnalysisResult {
  const valid = rows.filter(r => r.name.trim() && parseNum(r.firstPurchaseVolume) > 0);

  if (valid.length === 0) {
    return { products: [], highestVolumeProduct: null, highestRetentionProduct: null, retentionGap: 0 };
  }

  const rates = valid.map(r => parseNum(r.repeatRate90d));
  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
  const variance = rates.reduce((s, r) => s + (r - mean) ** 2, 0) / rates.length;
  const stdDev = Math.sqrt(variance);

  // Sort by repeat rate desc to assign retention tiers
  const sortedByRate = [...valid].sort(
    (a, b) => parseNum(b.repeatRate90d) - parseNum(a.repeatRate90d),
  );
  const tierMap = new Map<string, RetentionTier>();
  sortedByRate.forEach((r, i) => tierMap.set(r.id, assignRetentionTier(i, valid.length)));

  const products: ProductAnalysis[] = valid.map(r => {
    const rate = parseNum(r.repeatRate90d);
    const { zScore, zClassification } = computeZScore(rate, mean, stdDev);
    return {
      id: r.id,
      name: r.name.trim(),
      firstPurchaseVolume: parseNum(r.firstPurchaseVolume),
      repeatRate90d: rate,
      zScore,
      zClassification,
      avgSpend90d: parseNum(r.avgSpend90d),
      avgSpend180d: parseNum(r.avgSpend180d),
      retentionTier: tierMap.get(r.id) ?? "signal",
    };
  });

  const byVolume = [...products].sort((a, b) => b.firstPurchaseVolume - a.firstPurchaseVolume);
  const byRetention = [...products].sort((a, b) => b.repeatRate90d - a.repeatRate90d);

  const allRates = products.map(p => p.repeatRate90d);
  const retentionGap =
    products.length >= 2 ? Math.max(...allRates) - Math.min(...allRates) : 0;

  return {
    products,
    highestVolumeProduct: byVolume[0] ?? null,
    highestRetentionProduct: byRetention[0] ?? null,
    retentionGap,
  };
}

export function useAnalysis(rows: ProductFormRow[]) {
  return useMemo(() => computeAnalysis(rows), [rows]);
}
