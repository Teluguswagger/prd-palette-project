import { STREAMING_NETWORKS } from "@/lib/tmdb";

export function StreamingNetworks() {
  return (
    <div className="bg-card rounded-xl border border-hub-border p-4">
      <h3 className="text-sm font-bold text-foreground mb-4">📺 Streaming Networks</h3>
      <div className="grid grid-cols-2 gap-2">
        {STREAMING_NETWORKS.map((network) => (
          <div
            key={network.id}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary hover:bg-accent transition-colors cursor-pointer"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: network.color }}
            />
            <span className="text-xs font-medium text-foreground truncate">
              {network.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
