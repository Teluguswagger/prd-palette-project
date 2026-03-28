import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Bookmark } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-hub-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-1 shrink-0">
          <span className="text-xl font-black text-primary">Cine</span>
          <span className="text-xl font-black text-foreground">Whisper</span>
        </Link>

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

        <div className="flex items-center gap-3">
          <SearchBar className="hidden md:block w-64" />

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-hub-border hover:border-hub-border-hover transition-colors"
              >
                <User className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground hidden sm:block max-w-[100px] truncate">
                  {user.email?.split("@")[0]}
                </span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-hub-border rounded-xl shadow-lg overflow-hidden z-50">
                  <Link
                    to="/watchlist"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <Bookmark className="w-4 h-4" /> My Watchlist
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Sign In
            </Link>
          )}

          <button
            className="lg:hidden p-2 text-secondary-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

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
            {user && (
              <Link
                to="/watchlist"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-secondary-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                My Watchlist
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
