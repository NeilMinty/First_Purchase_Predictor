import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { InsightGap } from "@/hooks/use-first-purchase-data";

interface InsightCalloutProps {
  gap: InsightGap;
}

export function InsightCallout({ gap }: InsightCalloutProps) {
  if (gap.areSame) {
    return (
      <Card className="border-verified/30 bg-verified/5">
        <CardContent className="p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-verified mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-verified">Volume and retention are aligned</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your highest first-purchase volume product —{" "}
              <span className="font-medium text-foreground">{gap.highestVolumeProduct}</span> ({gap.highestVolumeCount} customers) — is also your best-retention first-purchase product (
              {(gap.highestRetentionRate * 100).toFixed(0)}% repeat rate). Acquisition and LTV are pointing in the same direction.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const retentionGap = gap.highestRetentionRate - gap.volumeProductRepeatRate;
  const retentionGapPp = Math.round(retentionGap * 100);

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardContent className="p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
        <div className="space-y-2">
          <p className="text-sm font-semibold text-warning">Volume and retention are misaligned</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            <div className="rounded-md bg-background/60 border border-border p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-0.5">Highest first-purchase volume</p>
              <p className="text-sm font-medium leading-snug">{gap.highestVolumeProduct}</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {gap.highestVolumeCount} customers &middot;{" "}
                {(gap.volumeProductRepeatRate * 100).toFixed(0)}% repeat rate
              </p>
            </div>
            <div className="rounded-md bg-background/60 border border-border p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-0.5">Highest retention first-purchase</p>
              <p className="text-sm font-medium leading-snug">{gap.highestRetentionProduct}</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {(gap.highestRetentionRate * 100).toFixed(0)}% repeat rate
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <TrendingUp className="h-3.5 w-3.5 text-warning" />
            <p className="text-xs text-muted-foreground">
              Shifting acquisition toward{" "}
              <span className="font-medium text-foreground">{gap.highestRetentionProduct}</span>{" "}
              could add{" "}
              <span className="font-mono font-medium text-foreground">+{retentionGapPp}pp</span>{" "}
              repeat rate per cohort vs. your current top-volume entry point.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
