import { useCallback, useState } from "react";
import { CSVUploader } from "@/components/CSVUploader";
import { ColumnMapper } from "@/components/ColumnMapper";
import type { ColumnMapping } from "@/components/ColumnMapper";
import { InsightCallout } from "@/components/InsightCallout";
import { ProductTable } from "@/components/ProductTable";
import { useFirstPurchaseData } from "@/hooks/use-first-purchase-data";
import type { OrderRow } from "@/hooks/use-first-purchase-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, BarChart3 } from "lucide-react";

// ─── CANONICAL HEADER MAP ─────────────────────────────────────────────────────

const CANONICAL: Record<string, keyof ColumnMapping> = {
  "order id": "orderId",
  "order_id": "orderId",
  "orderid": "orderId",
  "customer id": "customerId",
  "customer_id": "customerId",
  "customerid": "customerId",
  "product title": "productTitle",
  "product_title": "productTitle",
  "producttitle": "productTitle",
  "sku": "productTitle",
  "product sku": "productTitle",
  "product_sku": "productTitle",
  "order date": "orderDate",
  "order_date": "orderDate",
  "orderdate": "orderDate",
  "created at": "orderDate",
  "created_at": "orderDate",
  "date": "orderDate",
  "order value": "orderValue",
  "order_value": "orderValue",
  "ordervalue": "orderValue",
  "total": "orderValue",
  "total price": "orderValue",
  "total_price": "orderValue",
  "amount": "orderValue",
};

function autoDetectMapping(headers: string[]): Partial<ColumnMapping> {
  const mapping: Partial<ColumnMapping> = {};
  for (const h of headers) {
    const key = CANONICAL[h.toLowerCase().trim()];
    if (key && !mapping[key]) mapping[key] = h;
  }
  return mapping;
}

function isMappingComplete(m: Partial<ColumnMapping>): m is ColumnMapping {
  return !!(m.orderId && m.customerId && m.productTitle && m.orderDate && m.orderValue);
}

function buildOrders(rows: Record<string, string>[], mapping: ColumnMapping): OrderRow[] {
  const out: OrderRow[] = [];
  for (const row of rows) {
    const dateRaw = row[mapping.orderDate]?.trim();
    const valueRaw = row[mapping.orderValue]?.trim().replace(/[^0-9.-]/g, "");
    const date = new Date(dateRaw ?? "");
    const value = parseFloat(valueRaw ?? "");
    if (!dateRaw || isNaN(date.getTime()) || isNaN(value)) continue;
    out.push({
      orderId: row[mapping.orderId]?.trim() ?? "",
      customerId: row[mapping.customerId]?.trim() ?? "",
      productTitle: row[mapping.productTitle]?.trim() ?? "",
      orderDate: date,
      orderValue: value,
    });
  }
  return out;
}

// ─── APP ──────────────────────────────────────────────────────────────────────

type Stage = "upload" | "mapping" | "results";

export default function App() {
  const [stage, setStage] = useState<Stage>("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({});
  const [orders, setOrders] = useState<OrderRow[]>([]);

  const handleParsed = useCallback((headers: string[], rows: Record<string, string>[]) => {
    setCsvHeaders(headers);
    setCsvRows(rows);
    const auto = autoDetectMapping(headers);
    setMapping(auto);
    if (isMappingComplete(auto)) {
      setOrders(buildOrders(rows, auto));
      setStage("results");
    } else {
      setStage("mapping");
    }
  }, []);

  const handleMappingConfirm = useCallback(() => {
    if (!isMappingComplete(mapping)) return;
    setOrders(buildOrders(csvRows, mapping));
    setStage("results");
  }, [mapping, csvRows]);

  const handleReset = useCallback(() => {
    setStage("upload");
    setCsvHeaders([]);
    setCsvRows([]);
    setMapping({});
    setOrders([]);
  }, []);

  const { products, insightGap } = useFirstPurchaseData(orders);

  const oneDoneCount = products.filter(p => p.oneDoneRisk).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-sm font-semibold leading-none">First Purchase Predictor</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Which product a customer buys first predicts whether they stay.
              </p>
            </div>
          </div>
          {stage === "results" && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              New file
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {stage === "upload" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Upload your orders CSV</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Needs at minimum: order ID, customer ID, product title or SKU, order date, order value.
              </p>
            </div>
            <CSVUploader onParsed={handleParsed} />
          </div>
        )}

        {stage === "mapping" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Column mapping required</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {csvHeaders.length} columns detected in <span className="font-mono">{csvRows.length} rows</span>.
              </p>
            </div>
            <ColumnMapper
              csvHeaders={csvHeaders}
              mapping={mapping}
              onChange={setMapping}
              onConfirm={handleMappingConfirm}
            />
          </div>
        )}

        {stage === "results" && (
          <div className="space-y-6">
            {/* Summary row */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="font-mono text-xs gap-1.5">
                {orders.length.toLocaleString()} orders
              </Badge>
              <Badge variant="outline" className="font-mono text-xs gap-1.5">
                {new Set(orders.map(o => o.customerId)).size.toLocaleString()} customers
              </Badge>
              <Badge variant="outline" className="font-mono text-xs gap-1.5">
                {products.length} first-purchase products
              </Badge>
              {oneDoneCount > 0 && (
                <Badge variant="outline" className="badge-escalate text-xs gap-1.5">
                  {oneDoneCount} one-and-done {oneDoneCount === 1 ? "risk" : "risks"}
                </Badge>
              )}
            </div>

            {/* Insight callout */}
            {insightGap && <InsightCallout gap={insightGap} />}

            {/* Results table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  First-purchase products — ranked by volume
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Repeat rate z-score is relative to all products in this dataset.
                  Retention tier: <span className="text-verified font-medium">strong</span> ≥45% · <span className="text-warning font-medium">moderate</span> 20–44% · <span className="text-destructive font-medium">one-and-done risk</span> &lt;20%.
                </p>
              </CardHeader>
              <CardContent className="p-0 pb-1">
                <ProductTable products={products} />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
