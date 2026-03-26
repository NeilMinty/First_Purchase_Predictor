import { useCallback } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ProductFormRow } from "@/hooks/use-analysis";

const MAX_PRODUCTS = 10;

const EMPTY_ROW_DEFAULTS: Omit<ProductFormRow, "id"> = {
  name: "",
  firstPurchaseVolume: "",
  repeatRate90d: "",
  avgSpend90d: "",
  avgSpend180d: "",
  fullPricePct: "",
  discountDepth: "",
};

interface ProductInputFormProps {
  rows: ProductFormRow[];
  onChange: (rows: ProductFormRow[]) => void;
}

function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("text-[10px] uppercase tracking-wide text-muted-foreground font-medium", className)}>
      {children}
    </span>
  );
}

function NumInput({
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
  muted,
}: {
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  muted?: boolean;
}) {
  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-2.5 text-xs text-muted-foreground font-mono pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <Input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? "0"}
        className={cn(
          "h-8 text-sm font-mono",
          prefix && "pl-6",
          suffix && "pr-6",
          muted && "placeholder:text-muted-foreground/40",
        )}
      />
      {suffix && (
        <span className="absolute right-2.5 text-xs text-muted-foreground font-mono pointer-events-none select-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

// Grid template shared between header and rows
const GRID = "1fr 4.5rem 6rem 5.5rem 5.5rem 5.5rem 5.5rem 2rem";

export function ProductInputForm({ rows, onChange }: ProductInputFormProps) {
  const update = useCallback(
    (id: string, field: keyof ProductFormRow, value: string) => {
      onChange(rows.map(r => (r.id === id ? { ...r, [field]: value } : r)));
    },
    [rows, onChange],
  );

  const remove = useCallback(
    (id: string) => {
      if (rows.length <= 1) return;
      onChange(rows.filter(r => r.id !== id));
    },
    [rows, onChange],
  );

  const add = useCallback(() => {
    if (rows.length >= MAX_PRODUCTS) return;
    onChange([...rows, { id: crypto.randomUUID(), ...EMPTY_ROW_DEFAULTS }]);
  }, [rows, onChange]);

  return (
    <div className="space-y-2">
      {/* Column headers */}
      <div className="hidden sm:grid gap-2 px-1" style={{ gridTemplateColumns: GRID }}>
        <FieldLabel>Product name</FieldLabel>
        <FieldLabel className="text-right">Volume</FieldLabel>
        <FieldLabel className="text-right">90d repeat</FieldLabel>
        <FieldLabel className="text-right">Spend 90d</FieldLabel>
        <FieldLabel className="text-right">Spend 180d</FieldLabel>
        <FieldLabel className="text-right">Full price %</FieldLabel>
        <FieldLabel className="text-right">Disc. depth</FieldLabel>
        <span />
      </div>

      {/* Product rows */}
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div
            key={row.id}
            className="grid gap-2 items-center"
            style={{ gridTemplateColumns: GRID }}
          >
            <div>
              <span className="sm:hidden block">
                <FieldLabel>Product {idx + 1}</FieldLabel>
              </span>
              <Input
                value={row.name}
                onChange={e => update(row.id, "name", e.target.value)}
                placeholder="Product name"
                className="h-8 text-sm"
              />
            </div>

            <NumInput
              value={row.firstPurchaseVolume}
              onChange={v => update(row.id, "firstPurchaseVolume", v)}
            />
            <NumInput
              value={row.repeatRate90d}
              onChange={v => update(row.id, "repeatRate90d", v)}
              suffix="%"
            />
            <NumInput
              value={row.avgSpend90d}
              onChange={v => update(row.id, "avgSpend90d", v)}
              prefix="£"
            />
            <NumInput
              value={row.avgSpend180d}
              onChange={v => update(row.id, "avgSpend180d", v)}
              prefix="£"
            />
            <NumInput
              value={row.fullPricePct}
              onChange={v => update(row.id, "fullPricePct", v)}
              suffix="%"
              placeholder="100"
            />
            <NumInput
              value={row.discountDepth}
              onChange={v => update(row.id, "discountDepth", v)}
              suffix="%"
              placeholder="optional"
              muted
            />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => remove(row.id)}
              disabled={rows.length <= 1}
              aria-label="Remove product"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-1 gap-1.5 text-xs"
        onClick={add}
        disabled={rows.length >= MAX_PRODUCTS}
      >
        <Plus className="h-3.5 w-3.5" />
        Add product
        {rows.length >= MAX_PRODUCTS && (
          <span className="text-muted-foreground">(max {MAX_PRODUCTS})</span>
        )}
      </Button>
    </div>
  );
}
