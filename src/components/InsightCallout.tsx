import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import type { ProductAnalysis } from "@/hooks/use-analysis";

interface InsightCalloutProps {
  highestVolume: ProductAnalysis;
  highestRetention: ProductAnalysis;
  allProducts: ProductAnalysis[];
}

export function InsightCallout({ highestVolume, highestRetention, allProducts }: InsightCalloutProps) {
  // ── Determine main state ──────────────────────────────────────────────────

  let mainCard: React.ReactNode;

  // Priority 1: best-retention product is in the bottom third by volume
  const underPromoted = (() => {
    if (allProducts.length < 3) return false;
    const byVolume = [...allProducts].sort((a, b) => b.firstPurchaseVolume - a.firstPurchaseVolume);
    const bottomThirdStart = Math.ceil((2 * allProducts.length) / 3);
    const bottomThirdIds = new Set(byVolume.slice(bottomThirdStart).map(p => p.id));
    return bottomThirdIds.has(highestRetention.id);
  })();

  if (underPromoted) {
    mainCard = (
      <Card className="border-signal/30 bg-signal/5">
        <CardContent className="p-4 flex items-start gap-3">
          <TrendingUp className="h-4 w-4 text-signal mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-medium">{highestRetention.name}</span> produces your strongest
            long-term customers but only{" "}
            <span className="font-mono font-medium">{highestRetention.firstPurchaseVolume}</span>{" "}
            customers have started there. It may be under-promoted in acquisition — worth testing as
            a hero product.
          </p>
        </CardContent>
      </Card>
    );
  } else if (highestVolume.id === highestRetention.id) {
    // Priority 2: bestseller = best retention
    mainCard = (
      <Card className="border-verified/30 bg-verified/5">
        <CardContent className="p-4 flex items-start gap-3">
          <CheckCircle2 className="h-4 w-4 text-verified mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            Your bestseller is also your best retention product —{" "}
            <span className="font-medium">{highestVolume.name}</span>. That's rare. Protect it in
            acquisition.
          </p>
        </CardContent>
      </Card>
    );
  } else {
    // Priority 3: volume and retention diverge
    mainCard = (
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            You're acquiring most customers through{" "}
            <span className="font-medium">{highestVolume.name}</span> but your best long-term
            customers start with{" "}
            <span className="font-medium">{highestRetention.name}</span>. Consider shifting
            acquisition spend.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ── Promotional caveats ───────────────────────────────────────────────────

  const retentionCaveat =
    highestRetention.fullPricePct < 50 ? (
      <p className="text-[11px] text-muted-foreground px-1">
        Note: {highestRetention.fullPricePct.toFixed(0)}% of{" "}
        <span className="font-medium text-foreground">{highestRetention.name}</span>'s first
        purchases were discounted. Validate whether retention holds for full-price acquirees before
        shifting acquisition spend.
      </p>
    ) : null;

  const volumeCaveat =
    highestVolume.fullPricePct < 50 && highestVolume.id !== highestRetention.id ? (
      <p className="text-[11px] text-muted-foreground px-1">
        <span className="font-medium text-foreground">{highestVolume.name}</span> is your highest
        volume first purchase product but{" "}
        {(100 - highestVolume.fullPricePct).toFixed(0)}% of those customers were acquired on
        promotion — volume may be driven by discount sensitivity rather than product-market fit.
      </p>
    ) : null;

  return (
    <>
      {mainCard}
      {retentionCaveat}
      {volumeCaveat}
    </>
  );
}
