import { useState, useEffect } from "react";
import { ContentCard, ContentCardSkeleton } from "@/components/ContentCard";
import {
  getTopManga,
  getPopularManga,
  getPopularManhwa,
  getPopularManhua,
  getPopularLightNovels,
  getRecentManga,
} from "@/lib/jikan";

const tabs = [
  { key: "top", label: "Top Rated" },
  { key: "manga", label: "Manga" },
  { key: "manhwa", label: "Manhwa" },
  { key: "manhua", label: "Manhua" },
  { key: "lightnovel", label: "Light Novels" },
  { key: "recent", label: "New Releases" },
];

const fetchers: Record<string, () => Promise<any[]>> = {
  top: getTopManga,
  manga: getPopularManga,
  manhwa: getPopularManhwa,
  manhua: getPopularManhua,
  lightnovel: getPopularLightNovels,
  recent: getRecentManga,
};

export default function MangaPage() {
  const [tab, setTab] = useState("top");
  const [cache, setCache] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cache[tab]) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchers[tab]()
      .then((data) => setCache((prev) => ({ ...prev, [tab]: data })))
      .catch(() => setCache((prev) => ({ ...prev, [tab]: [] })))
      .finally(() => setLoading(false));
  }, [tab]);

  const items = cache[tab] || [];

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Manga</h1>
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 20 }).map((_, i) => (
                <ContentCardSkeleton key={i} />
              ))
            : items.map((m: any) => (
                <ContentCard
                  key={m.mal_id}
                  id={m.mal_id}
                  title={m.title}
                  posterUrl={m.images?.jpg?.image_url || null}
                  type={m.type || "Manga"}
                  genre={m.genres?.[0]?.name || ""}
                  year={m.published?.from?.slice(0, 4)}
                  score={m.score}
                  href={`/title/${m.mal_id}?type=manga`}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
