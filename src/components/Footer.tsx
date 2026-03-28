import { Link } from "react-router-dom";

const quickLinks = [
  { label: "Movies", path: "/movies" },
  { label: "Shows", path: "/shows" },
  { label: "Anime", path: "/anime" },
  { label: "Manga", path: "/manga" },
];

const categories = [
  { label: "Action", path: "/movies" },
  { label: "Comedy", path: "/movies" },
  { label: "Drama", path: "/movies" },
  { label: "Sci-Fi", path: "/movies" },
  { label: "Horror", path: "/movies" },
];

export function Footer() {
  return (
    <footer className="border-t border-hub-border bg-background mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="inline-block mb-4">
              <span className="text-lg font-black text-primary">Cine</span>
              <span className="text-lg font-black text-foreground">Whisper</span>
            </Link>
            <p className="text-sm text-secondary-foreground leading-relaxed">
              Your ultimate destination for discovering movies, OTT shows, anime, and manga. Read reviews, track watchlists, and stay updated.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-sm text-secondary-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-sm text-secondary-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-hub-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground"><p className="text-xs text-muted-foreground">© 2026 CineWhisper. All rights reserved.</p></p>
          <p className="text-xs text-muted-foreground">Built with ❤️ for entertainment fans</p>
        </div>
      </div>
    </footer>
  );
}
