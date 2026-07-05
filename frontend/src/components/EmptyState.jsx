import { Sparkles } from "lucide-react";

export default function EmptyState({
  icon: Icon = Sparkles,
  title = "Telemetry Vault Empty",
  description = "No logs located within this session segment.",
  actionText = "Log First Entry",
  onAction
}) {
  return (
    <div className="p-8 rounded-[24px] border border-neutral-border bg-card-bg relative overflow-hidden flex flex-col items-center text-center gap-5 max-w-lg mx-auto w-full shadow-xs">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-sage/10 blur-[30px] pointer-events-none" />
      
      <div className="p-3.5 bg-brand-sage/20 border border-brand-sage/35 text-brand-teal rounded-2xl">
        <Icon className="w-6 h-6" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h4 className="font-display font-bold text-sm text-charcoal-text">{title}</h4>
        <p className="text-[11px] text-charcoal-light font-light leading-relaxed max-w-xs mx-auto">
          {description}
        </p>
      </div>

      {onAction && actionText && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-brand-sage text-charcoal-text font-bold text-[10px] hover:bg-brand-teal hover:scale-[1.01] transition-all cursor-pointer outline-none"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
