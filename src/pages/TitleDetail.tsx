import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Star, Calendar, Clock, Bookmark, BookmarkCheck, Send } from "lucide-react";
import { getMovieDetails, getShowDetails, getWatchProviders, getPosterUrl, getBackdropUrl, GENRE_MAP, TMDB_IMAGE_BASE } from "@/lib/tmdb";
import { getAnimeDetails, getMangaDetails } from "@/lib/jikan";
import { ContentCard } from "@/components/ContentCard";
import { ScoreBadge } from "@/components/RatingBadge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function WatchlistButton({ contentId, contentType, title, posterPath }: { contentId: string; contentType: string; title: string; posterPath: string | null }) {
  const { user } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("watchlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("content_id", contentId)
      .eq("content_type", contentType)
      .maybeSingle()
      .then(({ data }) => setInWatchlist(!!data));
  }, [user, contentId, contentType]);

  const toggle = async () => {
    if (!user) { toast.error("Sign in to add to watchlist"); return; }
    setLoading(true);
    if (inWatchlist) {
      await supabase.from("watchlists").delete().eq("user_id", user.id).eq("content_id", contentId).eq("content_type", contentType);
      setInWatchlist(false);
      toast.success("Removed from watchlist");
    } else {
      await supabase.from("watchlists").insert({ user_id: user.id, content_id: contentId, content_type: contentType, title, poster_path: posterPath });
      setInWatchlist(true);
      toast.success("Added to watchlist!");
    }
    setLoading(false);
  };

  return (
    <button onClick={toggle} disabled={loading} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${inWatchlist ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground border border-hub-border hover:border-hub-border-hover'}`}>
      {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
      {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
    </button>
  );
}

function ReviewSection({ contentId, contentType }: { contentId: string; contentType: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(7);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [myReview, setMyReview] = useState<any>(null);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("*, profiles(display_name)")
      .eq("content_id", contentId)
      .eq("content_type", contentType)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setReviews(data || []);
        if (user) {
          const mine = (data || []).find((r: any) => r.user_id === user.id);
          if (mine) { setMyReview(mine); setRating(mine.rating); setReviewText(mine.review_text || ""); }
        }
      });
  }, [contentId, contentType, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in to leave a review"); return; }
    setSubmitting(true);

    if (myReview) {
      const { error } = await supabase.from("reviews").update({ rating, review_text: reviewText, updated_at: new Date().toISOString() }).eq("id", myReview.id);
      if (error) toast.error(error.message);
      else { toast.success("Review updated!"); setMyReview({ ...myReview, rating, review_text: reviewText }); }
    } else {
      const { error, data } = await supabase.from("reviews").insert({ user_id: user.id, content_id: contentId, content_type: contentType, rating, review_text: reviewText }).select().single();
      if (error) toast.error(error.message);
      else { toast.success("Review posted!"); setMyReview(data); setReviews([data, ...reviews]); }
    }
    setSubmitting(false);
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">💬 Reviews</h2>

      {user && (
        <form onSubmit={handleSubmit} className="bg-secondary border border-hub-border rounded-xl p-4 mb-6 space-y-3">
          <p className="text-sm font-medium text-foreground">{myReview ? "Update your review" : "Write a review"}</p>
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground">Rating:</label>
            <div className="flex gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} className={`w-7 h-7 rounded text-xs font-bold transition-colors ${n <= rating ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your thoughts (optional)..."
            className="w-full bg-background border border-hub-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-20"
          />
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50">
            <Send className="w-3 h-3" /> {myReview ? "Update" : "Post Review"}
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-card border border-hub-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{r.profiles?.display_name || "User"}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-primary fill-primary" />
                  <span className="text-sm font-bold text-foreground">{r.rating}/10</span>
                </div>
              </div>
              {r.review_text && <p className="text-sm text-secondary-foreground">{r.review_text}</p>}
              <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const genres = (data.genres || []).map((g: any) => g.name);
  const cast = !isAnime ? (data.credits?.cast || []).slice(0, 12) : [];
  const trailer = !isAnime ? (data.videos?.results || []).find((v: any) => v.type === "Trailer" && v.site === "YouTube") : null;
  const similar = !isAnime ? (data.similar?.results || []).slice(0, 6) : [];
  const episodes = isAnime ? data.episodes : (data.number_of_episodes || null);
  const status = data.status;
  const posterPath = isAnime ? null : data.poster_path;

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
              <div className="flex items-center gap-3 mb-3">
                <WatchlistButton contentId={id!} contentType={type === "show" ? "show" : type === "anime" ? "anime" : "movie"} title={title} posterPath={posterPath} />
              </div>
              <p className="text-sm text-secondary-foreground line-clamp-3 leading-relaxed">{overview}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-1 mb-6 border-b border-hub-border">
          {["overview", "reviews", ...(similar.length > 0 ? ["related"] : [])].map((tab) => (
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
            {providers && (providers.flatrate || providers.buy || providers.rent) && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3">📺 Where to Watch</h2>
                <div className="space-y-4 max-w-3xl">
                  {providers.flatrate && providers.flatrate.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Stream</p>
                      <div className="flex flex-wrap gap-3">
                        {providers.flatrate.map((p: any) => (
                          <div key={p.provider_id} className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
                            <img src={`${TMDB_IMAGE_BASE}/w45${p.logo_path}`} alt={p.provider_name} className="w-6 h-6 rounded" />
                            <span className="text-xs font-medium text-foreground">{p.provider_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {providers.rent && providers.rent.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Rent</p>
                      <div className="flex flex-wrap gap-3">
                        {providers.rent.map((p: any) => (
                          <div key={p.provider_id} className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
                            <img src={`${TMDB_IMAGE_BASE}/w45${p.logo_path}`} alt={p.provider_name} className="w-6 h-6 rounded" />
                            <span className="text-xs font-medium text-foreground">{p.provider_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {providers.buy && providers.buy.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Buy</p>
                      <div className="flex flex-wrap gap-3">
                        {providers.buy.map((p: any) => (
                          <div key={p.provider_id} className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
                            <img src={`${TMDB_IMAGE_BASE}/w45${p.logo_path}`} alt={p.provider_name} className="w-6 h-6 rounded" />
                            <span className="text-xs font-medium text-foreground">{p.provider_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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

        {activeTab === "reviews" && (
          <ReviewSection contentId={id!} contentType={type === "show" ? "show" : type === "anime" ? "anime" : "movie"} />
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
