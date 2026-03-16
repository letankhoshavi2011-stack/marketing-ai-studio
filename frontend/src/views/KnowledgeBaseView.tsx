import React, { useState, useEffect } from 'react';
import { 
    Database, Upload, Search, FileText, Trash2, Download, 
    MoreVertical, Filter, RefreshCw, X, File, AlertCircle, Info,
    CheckCircle, ExternalLink, HardDrive, FileSpreadsheet, FileVideo, FileCode, FileAudio, Eye
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '../store/appStore';
import { knowledgeApi } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import PanelHeader from '../components/PanelHeader';

interface KBDocument {
    id: string;
    _id?: string;
    filename: string;
    name?: string;
    file_type: string;
    content_type?: string;
    content_length: number;
    size_bytes?: number;
    created_at: string;
    gcs_url?: string;
    extracted_text?: string;
}

function DocumentViewer({ doc, onClose }: { doc: KBDocument, onClose: () => void }) {
    const ext = '.' + (doc.filename || '').split('.').pop()?.toLowerCase();
    const isImage = doc.content_type?.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.heic', '.heif'].includes(ext);
    const isPdf = doc.content_type?.includes('pdf') || ext === '.pdf';
    const isVideo = doc.content_type?.startsWith('video/') || ['.mp4', '.flv', '.mov', '.mpeg', '.mpg', '.webm', '.wmv', '.3gp'].includes(ext);
    const isAudio = doc.content_type?.startsWith('audio/') || ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg', '.pcm', '.webm'].includes(ext);
    const isMarkdown = doc.content_type?.includes('markdown') || ext === '.md';
    const isCsv = ext === '.csv' || doc.content_type?.includes('csv');
    const isSheetLike = ['.xls', '.xlsx', '.ods'].includes(ext) || (doc.content_type || '').includes('sheet');
    const isWordLike = ['.doc', '.docx', '.odt'].includes(ext) || (doc.content_type || '').includes('word');

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            padding: 40
        }} onClick={onClose}>
            <div style={{
                position: 'relative', width: '100%', maxWidth: 1000, height: '90vh',
                background: '#0d0d16', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(0,0,0,0.6)'
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                            width: 36, height: 36, borderRadius: 10, background: 'rgba(124,92,255,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <FileText size={18} color="var(--primary)" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'white' }}>{doc.filename}</h3>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>{doc.content_type} • {((doc.size_bytes || doc.content_length || 0) / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white',
                        padding: 8, borderRadius: 10, cursor: 'pointer'
                    }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 32, display: 'flex', justifyContent: 'center', background: '#08080c' }}>
                    {isImage && doc.gcs_url && (
                        <img src={doc.gcs_url} alt={doc.filename} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 12 }} />
                    )}
                    {isPdf && doc.gcs_url && (
                        <iframe src={`${doc.gcs_url}#toolbar=0`} title={doc.filename} style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }} />
                    )}
                    {isVideo && doc.gcs_url && (
                        <video 
                            src={doc.gcs_url}
                            controls
                            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, background: 'black' }}
                        />
                    )}
                    {isAudio && doc.gcs_url && (
                        <audio 
                            src={doc.gcs_url}
                            controls
                            style={{ width: '100%' }}
                        />
                    )}
                    {isMarkdown && doc.extracted_text && (
                        <div style={{ width: '100%', maxWidth: 900, color: 'white' }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.extracted_text}</ReactMarkdown>
                        </div>
                    )}
                    {(isCsv || isSheetLike) && doc.extracted_text && (
                        <div style={{ width: '100%', maxWidth: 900, overflowX: 'auto' }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%', color: 'white', fontSize: 13 }}>
                                <tbody>
                                    {doc.extracted_text.split('\n').slice(0, 100).map((row, i) => (
                                        <tr key={i}>
                                            {row.split(',').slice(0, 20).map((cell, j) => (
                                                <td key={j} style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '6px 8px', whiteSpace: 'nowrap' }}>
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 8 }}>Showing first 100 rows / 20 columns.</p>
                        </div>
                    )}
                    {!isImage && !isPdf && !isVideo && !isAudio && !isMarkdown && !isCsv && !isSheetLike && (
                        <div style={{ width: '100%', maxWidth: 800 }}>
                            <pre style={{ 
                                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                color: 'rgba(255,255,255,0.85)', fontFamily: 'inherit',
                                fontSize: 14, lineHeight: 1.6, padding: 24,
                                background: 'rgba(255,255,255,0.03)', borderRadius: 16,
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                {doc.extracted_text || 'No inline preview available. Use download/open to view.'}
                            </pre>
                            {(isWordLike || isSheetLike) && (
                                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>
                                    This format is best viewed via download; inline preview limited to extracted text.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ 
                    padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', justifyContent: 'flex-end', background: 'rgba(255,255,255,0.02)'
                }}>
                    <button onClick={onClose} style={{
                        padding: '10px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 600,
                        cursor: 'pointer'
                    }}>
                        Close Preview
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function KnowledgeBaseView() {
    const { activeWorkspace } = useAppStore();
    const [documents, setDocuments] = useState<KBDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [error, setError] = useState<string | null>(null);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewingDoc, setViewingDoc] = useState<KBDocument | null>(null);
    const [isFetchingDoc, setIsFetchingDoc] = useState(false);
    const [showFormatsHint, setShowFormatsHint] = useState(false);

    const ALLOWED_MIME_TYPES = [
        // Documents & Text
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.oasis.opendocument.text',
        'application/vnd.oasis.opendocument.spreadsheet',
        'text/csv', 'text/html', 'text/javascript', 'text/xml', 'text/rtf', 'application/json',
        // Images
        'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif',
        // Video
        'video/mp4', 'video/x-flv', 'video/quicktime', 'video/mpeg', 'video/mpg', 'video/webm', 'video/wmv', 'video/3gpp',
        // Audio
        'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/flac', 'audio/ogg', 'audio/pcm', 'audio/webm',
    ];
    const ALLOWED_EXTENSIONS = [
        '.pdf', '.txt', '.md', '.csv', '.doc', '.docx', '.odt', '.xls', '.xlsx', '.ods', '.html', '.js', '.xml', '.rtf', '.json',
        '.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif',
        '.mp4', '.flv', '.mov', '.mpeg', '.mpg', '.webm', '.wmv', '.3gp',
        '.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg', '.pcm'
    ];
    const ACCEPT_ATTR = [...ALLOWED_MIME_TYPES, ...ALLOWED_EXTENSIONS].join(',');
    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

    const loadDocuments = async () => {
        if (!activeWorkspace) return;
        setLoading(true);
        setError(null);
        try {
            const docs = await knowledgeApi.list(activeWorkspace.uuid);
            setDocuments(Array.isArray(docs) ? docs : []);
        } catch (err: any) {
            setError('Failed to load documents. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, [activeWorkspace?.uuid]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !activeWorkspace) return;
        const files = Array.from(e.target.files);
        setUploading(true);
        setError(null);

        try {
            for (const file of files) {
                const ext = '.' + file.name.split('.').pop()?.toLowerCase();
                const mime = file.type;
                const typeAllowed = ALLOWED_EXTENSIONS.includes(ext) || (mime && ALLOWED_MIME_TYPES.includes(mime));
                if (!typeAllowed) {
                    setError(`File type ${ext || mime || 'unknown'} is not supported. Supported: ${ALLOWED_EXTENSIONS.join(', ')}`);
                    continue;
                }
                if (file.size > MAX_FILE_SIZE) {
                    setError(`File ${file.name} is too large. Max size is 1MB.`);
                    continue;
                }
                await knowledgeApi.upload(activeWorkspace.uuid, file);
            }
            loadDocuments();
        } catch (err: any) {
            setError('Upload failed. Some files may not have been saved.');
            console.error(err);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (docId: string) => {
        setSelectedDocId(docId);
    };

    const confirmDelete = async () => {
        if (!activeWorkspace || !selectedDocId) return;
        setIsDeleting(true);
        try {
            await knowledgeApi.delete(activeWorkspace.uuid, selectedDocId);
            setDocuments(docs => docs.filter(d => (d.id || d._id) !== selectedDocId));
            setSelectedDocId(null);
        } catch (err) {
            console.error('Delete failed', err);
            setError('Failed to delete document.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleView = async (doc: KBDocument) => {
        if (!activeWorkspace) return;
        setIsFetchingDoc(true);
        try {
            const docId = doc.id || doc._id;
            if (!docId) return;
            const fullDoc = await knowledgeApi.get(activeWorkspace.uuid, docId);
            setViewingDoc(fullDoc);
        } catch (err) {
            console.error('Failed to fetch doc details', err);
            // Fallback to basic data if fetch fails
            setViewingDoc(doc);
        } finally {
            setIsFetchingDoc(false);
        }
    };

    const filteredDocs = documents.filter(doc => {
        const name = (doc.filename || doc.name || '').toLowerCase();
        const matchesSearch = name.includes(searchQuery.toLowerCase());
        const type = (doc.file_type || doc.content_type || '').toLowerCase();
        const ext = '.' + (doc.filename || '').split('.').pop()?.toLowerCase();

        const isPdf = type.includes('pdf') || ext === '.pdf';
        const isWord = type.includes('word') || ext === '.doc' || ext === '.docx' || ext === '.odt' || type.includes('opendocument');
        const isText = type.startsWith('text/') || ['.txt', '.md', '.json', '.js', '.html', '.xml', '.rtf'].includes(ext);
        const isSheet = type.includes('sheet') || ['.xls', '.xlsx', '.csv', '.ods'].includes(ext);
        const isImage = type.startsWith('image/');
        const isVideo = type.startsWith('video/') || ['.mp4', '.flv', '.mov', '.mpeg', '.mpg', '.webm', '.wmv', '.3gp'].includes(ext);
        const isAudio = type.startsWith('audio/') || ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg', '.pcm', '.webm'].includes(ext);

        if (filterType === 'all') return matchesSearch;
        if (filterType === 'docs') return matchesSearch && (isPdf || isWord);
        if (filterType === 'sheets') return matchesSearch && isSheet;
        if (filterType === 'text') return matchesSearch && isText;
        if (filterType === 'images') return matchesSearch && isImage;
        if (filterType === 'video') return matchesSearch && isVideo;
        if (filterType === 'audio') return matchesSearch && isAudio;
        return matchesSearch;
    });

    const formatSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIcon = (contentType: string, filename: string) => {
        const type = contentType || '';
        const ext = '.' + filename.split('.').pop()?.toLowerCase();
        
        if (type.startsWith('image/')) return null; // We'll show preview
        if (type.startsWith('video/')) return <FileVideo size={24} color="#f97316" />;
        if (type.startsWith('audio/')) return <FileAudio size={24} color="#10b981" />;
        if (type.includes('pdf')) return <FileText size={24} color="#ef4444" />;
        if (type.includes('csv') || ext === '.csv' || type.includes('sheet') || ext === '.xls' || ext === '.xlsx') return <FileSpreadsheet size={24} color="#22c55e" />;
        if (type.includes('word') || ext === '.doc' || ext === '.docx' || ext === '.odt') return <FileText size={24} color="#3b82f6" />;
        if (type.includes('text') || ext === '.md' || ext === '.txt' || ext === '.json' || ext === '.js' || ext === '.xml' || ext === '.rtf') return <FileCode size={24} color="#94a3b8" />;
        return <File size={24} color="var(--primary)" />;
    };

    return (
        <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            background: 'var(--bg-primary)', overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '24px 32px', borderBottom: '1px solid var(--border-default)',
                background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between'
            }} className="mobile-stack">
                <PanelHeader
                    title="Knowledge Base"
                    Icon={Database}
                    subtitle={(
                        <>
                            <span>{documents.length} documents</span>
                            <span style={{ opacity: 0.3 }}>•</span>
                            <span>{formatSize(documents.reduce((acc, doc) => acc + (doc.content_length || doc.size_bytes || 0), 0))} used</span>
                        </>
                    )}
                />
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', position: 'relative' }}>
                    {uploading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>
                            <RefreshCw size={16} className="animate-spin" />
                            Uploading...
                        </div>
                    )}
                    <label 
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 20px', color: 'white',
                            background: uploading ? 'rgba(124,92,255,0.5)' : 'linear-gradient(135deg, #7c5cff 0%, #6a4de6 50%, #8b6aff 100%)',
                            border: '1px solid rgba(124,92,255,0.4)',
                            borderRadius: 12, fontWeight: 700, fontSize: 13.5,
                            cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all 0.25s ease',
                            boxShadow: '0 4px 16px rgba(124,92,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                            letterSpacing: '0.2px',
                            opacity: uploading ? 0.7 : 1,
                        }}
                        onMouseEnter={e => {
                            if (uploading) return;
                            const el = e.currentTarget as HTMLElement;
                            el.style.transform = 'translateY(-2px) scale(1.02)';
                            el.style.boxShadow = '0 8px 28px rgba(124,92,255,0.45), inset 0 1px 0 rgba(255,255,255,0.2)';
                            el.style.background = 'linear-gradient(135deg, #8b6aff 0%, #7c5cff 50%, #9b7fff 100%)';
                        }}
                        onMouseLeave={e => {
                            if (uploading) return;
                            const el = e.currentTarget as HTMLElement;
                            el.style.transform = 'none';
                            el.style.boxShadow = '0 4px 16px rgba(124,92,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15)';
                            el.style.background = 'linear-gradient(135deg, #7c5cff 0%, #6a4de6 50%, #8b6aff 100%)';
                        }}
                        onMouseDown={e => { if (!uploading) (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(0.98)'; }}
                        onMouseUp={e => { if (!uploading) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.02)'; }}
                    >
                        <div style={{
                            width: 22, height: 22, borderRadius: 7,
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Upload size={14} strokeWidth={3} />
                        </div>
                        {uploading ? 'Processing...' : 'Upload Files'}
                        <input type="file" multiple hidden onChange={handleFileUpload} disabled={uploading} accept={ACCEPT_ATTR} />
                    </label>
                    <button
                        onMouseEnter={() => setShowFormatsHint(true)}
                        onMouseLeave={() => setShowFormatsHint(false)}
                        style={{
                            background: 'none', border: '1px solid var(--border-default)', borderRadius: 10,
                            color: 'var(--text-secondary)', padding: 8, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="Supported formats"
                    >
                        <Info size={16} />
                    </button>
                    {showFormatsHint && (
                        <div style={{
                            position: 'absolute', top: '110%', right: 0, zIndex: 20,
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                            borderRadius: 12, padding: 12, width: 320, boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                            color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.5
                        }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Supported formats</div>
                            <div><strong>Docs:</strong> PDF, DOC/DOCX, ODT</div>
                            <div><strong>Sheets:</strong> XLS/XLSX, ODS, CSV</div>
                            <div><strong>Text/Code:</strong> TXT, MD, JSON, JS, HTML, XML, RTF</div>
                            <div><strong>Images:</strong> PNG, JPEG, WebP, HEIC, HEIF</div>
                            <div><strong>Video:</strong> MP4, FLV, MOV, MPEG/MPG, WEBM, WMV, 3GP</div>
                            <div><strong>Audio:</strong> MP3, WAV, M4A, AAC, FLAC, OGG, PCM, WEBM</div>
                            <div style={{ color: 'var(--text-muted)', marginTop: 6 }}>Max 1MB per file.</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div style={{
                padding: '16px 32px', background: 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid var(--border-default)', display: 'flex', gap: 16,
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                    <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10,
                            background: 'var(--bg-primary)', border: '1px solid var(--border-default)',
                            color: 'var(--text-primary)', fontSize: 14, outline: 'none'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'docs', label: 'Docs' },
                        { id: 'sheets', label: 'Sheets' },
                        { id: 'text', label: 'Text/Code' },
                        { id: 'images', label: 'Images' },
                        { id: 'video', label: 'Video' },
                        { id: 'audio', label: 'Audio' },
                    ].map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => setFilterType(id)}
                            style={{
                                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                                background: filterType === id ? 'rgba(124,92,255,0.1)' : 'transparent',
                                border: '1px solid',
                                borderColor: filterType === id ? 'var(--primary)' : 'var(--border-default)',
                                color: filterType === id ? 'var(--primary)' : 'var(--text-secondary)',
                                cursor: 'pointer'
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={loadDocuments}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8 }}
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    margin: '16px 32px 0', padding: '12px 16px', borderRadius: 10,
                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                    display: 'flex', alignItems: 'center', gap: 10, color: '#ef4444', fontSize: 13
                }}>
                    <AlertCircle size={16} /> {error}
                    <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                        <RefreshCw size={32} className="animate-spin" />
                    </div>
                ) : filteredDocs.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                        {filteredDocs.map(doc => (
                            <div key={doc.id || doc._id} style={{
                                background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                                borderRadius: 16, padding: 20, transition: 'all 0.2s', position: 'relative',
                                display: 'flex', flexDirection: 'column', gap: 12
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 12,
                                        background: 'rgba(124, 92, 255, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {(doc.content_type?.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes('.' + (doc.filename || '').split('.').pop()?.toLowerCase())) ? (
                                            <img 
                                                src={doc.gcs_url} 
                                                alt="" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                    const parent = (e.currentTarget as HTMLElement).parentElement;
                                                    if (parent) {
                                                        const icon = document.createElement('div');
                                                        icon.style.display = 'flex';
                                                        icon.style.alignItems = 'center';
                                                        icon.style.justifyContent = 'center';
                                                        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                                                        parent.appendChild(icon);
                                                    }
                                                }}
                                            />
                                        ) : (
                                            getFileIcon(doc.content_type || '', doc.filename || '')
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button 
                                            onClick={() => handleView(doc)}
                                            disabled={isFetchingDoc}
                                            style={{
                                                padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)',
                                                cursor: isFetchingDoc ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                            title="View Document"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <a 
                                            href={doc.gcs_url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            style={{
                                                padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                            title="Download"
                                        >
                                            <Download size={16} />
                                        </a>
                                        <button 
                                            onClick={() => handleDelete(doc.id || doc._id || '')}
                                            style={{ 
                                                padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', 
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ 
                                        margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                    }}>
                                        {doc.filename || doc.name}
                                    </h3>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                        Added {new Date(doc.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div style={{ 
                                    marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    borderTop: '1px solid var(--border-default)', paddingTop: 12
                                }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                        {formatSize(doc.content_length || doc.size_bytes || 0)}
                                    </span>
                                    <span style={{
                                        fontSize: 10, padding: '2px 8px', borderRadius: 4,
                                        background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)'
                                    }}>
                                        {(doc.file_type || doc.content_type || 'Unknown').split('/').pop()?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ 
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', 
                        alignItems: 'center', height: '100%', color: 'var(--text-muted)', gap: 16
                    }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.02)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                             <HardDrive size={40} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>No documents found</p>
                            <p style={{ fontSize: 14 }}>Upload documents to get started with your knowledge base.</p>
                        </div>
                    </div>
                )}
            </div>
            {/* Stats Footer */}
            {!loading && (
                <div style={{
                    padding: '12px 32px', background: 'var(--bg-secondary)',
                    borderTop: '1px solid var(--border-default)', fontSize: 12,
                    color: 'var(--text-muted)', display: 'flex', gap: 24
                }}>
                    <span>Total Documents: {documents.length}</span>
                    <span>Total Storage: {formatSize(documents.reduce((acc, doc) => acc + (doc.content_length || doc.size_bytes || 0), 0))}</span>
                </div>
            )}

            {/* Deletion Confirmation */}
            <ConfirmDialog
                isOpen={!!selectedDocId}
                title="Delete Document"
                message="Are you sure you want to delete this document? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
                isLoading={isDeleting}
                onConfirm={confirmDelete}
                onCancel={() => setSelectedDocId(null)}
            />

            {/* Document Viewer */}
            {viewingDoc && (
                <DocumentViewer 
                    doc={viewingDoc} 
                    onClose={() => setViewingDoc(null)} 
                />
            )}
        </div>
    );
}
