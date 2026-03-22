import { cn } from "@/lib/utils";

type BadgeVariant =
  | "green"
  | "yellow"
  | "red"
  | "blue"
  | "purple"
  | "gray"
  | "pink";

const variants: Record<BadgeVariant, string> = {
  green: "bg-green-500/20 text-green-400 border-green-500/20",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
  red: "bg-red-500/20 text-red-400 border-red-500/20",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/20",
  gray: "bg-gray-500/20 text-gray-400 border-gray-500/20",
  pink: "bg-pink-500/20 text-pink-400 border-pink-500/20",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "gray", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
