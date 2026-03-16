/**
 * PromptLibraryView — Full-page Prompt Library for managing AI agent prompts.
 * Dark-themed, inline styles only, glassmorphism design language.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  FileText, Search, Plus, Edit3, Trash2, Copy, Save, X,
  ChevronRight, Sparkles, Code, Eye, EyeOff, Thermometer, BookOpen, Wand2,
} from 'lucide-react';
import { AppLogo } from './Icons';
import { useAppStore } from '../store/appStore';
import { promptApi } from '../services/api';
import PanelHeader from './PanelHeader';
import ConfirmDialog from './ConfirmDialog';

/* ─── Types ─────────────────────────────────────────────────── */

interface AgentDef {
  id: string;
  label: string;
}

interface CategoryDef {
  id: string;
  label: string;
  color: string;
  agents: AgentDef[];
}

interface EditFormState {
  name: string;
  description: string;
  system_prompt: string;
  prompt_template: string;
  temperature: number;
  agent_id: string;
}

/* ─── Constants ──────────────────────────────────────────────── */

const AGENT_CATEGORIES: CategoryDef[] = [
  {
    id: 'brand',
    label: 'Brand',
    color: '#7c5cff',
    agents: [
      { id: 'brand_identity', label: 'Brand Identity' },
      { id: 'brand_naming', label: 'Brand Naming' },
      { id: 'tagline_slogan', label: 'Tagline & Slogan' },
      { id: 'target_audience', label: 'Target Audience' },
      { id: 'brand_voice', label: 'Brand Voice' },
      { id: 'brand_guardian', label: 'Brand Guardian' },
    ],
  },
  {
    id: 'strategy',
    label: 'Creative Strategy',
    color: '#f59e0b',
    agents: [
      { id: 'creative_direction', label: 'Creative Direction' },
      { id: 'campaign_concept', label: 'Campaign Concept' },
      { id: 'content_calendar', label: 'Content Calendar' },
    ],
  },
  {
    id: 'visual',
    label: 'Visual Design',
    color: '#3b82f6',
    agents: [
      { id: 'logo_designer', label: 'Logo Designer' },
      { id: 'hero_image', label: 'Hero Image' },
      { id: 'product_photoshoot', label: 'Product Photoshoot' },
      { id: 'ad_creative', label: 'Ad Creative' },
      { id: 'image_editor', label: 'Image Editor' },
      { id: 'mockup_generator', label: 'Mockup Generator' },
      { id: 'infographic', label: 'Infographic' },
    ],
  },
  {
    id: 'social',
    label: 'Social Media',
    color: '#ec4899',
    agents: [
      { id: 'instagram_post', label: 'Instagram Post' },
      { id: 'instagram_story', label: 'Instagram Story' },
      { id: 'instagram_reel', label: 'Instagram Reel' },
      { id: 'instagram_carousel', label: 'Instagram Carousel' },
      { id: 'instagram_bio', label: 'Instagram Bio' },
      { id: 'facebook_post', label: 'Facebook Post' },
      { id: 'facebook_ad_copy', label: 'Facebook Ad Copy' },
      { id: 'linkedin_post', label: 'LinkedIn Post' },
      { id: 'linkedin_article', label: 'LinkedIn Article' },
      { id: 'linkedin_ad', label: 'LinkedIn Ad' },
      { id: 'twitter_tweet', label: 'Twitter Tweet' },
      { id: 'twitter_thread', label: 'Twitter Thread' },
      { id: 'twitter_ad', label: 'Twitter Ad' },
      { id: 'pinterest_pin', label: 'Pinterest Pin' },
      { id: 'pinterest_ad', label: 'Pinterest Ad' },
      { id: 'tiktok_script', label: 'TikTok Script' },
      { id: 'tiktok_trend', label: 'TikTok Trend' },
      { id: 'tiktok_ad', label: 'TikTok Ad' },
    ],
  },
  {
    id: 'video',
    label: 'Video & Motion',
    color: '#ef4444',
    agents: [
      { id: 'video_ad_script', label: 'Video Ad Script' },
      { id: 'youtube_script', label: 'YouTube Script' },
      { id: 'ai_video_gen', label: 'AI Video Gen' },
      { id: 'video_summarizer', label: 'Video Summarizer' },
      { id: 'caption_generator', label: 'Caption Generator' },
      { id: 'thumbnail_idea', label: 'Thumbnail Idea' },
      { id: 'video_trend_analyzer', label: 'Video Trend Analyzer' },
    ],
  },
  {
    id: 'content',
    label: 'Content & Copy',
    color: '#22c55e',
    agents: [
      { id: 'blog_post', label: 'Blog Post' },
      { id: 'email_campaign', label: 'Email Campaign' },
      { id: 'content_strategy', label: 'Content Strategy' },
      { id: 'newsletter', label: 'Newsletter' },
      { id: 'landing_page', label: 'Landing Page' },
      { id: 'case_study', label: 'Case Study' },
      { id: 'press_release', label: 'Press Release' },
      { id: 'whitepaper', label: 'Whitepaper' },
      { id: 'product_description', label: 'Product Description' },
      { id: 'faq_generator', label: 'FAQ Generator' },
      { id: 'sms_marketing', label: 'SMS Marketing' },
      { id: 'content_audit', label: 'Content Audit' },
    ],
  },
  {
    id: 'ads',
    label: 'Advertising Copy',
    color: '#8b5cf6',
    agents: [
      { id: 'meta_ads', label: 'Meta Ads' },
      { id: 'google_search_ads', label: 'Google Search Ads' },
      { id: 'google_display_ads', label: 'Google Display Ads' },
      { id: 'linkedin_lead_gen', label: 'LinkedIn Lead Gen' },
      { id: 'pinterest_ads', label: 'Pinterest Ads' },
      { id: 'tiktok_ads', label: 'TikTok Ads' },
      { id: 'youtube_ads', label: 'YouTube Ads' },
      { id: 'amazon_ppc', label: 'Amazon PPC' },
    ],
  },
  {
    id: 'seo',
    label: 'SEO & AEO',
    color: '#06b6d4',
    agents: [
      { id: 'keyword_researcher', label: 'Keyword Researcher' },
      { id: 'on_page_seo', label: 'On-Page SEO' },
      { id: 'technical_seo', label: 'Technical SEO' },
      { id: 'aeo_optimizer', label: 'AEO Optimizer' },
    ],
  },
  {
    id: 'audio',
    label: 'Audio & Podcast',
    color: '#f43f5e',
    agents: [
      { id: 'podcast_script', label: 'Podcast Script' },
      { id: 'podcast_description', label: 'Podcast Description' },
    ],
  },
  {
    id: 'growth',
    label: 'Growth & Strategy',
    color: '#10b981',
    agents: [
      { id: 'pricing_strategy', label: 'Pricing Strategy' },
      { id: 'launch_strategy', label: 'Launch Strategy' },
      { id: 'cold_email', label: 'Cold Email' },
      { id: 'email_sequence', label: 'Email Sequence' },
      { id: 'page_cro', label: 'Page CRO' },
      { id: 'ab_test_setup', label: 'A/B Test Setup' },
      { id: 'marketing_psychology', label: 'Marketing Psychology' },
      { id: 'competitor_alternatives', label: 'Competitor Alternatives' },
      { id: 'seo_audit', label: 'SEO Audit' },
      { id: 'schema_markup', label: 'Schema Markup' },
      { id: 'referral_program', label: 'Referral Program' },
    ],
  },
  {
    id: 'utility',
    label: 'Utilities',
    color: '#64748b',
    agents: [
      { id: 'custom_workflow', label: 'Content Adaptor' },
    ],
  },
];

