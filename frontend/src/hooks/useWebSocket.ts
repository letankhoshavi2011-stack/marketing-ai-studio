import { useCallback, useEffect, useRef } from "react";
import { useStore } from "../store";
import type { WSMessage } from "../types";

const WS_BASE = `ws://${window.location.hostname}:8000/ws`;
const RECONNECT_DELAY = 3000;

export function useWebSocket(sessionId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number>();

  const {
    setConnected,
    addMessage,
    setAgentThinking,
    setCampaign,
    setContext,
    addAsset,
  } = useStore();

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const msg: WSMessage = JSON.parse(event.data);

      switch (msg.type) {
        case "campaign_created":
          setCampaign({
            id: msg.payload.campaign_id as string,
            user_id: "default_user",
            name: msg.payload.campaign_name as string,
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          addMessage({
            id: crypto.randomUUID(),
            role: "system",
            text: `Campaign "${msg.payload.campaign_name}" created. Start describing your brand!`,
            timestamp: new Date(),
          });
          break;

        case "agent_thinking":
          setAgentThinking(true, msg.payload.agent_name as string);
          break;

        case "agent_response":
          setAgentThinking(false);
          addMessage({
            id: crypto.randomUUID(),
            role: "agent",
            text: msg.payload.text as string,
            agentName: msg.payload.agent_name as string,
            timestamp: new Date(),
            data: msg.payload.data as Record<string, unknown>,
          });
          break;

        case "asset_generated": {
          const assetData = msg.payload.data as Record<string, unknown>;
          addAsset({
            type: msg.payload.asset_type as string,
            url: (assetData?.url as string) || "",
            data: (assetData?.prompt as string) || "",
          });
          break;
        }

        case "context_updated": {
          const version = msg.payload.version_number as number;
          // Fetch updated context from REST endpoint
          if (useStore.getState().campaign) {
            fetch(`/api/campaigns/${useStore.getState().campaign!.id}/context`)
              .then((r) => r.json())
              .then((data) => {
                if (data.context) {
                  setContext(data.context, version);
                }
              });
          }
          break;
        }

        case "error":
          setAgentThinking(false);
          addMessage({
            id: crypto.randomUUID(),
            role: "system",
            text: `Error: ${msg.payload.error}`,
            timestamp: new Date(),
          });
          break;
      }
    },
    [addAsset, addMessage, setAgentThinking, setCampaign, setContext]
  );

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_BASE}/${sessionId}`);

    ws.onopen = () => {
      setConnected(true);
      console.log("WebSocket connected");
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("WebSocket disconnected, reconnecting...");
      reconnectTimer.current = window.setTimeout(connect, RECONNECT_DELAY);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      ws.close();
    };

    ws.onmessage = handleMessage;
    wsRef.current = ws;
  }, [sessionId, setConnected, handleMessage]);

  const sendMessage = useCallback(
    (type: string, payload: Record<string, unknown>) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type,
            payload,
            session_id: sessionId,
            timestamp: new Date().toISOString(),
          })
        );
      }
    },
    [sessionId]
  );

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { sendMessage };
}
