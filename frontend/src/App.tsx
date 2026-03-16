/** Main App — layout shell with auth gate and workspace gate. */

import React, { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { authApi } from './services/api';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import AnalyticsPanel from './components/AnalyticsPanel';
import SettingsPanel from './components/SettingsPanel';
import CanvasPanel from './components/ReactFlow/CanvasPanel';
import AgentEditorView from './components/AgentEditorView';
import MyAgentsView from './components/MyAgentsView';
import PromptLibraryView from './components/PromptLibraryView';
import UsagePanel from './components/UsagePanel';
import WorkspaceGate from './components/WorkspaceGate';
import AssetsLibraryView from './views/AssetsLibraryView';
import KnowledgeBaseView from './views/KnowledgeBaseView';
import { Menu } from 'lucide-react';

export default function App() {
  const {
    isAuthenticated, showAuthPage, setAuth, currentView,
    sidebarOpen, toggleSidebar, activeWorkspace, zenMode
  } = useAppStore();

  // Auth check on mount
  useEffect(() => {
    const handleAuthExpired = () => {
      useAppStore.getState().clearAuth();
      useAppStore.getState().setShowAuthPage(true);
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    const token = localStorage.getItem('token');
    if (token) {
      authApi.me()
        .then(r => setAuth(r))
        .catch(() => handleAuthExpired());
    }
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  if (!isAuthenticated && !showAuthPage) return <LandingPage />;
  if (!isAuthenticated && showAuthPage) return <AuthPage />;

  const renderView = () => {
    switch (currentView) {
      case 'canvas': return <CanvasPanel />;
      case 'agent-edit': return <AgentEditorView />;
      case 'my-agents': return <MyAgentsView />;
      case 'prompt-library': return <PromptLibraryView />;
      case 'analytics': return <AnalyticsPanel />;
      case 'usage': return <UsagePanel />;
      case 'assets': return <AssetsLibraryView />;
      case 'knowledge-base': return <KnowledgeBaseView />;
      case 'settings': return <SettingsPanel />;
      default: return <CanvasPanel />;
    }
  };

  // AgentEditorView is full-screen — no sidebar
  if (currentView === 'agent-edit') {
    return (
      <>
        {!activeWorkspace && <WorkspaceGate />}
        <AgentEditorView />
      </>
    );
  }

  return (
    <>
      {/* WorkspaceGate — shown as overlay whenever no workspace selected */}
      {!activeWorkspace && <WorkspaceGate />}

      <div className="layout">
        {/* Mobile Overlay */}
        {sidebarOpen && !zenMode && (
          <div
            className="md:hidden fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
            onClick={toggleSidebar}
          />
        )}
        {!zenMode && <Sidebar />}
        <main
          className="main-content"
          style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: 0,
            transition: 'all 0.3s ease',
            marginLeft: zenMode ? 0 : undefined,
            width: zenMode ? '100vw' : undefined,
            height: zenMode ? '100vh' : undefined,
          }}
        >
          {!zenMode && (
            <button
              onClick={toggleSidebar}
              className="md:hidden absolute z-30 flex items-center justify-center"
              style={{
                top: 16, left: 16, width: 40, height: 40,
                background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)', color: 'var(--text-primary)'
              }}
            >
              <Menu size={20} />
            </button>
          )}
          {renderView()}
        </main>
      </div>
    </>
  );
}
