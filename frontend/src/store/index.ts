import { create } from "zustand";
import type { BrandContext, Campaign, ChatMessage } from "../types";

interface AppState {
  // Connection
  isConnected: boolean;
  sessionId: string;
  setConnected: (connected: boolean) => void;
  setSessionId: (id: string) => void;

  // Campaign
  campaign: Campaign | null;
  campaigns: Campaign[];
  setCampaign: (campaign: Campaign) => void;
  setCampaigns: (campaigns: Campaign[]) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;

  // Agent state
  isAgentThinking: boolean;
  thinkingAgent: string;
  setAgentThinking: (thinking: boolean, agentName?: string) => void;

  // Context
  currentContext: BrandContext | null;
  contextVersion: number;
  setContext: (context: BrandContext, version: number) => void;

  // Assets
  assets: Array<{ type: string; url?: string; data?: string }>;
  addAsset: (asset: { type: string; url?: string; data?: string }) => void;
}

export const useStore = create<AppState>((set) => ({
  // Connection
  isConnected: false,
  sessionId: "",
  setConnected: (connected) => set({ isConnected: connected }),
  setSessionId: (id) => set({ sessionId: id }),

  // Campaign
  campaign: null,
  campaigns: [],
  setCampaign: (campaign) => set({ campaign }),
  setCampaigns: (campaigns) => set({ campaigns }),

  // Chat
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),

  // Agent state
  isAgentThinking: false,
  thinkingAgent: "",
  setAgentThinking: (thinking, agentName = "") =>
    set({ isAgentThinking: thinking, thinkingAgent: agentName }),

  // Context
  currentContext: null,
  contextVersion: 0,
  setContext: (context, version) =>
    set({ currentContext: context, contextVersion: version }),

  // Assets
  assets: [],
  addAsset: (asset) =>
    set((state) => ({ assets: [...state.assets, asset] })),
}));
