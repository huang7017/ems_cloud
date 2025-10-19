
export const generateRandomString = (length:number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * 格式化时间，使用浏览器本地时区
 * 自动根据用户浏览器所在时区显示时间
 * @param timestamp - 时间字符串或Date对象
 * @param options - Intl.DateTimeFormatOptions 配置
 * @returns 格式化后的时间字符串
 */
export const formatTimestamp = (
  timestamp: string | Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!timestamp) return '--';
  
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '--';
    }
    
    // 构建默认选项（不指定 timeZone，使用浏览器本地时区）
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      ...defaultOptions,
      ...options,
    };
    
    return new Intl.DateTimeFormat('zh-TW', formatOptions).format(date);
  } catch (error) {
    return '--';
  }
};

/**
 * 格式化日期（简短版本，只显示月/日 时:分）
 * @param timestamp - 时间字符串或Date对象
 * @returns 格式化后的时间字符串 (MM/DD HH:mm)
 */
export const formatShortTimestamp = (timestamp: string | Date): string => {
  return formatTimestamp(timestamp, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 格式化日期（只显示日期，不显示时间）
 * @param timestamp - 时间字符串或Date对象
 * @returns 格式化后的日期字符串 (YYYY/MM/DD)
 */
export const formatDateOnly = (timestamp: string | Date): string => {
  return formatTimestamp(timestamp, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * 格式化为月/日（用于图表显示）
 * 使用浏览器本地时区
 * @param timestamp - 时间字符串或Date对象
 * @returns 格式化后的日期字符串 (MM/DD)
 */
export const formatMonthDay = (timestamp: string | Date): string => {
  if (!timestamp) return '--';
  
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    if (isNaN(date.getTime())) {
      return '--';
    }
    
    // 手动构造 MM/DD 格式，使用浏览器本地时区
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${month}/${day}`;
  } catch (error) {
    return '--';
  }
};