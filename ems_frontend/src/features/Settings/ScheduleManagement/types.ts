import type { Schedule, DailyRule, Action, TimePeriod } from "../../../api/schedule";

export type { Schedule, DailyRule, Action, TimePeriod };

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type ActionType = "closeOnce" | "skip" | "forceCloseAfter";

export type SyncStatus = "pending" | "synced" | "failed";

// 編輯用的表單狀態
export interface DailyRuleFormData {
  enabled: boolean;
  runPeriod: {
    enabled: boolean;
    start: string;
    end: string;
  };
  actions: ActionFormData[];
}

export interface ActionFormData {
  type: ActionType;
  time: string;
}

export interface ScheduleFormData {
  dailyRules: Record<DayOfWeek, DailyRuleFormData>;
  exceptions: string[];
}

// Redux State
export interface ScheduleManagementState {
  schedule: Schedule | null;
  loading: boolean;
  saving: boolean;
  syncing: boolean;
  error: string | null;
  snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  };
}

// 初始化每日規則表單資料
export const createEmptyDailyRuleForm = (): DailyRuleFormData => ({
  enabled: false,
  runPeriod: {
    enabled: false,
    start: "08:00",
    end: "18:00",
  },
  actions: [],
});

// 初始化排程表單資料
export const createEmptyScheduleForm = (): ScheduleFormData => ({
  dailyRules: {
    Monday: createEmptyDailyRuleForm(),
    Tuesday: createEmptyDailyRuleForm(),
    Wednesday: createEmptyDailyRuleForm(),
    Thursday: createEmptyDailyRuleForm(),
    Friday: createEmptyDailyRuleForm(),
    Saturday: createEmptyDailyRuleForm(),
    Sunday: createEmptyDailyRuleForm(),
  },
  exceptions: [],
});

// 從 API 資料轉換為表單資料
export const scheduleToFormData = (schedule: Schedule | null): ScheduleFormData => {
  const formData = createEmptyScheduleForm();

  if (!schedule) return formData;

  // 轉換每日規則
  Object.entries(schedule.daily_rules).forEach(([day, rule]) => {
    if (rule && day in formData.dailyRules) {
      const dayKey = day as DayOfWeek;
      formData.dailyRules[dayKey] = {
        enabled: true,
        runPeriod: {
          enabled: !!rule.run_period,
          start: rule.run_period?.start || "08:00",
          end: rule.run_period?.end || "18:00",
        },
        actions: rule.actions.map((action) => ({
          type: action.type as ActionType,
          time: action.time || "",
        })),
      };
    }
  });

  // 轉換例外日期
  formData.exceptions = schedule.exceptions || [];

  return formData;
};

// 從表單資料轉換為 API 請求
export const formDataToRequest = (
  formData: ScheduleFormData,
  companyDeviceId: number
): import("../../../api/schedule").ScheduleRequest => {
  const data: Record<string, import("../../../api/schedule").DailyRuleRequest | null> = {};

  Object.entries(formData.dailyRules).forEach(([day, rule]) => {
    if (rule.enabled) {
      data[day] = {
        runPeriod: rule.runPeriod.enabled
          ? { start: rule.runPeriod.start, end: rule.runPeriod.end }
          : null,
        actions: rule.actions.map((action) => ({
          type: action.type as "closeOnce" | "skip" | "forceCloseAfter",
          time: action.time || undefined,
        })),
      };
    } else {
      data[day] = null;
    }
  });

  return {
    company_device_id: companyDeviceId,
    command: "schedule",
    data,
    exceptions: formData.exceptions,
  };
};
