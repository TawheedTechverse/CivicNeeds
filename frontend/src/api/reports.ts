import { apiClient } from "./client";
import type { Report, ReportCategory, ReportCreateResponse, ReportPriority, ReportStatus } from "../types";

export interface ReportFilters {
  status?: ReportStatus;
  category?: ReportCategory;
  priority?: ReportPriority;
  min_lat?: number;
  max_lat?: number;
  min_lng?: number;
  max_lng?: number;
}

export async function listReports(filters: ReportFilters = {}): Promise<Report[]> {
  const { data } = await apiClient.get<Report[]>("/reports", { params: filters });
  return data;
}

export async function getReport(id: string): Promise<Report> {
  const { data } = await apiClient.get<Report>(`/reports/${id}`);
  return data;
}

export interface CreateReportPayload {
  title: string;
  description: string;
  category?: ReportCategory;
  latitude: number;
  longitude: number;
  image_urls?: string[];
}

export async function createReport(payload: CreateReportPayload): Promise<ReportCreateResponse> {
  const { data } = await apiClient.post<ReportCreateResponse>("/reports", payload);
  return data;
}

export interface UpdateReportPayload {
  status?: ReportStatus;
  priority?: ReportPriority;
  category?: ReportCategory;
  assigned_to_id?: string;
}

export async function updateReport(id: string, payload: UpdateReportPayload): Promise<Report> {
  const { data } = await apiClient.patch<Report>(`/reports/${id}`, payload);
  return data;
}
