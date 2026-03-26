import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export type ColumnMapping = {
  orderId: string;
  customerId: string;
  productTitle: string;
  orderDate: string;
  orderValue: string;
};

const REQUIRED_FIELDS: Array<{ key: keyof ColumnMapping; label: string; description: string }> = [
  { key: "orderId", label: "Order ID", description: "Unique identifier for each order" },
  { key: "customerId", label: "Customer ID", description: "Identifier linking orders to customers" },
  { key: "productTitle", label: "Product Title / SKU", description: "Product name or SKU" },
  { key: "orderDate", label: "Order Date", description: "Date the order was placed" },
  { key: "orderValue", label: "Order Value", description: "Numeric order total" },
];

interface ColumnMapperProps {
  csvHeaders: string[];
  mapping: Partial<ColumnMapping>;
  onChange: (mapping: Partial<ColumnMapping>) => void;
  onConfirm: () => void;
}

export function ColumnMapper({ csvHeaders, mapping, onChange, onConfirm }: ColumnMapperProps) {
  const allMapped = REQUIRED_FIELDS.every(f => mapping[f.key]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-warning" />
          Map your CSV columns
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          The uploaded file's headers don't match exactly. Map each required field to the correct column.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {REQUIRED_FIELDS.map(field => (
          <div key={field.key} className="grid grid-cols-2 items-center gap-4">
            <div>
              <p className="text-sm font-medium">{field.label}</p>
              <p className="text-xs text-muted-foreground">{field.description}</p>
            </div>
            <Select
              value={mapping[field.key] ?? ""}
              onValueChange={value => onChange({ ...mapping, [field.key]: value })}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select column…" />
              </SelectTrigger>
              <SelectContent>
                {csvHeaders.map(h => (
                  <SelectItem key={h} value={h} className="text-sm font-mono">
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        <Button
          className="w-full mt-2"
          disabled={!allMapped}
          onClick={onConfirm}
        >
          Run analysis
        </Button>
      </CardContent>
    </Card>
  );
}
