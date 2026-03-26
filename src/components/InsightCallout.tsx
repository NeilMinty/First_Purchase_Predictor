import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { ProductAnalysis } from "@/hooks/use-analysis";

interface InsightCalloutProps {
  highestVolume: ProductAnalysis;
  highestRetention: ProductAnalysis;
}

export function InsightCallout({ highestVolume, highestRetention }: InsightCalloutProps) {
  const areSame = highestVolume.id === highestRetention.id;

  if (areSame) {
    return (
      <Card className="border-verified/30 bg-verified/5">
        <CardContent className="p-4 flex items-start gap-3">
          <CheckCircle2 className="h-4 w-4 text-verified mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            Your bestseller is also your best retention product —{" "}
            <span className="font-medium">{highestVolume.name}</span>. That's rare. Protect it in acquisition.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardContent className="p-4 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
        <p className="text-sm text-foreground">
          You're acquiring most customers through{" "}
          <span className="font-medium">{highestVolume.name}</span> but your best long-term customers start
          with <span className="font-medium">{highestRetention.name}</span>. Consider shifting acquisition spend.
        </p>
      </CardContent>
    </Card>
  );
}
