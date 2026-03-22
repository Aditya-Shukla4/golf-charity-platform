import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all",
        className,
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center mb-3",
          bg,
        )}
      >
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={cn("text-lg font-bold mt-0.5", color)}>{value}</p>
      <p className="text-xs text-gray-600 mt-0.5">{sub}</p>
    </div>
  );
}
