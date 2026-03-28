import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScoreBadge } from "./RatingBadge";

interface ContentCardProps {
  id: number | string;
  title: string;
  posterUrl: string | null;
  type: string;
  genre?: string;
  year?: string;
  score?: number;
  href: string;
  className?: string;
}

export function ContentCard({ id, title, posterUrl, type, genre, year, score, href, className }: ContentCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        "group block rounded-xl overflow-hidden border border-hub-border bg-hub-bg-card transition-all duration-300 hover:border-hub-border-hover hover:scale-[1.02]",
        className
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="text-muted-foreground text-sm">No Image</span>
          </div>
        )}
        {score && score > 0 && (
          <div className="absolute top-2 right-2">
            <ScoreBadge score={score} />
          </div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-xs text-secondary-foreground truncate">
          {type}{genre ? ` · ${genre}` : ''}{year ? ` · ${year}` : ''}
        </p>
      </div>
    </Link>
  );
}

export function ContentCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-hub-border bg-hub-bg-card animate-pulse">
      <div className="aspect-[2/3] bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}
