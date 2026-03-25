import { Newspaper } from "lucide-react";

export default function NewsPage() {
  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">News</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Newspaper className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Entertainment news and editorial articles are being prepared. Connect a backend to enable news publishing.
          </p>
        </div>
      </div>
    </div>
  );
}
