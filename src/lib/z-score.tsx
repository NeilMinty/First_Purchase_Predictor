import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type ZClassification = "outlier" | "mild_outlier" | "normal";

export interface ZScoreData {
  zScore: number;
  zClassification: ZClassification;
}

// ─── CLASSIFICATION ─────────────────────────────────────────────────────────

export function classifyZScore(z: number): ZClassification {
  const abs = Math.abs(z);
  if (abs >= 2.0) return "outlier";
  if (abs >= 1.5) return "mild_outlier";
  return "normal";
}

export function computeZScore(value: number, mean: number, stdDev: number): ZScoreData {
  if (stdDev < 0.01) return { zScore: 0, zClassification: "normal" };
  const z = +((value - mean) / stdDev).toFixed(1);
  return { zScore: z, zClassification: classifyZScore(z) };
}

// ─── STYLE MAPS ─────────────────────────────────────────────────────────────

const zColors: Record<ZClassification, string> = {
  outlier: "bg-destructive/15 text-destructive border-destructive/30",
  mild_outlier: "bg-warning/15 text-warning border-warning/30",
  normal: "bg-muted text-muted-foreground border-border",
};

const zLabels: Record<ZClassification, string> = {
  outlier: "Outlier",
  mild_outlier: "Mild Outlier",
  normal: "Normal",
};

const zTooltips: Record<ZClassification, string> = {
  outlier: "≥2σ from rolling mean — statistically anomalous",
  mild_outlier: "1.5–2σ from rolling mean — elevated, monitor",
  normal: "Within expected variation (<1.5σ)",
};

// ─── BADGE COMPONENT ────────────────────────────────────────────────────────

interface ZScoreBadgeProps {
  zScore: number;
  classification: ZClassification;
  compact?: boolean;
}

export function ZScoreBadge({ zScore, classification, compact = false }: ZScoreBadgeProps) {
  const sign = zScore > 0 ? "+" : "";
  const label = compact
    ? `${sign}${zScore.toFixed(1)}σ`
    : `Z ${sign}${zScore.toFixed(1)}`;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`${zColors[classification]} text-[9px] font-mono cursor-help px-1.5 py-0`}
          >
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[200px]">
          <p className="font-medium">{zLabels[classification]}</p>
          <p className="text-muted-foreground">{zTooltips[classification]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
