import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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
import { formatCurrency, cn } from "@/lib/utils";
import type { ProductAnalysis, RetentionTier } from "@/hooks/use-analysis";

// ─── TIER CONFIG ──────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<RetentionTier, { label: string; className: string }> = {
  verified: { label: "Strong retention", className: "badge-verified" },
  signal: { label: "Moderate retention", className: "badge-signal" },
  escalate: { label: "One-and-done risk", className: "badge-escalate" },
};

// ─── SORT TYPES ───────────────────────────────────────────────────────────────

type SortKey = "name" | "firstPurchaseVolume" | "repeatRate90d" | "avgSpend90d" | "avgSpend180d";
type SortDir = "asc" | "desc";

interface SortState {
  key: SortKey;
  dir: SortDir;
}

// ─── COLUMN HEADER ────────────────────────────────────────────────────────────

function SortableHead({
  label,
  sortKey,
  current,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  current: SortState;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = current.key === sortKey;
  const Icon = active ? (current.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead
      className={cn("cursor-pointer select-none group", className)}
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-1 justify-end">
        <span className={active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}>
          {label}
        </span>
        <Icon
          className={cn(
            "h-3 w-3 transition-colors",
            active ? "text-foreground" : "text-muted-foreground/50 group-hover:text-muted-foreground",
          )}
        />
      </span>
    </TableHead>
  );
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface SortableProductTableProps {
  products: ProductAnalysis[];
}

export function SortableProductTable({ products }: SortableProductTableProps) {
  const [sort, setSort] = useState<SortState>({ key: "repeatRate90d", dir: "desc" });

  const toggleSort = (key: SortKey) => {
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "name" ? "asc" : "desc" },
    );
  };

  const sorted = useMemo(() => {
    return [...products].sort((a, b) => {
      let cmp = 0;
      if (sort.key === "name") {
        cmp = a.name.localeCompare(b.name);
      } else {
        cmp = a[sort.key] - b[sort.key];
      }
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [products, sort]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHead
            label="Product"
            sortKey="name"
            current={sort}
            onSort={toggleSort}
            className="text-left [&>span]:justify-start"
          />
          <SortableHead
            label="1st purchase vol"
            sortKey="firstPurchaseVolume"
            current={sort}
            onSort={toggleSort}
            className="text-right"
          />
          <SortableHead
            label="90d repeat rate"
            sortKey="repeatRate90d"
            current={sort}
            onSort={toggleSort}
            className="text-right"
          />
          <SortableHead
            label="LTV 90d"
            sortKey="avgSpend90d"
            current={sort}
            onSort={toggleSort}
            className="text-right"
          />
          <SortableHead
            label="LTV 180d"
            sortKey="avgSpend180d"
            current={sort}
            onSort={toggleSort}
            className="text-right"
          />
          <TableHead className="text-left">Retention tier</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
              Add at least one product above to see results.
            </TableCell>
          </TableRow>
        ) : (
          sorted.map(p => {
            const tier = TIER_CONFIG[p.retentionTier];
            return (
              <TableRow key={p.id}>
                <TableCell className="max-w-[200px]">
                  <p className="text-sm font-medium truncate" title={p.name}>
                    {p.name}
                  </p>
                </TableCell>
                <TableCell className="text-right font-mono text-sm tabular-nums">
                  {p.firstPurchaseVolume.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="font-mono text-sm tabular-nums">
                      {p.repeatRate90d.toFixed(1)}%
                    </span>
                    <ZScoreBadge
                      zScore={p.zScore}
                      classification={p.zClassification}
                      compact
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-sm tabular-nums">
                  {formatCurrency(p.avgSpend90d)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm tabular-nums">
                  {formatCurrency(p.avgSpend180d)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] px-1.5 py-0 whitespace-nowrap", tier.className)}
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
