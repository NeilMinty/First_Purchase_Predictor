import { useMemo } from "react";
import { computeZScore } from "@/lib/z-score";
import type { ZClassification } from "@/lib/z-score";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface OrderRow {
  orderId: string;
  customerId: string;
  productTitle: string;
  orderDate: Date;
  orderValue: number;
}

export type RetentionTier = "verified" | "signal" | "escalate";

export interface FirstPurchaseProduct {
  productTitle: string;
  firstPurchaseVolume: number;
  repeatPurchaseRate: number;
  repeatRateZScore: number;
  repeatRateZClassification: ZClassification;
  avgLtv90d: number;
  avgLtv180d: number;
  avgOrderFrequency: number;
  retentionTier: RetentionTier;
  oneDoneRisk: boolean;
}

export interface InsightGap {
  highestVolumeProduct: string;
  highestVolumeCount: number;
  highestRetentionProduct: string;
  highestRetentionRate: number;
  areSame: boolean;
  volumeProductRepeatRate: number;
}

// ─── ANALYSIS ────────────────────────────────────────────────────────────────

function msToDays(ms: number): number {
  return ms / (1000 * 60 * 60 * 24);
}

function retentionTier(repeatRate: number): RetentionTier {
  if (repeatRate >= 0.45) return "verified";
  if (repeatRate >= 0.20) return "signal";
  return "escalate";
}

export function analyseFirstPurchases(orders: OrderRow[]): {
  products: FirstPurchaseProduct[];
  insightGap: InsightGap | null;
} {
  if (orders.length === 0) return { products: [], insightGap: null };

  // Sort all orders by date ascending
  const sorted = [...orders].sort((a, b) => a.orderDate.getTime() - b.orderDate.getTime());

  // Find each customer's first purchase
  const firstPurchaseByCustomer = new Map<string, OrderRow>();
  for (const order of sorted) {
    if (!firstPurchaseByCustomer.has(order.customerId)) {
      firstPurchaseByCustomer.set(order.customerId, order);
    }
  }

  // Build per-product customer lists
  const productCustomers = new Map<string, string[]>();
  for (const [customerId, firstOrder] of firstPurchaseByCustomer) {
    const title = firstOrder.productTitle;
    if (!productCustomers.has(title)) productCustomers.set(title, []);
    productCustomers.get(title)!.push(customerId);
  }

  // Build per-customer order lookup
  const ordersByCustomer = new Map<string, OrderRow[]>();
  for (const order of sorted) {
    if (!ordersByCustomer.has(order.customerId)) ordersByCustomer.set(order.customerId, []);
    ordersByCustomer.get(order.customerId)!.push(order);
  }

  // Compute stats per product
  const rawProducts: Array<{ title: string; repeatRate: number; volume: number; ltv90: number; ltv180: number; avgFreq: number }> = [];

  for (const [title, customerIds] of productCustomers) {
    let repeaters = 0;
    let totalLtv90 = 0;
    let totalLtv180 = 0;
    let totalOrders = 0;

    for (const cid of customerIds) {
      const firstOrder = firstPurchaseByCustomer.get(cid)!;
      const allOrders = ordersByCustomer.get(cid) ?? [];
      const firstDate = firstOrder.orderDate.getTime();

      if (allOrders.length > 1) repeaters++;

      let ltv90 = 0;
      let ltv180 = 0;
      for (const o of allOrders) {
        const days = msToDays(o.orderDate.getTime() - firstDate);
        if (days <= 90) ltv90 += o.orderValue;
        if (days <= 180) ltv180 += o.orderValue;
      }
      totalLtv90 += ltv90;
      totalLtv180 += ltv180;
      totalOrders += allOrders.length;
    }

    const n = customerIds.length;
    rawProducts.push({
      title,
      repeatRate: n > 0 ? repeaters / n : 0,
      volume: n,
      ltv90: n > 0 ? totalLtv90 / n : 0,
      ltv180: n > 0 ? totalLtv180 / n : 0,
      avgFreq: n > 0 ? totalOrders / n : 0,
    });
  }

  // Compute z-scores on repeat rate
  const rates = rawProducts.map(p => p.repeatRate);
  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
  const variance = rates.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rates.length;
  const stdDev = Math.sqrt(variance);

  const products: FirstPurchaseProduct[] = rawProducts
    .sort((a, b) => b.volume - a.volume)
    .map(p => {
      const { zScore, zClassification } = computeZScore(p.repeatRate, mean, stdDev);
      const tier = retentionTier(p.repeatRate);
      return {
        productTitle: p.title,
        firstPurchaseVolume: p.volume,
        repeatPurchaseRate: p.repeatRate,
        repeatRateZScore: zScore,
        repeatRateZClassification: zClassification,
        avgLtv90d: p.ltv90,
        avgLtv180d: p.ltv180,
        avgOrderFrequency: p.avgFreq,
        retentionTier: tier,
        oneDoneRisk: tier === "escalate" && p.volume >= 10,
      };
    });

  // Insight gap
  if (products.length === 0) return { products, insightGap: null };

  const highestVolume = products[0];
  const highestRetention = [...products].sort((a, b) => b.repeatPurchaseRate - a.repeatPurchaseRate)[0];
  const areSame = highestVolume.productTitle === highestRetention.productTitle;

  const insightGap: InsightGap = {
    highestVolumeProduct: highestVolume.productTitle,
    highestVolumeCount: highestVolume.firstPurchaseVolume,
    highestRetentionProduct: highestRetention.productTitle,
    highestRetentionRate: highestRetention.repeatPurchaseRate,
    areSame,
    volumeProductRepeatRate: highestVolume.repeatPurchaseRate,
  };

  return { products, insightGap };
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useFirstPurchaseData(orders: OrderRow[]) {
  return useMemo(() => analyseFirstPurchases(orders), [orders]);
}
