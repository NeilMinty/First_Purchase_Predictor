import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DemoDataBadgeProps {
  /** The platform name — if connected to a real API, badge is hidden. */
  connected: boolean;
  className?: string;
}

/** Shows a small "Demo Data" badge for platforms not yet connected to a live API. */
export function DemoDataBadge({ connected, className }: DemoDataBadgeProps) {
  if (connected) return null;
  return (
    <Badge
      variant="outline"
      className={`text-[9px] px-1.5 py-0 h-4 gap-1 text-warning border-warning/30 bg-warning/10 ${className ?? ""}`}
    >
      <AlertTriangle className="h-2.5 w-2.5" />
      Demo Data
    </Badge>
  );
}
