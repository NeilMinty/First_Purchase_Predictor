import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ZScoreBadge } from "@/lib/z-score";
import { formatCurrency } from "@/lib/utils";
import type { FirstPurchaseProduct, RetentionTier } from "@/hooks/use-first-purchase-data";

const TIER_CONFIG: Record<RetentionTier, { label: string; className: string }> = {
  verified: { label: "Strong retention", className: "badge-verified" },
  signal: { label: "Moderate retention", className: "badge-signal" },
  escalate: { label: "One-and-done risk", className: "badge-escalate" },
};

interface ProductTableProps {
  products: FirstPurchaseProduct[];
}

export function ProductTable({ products }: ProductTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead className="text-right font-mono">1st Purchase Vol</TableHead>
          <TableHead className="text-right">Repeat Rate</TableHead>
          <TableHead className="text-right font-mono">Avg LTV 90d</TableHead>
          <TableHead className="text-right font-mono">Avg LTV 180d</TableHead>
          <TableHead className="text-right font-mono">Avg Orders</TableHead>
          <TableHead>Retention Tier</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
              No data available
            </TableCell>
          </TableRow>
        ) : (
          products.map(p => {
            const tier = TIER_CONFIG[p.retentionTier];
            return (
              <TableRow key={p.productTitle} className={p.oneDoneRisk ? "bg-destructive/3" : undefined}>
                <TableCell className="max-w-[280px]">
                  <p className="text-sm font-medium leading-tight truncate" title={p.productTitle}>
                    {p.productTitle}
                  </p>
                  {p.oneDoneRisk && (
                    <p className="text-[10px] text-destructive mt-0.5">
                      High volume · poor retention
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {p.firstPurchaseVolume.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="font-mono text-sm">
                      {(p.repeatPurchaseRate * 100).toFixed(1)}%
                    </span>
                    <ZScoreBadge
                      zScore={p.repeatRateZScore}
                      classification={p.repeatRateZClassification}
                      compact
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatCurrency(p.avgLtv90d)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatCurrency(p.avgLtv180d)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {p.avgOrderFrequency.toFixed(1)}x
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${tier.className}`}
                  >
                    {tier.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
