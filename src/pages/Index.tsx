import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Star, Flame, ChevronRight } from "lucide-react";
import { ContentCard, ContentCardSkeleton } from "@/components/ContentCard";
import { StreamingNetworks } from "@/components/StreamingNetworks";
import {
  getTrendingMovies, getTrendingShows, getUpcomingMovies, getNowPlayingMovies,
  getIndianMovies, getIndianShows,
  getPosterUrl, getBackdropUrl, GENRE_MAP,
} from "@/lib/tmdb";
import { getTopAnime } from "@/lib/jikan";

function HeroSection({ items }: { items: any[] }) {
  const [active, setActive] = useState(0);
  const hero = items[active];

  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(() => setActive((a) => (a + 1) % Math.min(items.length, 5)), 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!hero) return null;

  return (
    <div className="relative h-[420px] md:h-[480px] overflow-hidden">
      <div className="absolute inset-0">
        <img src={getBackdropUrl(hero.backdrop_path) || ''} alt="" className="w-full h-full object-cover transition-opacity duration-700" />
        <div className="absolute inset-0 gradient-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 h-full flex items-end pb-12">
        <div className="max-w-xl animate-fade-in">
          <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">🔥 Trending Now</span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">{hero.title || hero.name}</h1>
          <p className="text-sm text-secondary-foreground mb-4 line-clamp-2">{hero.overview}</p>
          <div className="flex items-center gap-3">
            <Link to={`/title/${hero.id}?type=${hero.title ? 'movie' : 'show'}`} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-hub-red-hover transition-colors">
              View Details
            </Link>
            <span className="text-sm text-secondary-foreground">★ {hero.vote_average?.toFixed(1)} · {(hero.release_date || hero.first_air_date || '').slice(0, 4)}</span>
          </div>
          <div className="flex gap-2 mt-6">
            {items.slice(0, 5).map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={`h-1 rounded-full transition-all ${i === active ? 'w-8 bg-primary' : 'w-4 bg-muted-foreground/30'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendingStrip({ title, items, loading, type }: { title: string; items: any[]; loading: boolean; type: 'movie' | 'show' }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="min-w-[140px]"><ContentCardSkeleton /></div>)
          : items.slice(0, 10).map((item: any) => (
              <div key={item.id} className="min-w-[140px] max-w-[140px]">
                <ContentCard
                  id={item.id}
                  title={item.title || item.name}
                  posterUrl={getPosterUrl(item.poster_path)}
                  type={type === 'movie' ? 'Film' : 'TV Show'}
                  genre={GENRE_MAP[item.genre_ids?.[0]] || ''}
                  year={(item.release_date || item.first_air_date || '').slice(0, 4)}
                  score={item.vote_average}
                  href={`/title/${item.id}?type=${type}`}
                />
              </div>
            ))}
      </div>
    </section>
  );
}

function SidebarTop10({ title, items, icon }: { title: string; items: any[]; icon: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-hub-border p-4">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.slice(0, 10).map((item, i) => (
          <Link key={item.id || i} to={`/title/${item.id}?type=${item.title ? 'movie' : 'show'}`} className="flex items-center gap-3 group">
            <span className={`text-lg font-black w-6 text-center ${i < 3 ? 'text-primary' : 'text-muted-foreground'}`}>{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{item.title || item.name}</p>
              <p className="text-xs text-muted-foreground">{item.genre_ids ? GENRE_MAP[item.genre_ids[0]] : ''} · {(item.release_date || item.first_air_date || '').slice(0, 4)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {href && (
        <Link to={href} className="flex items-center gap-1 text-xs text-primary hover:text-hub-red-hover transition-colors font-medium">
          See All <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
  const [trendingShows, setTrendingShows] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [nowPlaying, setNowPlaying] = useState<any[]>([]);
  const [indianMovies, setIndianMovies] = useState<any[]>([]);
  const [indianShows, setIndianShows] = useState<any[]>([]);
  const [topAnime, setTopAnime] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'streaming' | 'upcoming'>('streaming');

  useEffect(() => {
    Promise.all([
      getTrendingMovies(),
      getTrendingShows(),
      getUpcomingMovies(),
      getNowPlayingMovies(),
      getIndianMovies().catch(() => []),
      getIndianShows().catch(() => []),
      getTopAnime().catch(() => []),
    ]).then(([movies, shows, up, np, inMovies, inShows, anime]) => {
      setTrendingMovies(movies);
      setTrendingShows(shows);
      setUpcoming(up);
      setNowPlaying(np);
      setIndianMovies(inMovies);
      setIndianShows(inShows);
      setTopAnime(anime);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const displayItems = tab === 'streaming' ? nowPlaying : upcoming;

  return (
    <div>
      <HeroSection items={trendingMovies} />

      {/* Trending Horizontal Strips */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <TrendingStrip title="Trending Movies" items={trendingMovies} loading={loading} type="movie" />
        <TrendingStrip title="Trending Shows" items={trendingShows} loading={loading} type="show" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Best Things to Watch */}
            <section>
              <SectionHeader title="Best Things to Watch" href="/movies" />
              <div className="flex gap-2 mb-4">
                {(['streaming', 'upcoming'] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}>
                    {t === 'streaming' ? 'Streaming Now' : 'Coming Soon'}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <ContentCardSkeleton key={i} />)
                  : displayItems.slice(0, 6).map((item: any) => (
                      <ContentCard key={item.id} id={item.id} title={item.title || item.name} posterUrl={getPosterUrl(item.poster_path)} type="Film" genre={GENRE_MAP[item.genre_ids?.[0]] || ''} year={(item.release_date || '').slice(0, 4)} score={item.vote_average} href={`/title/${item.id}?type=movie`} />
                    ))}
              </div>
            </section>

            {/* Indian Movies (Bollywood) */}
            {indianMovies.length > 0 && (
              <section>
                <SectionHeader title="🇮🇳 Indian Movies" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {indianMovies.slice(0, 6).map((item: any) => (
                    <ContentCard key={item.id} id={item.id} title={item.title || item.name} posterUrl={getPosterUrl(item.poster_path)} type="Bollywood" genre={GENRE_MAP[item.genre_ids?.[0]] || ''} year={(item.release_date || '').slice(0, 4)} score={item.vote_average} href={`/title/${item.id}?type=movie`} />
                  ))}
                </div>
              </section>
            )}

            {/* Indian Shows */}
            {indianShows.length > 0 && (
              <section>
                <SectionHeader title="🇮🇳 Indian Shows" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {indianShows.slice(0, 6).map((item: any) => (
                    <ContentCard key={item.id} id={item.id} title={item.name || item.title} posterUrl={getPosterUrl(item.poster_path)} type="Indian TV" genre={GENRE_MAP[item.genre_ids?.[0]] || ''} year={(item.first_air_date || '').slice(0, 4)} score={item.vote_average} href={`/title/${item.id}?type=show`} />
                  ))}
                </div>
              </section>
            )}

            {/* Top Anime */}
            {topAnime.length > 0 && (
              <section>
                <SectionHeader title="Top Anime" href="/anime" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {topAnime.slice(0, 6).map((item: any) => (
                    <ContentCard key={item.mal_id} id={item.mal_id} title={item.title} posterUrl={item.images?.jpg?.image_url || null} type="Anime" genre={item.genres?.[0]?.name || ''} year={item.year?.toString()} score={item.score} href={`/title/${item.mal_id}?type=anime`} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <StreamingNetworks />
            <SidebarTop10 title="Top 10 This Week" items={trendingMovies} icon={<TrendingUp className="w-4 h-4 text-primary" />} />
            <SidebarTop10 title="Most Anticipated" items={upcoming} icon={<Star className="w-4 h-4 text-yellow-500" />} />
          </div>
        </div>
      </div>
    </div>
  );
}
