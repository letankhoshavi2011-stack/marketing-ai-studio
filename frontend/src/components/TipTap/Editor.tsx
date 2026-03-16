import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Node } from '@tiptap/core';
import { Sparkles, Type, Bold, Italic, List, ListOrdered } from 'lucide-react';
import './editor.css';

const TableBlock = Node.create({
    name: 'tableBlock',
    group: 'block',
    atom: true,
    addAttributes() { return { content: { default: '' } }; },
    parseHTML() {
        return [{ tag: 'table', getAttrs: (el: HTMLElement) => ({ content: el.outerHTML }) }];
    },
    renderHTML({ node }: any) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = node.attrs.content;
        const table = wrapper.querySelector('table');
        if (table) return table as any;
        return ['table'] as any;
    },
    addNodeView() {
        return ({ node }: any) => {
            const dom = document.createElement('div');
            dom.setAttribute('data-table-block', '');
            dom.style.margin = '16px 0';
            dom.innerHTML = node.attrs.content;
            return { dom };
        };
    },
});

interface EditorProps {
    initialContent?: string;
    onUpdate?: (html: string) => void;
}

export default function MarketingEditor({ initialContent = '<p>Start writing your campaign content here...</p>', onUpdate }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TableBlock,
        ],
        content: initialContent,
        onUpdate: ({ editor }) => {
            onUpdate?.(editor.getHTML());
        },
    });

    if (!editor) {
        return null;
    }

    const handleAIAction = (action: string) => {
        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
            ' '
        );

        if (!selectedText) {
            alert('Please select some text to apply AI actions.');
            return;
        }

        console.log(`Triggering AI ${action} on:`, selectedText);
        // This will hook into the AI Content Agents later
        // e.g., rewrite, shorten, expand, change tone to brand voice
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
            {/* Standard Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-[var(--border-default)] bg-[var(--bg-secondary)] flex-wrap">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-[var(--bg-primary)] ${editor.isActive('bold') ? 'text-[var(--primary)] bg-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'}`}
                >
                    <Bold size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-[var(--bg-primary)] ${editor.isActive('italic') ? 'text-[var(--primary)] bg-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'}`}
                >
                    <Italic size={16} />
                </button>
                <div className="w-px h-5 bg-[var(--border-default)] mx-1" />
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded hover:bg-[var(--bg-primary)] ${editor.isActive('heading', { level: 2 }) ? 'text-[var(--primary)] bg-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'}`}
                >
                    <Type size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-[var(--bg-primary)] ${editor.isActive('bulletList') ? 'text-[var(--primary)] bg-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'}`}
                >
                    <List size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-[var(--bg-primary)] ${editor.isActive('orderedList') ? 'text-[var(--primary)] bg-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'}`}
                >
                    <ListOrdered size={16} />
                </button>

                <div className="flex-1" />

                {/* AI Powers Toolbar */}
                <div className="flex items-center gap-2 bg-[var(--gradient-subtle)] px-3 py-1.5 rounded-[var(--radius-md)] border border-[rgba(124,92,255,0.2)]">
                    <Sparkles size={14} className="text-[var(--accent-1)]" />
                    <span className="text-xs font-bold text-[var(--accent-1)] mr-2">AI Copilot</span>
                    <button
                        onClick={() => handleAIAction('rewrite')}
                        className="text-xs font-semibold px-2 py-1 rounded bg-white dark:bg-black border border-[var(--border-default)] hover:border-[var(--primary)] transition-colors"
                    >
                        Rewrite
                    </button>
                    <button
                        onClick={() => handleAIAction('expand')}
                        className="text-xs font-semibold px-2 py-1 rounded bg-white dark:bg-black border border-[var(--border-default)] hover:border-[var(--primary)] transition-colors"
                    >
                        Expand
                    </button>
                    <button
                        onClick={() => handleAIAction('brand_voice')}
                        className="text-xs font-semibold px-2 py-1 rounded bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
                    >
                        Apply Brand Voice
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12">
                <div className="max-w-3xl mx-auto prose prose-sm sm:prose-base dark:prose-invert focus:outline-none">
                    <EditorContent editor={editor} className="focus:outline-none min-h-[500px]" />
                </div>
            </div>
        </div>
    );
}
