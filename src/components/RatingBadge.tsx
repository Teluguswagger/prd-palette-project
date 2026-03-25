import { cn } from "@/lib/utils";

type RatingType = "Must Watch" | "Good" | "Satisfactory" | "Passable" | "Poor" | "Skip" | "Yet to Review";

interface RatingBadgeProps {
  rating: RatingType | string;
  size?: "sm" | "md";
  className?: string;
}

const colorMap: Record<string, string> = {
  "Must Watch": "bg-green-600",
  "Good": "bg-green-500",
  "Satisfactory": "bg-blue-500",
  "Passable": "bg-yellow-500",
  "Poor": "bg-red-500",
  "Skip": "bg-gray-600",
  "Yet to Review": "bg-gray-700",
};

export function RatingBadge({ rating, size = "sm", className }: RatingBadgeProps) {
  const bg = colorMap[rating] || "bg-gray-700";
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span className={cn("rounded-md font-semibold text-primary-foreground", bg, sizeClasses, className)}>
      {rating}
    </span>
  );
}

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const bg = score >= 8 ? "bg-green-600" : score >= 6 ? "bg-blue-500" : score >= 4 ? "bg-yellow-500" : "bg-red-500";
  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-md font-bold text-primary-foreground", bg, className)}>
      ★ {score.toFixed(1)}
    </span>
  );
}
