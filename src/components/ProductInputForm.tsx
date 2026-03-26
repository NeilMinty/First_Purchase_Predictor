import { useCallback } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ProductFormRow } from "@/hooks/use-analysis";

const MAX_PRODUCTS = 10;

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
}: {
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
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
    onChange([
      ...rows,
      { id: crypto.randomUUID(), name: "", firstPurchaseVolume: "", repeatRate90d: "", avgSpend90d: "", avgSpend180d: "" },
    ]);
  }, [rows, onChange]);

  return (
    <div className="space-y-2">
      {/* Column headers */}
      <div className="hidden sm:grid gap-2 px-1" style={{ gridTemplateColumns: "1fr 6rem 7rem 7rem 7rem 2rem" }}>
        <FieldLabel>Product name</FieldLabel>
        <FieldLabel className="text-right">1st purchase vol</FieldLabel>
        <FieldLabel className="text-right">90d repeat rate</FieldLabel>
        <FieldLabel className="text-right">Avg spend 90d</FieldLabel>
        <FieldLabel className="text-right">Avg spend 180d</FieldLabel>
        <span />
      </div>

      {/* Product rows */}
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div
            key={row.id}
            className="grid gap-2 items-center"
            style={{ gridTemplateColumns: "1fr 6rem 7rem 7rem 7rem 2rem" }}
          >
            {/* Mobile: show labels above each field on xs */}
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
              placeholder="0"
            />
            <NumInput
              value={row.repeatRate90d}
              onChange={v => update(row.id, "repeatRate90d", v)}
              suffix="%"
              placeholder="0"
            />
            <NumInput
              value={row.avgSpend90d}
              onChange={v => update(row.id, "avgSpend90d", v)}
              prefix="£"
              placeholder="0"
            />
            <NumInput
              value={row.avgSpend180d}
              onChange={v => update(row.id, "avgSpend180d", v)}
              prefix="£"
              placeholder="0"
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
        {rows.length >= MAX_PRODUCTS && <span className="text-muted-foreground">(max {MAX_PRODUCTS})</span>}
      </Button>
    </div>
  );
}
