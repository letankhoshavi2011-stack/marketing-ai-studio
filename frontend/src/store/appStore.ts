/** Zustand store — global application state. */

import { create } from 'zustand';

type View = 'canvas' | 'agents' | 'agent-edit' | 'my-agents' | 'prompt-library' | 'assets' | 'settings' | 'analytics' | 'usage' | 'knowledge-base';

export interface Workspace {
    uuid: string;
    name: string;
    description: string;
    settings?: Record<string, any>;
    created_at: string;
}

export interface Campaign {
    id: string;
    name: string;
    description: string;
    campaign_type: string;
    status: string;
    created_at: string;
    workspace_id?: string;
    _id?: string;
}

export interface Card {
    id: string;
    card_type: string;
    title: string;
    status: string;
    agent_used: string;
    thumbnail_url?: string;
    text_preview?: string;
    agent_id?: string;             // core link
    workspace_id?: string;
}

export interface CoreWorkspaceContext {
    brand_name?: string;
    tagline?: string;
    colors: any[];
    fonts: Record<string, string>;
    logo_url?: string;
    visual_style?: string;
    mood?: string;
    industry?: string;
    target_audience?: any[];
    voice_profile?: any;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    agent?: string;
    ui_hints?: any;
    timestamp: string;
}

interface AppState {
    // Auth
    isAuthenticated: boolean;
    showAuthPage: boolean;
    setShowAuthPage: (show: boolean) => void;
    user: any | null;
    setAuth: (user: any) => void;
    clearAuth: () => void;

    // Workspace
    workspaces: Workspace[];
    activeWorkspace: Workspace | null;
    setWorkspaces: (ws: Workspace[]) => void;
    setActiveWorkspace: (ws: Workspace | null) => void;
    updateActiveWorkspace: (updates: Partial<Workspace>) => void;

    // Campaign
    campaigns: Campaign[];
    activeCampaign: Campaign | null;
    setCampaigns: (c: Campaign[]) => void;
    setActiveCampaign: (c: Campaign | null) => void;
    updateActiveCampaign: (updates: Partial<Campaign>) => void;

    // Chat
    messages: ChatMessage[];
    sessionId: string | null;
    isAgentThinking: boolean;
    activeAgent: string | null;
    addMessage: (msg: ChatMessage) => void;
    setMessages: (msgs: ChatMessage[]) => void;
    setSessionId: (id: string | null) => void;
    setAgentThinking: (thinking: boolean, agent?: string) => void;
    setActiveAgent: (agent: string | null) => void;
    updateLastAssistantMessage: (content: string) => void;
    setLastAssistantMessage: (content: string, uiHints?: any) => void;

    // Cards
    cards: Card[];
    setCards: (cards: Card[]) => void;
    addCard: (card: Card) => void;
    removeCard: (cardId: string) => void;

    // Workspace loading
    workspaceLoading: boolean;
    setWorkspaceLoading: (loading: boolean) => void;

    // UI
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    sidebarCollapsed: boolean;
    toggleSidebarCollapsed: () => void;
    currentView: View;
    setCurrentView: (view: View) => void;
    postEditorView: View;
    setPostEditorView: (view: View) => void;
    zenMode: boolean;
    setZenMode: (zen: boolean) => void;
    toggleZenMode: () => void;

    // Agent Editor
    agentEditorCardId: string | null;
    agentEditorAgentId: string | null;
    lastCardId: string | null;
    setAgentEditor: (cardId: string | null, agentId: string | null) => void;
    setLastCardId: (cardId: string | null) => void;

