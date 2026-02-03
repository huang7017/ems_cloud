import { useEffect, useRef, useCallback } from "react";
import Cookies from "js-cookie";
import { config } from "../config/environment";

interface DeviceUpdateEvent {
  device_sn: string;
  company_id: number;
  device_id: number;
  updated_at: string;
}

interface UseDeviceSSEOptions {
  companyId?: number;
  onDeviceUpdate?: (event: DeviceUpdateEvent) => void;
  enabled?: boolean;
}

export const useDeviceSSE = ({
  companyId,
  onDeviceUpdate,
  enabled = true,
}: UseDeviceSSEOptions) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;

    const accessToken = Cookies.get("accessToken");
    if (!accessToken) {
      console.warn("[SSE] No access token, cannot connect");
      return;
    }

    // Build SSE URL with auth token in query params (SSE doesn't support headers)
    let url = `${config.api.baseURL}/sse/devices?token=${accessToken}`;
    if (companyId) {
      url += `&company_id=${companyId}`;
    }

    console.log("[SSE] Connecting to:", url);

    const eventSource = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("[SSE] Connection established");
    };

    eventSource.addEventListener("connected", (e) => {
      const data = JSON.parse(e.data);
      console.log("[SSE] Connected with client ID:", data.client_id);
    });

    eventSource.addEventListener("device_update", (e) => {
      const event: DeviceUpdateEvent = JSON.parse(e.data);
      console.log("[SSE] Device update received:", event);
      onDeviceUpdate?.(event);
    });

    eventSource.onerror = (error) => {
      console.error("[SSE] Connection error:", error);
      eventSource.close();
      eventSourceRef.current = null;

      // Reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("[SSE] Attempting to reconnect...");
        connect();
      }, 5000);
    };
  }, [enabled, companyId, onDeviceUpdate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      console.log("[SSE] Disconnecting");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { disconnect, reconnect: connect };
};
