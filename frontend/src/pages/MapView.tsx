import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { listReports } from "../api/reports";
import { CATEGORY_MAP_COLORS, CategoryBadge, PriorityBadge, StatusBadge } from "../components/CategoryBadge";
import { ThemeToggle } from "../components/ThemeToggle";
import type { Report, ReportCategory, ReportStatus } from "../types";

// Sydney, NSW — the default map center for this deployment.
const DEFAULT_CENTER: [number, number] = [-33.8688, 151.2093];

export function MapView() {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | "">("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    listReports({
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
    })
      .then(setReports)
      .finally(() => setIsLoading(false));
  }, [statusFilter, categoryFilter]);

  return (
    <div className="relative h-screen w-screen">
      <MapContainer center={DEFAULT_CENTER} zoom={11} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map((report) => (
          <CircleMarker
            key={report.id}
            center={[report.latitude, report.longitude]}
            radius={9}
            pathOptions={{
              color: CATEGORY_MAP_COLORS[report.category],
              fillColor: CATEGORY_MAP_COLORS[report.category],
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <div className="flex flex-col gap-1.5">
                <p className="font-medium">{report.title}</p>
                <p className="text-xs text-charcoal-900/60">{report.description}</p>
                <div className="flex flex-wrap gap-1">
                  <CategoryBadge category={report.category} />
                  <PriorityBadge priority={report.priority} />
                  <StatusBadge status={report.status} />
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="glass-panel absolute left-1/2 top-4 z-[1000] flex -translate-x-1/2 flex-wrap items-center gap-2 p-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReportStatus | "")}
          className="glass-input py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ReportCategory | "")}
          className="glass-input py-1.5 text-sm"
        >
          <option value="">All categories</option>
          <option value="pothole">Pothole</option>
          <option value="lighting">Lighting</option>
          <option value="waste">Waste</option>
          <option value="flooding">Flooding</option>
          <option value="other">Other</option>
        </select>

        {isLoading && <span className="text-xs text-charcoal-900/50 dark:text-sage-50/50">Loading...</span>}
      </div>

      <div className="absolute right-4 top-4 z-[1000]">
        <ThemeToggle />
      </div>
    </div>
  );
}
