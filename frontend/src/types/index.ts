export type UserRole = "citizen" | "authority";

export type ReportCategory = "pothole" | "lighting" | "waste" | "flooding" | "other";
export type ReportPriority = "low" | "medium" | "high" | "critical";
export type ReportStatus = "open" | "in_progress" | "resolved";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface ReportImage {
  id: string;
  url: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  priority: ReportPriority;
  status: ReportStatus;
  latitude: number;
  longitude: number;
  ai_confidence: number | null;
  ai_reasoning: string | null;
  duplicate_of_id: string | null;
  reporter_id: string;
  assigned_to_id: string | null;
  created_at: string;
  updated_at: string;
  images: ReportImage[];
}

export interface DuplicateInfo {
  report_id: string;
  title: string;
  distance_meters: number;
  similarity: number;
}

export interface ReportCreateResponse {
  report: Report;
  possible_duplicates: DuplicateInfo[];
}
