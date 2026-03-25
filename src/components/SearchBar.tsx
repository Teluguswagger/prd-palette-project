import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { searchContent, getPosterUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setIsOpen(false); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchContent(query);
        setResults(data.slice(0, 8));
        setIsOpen(true);
      } catch { setResults([]); }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const handleSelect = (item: any) => {
    const type = item.media_type === 'tv' ? 'show' : item.media_type;
    navigate(`/title/${item.id}?type=${type}`);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
          placeholder="Search movies, shows, anime..."
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
        />
        {query && (
          <button onClick={() => { setQuery(""); setIsOpen(false); }}>
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-hub-border rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground text-center">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">No results found</div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
              >
                {item.poster_path ? (
                  <img src={getPosterUrl(item.poster_path, 'w92')!} alt="" className="w-10 h-14 rounded object-cover" />
                ) : (
                  <div className="w-10 h-14 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title || item.name}</p>
                  <p className="text-xs text-secondary-foreground capitalize">{item.media_type} · {(item.release_date || item.first_air_date || '').slice(0, 4)}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
