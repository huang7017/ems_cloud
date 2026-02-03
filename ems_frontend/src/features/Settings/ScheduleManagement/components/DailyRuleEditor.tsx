import React from "react";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  IconButton,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import type { ScheduleFormData, DayOfWeek, ActionFormData, ActionType } from "../types";
import { DAYS_OF_WEEK, DAY_LABELS, ACTION_LABELS } from "../../../../api/schedule";

interface DailyRuleEditorProps {
  formData: ScheduleFormData;
  onChange: (formData: ScheduleFormData) => void;
}

const DailyRuleEditor: React.FC<DailyRuleEditorProps> = ({ formData, onChange }) => {
  // 更新某天的啟用狀態
  const handleDayToggle = (day: DayOfWeek) => {
    const newFormData = { ...formData };
    newFormData.dailyRules = {
      ...newFormData.dailyRules,
      [day]: {
        ...newFormData.dailyRules[day],
        enabled: !newFormData.dailyRules[day].enabled,
      },
    };
    onChange(newFormData);
  };

  // 更新運行時段啟用狀態
  const handleRunPeriodToggle = (day: DayOfWeek) => {
    const newFormData = { ...formData };
    newFormData.dailyRules = {
      ...newFormData.dailyRules,
      [day]: {
        ...newFormData.dailyRules[day],
        runPeriod: {
          ...newFormData.dailyRules[day].runPeriod,
          enabled: !newFormData.dailyRules[day].runPeriod.enabled,
        },
      },
    };
    onChange(newFormData);
  };

  // 更新運行時段時間
  const handleRunPeriodChange = (
    day: DayOfWeek,
    field: "start" | "end",
    value: string
  ) => {
    const newFormData = { ...formData };
    newFormData.dailyRules = {
      ...newFormData.dailyRules,
      [day]: {
        ...newFormData.dailyRules[day],
        runPeriod: {
          ...newFormData.dailyRules[day].runPeriod,
          [field]: value,
        },
      },
    };
    onChange(newFormData);
  };

  // 新增動作
  const handleAddAction = (day: DayOfWeek) => {
    const newFormData = { ...formData };
    const newAction: ActionFormData = { type: "closeOnce", time: "12:00" };
    newFormData.dailyRules = {
      ...newFormData.dailyRules,
      [day]: {
        ...newFormData.dailyRules[day],
        actions: [...newFormData.dailyRules[day].actions, newAction],
      },
    };
    onChange(newFormData);
  };

  // 更新動作
  const handleActionChange = (
    day: DayOfWeek,
    index: number,
    field: keyof ActionFormData,
    value: string
  ) => {
    const newFormData = { ...formData };
    const newActions = [...newFormData.dailyRules[day].actions];
    newActions[index] = { ...newActions[index], [field]: value };
    newFormData.dailyRules = {
      ...newFormData.dailyRules,
      [day]: {
        ...newFormData.dailyRules[day],
        actions: newActions,
      },
    };
    onChange(newFormData);
  };

  // 刪除動作
  const handleDeleteAction = (day: DayOfWeek, index: number) => {
    const newFormData = { ...formData };
    const newActions = newFormData.dailyRules[day].actions.filter(
      (_, i) => i !== index
    );
    newFormData.dailyRules = {
      ...newFormData.dailyRules,
      [day]: {
        ...newFormData.dailyRules[day],
        actions: newActions,
      },
    };
    onChange(newFormData);
  };

  return (
    <Box>
      {DAYS_OF_WEEK.map((day) => {
        const rule = formData.dailyRules[day as DayOfWeek];
        return (
          <Accordion key={day} defaultExpanded={rule.enabled}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <FormControlLabel
                control={
                  <Switch
                    checked={rule.enabled}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleDayToggle(day as DayOfWeek);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                }
                label={
                  <Typography fontWeight={rule.enabled ? "bold" : "normal"}>
                    {DAY_LABELS[day]}
                  </Typography>
                }
                onClick={(e) => e.stopPropagation()}
              />
              {rule.enabled && (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  {rule.actions.length} 個動作
                  {rule.runPeriod.enabled &&
                    ` | 效率模式 ${rule.runPeriod.start}-${rule.runPeriod.end}`}
                </Typography>
              )}
            </AccordionSummary>
            <AccordionDetails>
              {rule.enabled && (
                <Stack spacing={2}>
                  {/* 運行時段 */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rule.runPeriod.enabled}
                          onChange={() => handleRunPeriodToggle(day as DayOfWeek)}
                          size="small"
                        />
                      }
                      label="效率模式時段"
                    />
                    {rule.runPeriod.enabled && (
                      <Stack direction="row" spacing={2} sx={{ mt: 1, ml: 4 }}>
                        <TextField
                          label="開始時間"
                          type="time"
                          value={rule.runPeriod.start}
                          onChange={(e) =>
                            handleRunPeriodChange(day as DayOfWeek, "start", e.target.value)
                          }
                          size="small"
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="結束時間"
                          type="time"
                          value={rule.runPeriod.end}
                          onChange={(e) =>
                            handleRunPeriodChange(day as DayOfWeek, "end", e.target.value)
                          }
                          size="small"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Stack>
                    )}
                  </Box>

                  <Divider />

                  {/* 動作列表 */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      排程動作
                    </Typography>
                    {rule.actions.map((action, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <InputLabel>動作類型</InputLabel>
                          <Select
                            value={action.type}
                            label="動作類型"
                            onChange={(e) =>
                              handleActionChange(
                                day as DayOfWeek,
                                index,
                                "type",
                                e.target.value as ActionType
                              )
                            }
                          >
                            <MenuItem value="closeOnce">{ACTION_LABELS.closeOnce}</MenuItem>
                            <MenuItem value="skip">{ACTION_LABELS.skip}</MenuItem>
                            <MenuItem value="forceCloseAfter">
                              {ACTION_LABELS.forceCloseAfter}
                            </MenuItem>
                          </Select>
                        </FormControl>

                        {action.type !== "skip" && (
                          <TextField
                            label="執行時間"
                            type="time"
                            value={action.time}
                            onChange={(e) =>
                              handleActionChange(
                                day as DayOfWeek,
                                index,
                                "time",
                                e.target.value
                              )
                            }
                            size="small"
                            InputLabelProps={{ shrink: true }}
                          />
                        )}

                        <IconButton
                          color="error"
                          onClick={() => handleDeleteAction(day as DayOfWeek, index)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    ))}

                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => handleAddAction(day as DayOfWeek)}
                      size="small"
                    >
                      新增動作
                    </Button>
                  </Box>
                </Stack>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default DailyRuleEditor;
