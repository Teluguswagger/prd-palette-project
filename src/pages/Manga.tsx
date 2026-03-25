import { useState, useEffect } from "react";
import { ContentCard, ContentCardSkeleton } from "@/components/ContentCard";
import { getTopManga } from "@/lib/jikan";

export default function MangaPage() {
  const [manga, setManga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopManga().then(setManga).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Manga</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 20 }).map((_, i) => <ContentCardSkeleton key={i} />)
            : manga.map((m: any) => (
                <ContentCard
                  key={m.mal_id}
                  id={m.mal_id}
                  title={m.title}
                  posterUrl={m.images?.jpg?.image_url || null}
                  type="Manga"
                  genre={m.genres?.[0]?.name || ''}
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
