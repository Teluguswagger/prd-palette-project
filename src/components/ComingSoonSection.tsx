import { useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { getPosterUrl, GENRE_MAP } from "@/lib/tmdb";
import { ContentCardSkeleton } from "@/components/ContentCard";
import { Link } from "react-router-dom";

interface ComingSoonItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  vote_average?: number;
  overview?: string;
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return "TBA";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function ComingSoonSection({
  items,
  loading,
}: {
  items: ComingSoonItem[];
  loading: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Coming Soon</h2>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full bg-secondary hover:bg-accent text-secondary-foreground transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full bg-secondary hover:bg-accent text-secondary-foreground transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="min-w-[180px]">
                <ContentCardSkeleton />
              </div>
            ))
          : items.filter(item => item.poster_path).slice(0, 20).map((item) => {
              const isMovie = !!item.title;
              const type = isMovie ? "movie" : "show";
              const streamDate = item.release_date || item.first_air_date;

              return (
                <Link
                  key={item.id}
                  to={`/title/${item.id}?type=${type}`}
                  className="min-w-[180px] max-w-[180px] group flex-shrink-0"
                >
                  <div className="relative rounded-xl overflow-hidden bg-card border border-hub-border">
                    <div className="aspect-[2/3] relative">
                      {getPosterUrl(item.poster_path) ? (
                        <img
                          src={getPosterUrl(item.poster_path)!}
                          alt={item.title || item.name || ""}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground text-xs">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {isMovie ? "Movie" : "Series"}
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {item.title || item.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {GENRE_MAP[item.genre_ids?.[0] || 0] || ""}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Calendar className="w-3 h-3 text-primary" />
                        <span className="text-[11px] font-medium text-primary">
                          {formatDate(streamDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
