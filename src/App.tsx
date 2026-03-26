import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProductInputForm } from "@/components/ProductInputForm";
import { InsightCallout } from "@/components/InsightCallout";
import { RetentionGapMetric } from "@/components/RetentionGapMetric";
import { SortableProductTable } from "@/components/SortableProductTable";
import { useAnalysis } from "@/hooks/use-analysis";
import type { ProductFormRow } from "@/hooks/use-analysis";

// ─── DEMO DATA ────────────────────────────────────────────────────────────────

const DEMO_ROWS: ProductFormRow[] = [
  {
    id: "d1",
    name: "SKU-001",
    firstPurchaseVolume: "96",
    repeatRate90d: "64",
    avgSpend90d: "48",
    avgSpend180d: "82",
  },
  {
    id: "d2",
    name: "SKU-002",
    firstPurchaseVolume: "164",
    repeatRate90d: "52",
    avgSpend90d: "38",
    avgSpend180d: "64",
  },
  {
    id: "d3",
    name: "SKU-003",
    firstPurchaseVolume: "112",
    repeatRate90d: "28",
    avgSpend90d: "22",
    avgSpend180d: "34",
  },
];

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [rows, setRows] = useState<ProductFormRow[]>(DEMO_ROWS);
  const { products, highestVolumeProduct, highestRetentionProduct, retentionGap } =
    useAnalysis(rows);

  const showOutput = products.length >= 1;
  const showInsight = products.length >= 2 && highestVolumeProduct && highestRetentionProduct;
  const lowestRetentionProduct =
    products.length >= 2
      ? [...products].sort((a, b) => a.repeatRate90d - b.repeatRate90d)[0]
      : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-sm font-semibold leading-none">First Purchase Predictor</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Which product a customer buys first predicts whether they come back.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* ── Input section ── */}
        <section>
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Your products</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter data for each first-purchase product. Output updates live.
            </p>
          </div>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <ProductInputForm rows={rows} onChange={setRows} />
            </CardContent>
          </Card>
        </section>

        {/* ── Output section ── */}
        {showOutput && (
          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Analysis</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {products.length} product{products.length !== 1 ? "s" : ""} analysed. Retention tiers assigned by thirds — top third{" "}
                <span className="text-verified font-medium">strong</span>, middle third{" "}
                <span className="text-warning font-medium">moderate</span>, bottom third{" "}
                <span className="text-destructive font-medium">one-and-done risk</span>.
              </p>
            </div>

            {/* Insight callout */}
            {showInsight && (
              <InsightCallout
                highestVolume={highestVolumeProduct!}
                highestRetention={highestRetentionProduct!}
              />
            )}

            {/* Retention gap metric */}
            {products.length >= 2 && highestRetentionProduct && lowestRetentionProduct && (
              <RetentionGapMetric
                gap={retentionGap}
                highestRetentionName={highestRetentionProduct.name}
                lowestRetentionName={lowestRetentionProduct.name}
              />
            )}

            <Separator />

            {/* Sortable table */}
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  First-purchase products ranked
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-1">
                <SortableProductTable products={products} />
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      <footer className="border-t border-border mt-16 py-4">
        <p className="text-center text-xs text-muted-foreground">
          First Purchase Predictor — calculator only, no data stored.
        </p>
      </footer>
    </div>
  );
}
