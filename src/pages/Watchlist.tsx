import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ContentCard } from "@/components/ContentCard";
import { getPosterUrl } from "@/lib/tmdb";

export default function Watchlist() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }

    supabase
      .from("watchlists")
      .select("*")
      .order("added_at", { ascending: false })
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen max-w-7xl mx-auto px-4">
      <div className="flex items-center gap-2 mb-6">
        <Bookmark className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">My Watchlist</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Your watchlist is empty. Browse movies and shows to add them!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <ContentCard
              key={item.id}
              id={item.content_id}
              title={item.title}
              posterUrl={item.poster_path ? getPosterUrl(item.poster_path) : null}
              type={item.content_type === "movie" ? "Film" : item.content_type === "show" ? "TV Show" : "Anime"}
              href={`/title/${item.content_id}?type=${item.content_type}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
