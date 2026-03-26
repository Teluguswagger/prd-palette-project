import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Star, Calendar, Clock } from "lucide-react";
import { getMovieDetails, getShowDetails, getWatchProviders, getPosterUrl, getBackdropUrl, GENRE_MAP, TMDB_IMAGE_BASE } from "@/lib/tmdb";
import { getAnimeDetails, getMangaDetails } from "@/lib/jikan";
import { ContentCard } from "@/components/ContentCard";
import { ScoreBadge } from "@/components/RatingBadge";

export default function TitleDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "movie";
  const [data, setData] = useState<any>(null);
  const [providers, setProviders] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const isAnimeType = type === "anime" || type === "manga";
    const fetcher =
      type === "show" ? getShowDetails(id) :
      type === "anime" ? getAnimeDetails(id) :
      type === "manga" ? getMangaDetails(id) :
      getMovieDetails(id);

    fetcher.then(setData).catch(console.error).finally(() => setLoading(false));

    // Fetch watch providers for movies/shows
    if (!isAnimeType) {
      const tmdbType = type === "show" ? "tv" : "movie";
      getWatchProviders(id, tmdbType as 'movie' | 'tv').then(setProviders).catch(() => {});
    }
  }, [id, type]);

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Content not found</div>
      </div>
    );
  }

  const isAnime = type === "anime" || type === "manga";
  const title = isAnime ? data.title : (data.title || data.name);
  const overview = isAnime ? data.synopsis : data.overview;
  const poster = isAnime ? data.images?.jpg?.large_image_url : getPosterUrl(data.poster_path);
  const backdrop = isAnime ? data.images?.jpg?.large_image_url : getBackdropUrl(data.backdrop_path);
  const score = isAnime ? data.score : data.vote_average;
  const year = isAnime
    ? (data.year || data.aired?.from?.slice(0, 4) || data.published?.from?.slice(0, 4))
    : (data.release_date || data.first_air_date || '').slice(0, 4);
  const genres = isAnime
    ? (data.genres || []).map((g: any) => g.name)
    : (data.genres || []).map((g: any) => g.name);
  const cast = !isAnime ? (data.credits?.cast || []).slice(0, 12) : [];
  const trailer = !isAnime ? (data.videos?.results || []).find((v: any) => v.type === "Trailer" && v.site === "YouTube") : null;
  const similar = !isAnime ? (data.similar?.results || []).slice(0, 6) : [];
  const episodes = isAnime ? data.episodes : (data.number_of_episodes || null);
  const status = data.status;

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img src={backdrop || ''} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-overlay" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex gap-6 items-end">
            {poster && (
              <img src={poster} alt={title} className="hidden sm:block w-40 md:w-48 rounded-xl shadow-2xl border border-hub-border" />
            )}
            <div className="pb-2 max-w-2xl">
              <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Back
              </Link>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">{title}</h1>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {score > 0 && <ScoreBadge score={score} />}
                <span className="text-sm text-secondary-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> {year}</span>
                {episodes && <span className="text-sm text-secondary-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {episodes} eps</span>}
                {status && <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">{status}</span>}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {genres.map((g: string) => (
                  <span key={g} className="text-xs bg-accent text-accent-foreground px-2.5 py-1 rounded-full">{g}</span>
                ))}
              </div>
              <p className="text-sm text-secondary-foreground line-clamp-3 leading-relaxed">{overview}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-1 mb-6 border-b border-hub-border">
          {["overview", ...(similar.length > 0 ? ["related"] : [])].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8">
            {overview && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3">Synopsis</h2>
                <p className="text-sm text-secondary-foreground leading-relaxed max-w-3xl">{overview}</p>
              </div>
            )}

            {trailer && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <Play className="w-4 h-4 text-primary" /> Trailer
                </h2>
                <div className="aspect-video max-w-3xl rounded-xl overflow-hidden border border-hub-border">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    title="Trailer"
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
            )}

            {cast.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3">Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {cast.map((person: any) => (
                    <div key={person.id} className="bg-card rounded-lg overflow-hidden border border-hub-border">
                      {person.profile_path ? (
                        <img src={getPosterUrl(person.profile_path, 'w185')!} alt={person.name} className="w-full aspect-[2/3] object-cover" />
                      ) : (
                        <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center text-muted-foreground text-xs">
                          <Star className="w-6 h-6" />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs font-semibold text-foreground truncate">{person.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{person.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "related" && similar.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {similar.map((s: any) => (
              <ContentCard
                key={s.id}
                id={s.id}
                title={s.title || s.name}
                posterUrl={getPosterUrl(s.poster_path)}
                type={type === "show" ? "TV Show" : "Film"}
                genre={GENRE_MAP[s.genre_ids?.[0]] || ''}
                year={(s.release_date || s.first_air_date || '').slice(0, 4)}
                score={s.vote_average}
                href={`/title/${s.id}?type=${type}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
