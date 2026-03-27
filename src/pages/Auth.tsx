import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        navigate("/");
      }
    } else {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email to confirm your account!");
      }
    }
    setLoading(false);
  };

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-hub-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Sign in to access your watchlist & reviews" : "Join EntertainHub to save and review content"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary border border-hub-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-secondary border border-hub-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
