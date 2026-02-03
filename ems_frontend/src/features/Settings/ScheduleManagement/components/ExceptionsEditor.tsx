import React, { useState } from "react";
import {
  Box,
  Chip,
  TextField,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import dayjs from "dayjs";

interface ExceptionsEditorProps {
  exceptions: string[];
  onChange: (exceptions: string[]) => void;
}

const ExceptionsEditor: React.FC<ExceptionsEditorProps> = ({
  exceptions,
  onChange,
}) => {
  const [newDate, setNewDate] = useState("");

  // 新增例外日期
  const handleAddException = () => {
    if (!newDate) return;

    // 檢查日期格式
    const dateStr = dayjs(newDate).format("YYYY-MM-DD");
    if (!dayjs(newDate).isValid()) return;

    // 檢查是否已存在
    if (exceptions.includes(dateStr)) return;

    onChange([...exceptions, dateStr].sort());
    setNewDate("");
  };

  // 刪除例外日期
  const handleDeleteException = (date: string) => {
    onChange(exceptions.filter((d) => d !== date));
  };

  // 格式化日期顯示
  const formatDate = (date: string) => {
    return dayjs(date).format("YYYY/MM/DD (ddd)");
  };

  return (
    <Box>
      {/* 新增日期 */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="選擇日期"
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddException}
          disabled={!newDate}
        >
          新增
        </Button>
      </Stack>

      {/* 例外日期列表 */}
      {exceptions.length > 0 ? (
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {exceptions.map((date) => (
            <Chip
              key={date}
              label={formatDate(date)}
              onDelete={() => handleDeleteException(date)}
              color="warning"
              variant="outlined"
            />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          尚無例外日期。在例外日期當天，排程將不會執行。
        </Typography>
      )}
    </Box>
  );
};

export default ExceptionsEditor;
