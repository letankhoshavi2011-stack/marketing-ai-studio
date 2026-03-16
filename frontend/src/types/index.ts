// WebSocket message types matching backend models

export type WSMessageType =
  | "start_campaign"
  | "user_message"
  | "feedback"
  | "campaign_created"
  | "agent_thinking"
  | "agent_response"
  | "asset_generated"
  | "context_updated"
  | "error";

export interface WSMessage {
  type: WSMessageType;
  payload: Record<string, unknown>;
  session_id: string;
  timestamp: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  status: "active" | "paused" | "completed" | "archived";
  created_at: string;
  updated_at: string;
}

export interface BrandContext {
  industry: string;
  target_audience: string;
  keywords: string[];
  brand_values: string[];
  brand_names: string[];
  selected_brand_name: string;
  taglines: string[];
  selected_tagline: string;
  brand_identity: Record<string, unknown>;
  logo_concepts: Record<string, unknown>[];
  visual_style: Record<string, unknown>;
  campaign_concepts: Record<string, unknown>[];
  content: Record<string, unknown>;
  images: MediaAsset[];
  videos: MediaAsset[];
  seo_strategy: Record<string, unknown>;
  compliance_notes: string[];
}

export interface MediaAsset {
  url?: string;
  image_data?: string;
  prompt?: string;
  style?: string;
  type?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent" | "system";
  text: string;
  agentName?: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export interface AgentThinking {
  agent_name: string;
  status: string;
}
