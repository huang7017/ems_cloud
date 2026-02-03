import axios from "../helper/axios";

// ============================================
// Types (matches ems_vrv schedule format)
// ============================================

export interface TimePeriod {
  id?: number;
  start: string; // HH:MM
  end: string; // HH:MM
}

export interface Action {
  id?: number;
  type: "closeOnce" | "skip" | "forceCloseAfter";
  time?: string; // HH:MM (optional for "skip")
}

export interface DailyRule {
  id?: number;
  day_of_week: string;
  run_period?: TimePeriod | null;
  actions: Action[];
}

export interface Schedule {
  id: number;
  company_device_id: number;
  schedule_id: string;
  command: string;
  daily_rules: Record<string, DailyRule | null>;
  exceptions: string[]; // YYYY-MM-DD format
  version: number;
  sync_status: "pending" | "synced" | "failed";
  synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyRuleRequest {
  runPeriod?: {
    start: string;
    end: string;
  } | null;
  actions?: Action[];
}

export interface ScheduleRequest {
  company_device_id: number;
  command?: string;
  data: Record<string, DailyRuleRequest | null>;
  exceptions?: string[];
}

// ============================================
// API Functions
// ============================================

// 獲取設備排程
export const fetchSchedule = async (companyDeviceId: number): Promise<Schedule> => {
  const response = await axios.get(`/schedules/${companyDeviceId}`);
  return response.data;
};

// 獲取待同步排程列表
export const fetchPendingSchedules = async (): Promise<Schedule[]> => {
  const response = await axios.get("/schedules");
  return response.data;
};

// 創建排程
export const createSchedule = async (data: ScheduleRequest): Promise<Schedule> => {
  const response = await axios.post("/schedules", data);
  return response.data;
};

// 更新排程
export const updateSchedule = async (
  companyDeviceId: number,
  data: ScheduleRequest
): Promise<Schedule> => {
  const response = await axios.put(`/schedules/${companyDeviceId}`, data);
  return response.data;
};

// 刪除排程
export const deleteSchedule = async (companyDeviceId: number): Promise<void> => {
  await axios.delete(`/schedules/${companyDeviceId}`);
};

// 同步排程到設備
export const syncSchedule = async (companyDeviceId: number): Promise<{ message: string }> => {
  const response = await axios.post(`/schedules/${companyDeviceId}/sync`);
  return response.data;
};

// 從設備獲取排程 (發送 getSchedule 命令)
export const queryScheduleFromDevice = async (companyDeviceId: number): Promise<{ message: string }> => {
  const response = await axios.post(`/schedules/${companyDeviceId}/query`);
  return response.data;
};

// ============================================
// Helper Functions
// ============================================

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const DAY_LABELS: Record<string, string> = {
  Monday: "週一",
  Tuesday: "週二",
  Wednesday: "週三",
  Thursday: "週四",
  Friday: "週五",
  Saturday: "週六",
  Sunday: "週日",
};

export const ACTION_LABELS: Record<string, string> = {
  closeOnce: "單次關閉",
  skip: "跳過當日",
  forceCloseAfter: "時間後強制關閉",
};

export const SYNC_STATUS_LABELS: Record<string, string> = {
  pending: "待同步",
  synced: "已同步",
  failed: "同步失敗",
};
