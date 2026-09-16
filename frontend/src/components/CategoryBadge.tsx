import type { ReportCategory, ReportPriority, ReportStatus } from "../types";

const CATEGORY_COLORS: Record<ReportCategory, string> = {
  pothole: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  lighting: "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300",
  waste: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  flooding: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  other: "bg-gray-400/20 text-gray-700 dark:text-gray-300",
};

const PRIORITY_COLORS: Record<ReportPriority, string> = {
  low: "bg-sage-400/20 text-sage-700 dark:text-sage-300",
  medium: "bg-amber-400/20 text-amber-700 dark:text-amber-300",
  high: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  critical: "bg-red-500/20 text-red-700 dark:text-red-300",
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  open: "bg-red-500/20 text-red-700 dark:text-red-300",
  in_progress: "bg-amber-400/20 text-amber-700 dark:text-amber-300",
  resolved: "bg-sage-500/20 text-sage-700 dark:text-sage-300",
};

function Badge({ className, children }: { className: string; children: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{children}</span>;
}

export function CategoryBadge({ category }: { category: ReportCategory }) {
  return <Badge className={CATEGORY_COLORS[category]}>{category}</Badge>;
}

export function PriorityBadge({ priority }: { priority: ReportPriority }) {
  return <Badge className={PRIORITY_COLORS[priority]}>{priority}</Badge>;
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  return <Badge className={STATUS_COLORS[status]}>{status.replace("_", " ")}</Badge>;
}

export const CATEGORY_MAP_COLORS: Record<ReportCategory, string> = {
  pothole: "#d97706",
  lighting: "#ca8a04",
  waste: "#ea580c",
  flooding: "#2563eb",
  other: "#6b7280",
};
