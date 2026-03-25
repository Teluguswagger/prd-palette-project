import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Movies", path: "/movies" },
  { label: "Shows", path: "/shows" },
  { label: "Anime", path: "/anime" },
  { label: "Manga", path: "/manga" },
  { label: "News", path: "/news" },
  { label: "Reviews", path: "/reviews" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-hub-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 shrink-0">
          <span className="text-xl font-black text-primary">Entertain</span>
          <span className="text-xl font-black text-foreground">Hub</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                location.pathname === link.path
                  ? "text-foreground bg-accent"
                  : "text-secondary-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <SearchBar className="hidden md:block w-64" />
          <button
            className="lg:hidden p-2 text-secondary-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-hub-border bg-background animate-slide-in">
          <div className="p-4 space-y-1">
            <SearchBar className="mb-3 md:hidden" />
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === link.path
                    ? "text-foreground bg-accent"
                    : "text-secondary-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