const KNOWN_VARIABLE_DESCRIPTIONS: Record<string, string> = {
  business_name: 'The name of the business',
  business_description: 'Detailed description of the business',
  industry: 'Business industry/sector',
  target_audience: 'Who the brand serves',
  values: 'Core brand values',
  style_preferences: 'Visual style preferences',
  color_preferences: 'Preferred colors (hex codes or names)',
  target_language: 'Output language for content',
  context: 'Additional context from KB, scraped URLs, etc.',
};

const EMPTY_FORM: EditFormState = {
  name: '',
  description: '',
  system_prompt: '',
  prompt_template: '',
  temperature: 0.7,
  agent_id: '',
};

/* ─── Helpers ────────────────────────────────────────────────── */

const extractVariables = (template: string): string[] => {
  const matches = template.match(/(?<!\{)\{([a-zA-Z_][a-zA-Z0-9_]*)\}(?!\})/g) || [];
  const stripped = matches.map(m => m.slice(1, -1));
  const seen = new Set<string>();
  return stripped.filter(v => {
    if (seen.has(v)) return false;
    seen.add(v);
    return true;
  });
};

const humanizeAgentId = (id: string): string => {
  const all = AGENT_CATEGORIES.flatMap(c => c.agents);
  const found = all.find(a => a.id === id);
  if (found) return found.label;
  return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

/* ─── Component ──────────────────────────────────────────────── */

export default function PromptLibraryView() {
  const activeWorkspace = useAppStore(s => s.activeWorkspace);

  /* state */
  const [selectedCategory, setSelectedCategory] = useState<string>('brand');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({ ...EMPTY_FORM });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    brand: true, strategy: false, visual: false, social: false, video: false, content: false, ads: false, seo: false, audio: false, growth: false, utility: false
  });
  const [showSystemPrompt, setShowSystemPrompt] = useState(true);
  const [isRewriting, setIsRewriting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /* derived */
  const wsUuid = activeWorkspace?.uuid || '';

  /* ─── Data Loading ──────────────────────────────────────── */

  const loadPrompts = useCallback(async () => {
    if (!wsUuid) return;
    setLoading(true);
    try {
      const data = await promptApi.list(wsUuid, selectedAgentId || undefined);
      setPrompts(data);
    } catch (err) {
      console.error('Failed to load prompts:', err);
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }, [wsUuid, selectedAgentId]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  /* ─── Filtering ─────────────────────────────────────────── */

  const filteredPrompts = prompts.filter(p => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (p.name || '').toLowerCase().includes(q);
      const descMatch = (p.description || '').toLowerCase().includes(q);
      const agentMatch = (p.agent_id || '').toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !agentMatch) return false;
    }
    return true;
  });

  /* count prompts per agent for badge */
  const promptCountByAgent = (agentId: string): number =>
    prompts.filter(p => p.agent_id === agentId).length;

  /* ─── Actions ───────────────────────────────────────────── */

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgentId(prev => (prev === agentId ? null : agentId));
    setSelectedPrompt(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleOpenPrompt = (prompt: any) => {
    setSelectedPrompt(prompt);
    setIsEditing(false);
    setIsCreating(false);
    setEditForm({
      name: prompt.name || '',
      description: prompt.description || '',
      system_prompt: prompt.system_prompt || '',
      prompt_template: prompt.prompt_template || '',
      temperature: prompt.temperature ?? 0.7,
      agent_id: prompt.agent_id || '',
    });
  };

  const handleStartCreate = () => {
    setSelectedPrompt(null);
    setIsCreating(true);
    setIsEditing(true);
    setEditForm({
      ...EMPTY_FORM,
      agent_id: selectedAgentId || '',
    });
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleDuplicate = () => {
    if (!selectedPrompt) return;
    setIsCreating(true);
    setIsEditing(true);
    setEditForm({
      name: `${selectedPrompt.name || ''} (Copy)`,
      description: selectedPrompt.description || '',
      system_prompt: selectedPrompt.system_prompt || '',
      prompt_template: selectedPrompt.prompt_template || '',
      temperature: selectedPrompt.temperature ?? 0.7,
      agent_id: selectedPrompt.agent_id || '',
    });
    setSelectedPrompt(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    if (selectedPrompt) {
      setEditForm({
        name: selectedPrompt.name || '',
        description: selectedPrompt.description || '',
        system_prompt: selectedPrompt.system_prompt || '',
        prompt_template: selectedPrompt.prompt_template || '',
        temperature: selectedPrompt.temperature ?? 0.7,
        agent_id: selectedPrompt.agent_id || '',
      });
    }
  };

  const handleBackToList = () => {
    setSelectedPrompt(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!wsUuid) return;
    try {
      if (isCreating) {
        // Derive category from agent_id
        const cat = AGENT_CATEGORIES.find(c => c.agents.some(a => a.id === editForm.agent_id));
        const created = await promptApi.create(wsUuid, {
          name: editForm.name,
          description: editForm.description,
          system_prompt: editForm.system_prompt,
          prompt_template: editForm.prompt_template,
          temperature: editForm.temperature,
          agent_id: editForm.agent_id,
          category: cat?.id || 'brand',
        });
        setSelectedPrompt(created);
        setIsCreating(false);
        setIsEditing(false);
      } else if (selectedPrompt) {
        const updated = await promptApi.update(wsUuid, selectedPrompt.prompt_id, {
          name: editForm.name,
          description: editForm.description,
          system_prompt: editForm.system_prompt,
          prompt_template: editForm.prompt_template,
          temperature: editForm.temperature,
          agent_id: editForm.agent_id,
        });
        setSelectedPrompt(updated);
        setIsEditing(false);
      }
      await loadPrompts();
    } catch (err) {
      console.error('Failed to save prompt:', err);
      alert('Failed to save prompt. Please try again.');
    }
  };

  const handleDelete = async () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!wsUuid || !selectedPrompt) return;
    setIsDeleting(true);
    try {
      await promptApi.delete(wsUuid, selectedPrompt.prompt_id);
      setSelectedPrompt(null);
      setIsEditing(false);
      setShowDeleteDialog(false);
      await loadPrompts();
    } catch (err) {
      console.error('Failed to delete prompt:', err);
      alert('Failed to delete prompt. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const updateForm = (field: keyof EditFormState, value: string | number) =>
    setEditForm(prev => ({ ...prev, [field]: value }));

  const handleRewriteWithAI = async () => {
    if (!wsUuid || !editForm.prompt_template.trim()) return;
    setIsRewriting(true);
    try {
      const res = await promptApi.rewrite(wsUuid, editForm.prompt_template, editForm.agent_id || undefined);
      if (res.rewritten_prompt) {
        updateForm('prompt_template', res.rewritten_prompt);
      }
    } catch (err) {
      console.error('Rewrite failed:', err);
    } finally {
      setIsRewriting(false);
    }
  };

  /* ─── Subcomponents ─────────────────────────────────────── */

  const isViewingOrEditing = selectedPrompt !== null || isCreating;
  const isSystemDefault = selectedPrompt?.is_default === true;
  const templateVars = extractVariables(editForm.prompt_template || '');
  const systemVars = extractVariables(editForm.system_prompt || '');
  const allVars = [...new Set([...templateVars, ...systemVars])];

  // Calculate allowed variables based on the default prompt for the selected agent
  const defaultPrompt = isViewingOrEditing && editForm.agent_id
    ? prompts.find(p => p.agent_id === editForm.agent_id && p.is_default)
    : null;
  const defaultTemplateVars = extractVariables(defaultPrompt?.prompt_template || '');
  const defaultSystemVars = extractVariables(defaultPrompt?.system_prompt || '');
  const allowedVars = [...new Set([...defaultTemplateVars, ...defaultSystemVars])].sort();

  let missingVars: string[] = [];
  let extraVars: string[] = [];
  if (allowedVars.length > 0 && (isEditing || isCreating)) {
    missingVars = allowedVars.filter(v => !allVars.includes(v));
    extraVars = allVars.filter(v => !allowedVars.includes(v));
  }
  const hasVarErrors = (isEditing || isCreating) && (missingVars.length > 0 || extraVars.length > 0);
  const canSave = editForm.name.trim() && editForm.agent_id.trim() && !hasVarErrors;

  /* ─── Render ────────────────────────────────────────────── */

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg-primary)', color: 'var(--text-primary)',
      overflowY: 'auto'
    }} className="custom-scrollbar">

      {/* ── Header Area ─────────────────────────────────────── */}
      <div className="mobile-padding" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-secondary)' }}>
        <PanelHeader
          title="Prompt Library"
          Icon={Sparkles}
          subtitle={(
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BookOpen size={13} color="var(--accent-1)" /> library of templates</span>
              <span style={{ opacity: 0.3 }} className="hide-on-mobile">•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Code size={13} color="var(--accent-2)" /> ai-powered customization</span>
            </>
          )}
        />
      </div>

      {/* ── Main content ───────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 24 }} className="mobile-stack mobile-padding">

        {/* ── Left Panel ─────────────────────────────────────── */}
        <div style={{
          width: '100%', maxWidth: 320, border: '1px solid var(--border-default)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: 'var(--bg-secondary)', borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)', flexShrink: 0
        }} className="hide-on-mobile">
          {/* Search */}
          <div style={{ padding: '24px 20px 16px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--bg-primary)', border: '1px solid var(--border-default)',
              borderRadius: 12, padding: '10px 14px',
            }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: 13, flex: 1,
                  fontFamily: 'inherit',
                }}
              />
              {searchQuery && (
                <X
                  size={14}
                  color="var(--text-muted)"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSearchQuery('')}
                />
              )}
            </div>
          </div>

          {/* Agent Categories */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 24px' }} className="custom-scrollbar">
            {AGENT_CATEGORIES.map(cat => (
              <div key={cat.id} style={{ marginBottom: 8 }}>
                {/* Category Header */}
                <div
                  onClick={() => toggleCategory(cat.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <ChevronRight
                    size={14}
                    color="var(--text-muted)"
                    style={{
                      transition: 'transform 0.2s',
                      transform: expandedCategories[cat.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                  />
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: cat.color, flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
                    textTransform: 'uppercase', letterSpacing: '0.8px',
                  }}>
                    {cat.label}
                  </span>
                  <span style={{
                    fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto',
                    fontWeight: 600
                  }}>
                    {cat.agents.length}
                  </span>
                </div>

                {/* Agent list */}
                {expandedCategories[cat.id] && (
                  <div style={{ marginLeft: 16, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {cat.agents.map(agent => {
                      const isActive = selectedAgentId === agent.id;
                      const count = promptCountByAgent(agent.id);
                      return (
                        <div
                          key={agent.id}
                          onClick={() => handleSelectAgent(agent.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                            background: isActive ? 'rgba(124,92,255,0.1)' : 'transparent',
                            border: `1px solid ${isActive ? 'rgba(124,92,255,0.2)' : 'transparent'}`,
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => {
                            if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                          }}
                          onMouseLeave={e => {
                            if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                          }}
                        >
                          <FileText size={14} color={isActive ? '#7c5cff' : 'var(--text-muted)'} />
                          <span style={{
                            flex: 1, fontSize: 13,
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: isActive ? 600 : 500,
                          }}>
                            {agent.label}
                          </span>
                          {count > 0 && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: '#7c5cff',
                              background: 'rgba(124,92,255,0.1)',
                              padding: '2px 8px', borderRadius: 20, minWidth: 20,
                              textAlign: 'center',
                            }}>
                              {count}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel ────────────────────────────────────── */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {!isViewingOrEditing ? renderPromptList() : renderPromptEditor()}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Prompt"
        message={`Are you sure you want to delete "${selectedPrompt?.name}"? This action cannot be undone and will permanently remove this template from your library.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );

  /* ─── Prompt List ─────────────────────────────────────────── */

  function renderPromptList() {
    return (
      <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              {selectedAgentId ? humanizeAgentId(selectedAgentId) : 'All Library Prompts'}
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
              {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''} available
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </p>
          </div>
          <button
            onClick={handleStartCreate}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--accent-1)', color: '#fff', border: 'none',
              padding: '12px 24px', borderRadius: 14, fontSize: 14,
              fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(124, 92, 255, 0.2)'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(124, 92, 255, 0.3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(124, 92, 255, 0.2)'; }}
          >
            <Plus size={16} strokeWidth={3} />
            Create Prompt
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 80, color: 'var(--text-muted)', fontSize: 14,
          }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border-default)', borderTopColor: 'var(--accent-1)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredPrompts.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: 100, gap: 20,
            background: 'var(--bg-secondary)', borderRadius: 24, border: '1px dashed var(--border-default)'
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'rgba(124,92,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen size={32} color="var(--accent-1)" opacity={0.5} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>
                No prompts found
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
                {selectedAgentId
                  ? `No custom prompts for ${humanizeAgentId(selectedAgentId)}.`
                  : 'Your prompt library is empty. Start by creating a new template.'}
              </p>
            </div>
          </div>
        )}

        {/* Prompt cards grid */}
        {!loading && filteredPrompts.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
          }}>
            {filteredPrompts.map(prompt => {
              const vars = extractVariables(prompt.prompt_template || '');
              const isDefault = prompt.is_default === true;
              return (
                <div
                  key={prompt.prompt_id || prompt.id || prompt._id}
                  onClick={() => handleOpenPrompt(prompt)}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 18, padding: 24, cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column'
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-1)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)';
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'rgba(124,92,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Sparkles size={18} color="var(--accent-1)" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {prompt.name || 'Untitled Prompt'}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                          {humanizeAgentId(prompt.agent_id || '')}
                        </p>
                      </div>
                    </div>
                    {isDefault && (
                      <span style={{
                        fontSize: 9, fontWeight: 800, color: 'var(--accent-1)',
                        background: 'rgba(124,92,255,0.1)',
                        padding: '4px 10px', borderRadius: 8, letterSpacing: '0.8px',
                        border: '1px solid rgba(124,92,255,0.2)',
                        flexShrink: 0,
                      }}>
                        SYSTEM
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {prompt.description && (
                    <p style={{
                      margin: '0 0 20px', fontSize: 13, color: 'var(--text-secondary)',
                      lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                      flex: 1
                    }}>
                      {prompt.description}
                    </p>
                  )}

                  {/* Meta row */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    borderTop: '1px solid var(--border-default)', paddingTop: 16,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Thermometer size={12} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                        {(prompt.temperature ?? 0.7).toFixed(2)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Code size={12} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                        {vars.length} variable{vars.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ─── Prompt Editor ───────────────────────────────────────── */

  function renderPromptEditor() {
    const readOnly = isSystemDefault && !isEditing;
    const showEditControls = !isSystemDefault && !isEditing && !isCreating;

    return (
      <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24,
        }}>
          <button
            onClick={handleBackToList}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
              color: 'var(--text-primary)', padding: '10px 18px', borderRadius: 12,
              fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: '0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)'; }}
          >
            <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
            Back to Library
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            {/* System default: show duplicate button */}
            {isSystemDefault && !isEditing && !isCreating && (
              <button
                onClick={handleDuplicate}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--accent-1)', color: '#fff', border: 'none',
                  padding: '10px 20px', borderRadius: 12, fontSize: 13,
                  fontWeight: 700, cursor: 'pointer', transition: '0.2s',
                }}
              >
                <Copy size={14} />
                Customize Template
              </button>
            )}

            {/* Custom prompt viewing: show edit & delete */}
            {showEditControls && (
              <>
                <button
                  onClick={handleStartEdit}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(124,92,255,0.1)', color: 'var(--accent-1)',
                    border: '1px solid rgba(124,92,255,0.2)',
                    padding: '10px 20px', borderRadius: 12, fontSize: 13,
                    fontWeight: 700, cursor: 'pointer', transition: '0.2s',
                  }}
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.2)',
                    padding: '10px 20px', borderRadius: 12, fontSize: 13,
                    fontWeight: 700, cursor: 'pointer', transition: '0.2s',
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </>
            )}

            {/* Editing: save/cancel */}
            {(isEditing || isCreating) && (
              <>
                <button
                  onClick={handleCancel}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)', padding: '10px 20px', borderRadius: 12,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: '0.2s',
                  }}
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: (!canSave) ? 'var(--border-default)' : 'var(--accent-1)',
                    color: '#fff', border: 'none',
                    padding: '10px 20px', borderRadius: 12, fontSize: 13,
                    fontWeight: 700, cursor: canSave ? 'pointer' : 'not-allowed', transition: '0.2s',
                    opacity: (!canSave) ? 0.5 : 1,
                  }}
                >
                  <Save size={14} />
                  {isCreating ? 'Create Prompt' : 'Update Prompt'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* System default banner */}
        {isSystemDefault && !isEditing && !isCreating && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(124,92,255,0.06)',
            border: '1px solid rgba(124,92,255,0.15)',
            borderRadius: 14, padding: '14px 20px', marginBottom: 24,
          }}>
            <Eye size={16} color="var(--accent-1)" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              This is a system default prompt and is read-only. Use <strong>Customize Template</strong> to create your own version.
            </span>
          </div>
        )}

        {/* Variable constraints banner */}
        {hasVarErrors && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 14, padding: '14px 20px', marginBottom: 24,
          }}>
            <Code size={16} color="#ef4444" style={{ marginTop: 2 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700 }}>
                Variable Constraints Not Met
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Custom prompts must use exactly the same variables as the original default prompt. You cannot add new variables or remove required ones.
                {missingVars.length > 0 && <span><br /><strong>Missing variables:</strong> {missingVars.map(v => `{${v}}`).join(', ')}</span>}
                {extraVars.length > 0 && <span><br /><strong>Unsupported variables:</strong> {extraVars.map(v => `{${v}}`).join(', ')}</span>}
              </span>
            </div>
          </div>
        )}

        {/* Editor form */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
          borderRadius: 20, padding: 32,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Prompt Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => updateForm('name', e.target.value)}
                  readOnly={readOnly}
                  placeholder="e.g., Brand Identity Deep Dive"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: readOnly ? 'rgba(255,255,255,0.02)' : 'var(--bg-primary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 12, padding: '12px 16px',
                    color: 'var(--text-primary)', fontSize: 14,
                    fontFamily: 'inherit', outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = 'var(--accent-1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={e => updateForm('description', e.target.value)}
                  readOnly={readOnly}
                  placeholder="Brief description of what this prompt does..."
                  rows={2}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: readOnly ? 'rgba(255,255,255,0.02)' : 'var(--bg-primary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 12, padding: '12px 16px',
                    color: 'var(--text-primary)', fontSize: 14,
                    fontFamily: 'inherit', outline: 'none',
                    resize: 'vertical', lineHeight: 1.6,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = 'var(--accent-1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                />
              </div>

              {/* System Prompt */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    System Persona
                  </label>
                  <button
                    onClick={() => setShowSystemPrompt(prev => !prev)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-1)', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}
                  >
                    {showSystemPrompt ? 'Hide Persona' : 'Show Persona'}
                  </button>
                </div>
                {showSystemPrompt && (
                  <textarea
                    value={editForm.system_prompt}
                    onChange={e => updateForm('system_prompt', e.target.value)}
                    readOnly={readOnly}
                    placeholder="Define the AI personality and constraints..."
                    rows={5}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: readOnly ? 'rgba(255,255,255,0.02)' : 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 12, padding: '16px',
                      color: 'var(--text-primary)', fontSize: 13,
                      fontFamily: '"Fira Code", monospace',
                      outline: 'none', resize: 'vertical', lineHeight: 1.6,
                    }}
                    onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = 'var(--accent-1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                  />
                )}
              </div>

              {/* Prompt Template */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Code size={14} color="var(--accent-1)" />
                  Prompt Template
                </label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    value={editForm.prompt_template}
                    onChange={e => updateForm('prompt_template', e.target.value)}
                    readOnly={readOnly}
                    placeholder={'Analyze the brand for {business_name}...\n\nUse {category} and focus on {target_audience}.'}
                    rows={12}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: readOnly ? 'rgba(255,255,255,0.02)' : 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 12, padding: '16px',
                      color: 'var(--text-primary)', fontSize: 13,
                      fontFamily: '"Fira Code", monospace',
                      outline: 'none', resize: 'vertical', lineHeight: 1.6,
                    }}
                    onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = 'var(--accent-1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                  />
                  {/* Rewrite AI Button */}
                  {!readOnly && (
                    <button
                      onClick={handleRewriteWithAI}
                      disabled={isRewriting || !editForm.prompt_template.trim()}
                      style={{
                        position: 'absolute', bottom: 16, right: 16,
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 14px',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                        borderRadius: 10, color: 'var(--accent-1)', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    >
                      {isRewriting ? <Sparkles size={12} className="animate-spin" /> : <Wand2 size={12} />}
                      {isRewriting ? 'Refining...' : 'AI Refine'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Agent Selection */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Assigned Agent
                </label>
                <select
                  value={editForm.agent_id}
                  onChange={e => updateForm('agent_id', e.target.value)}
                  disabled={readOnly}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: readOnly ? 'rgba(255,255,255,0.02)' : 'var(--bg-primary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 12, padding: '12px 16px',
                    color: 'var(--text-primary)', fontSize: 14,
                    fontFamily: 'inherit', outline: 'none', cursor: 'pointer'
                  }}
                >
                  <option value="">Select agent...</option>
                  {AGENT_CATEGORIES.map(cat => (
                    <optgroup key={cat.id} label={cat.label}>
                      {cat.agents.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Temperature */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <span>Temperature</span>
                  <span style={{ color: 'var(--accent-1)', background: 'rgba(124,92,255,0.1)', padding: '2px 8px', borderRadius: 6 }}>
                    {editForm.temperature.toFixed(2)}
                  </span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={editForm.temperature}
                  onChange={e => updateForm('temperature', parseFloat(e.target.value))}
                  disabled={readOnly}
                  style={{ width: '100%', accentColor: 'var(--accent-1)', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>PRECISE</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>CREATIVE</span>
                </div>
              </div>

              {/* Variables Information */}
              {(isEditing || isCreating ? allowedVars : allVars).length > 0 && (
                <div style={{ background: 'rgba(124,92,255,0.03)', border: '1px solid rgba(124,92,255,0.1)', borderRadius: 16, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Sparkles size={14} color="var(--accent-1)" />
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {isEditing || isCreating ? 'Allowed Variables' : 'Dynamic Variables'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(isEditing || isCreating ? allowedVars : allVars).map(v => (
                      <span
                        key={v}
                        draggable={isEditing || isCreating}
                        onDragStart={e => e.dataTransfer.setData('text/plain', `{${v}}`)}
                        style={{
                          fontSize: 11, fontWeight: 700, color: 'var(--accent-1)',
                          background: 'rgba(124,92,255,0.1)', padding: '4px 10px',
                          borderRadius: 20, fontFamily: '"Fira Code", monospace',
                          cursor: (isEditing || isCreating) ? 'grab' : 'default',
                        }}
                      >
                        {'{'}{v}{'}'}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.5 }}>
                    {isEditing || isCreating
                      ? 'Drag and drop these variables into the prompt template. You must use all of these exactly as written.'
                      : 'These placeholders will be automatically populated with user data or workspace context during generation.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
