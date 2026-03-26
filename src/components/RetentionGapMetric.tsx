import { Card, CardContent } from "@/components/ui/card";

interface RetentionGapMetricProps {
  gap: number;
  highestRetentionName: string;
  lowestRetentionName: string;
}

function gapLabel(gap: number): { label: string; className: string } {
  if (gap >= 30) return { label: "High impact", className: "text-destructive" };
  if (gap >= 15) return { label: "Moderate impact", className: "text-warning" };
  return { label: "Low impact", className: "text-verified" };
}

export function RetentionGapMetric({
  gap,
  highestRetentionName,
  lowestRetentionName,
}: RetentionGapMetricProps) {
  const { label, className } = gapLabel(gap);

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
            Retention gap
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Repeat rate delta between{" "}
            <span className="text-foreground font-medium">{highestRetentionName}</span> and{" "}
            <span className="text-foreground font-medium">{lowestRetentionName}</span>. The bigger this number, the more your acquisition mix matters.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-3xl font-mono font-semibold tabular-nums ${className}`}>
            {gap.toFixed(1)}
            <span className="text-lg">pp</span>
          </p>
          <p className={`text-xs font-medium mt-0.5 ${className}`}>{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
