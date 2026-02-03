import { useEffect, useRef, useCallback, useState } from 'react';

// AC Status Update
export interface ACStatusUpdate {
  package_id: string;
  package_name?: string;
  compressor_id: string;
  compressor_addr?: number;
  run_status: boolean;
  error_status: boolean;
  runtime_seconds?: number;
  starts_in_hour?: number;
  timestamp: string;
}

// VRF Status Update
export interface VRFStatusUpdate {
  vrf_id: string;
  vrf_address?: string;
  ac_number: number;
  status: number;
  timestamp: string;
}

// Hook options
interface UseSSEOptions {
  companyId?: number;
  onACStatus?: (data: ACStatusUpdate) => void;
  onVRFStatus?: (data: VRFStatusUpdate) => void;
  onDataRefresh?: () => void;  // Called when polling triggers a data refresh
  pollingInterval?: number;    // Polling interval in ms (default: 30000)
  enabled?: boolean;           // Whether to enable polling (default: true)
}

/**
 * useSSE Hook - 使用 Polling 模式
 *
 * 由於 Cloudflare 不支援 SSE，改用 polling 方式定時刷新資料
 * 當 companyId 改變時會觸發 onDataRefresh callback
 */
export function useSSE(options: UseSSEOptions = {}) {
  const {
    companyId,
    onDataRefresh,
    pollingInterval = 30000,  // 預設 30 秒
    enabled = true,
  } = options;

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Start polling
  const startPolling = useCallback(() => {
    if (!enabled) return;

    // Clear existing interval
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    setIsPolling(true);
    console.log(`[Polling] Started with interval ${pollingInterval}ms for company ${companyId}`);

    // Set up polling interval
    pollingRef.current = setInterval(() => {
      console.log('[Polling] Refreshing data...');
      setLastRefresh(new Date());
      onDataRefresh?.();
    }, pollingInterval);
  }, [companyId, pollingInterval, onDataRefresh, enabled]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
    console.log('[Polling] Stopped');
  }, []);

  // Manual refresh
  const refresh = useCallback(() => {
    console.log('[Polling] Manual refresh triggered');
    setLastRefresh(new Date());
    onDataRefresh?.();
  }, [onDataRefresh]);

  // Start/stop polling on mount/unmount and when companyId changes
  useEffect(() => {
    if (enabled && companyId) {
      startPolling();
    }
    return () => {
      stopPolling();
    };
  }, [companyId, enabled, startPolling, stopPolling]);

  return {
    isConnected: isPolling,  // For backwards compatibility
    isPolling,
    lastRefresh,
    refresh,
    startPolling,
    stopPolling,
  };
}

export default useSSE;
