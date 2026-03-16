import React, { useState, useEffect } from 'react';
import { Upload, Link, ListPlus, FileText, X, AlertCircle, RefreshCw, CheckCircle, Globe, Eye, Maximize2, FolderOpen } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { knowledgeApi, scraperApi } from '../../services/api';
import { marked } from 'marked';
import { Toggle } from './Toggle';

const MAX_FILE_SIZE = 1_048_576; // 1 MB
const DEFAULT_ACCEPT_TYPES = '.pdf,.txt,.md,.csv,.docx,image/*';

interface KBProps {
    maxFiles?: number;
    acceptTypes?: string;
    agentId?: string;
    sourceCardId?: string | null;
    allowUpload?: boolean;
}

export const KnowledgeBaseInput: React.FC<KBProps> = ({
    maxFiles = 1,
    acceptTypes = DEFAULT_ACCEPT_TYPES,
    agentId,
    sourceCardId,
    allowUpload = true,
}) => {
    const {
        activeWorkspace,
        activeCampaign,
        files,
        setFiles,
        setKbUploadsInFlight,
        selectedKnowledgeDocumentIds,
        setSelectedKnowledgeDocumentIds,
    } = useAppStore();
    const [existingDocs, setExistingDocs] = useState<any[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [uploadingNames, setUploadingNames] = useState<string[]>([]);
    const [sizeError, setSizeError] = useState<string | null>(null);
    const [showLibrary, setShowLibrary] = useState(false);

    useEffect(() => {
        if (activeWorkspace) {
            setLoadingDocs(true);
            knowledgeApi.list(activeWorkspace.uuid)
                .then(docs => setExistingDocs(Array.isArray(docs) ? docs : []))
                .catch(() => setExistingDocs([]))
                .finally(() => setLoadingDocs(false));
        }
    }, [activeWorkspace?.uuid]);

    useEffect(() => {
        setShowLibrary(false);
    }, [activeWorkspace?.uuid, activeCampaign?.id, agentId, sourceCardId]);

    const totalSelectedCount = selectedKnowledgeDocumentIds.length + files.length + uploadingNames.length;
    const atFileLimit = totalSelectedCount >= maxFiles;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !activeWorkspace) return;

        setSizeError(null);
        const newFiles = Array.from(e.target.files);
        const oversized = newFiles.filter(f => f.size > MAX_FILE_SIZE);
        const valid = newFiles.filter(f => f.size <= MAX_FILE_SIZE);
        if (oversized.length > 0) {
            setSizeError(`${oversized.map(f => f.name).join(', ')} exceed${oversized.length === 1 ? 's' : ''} the 1 MB limit and ${oversized.length === 1 ? 'was' : 'were'} skipped.`);
        }

        const remaining = maxFiles - selectedKnowledgeDocumentIds.length - uploadingNames.length;
        const toUpload = valid.slice(0, Math.max(remaining, 0));
        if (toUpload.length < valid.length) {
            setSizeError(prev => (prev ? `${prev} ` : '') + `Only ${Math.max(remaining, 0)} file${remaining === 1 ? '' : 's'} can be added (limit: ${maxFiles}).`);
        }
        if (toUpload.length === 0) {
            e.target.value = '';
            return;
        }

        const storeBeforeUpload = useAppStore.getState();
        setFiles([...storeBeforeUpload.files, ...toUpload]);
        setUploadingNames(prev => [...prev, ...toUpload.map(file => file.name)]);
        setKbUploadsInFlight(storeBeforeUpload.kbUploadsInFlight + toUpload.length);

        Promise.all(
            toUpload.map(async (file) => {
                const created = await knowledgeApi.upload(activeWorkspace.uuid, file, {
                    campaignId: activeCampaign?.id,
                    agentId,
                    sourceCardId,
                });
                setExistingDocs(prev => [created, ...prev.filter(doc => (doc._id || doc.id) !== (created._id || created.id))]);
                const currentState = useAppStore.getState();
                setSelectedKnowledgeDocumentIds(Array.from(new Set([
                    ...currentState.selectedKnowledgeDocumentIds,
                    created._id || created.id,
                ])));
                return file.name;
            })
        ).catch((err: any) => {
            setSizeError(err.message || 'File upload failed.');
        }).finally(() => {
            const currentState = useAppStore.getState();
            setFiles(currentState.files.filter(existing => !toUpload.some(file => file.name === existing.name && file.size === existing.size)));
            setUploadingNames(prev => prev.filter(name => !toUpload.some(file => file.name === name)));
            setKbUploadsInFlight(Math.max(0, currentState.kbUploadsInFlight - toUpload.length));
            e.target.value = '';
        });
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / 1_048_576).toFixed(1)} MB`;
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const toggleDoc = (docId: string) => {
        if (!selectedKnowledgeDocumentIds.includes(docId) && selectedKnowledgeDocumentIds.length >= maxFiles) {
            setSizeError(`Only ${maxFiles} document${maxFiles === 1 ? '' : 's'} can be selected.`);
            return;
        }
        setSelectedKnowledgeDocumentIds(
            selectedKnowledgeDocumentIds.includes(docId)
                ? selectedKnowledgeDocumentIds.filter(id => id !== docId)
                : [...selectedKnowledgeDocumentIds, docId]
        );
    };

    const restoredDocs = existingDocs.filter(doc =>
        selectedKnowledgeDocumentIds.includes(doc._id || doc.id)
    );
    const unresolvedRestoredCount = Math.max(selectedKnowledgeDocumentIds.length - restoredDocs.length, 0);
    const libraryDocs = existingDocs.filter(doc => {
        const docId = doc._id || doc.id;
        if (selectedKnowledgeDocumentIds.includes(docId)) return false;
        if (!activeCampaign?.id) return true;
        return !doc.campaign_id || doc.campaign_id === activeCampaign.id;
    });

    const renderDocRow = (doc: any) => {
        const docId = doc._id || doc.id;
        const contentLength = doc.content_length || doc.size_bytes;
        const fileType = doc.file_type || doc.content_type || 'file';

        return (
            <label key={docId} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', cursor: 'pointer',
                background: selectedKnowledgeDocumentIds.includes(docId) ? 'rgba(124,92,255,0.08)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                transition: 'background 0.15s',
            }}>
                <Toggle
                    checked={selectedKnowledgeDocumentIds.includes(docId)}
                    onChange={() => toggleDoc(docId)}
                    size="sm"
                />
                <FileText size={13} color="var(--text-muted)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.filename || doc.name}
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>
                        {fileType} - {contentLength ? `${Math.round(contentLength / 1024)}KB` : ''}
                    </p>
                </div>
            </label>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                <Upload size={14} color="#7c5cff" /> Knowledge Base
            </label>

            {selectedKnowledgeDocumentIds.length > 0 && (
                <div style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'rgba(124,92,255,0.08)',
                    border: '1px solid rgba(124,92,255,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Attached To This Draft
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
                        These files stay linked to this agent draft/version when you reopen it.
                    </p>
                    {restoredDocs.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {restoredDocs.map(doc => (
                                <span
                                    key={doc._id || doc.id}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '4px 10px',
                                        borderRadius: 999,
                                        background: 'rgba(124,92,255,0.12)',
                                        border: '1px solid rgba(124,92,255,0.2)',
                                        fontSize: 11,
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    <FileText size={11} color="#7c5cff" />
                                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {doc.filename || doc.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => toggleDoc(doc._id || doc.id)}
                                        className="kb-unselect-btn"
                                        style={{
                                            background: 'none', border: 'none', color: 'var(--text-secondary)',
                                            padding: 2, cursor: 'pointer', display: 'flex', alignItems: 'center',
                                            transition: 'color 0.2s'
                                        }}
                                        title="Unselect"
                                    >
                                        <X size={10} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    {loadingDocs && restoredDocs.length === 0 && (
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                            Loading restored documents...
                        </p>
                    )}
                    {!loadingDocs && unresolvedRestoredCount > 0 && (
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                            {unresolvedRestoredCount} restored document{unresolvedRestoredCount === 1 ? '' : 's'} will appear once the workspace list refreshes.
                        </p>
                    )}
                </div>
            )}

            {loadingDocs ? (
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Loading documents...</p>
            ) : existingDocs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <button
                            type="button"
                            onClick={() => setShowLibrary(prev => !prev)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '8px 14px',
                                borderRadius: 8,
                                background: showLibrary ? 'rgba(124,92,255,0.1)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${showLibrary ? 'var(--primary)' : 'var(--border-default)'}`,
                                color: showLibrary ? 'var(--primary)' : 'var(--text-secondary)',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <FolderOpen size={14} />
                            {showLibrary ? 'Close Library' : 'Browse Workspace Library'}
                        </button>
                        {existingDocs.length > 0 && !showLibrary && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {existingDocs.length} reusable files found
                            </span>
                        )}
                    </div>
                    
                    {showLibrary && (
                        <div style={{
                            animation: 'fadeIn 0.2s ease-out',
                        }}>
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, paddingLeft: 4 }}>
                                Select files from your workspace knowledge base to use as context for this agent.
                            </p>
                            {libraryDocs.length > 0 ? (
                                <div style={{
                                    border: '1px solid var(--border-default)', borderRadius: 12,
                                    overflow: 'hidden', maxHeight: 200, overflowY: 'auto',
                                    background: 'rgba(0,0,0,0.1)'
                                }}>
                                    {libraryDocs.map(renderDocRow)}
                                </div>
                            ) : (
                                <div style={{ 
                                    padding: 20, textAlign: 'center', borderRadius: 12, 
                                    background: 'rgba(0,0,0,0.1)', border: '1px dashed var(--border-default)' 
                                }}>
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                                        No other files available in this workspace yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : null}

            {allowUpload && !atFileLimit && (
                <div style={{
                    padding: 16, border: '1.5px dashed var(--border-default)',
                    borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                    position: 'relative', transition: 'all 0.2s',
                    background: 'rgba(255,255,255,0.02)'
                }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--primary)';
                    el.style.background = 'rgba(124,92,255,0.04)';
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--border-default)';
                    el.style.background = 'rgba(255,255,255,0.02)';
                }}
                >
                    <input
                        type="file"
                        multiple={maxFiles > 1}
                        onChange={handleFileChange}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 1 }}
                        accept={acceptTypes}
                    />
                    <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: 'rgba(124,92,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 8px', border: '1px solid rgba(124,92,255,0.2)'
                    }}>
                        <Upload size={16} color="var(--primary)" />
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        Upload New
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                        Up to 1 MB ({acceptTypes})
                    </p>
                </div>
            )}
            <style>{`
                .kb-unselect-btn:hover { color: #ef4444 !important; }
            `}</style>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                {selectedKnowledgeDocumentIds.length}/{maxFiles} {maxFiles === 1 ? 'document' : 'files'} selected
            </p>

            {uploadingNames.length > 0 && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.18)',
                }}>
                    {uploadingNames.map((name) => (
                        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                            <RefreshCw size={12} className="animate-spin" />
                            Uploading {name}...
                        </div>
                    ))}
                </div>
            )}

            {sizeError && (
                <p style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
                    <AlertCircle size={12} /> {sizeError}
                </p>
            )}

            {files.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {files.map((f, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '6px 10px', background: 'rgba(255,255,255,0.04)',
                            borderRadius: 8, fontSize: 12,
                        }}>
                            <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                {f.name}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: 10, marginRight: 8, flexShrink: 0 }}>
                                {formatSize(f.size)}
                            </span>
                            <button onClick={() => removeFile(i)} style={{
                                background: 'none', border: 'none', color: '#ef4444',
                                cursor: 'pointer', padding: 2, display: 'flex',
                            }}>
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const MAX_SCRAPER_URLS = 2;