    // Core State
    coreContext: CoreWorkspaceContext | null;
    selectedOutputs: string[]; // IDs of cards
    selectedKnowledgeDocumentIds: string[];
    urls: string[];
    files: File[];
    kbUploadsInFlight: number;
    scraperPreviewed: boolean;
    setCoreContext: (ctx: CoreWorkspaceContext | null) => void;
    setSelectedOutputs: (ids: string[]) => void;
    setSelectedKnowledgeDocumentIds: (ids: string[]) => void;
    setUrls: (urls: string[]) => void;
    setFiles: (files: File[]) => void;
    setKbUploadsInFlight: (count: number) => void;
    setScraperPreviewed: (v: boolean) => void;
    resetCoreForm: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Auth
    isAuthenticated: !!localStorage.getItem('token'),
    showAuthPage: false,
    setShowAuthPage: (showAuthPage) => set({ showAuthPage }),
    user: null,
    setAuth: (user) => set({ isAuthenticated: true, user, showAuthPage: false }),
    clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        set({ isAuthenticated: false, user: null });
    },

    // Workspace
    workspaces: [],
    activeWorkspace: null,
    setWorkspaces: (workspaces) => set({ workspaces }),
    setActiveWorkspace: (activeWorkspace) => set((s) => {
        if (activeWorkspace && s.activeWorkspace?.uuid === activeWorkspace.uuid) return s;
        return { activeWorkspace, campaigns: [], activeCampaign: null };
    }),
    updateActiveWorkspace: (updates) => set((s) => {
        if (!s.activeWorkspace) return s;
        const newWs = { ...s.activeWorkspace, ...updates };
        return {
            activeWorkspace: newWs,
            workspaces: s.workspaces.map(w => w.uuid === newWs.uuid ? newWs : w)
        };
    }),

    // Campaign
    campaigns: [],
    activeCampaign: null,
    setCampaigns: (campaigns) => set({ campaigns }),
    setActiveCampaign: (activeCampaign) => set({ activeCampaign, messages: [], sessionId: null }),
    updateActiveCampaign: (updates) => set((s) => {
        if (!s.activeCampaign) return s;
        const newCamp = { ...s.activeCampaign, ...updates };
        return {
            activeCampaign: newCamp,
            campaigns: s.campaigns.map(c => c.id === newCamp.id ? newCamp : c)
        };
    }),

    // Chat
    messages: [],
    sessionId: null,
    isAgentThinking: false,
    activeAgent: null,
    addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
    setMessages: (messages) => set({ messages }),
    setSessionId: (sessionId) => set({ sessionId }),
    setAgentThinking: (isAgentThinking, agent) => set({ isAgentThinking, activeAgent: agent || null }),
    setActiveAgent: (activeAgent) => set({ activeAgent }),
    updateLastAssistantMessage: (content) =>
        set((s) => {
            const msgs = [...s.messages];
            for (let i = msgs.length - 1; i >= 0; i--) {
                if (msgs[i].role === 'assistant') {
                    msgs[i] = { ...msgs[i], content: msgs[i].content + content };
                    break;
                }
            }
            return { messages: msgs };
        }),
    setLastAssistantMessage: (content, uiHints) =>
        set((s) => {
            const msgs = [...s.messages];
            for (let i = msgs.length - 1; i >= 0; i--) {
                if (msgs[i].role === 'assistant') {
                    msgs[i] = { ...msgs[i], content, ...(uiHints ? { ui_hints: uiHints } : {}) };
                    break;
                }
            }
            return { messages: msgs };
        }),

    // Cards
    cards: [],
    setCards: (cards) => set({ cards }),
    addCard: (card) => set((s) => ({ cards: [...s.cards, card] })),
    removeCard: (cardId) => set((s) => ({ cards: s.cards.filter(c => c.id !== cardId) })),

    // Workspace loading
    workspaceLoading: false,
    setWorkspaceLoading: (workspaceLoading) => set({ workspaceLoading }),

    // UI
    sidebarOpen: true,
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    sidebarCollapsed: false,
    toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    currentView: 'canvas',
    setCurrentView: (currentView) => set({ currentView }),
    postEditorView: 'my-agents',
    setPostEditorView: (postEditorView) => set({ postEditorView }),
    zenMode: false,
    setZenMode: (zenMode) => set({ zenMode }),
    toggleZenMode: () => set((s) => ({ zenMode: !s.zenMode })),

    // Agent Editor
    agentEditorCardId: null,
    agentEditorAgentId: null,
    lastCardId: null,
    setAgentEditor: (agentEditorCardId, agentEditorAgentId) => set({ agentEditorCardId, agentEditorAgentId }),
    setLastCardId: (lastCardId) => set({ lastCardId }),

    // Core State
    coreContext: null,
    selectedOutputs: [],
    selectedKnowledgeDocumentIds: [],
    urls: [],
    files: [],
    kbUploadsInFlight: 0,
    scraperPreviewed: false,
    setCoreContext: (coreContext) => set({ coreContext }),
    setSelectedOutputs: (selectedOutputs) => set({ selectedOutputs }),
    setSelectedKnowledgeDocumentIds: (selectedKnowledgeDocumentIds) => set({ selectedKnowledgeDocumentIds }),
    setUrls: (urls) => set({ urls, scraperPreviewed: false }),
    setFiles: (files) => set({ files }),
    setKbUploadsInFlight: (kbUploadsInFlight) => set({ kbUploadsInFlight }),
    setScraperPreviewed: (scraperPreviewed) => set({ scraperPreviewed }),
    resetCoreForm: () => set({
        selectedOutputs: [],
        selectedKnowledgeDocumentIds: [],
        urls: [],
        files: [],
        kbUploadsInFlight: 0,
        scraperPreviewed: false
    }),
}));

