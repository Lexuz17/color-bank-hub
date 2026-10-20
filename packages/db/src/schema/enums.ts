import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", [
  "website_admin",
  "rnd",
  "pid",
  "tsi",
]);
export const userStatus = pgEnum("user_status", [
  "pending",
  "active",
  "disabled",
]);
export const approvalStatus = pgEnum("approval_status", [
  "pending",
  "approved",
  "declined",
]);

export const undertone = pgEnum("undertone", ["warm", "neutral", "cool"]);
export const season = pgEnum("season", [
  "spring",
  "summer",
  "autumn",
  "winter",
]);
export const colorModel = pgEnum("color_model", ["hsl", "lab", "lch"]);

export const mappingView = pgEnum("mapping_view", [
  "season",
  "color_family",
  "custom",
]);
export const mappingStatus = pgEnum("mapping_status", ["draft", "published"]);

export const priorityLevel = pgEnum("priority_level", [
  "low",
  "medium",
  "high",
]);
export const requestType = pgEnum("request_type", [
  "benchmark_matching",
  "gap_filling",
]);
export const requestStatus = pgEnum("request_status", [
  "pending",
  "approved",
  "formulating",
  "completed",
  "declined",
]);
export const reportStatus = pgEnum("report_status", ["pending", "resolved"]);
