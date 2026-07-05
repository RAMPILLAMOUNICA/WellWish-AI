import { Heart } from "lucide-react";

export default function SkeletonLoader({ type = "card" }) {
  if (type === "index") {
    return (
      <div className="glass-panel p-6 rounded-3xl border border-neutral-border/40 flex flex-col justify-between h-full min-h-[300px] animate-pulse">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-32 bg-neutral-border/50 rounded" />
            <div className="h-2 w-24 bg-neutral-border/50 rounded" />
          </div>
          <div className="h-6 w-20 bg-neutral-border/50 rounded-full" />
        </div>
        <div className="flex items-center justify-center my-6">
          <div className="w-32 h-32 rounded-full border-[8px] border-neutral-border/30 flex items-center justify-center">
            <Heart className="w-6 h-6 text-charcoal-light/30" />
          </div>
        </div>
        <div className="h-8 w-full bg-neutral-border/50 rounded-xl" />
      </div>
    );
  }

  if (type === "graph") {
    return (
      <div className="glass-panel p-6 rounded-3xl border border-neutral-border/40 w-full min-h-[300px] flex flex-col justify-between animate-pulse">
        <div className="flex items-center justify-between border-b border-neutral-border/40 pb-4">
          <div className="flex flex-col gap-2">
            <div className="h-4 w-40 bg-neutral-border/50 rounded" />
            <div className="h-2.5 w-48 bg-neutral-border/50 rounded" />
          </div>
          <div className="flex gap-4">
            <div className="h-3 w-16 bg-neutral-border/50 rounded" />
            <div className="h-3 w-16 bg-neutral-border/50 rounded" />
          </div>
        </div>
        <div className="flex items-end justify-between gap-3 h-40 pt-4 px-2">
          <div className="h-[40%] w-[10%] bg-neutral-border/50 rounded-t" />
          <div className="h-[60%] w-[10%] bg-neutral-border/50 rounded-t" />
          <div className="h-[50%] w-[10%] bg-neutral-border/50 rounded-t" />
          <div className="h-[75%] w-[10%] bg-neutral-border/50 rounded-t" />
          <div className="h-[80%] w-[10%] bg-neutral-border/50 rounded-t" />
          <div className="h-[90%] w-[10%] bg-neutral-border/50 rounded-t" />
          <div className="h-[85%] w-[10%] bg-neutral-border/50 rounded-t" />
        </div>
      </div>
    );
  }

  if (type === "metric") {
    return (
      <div className="glass-panel p-5 rounded-2xl border border-neutral-border/40 flex flex-col justify-between min-h-[140px] animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-3 w-16 bg-neutral-border/50 rounded" />
          <div className="h-4 w-4 bg-neutral-border/50 rounded" />
        </div>
        <div className="my-3">
          <div className="h-6 w-12 bg-neutral-border/50 rounded" />
          <div className="h-2.5 w-20 bg-neutral-border/50 rounded mt-1.5" />
        </div>
        <div className="h-1.5 w-full bg-neutral-border/50 rounded-full" />
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="flex flex-col gap-4 w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl border border-neutral-border/40 flex gap-4 animate-pulse">
            <div className="h-10 w-10 bg-neutral-border/50 rounded-xl shrink-0" />
            <div className="flex-1 flex flex-col gap-2.5">
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-neutral-border/50 rounded" />
                <div className="h-3 w-16 bg-neutral-border/50 rounded" />
              </div>
              <div className="h-3.5 w-full bg-neutral-border/50 rounded" />
              <div className="h-3 w-3/4 bg-neutral-border/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border border-neutral-border/40 w-full min-h-[150px] animate-pulse flex flex-col gap-3">
      <div className="h-3.5 w-1/4 bg-neutral-border/50 rounded" />
      <div className="h-3 w-3/4 bg-neutral-border/50 rounded" />
      <div className="h-3 w-1/2 bg-neutral-border/50 rounded" />
    </div>
  );
}
