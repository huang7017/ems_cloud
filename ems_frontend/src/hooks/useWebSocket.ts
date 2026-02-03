import { useEffect, useRef, useCallback, useState } from 'react';
import Cookies from 'js-cookie';

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

// WebSocket Event
interface WSEvent {
  type: 'ac_status' | 'vrf_status' | 'temperature' | 'meter' | 'alert';
  company_id?: number;
  data: unknown;
}

// Hook options
interface UseWebSocketOptions {
  companyId?: number;
  onACStatus?: (data: ACStatusUpdate) => void;
  onVRFStatus?: (data: VRFStatusUpdate) => void;
  onDataRefresh?: () => void;
  enabled?: boolean;
  reconnectInterval?: number;
}

/**
 * useWebSocket Hook - WebSocket real-time updates
 *
 * Connects to the backend WebSocket endpoint for real-time AC/VRF status updates.
 * Automatically reconnects on connection loss.
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    companyId,
    onACStatus,
    onVRFStatus,
    onDataRefresh,
    enabled = true,
    reconnectInterval = 5000,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<Date | null>(null);

  // Build WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    const token = Cookies.get('accessToken');
    if (!token) {
      console.warn('[WebSocket] No access token available');
      return null;
    }

    // Determine WebSocket URL based on current location
    const currentHost = window.location.host;
    const isSecure = window.location.protocol === 'https:';
    const protocol = isSecure ? 'wss:' : 'ws:';

    let wsUrl: string;

    // Check if running in development (Vite dev server)
    if (import.meta.env.DEV) {
      // Development: connect to backend directly via ws://localhost:8080
      // Vite proxy doesn't handle WebSocket upgrade well, so connect directly
      wsUrl = `ws://localhost:8080/ws/dashboard`;
    } else {
      // Production: use /api/ws/ path since Cloudflare proxies /api/* to backend
      wsUrl = `${protocol}//${currentHost}/api/ws/dashboard`;
    }

    // Add query parameters
    const params = new URLSearchParams();
    params.set('token', token);
    if (companyId) {
      params.set('company_id', companyId.toString());
    }

    console.log(`[WebSocket] URL: ${wsUrl.split('?')[0]}, DEV: ${import.meta.env.DEV}`);
    return `${wsUrl}?${params.toString()}`;
  }, [companyId]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const url = getWebSocketUrl();
    if (!url) {
      return;
    }

    console.log(`[WebSocket] Connecting to ${url.split('?')[0]}...`);

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
      // Clear any pending reconnect
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const message: WSEvent = JSON.parse(event.data);
        setLastMessage(new Date());

        console.log('[WebSocket] Received:', message.type);

        switch (message.type) {
          case 'ac_status':
            onACStatus?.(message.data as ACStatusUpdate);
            break;
          case 'vrf_status':
            onVRFStatus?.(message.data as VRFStatusUpdate);
            break;
          default:
            console.log('[WebSocket] Unknown event type:', message.type);
        }
      } catch (err) {
        console.error('[WebSocket] Failed to parse message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    ws.onclose = (event) => {
      console.log(`[WebSocket] Disconnected (code: ${event.code})`);
      setIsConnected(false);
      wsRef.current = null;

      // Schedule reconnect if enabled
      if (enabled && !reconnectTimeoutRef.current) {
        console.log(`[WebSocket] Reconnecting in ${reconnectInterval}ms...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connect();
        }, reconnectInterval);
      }
    };
  }, [getWebSocketUrl, onACStatus, onVRFStatus, enabled, reconnectInterval]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    console.log('[WebSocket] Disconnected manually');
  }, []);

  // Manual refresh (triggers onDataRefresh callback)
  const refresh = useCallback(() => {
    console.log('[WebSocket] Manual refresh triggered');
    onDataRefresh?.();
  }, [onDataRefresh]);

  // Connect/disconnect based on enabled state and companyId
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, companyId, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    refresh,
    connect,
    disconnect,
  };
}

export default useWebSocket;
