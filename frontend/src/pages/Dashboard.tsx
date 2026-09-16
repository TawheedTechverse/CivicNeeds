import { useEffect, useState } from "react";
import { listReports, updateReport } from "../api/reports";
import { CategoryBadge, PriorityBadge, StatusBadge } from "../components/CategoryBadge";
import { GlassCard } from "../components/GlassCard";
import { ThemeToggle } from "../components/ThemeToggle";
import type { Report, ReportCategory, ReportPriority, ReportStatus } from "../types";

export function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | "">("");
  const [priorityFilter, setPriorityFilter] = useState<ReportPriority | "">("");
  const [isLoading, setIsLoading] = useState(true);

  const refresh = () => {
    setIsLoading(true);
    listReports({
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      priority: priorityFilter || undefined,
    })
      .then(setReports)
      .finally(() => setIsLoading(false));
  };

  useEffect(refresh, [statusFilter, categoryFilter, priorityFilter]);

  const handleStatusChange = async (id: string, status: ReportStatus) => {
    const updated = await updateReport(id, { status });
    setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Authority dashboard</h1>
        <ThemeToggle />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ReportStatus | "")} className="glass-input py-1.5 text-sm">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as ReportCategory | "")} className="glass-input py-1.5 text-sm">
          <option value="">All categories</option>
          <option value="pothole">Pothole</option>
          <option value="lighting">Lighting</option>
          <option value="waste">Waste</option>
          <option value="flooding">Flooding</option>
          <option value="other">Other</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as ReportPriority | "")} className="glass-input py-1.5 text-sm">
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <GlassCard className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/30 dark:border-white/10 text-charcoal-900/60 dark:text-sage-50/60">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Reported</th>
              <th className="px-4 py-3 font-medium">Update</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-charcoal-900/50 dark:text-sage-50/50">
                  Loading...
                </td>
              </tr>
            )}
            {!isLoading && reports.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-charcoal-900/50 dark:text-sage-50/50">
                  No reports match these filters.
                </td>
              </tr>
            )}
            {reports.map((report) => (
              <tr key={report.id} className="border-b border-white/20 dark:border-white/5 last:border-0">
                <td className="px-4 py-3 font-medium">{report.title}</td>
                <td className="px-4 py-3">
                  <CategoryBadge category={report.category} />
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={report.priority} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={report.status} />
                </td>
                <td className="px-4 py-3 text-charcoal-900/60 dark:text-sage-50/60">
                  {new Date(report.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={report.status}
                    onChange={(e) => handleStatusChange(report.id, e.target.value as ReportStatus)}
                    className="glass-input py-1 text-xs"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