export const UrlScraperInput: React.FC = () => {
    const { activeWorkspace, urls, setUrls, setScraperPreviewed, scraperPreviewed } = useAppStore();
    const [input, setInput] = useState('');
    const [scraping, setScraping] = useState(false);
    const [scrapeResults, setScrapeResults] = useState<any[]>([]);
    const [scrapeError, setScrapeError] = useState<string | null>(null);
    const [viewFullMarkdown, setViewFullMarkdown] = useState<{ title: string; content: string } | null>(null);

    const atLimit = urls.length >= MAX_SCRAPER_URLS;
    const hasUnscrapedUrls = urls.length > 0 && !scraperPreviewed;

    const addUrl = () => {
        if (atLimit) return;
        const url = input.trim();
        if (url && !urls.includes(url)) {
            setUrls([...urls, url]);
            setScrapeResults([]); // reset preview when URLs change
            setInput('');
        }
    };

    const handleScrapeNow = async () => {
        if (!activeWorkspace || urls.length === 0) return;
        setScraping(true);
        setScrapeError(null);
        try {
            const results = await scraperApi.scrape(activeWorkspace.uuid, urls);
            setScrapeResults(Array.isArray(results) ? results : []);
            setScraperPreviewed(true);
        } catch (err: any) {
            setScrapeError(err.message || 'Scraping failed');
        } finally {
            setScraping(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                <Globe size={14} color="#7c5cff" /> URLs to Scrape
            </label>

            <div style={{ display: 'flex', gap: 8 }}>
                <input
                    type="url"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
                    placeholder={atLimit ? `Limit reached (${MAX_SCRAPER_URLS} URLs)` : 'https://example.com/blog...'}
                    disabled={atLimit}
                    style={{
                        flex: 1, padding: '9px 12px', borderRadius: 8,
                        border: '1.5px solid var(--border-default)',
                        background: 'var(--bg-primary)', color: 'var(--text-primary)',
                        fontSize: 13, outline: 'none',
                        opacity: atLimit ? 0.5 : 1,
                    }}
                />
                <button
                    type="button"
                    onClick={addUrl}
                    disabled={atLimit}
                    style={{
                        padding: '9px 16px', borderRadius: 8,
                        background: atLimit ? 'var(--border-default)' : 'rgba(124,92,255,0.15)',
                        border: `1px solid ${atLimit ? 'var(--border-default)' : 'rgba(124,92,255,0.3)'}`,
                        color: atLimit ? 'var(--text-muted)' : 'var(--primary)',
                        fontSize: 12, fontWeight: 700,
                        cursor: atLimit ? 'not-allowed' : 'pointer',
                    }}
                >
                    Add
                </button>
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Max {MAX_SCRAPER_URLS} URLs. Only web pages supported. Image, video, and audio URLs cannot be scraped.
            </p>

            {urls.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {urls.map((u, i) => (
                        <span key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '4px 10px', borderRadius: 16, fontSize: 11,
                            background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            <Link size={10} />
                            {u}
                            <button
                                type="button"
                                onClick={() => { setUrls(urls.filter((_, idx) => idx !== i)); setScrapeResults([]); }}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
                            >
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {urls.length > 0 && (
                <button
                    type="button"
                    onClick={handleScrapeNow}
                    disabled={scraping}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 16px', borderRadius: 8,
                        background: scraping ? 'var(--border-default)' : 'rgba(34,197,94,0.12)',
                        border: `1px solid ${scraping ? 'var(--border-default)' : 'rgba(34,197,94,0.3)'}`,
                        color: scraping ? 'var(--text-muted)' : '#22c55e',
                        fontSize: 12, fontWeight: 700, cursor: scraping ? 'not-allowed' : 'pointer',
                    }}
                >
                    {scraping ? (
                        <><RefreshCw size={13} className="animate-spin" /> Scraping...</>
                    ) : (
                        <><Eye size={13} /> Scrape Now - Preview Content</>
                    )}
                </button>
            )}

            {hasUnscrapedUrls && (
                <p style={{ fontSize: 11, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
                    <AlertCircle size={12} /> Please click "Scrape Now" to preview content before generating.
                </p>
            )}

            {scrapeError && (
                <p style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {scrapeError}
                </p>
            )}

            {scrapeResults.length > 0 && (
                <div style={{
                    border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10,
                    overflow: 'hidden',
                }}>
                    {scrapeResults.map((result, i) => (
                        <div key={i} style={{
                            padding: '10px 14px',
                            borderBottom: i < scrapeResults.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            background: result.success ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {result.success ? (
                                        <CheckCircle size={12} color="#22c55e" />
                                    ) : (
                                        <AlertCircle size={12} color="#ef4444" />
                                    )}
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {result.title || result.url}
                                    </span>
                                </div>
                                {result.success && (
                                    <button
                                        type="button"
                                        onClick={() => setViewFullMarkdown({ title: result.title || result.url, content: result.extracted_text })}
                                        style={{
                                            background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.2)',
                                            color: 'var(--primary)', fontSize: 10, fontWeight: 700, padding: '3px 8px',
                                            borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                                        }}
                                    >
                                        <Maximize2 size={10} /> View Full
                                    </button>
                                )}
                            </div>
                            {result.success && (
                                <>
                                    <p style={{
                                        fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0',
                                        lineHeight: 1.5, maxHeight: 60, overflow: 'hidden',
                                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                                    }}>
                                        {result.extracted_text?.slice(0, 300)}
                                    </p>
                                    <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>
                                        {result.word_count} words extracted
                                    </p>
                                </>
                            )}
                            {!result.success && (
                                <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0' }}>
                                    Failed to scrape this URL
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {viewFullMarkdown && (
                <>
                    <div
                        onClick={() => setViewFullMarkdown(null)}
                        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                    />
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 101,
                        width: '90%', maxWidth: 800, maxHeight: '85vh',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                        borderRadius: 16, display: 'flex', flexDirection: 'column',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                    }}>
                        <div style={{
                            padding: '16px 20px', borderBottom: '1px solid var(--border-default)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)'
                        }}>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Globe size={16} color="var(--primary)" /> {viewFullMarkdown.title}
                            </h3>
                            <button onClick={() => setViewFullMarkdown(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={14} />
                            </button>
                        </div>
                        <div
                            style={{
                                padding: '24px 32px', overflowY: 'auto', flex: 1,
                                fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)',
                                fontFamily: 'var(--font-mono), monospace'
                            }}
                            dangerouslySetInnerHTML={{ __html: marked.parse(viewFullMarkdown.content, { breaks: true }) as string }}
                        />
                    </div>
                    <style>{`
                        .deckcard-md h1, .deckcard-md h2, .deckcard-md h3 { margin-top: 20px; color: #fff; }
                        .deckcard-md a { color: #7c5cff; text-decoration: none; }
                        .deckcard-md pre { background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
                        .deckcard-md code { font-family: 'JetBrains Mono', monospace; font-size: 11px; }
                    `}</style>
                </>
            )}
        </div>
    );
};

export const OutputSelector: React.FC = () => {
    const { cards, selectedOutputs, setSelectedOutputs } = useAppStore();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                <ListPlus size={14} color="#7c5cff" /> Select Outputs from Other Agents
            </label>
            {cards.length > 0 ? (
                <div style={{
                    border: '1px solid var(--border-default)', borderRadius: 10,
                    overflow: 'hidden', maxHeight: 200, overflowY: 'auto',
                }}>
                    {cards.map(card => (
                        <label key={card.id} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 12px', cursor: 'pointer',
                            background: selectedOutputs.includes(card.id) ? 'rgba(124,92,255,0.08)' : 'transparent',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}>
                            <Toggle
                                checked={selectedOutputs.includes(card.id)}
                                onChange={(checked) => {
                                    if (checked) setSelectedOutputs([...selectedOutputs, card.id]);
                                    else setSelectedOutputs(selectedOutputs.filter(id => id !== card.id));
                                }}
                                size="sm"
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 12, color: 'var(--text-primary)', margin: 0 }}>{card.title}</p>
                                <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>{card.agent_used?.replace(/_/g, ' ')}</p>
                            </div>
                        </label>
                    ))}
                </div>
            ) : (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: 8 }}>
                    No previous outputs in this workspace.
                </p>
            )}
        </div>
    );
};
