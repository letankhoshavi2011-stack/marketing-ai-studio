import React, { useEffect, useMemo, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Node, mergeAttributes } from '@tiptap/core';
import { marked } from 'marked';
import {
    Bold, Italic, List, ListOrdered,
    Heading1, Heading2, Quote, Undo, Redo
} from 'lucide-react';

/**
 * Custom atom node that captures full <table> HTML from marked output
 * and renders it via NodeView. Tables display with styling but are
 * treated as opaque blocks (selectable / deletable, not cell-editable).
 */
const TableBlock = Node.create({
    name: 'tableBlock',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            content: { default: '' },
        };
    },

    parseHTML() {
        return [{
            tag: 'table',
            getAttrs: (element: HTMLElement) => ({
                content: element.outerHTML,
            }),
        }];
    },

    renderHTML({ node }) {
        // Return actual table DOM so getHTML() preserves the content
        const wrapper = document.createElement('div');
        wrapper.innerHTML = node.attrs.content;
        const table = wrapper.querySelector('table');
        if (table) return table as unknown as ReturnType<typeof Node.create>; // DOMOutputSpec accepts DOM nodes
        return ['table'] as any;
    },

    addNodeView() {
        return ({ node }) => {
            const dom = document.createElement('div');
            dom.setAttribute('data-table-block', '');
            dom.style.margin = '16px 0';
            dom.innerHTML = node.attrs.content;
            return { dom };
        };
    },
});

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            padding: '8px',
            borderBottom: '1px solid var(--border-default)',
            background: 'var(--bg-secondary)',
            borderRadius: '8px 8px 0 0',
        }}>
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                style={{
                    padding: '4px 8px',
                    background: editor.isActive('bold') ? 'var(--primary)' : 'transparent',
                    color: editor.isActive('bold') ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                <Bold size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                style={{
                    padding: '4px 8px',
                    background: editor.isActive('italic') ? 'var(--primary)' : 'transparent',
                    color: editor.isActive('italic') ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                <Italic size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                style={{
                    padding: '4px 8px',
                    background: editor.isActive('heading', { level: 1 }) ? 'var(--primary)' : 'transparent',
                    color: editor.isActive('heading', { level: 1 }) ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                <Heading1 size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                style={{
                    padding: '4px 8px',
                    background: editor.isActive('heading', { level: 2 }) ? 'var(--primary)' : 'transparent',
                    color: editor.isActive('heading', { level: 2 }) ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                <Heading2 size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                style={{
                    padding: '4px 8px',
                    background: editor.isActive('bulletList') ? 'var(--primary)' : 'transparent',
                    color: editor.isActive('bulletList') ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                <List size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                style={{
                    padding: '4px 8px',
                    background: editor.isActive('orderedList') ? 'var(--primary)' : 'transparent',
                    color: editor.isActive('orderedList') ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                <ListOrdered size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                style={{
                    padding: '4px 8px',
                    background: editor.isActive('blockquote') ? 'var(--primary)' : 'transparent',
                    color: editor.isActive('blockquote') ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                <Quote size={16} />
            </button>
            <div style={{ width: '1px', background: 'var(--border-default)', margin: '0 4px' }} />
            <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                style={{ padding: '4px 8px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
            >
                <Undo size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                style={{ padding: '4px 8px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
            >
                <Redo size={16} />
            </button>
        </div>
    );
};

export default function RichTextEditor({ content, onChange, editable = true }: RichTextEditorProps) {
    const parseContent = useCallback((text: string) => {
        if (!text) return '';
        // If it looks like HTML, return as is
        if (/<(?:p|h[1-6]|ul|ol|li|blockquote|strong|em|a|br|div|span|table)[>\s]/i.test(text)) {
            return text;
        }
        return (marked.parse(text) as string) || '';
    }, []);

    const initialContent = useMemo(() => parseContent(content), []);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'editor-image',
                },
            }),
            Placeholder.configure({
                placeholder: 'Write something amazing...',
            }),
            TableBlock,
        ],
        content: initialContent,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor) {
            const currentHtml = editor.getHTML();
            const newParsed = parseContent(content);
            if (newParsed.trim() !== currentHtml.trim()) {
                editor.commands.setContent(newParsed, { emitUpdate: false });
            }
        }
    }, [content, editor, parseContent]);

    return (
        <div style={{
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            background: 'var(--bg-primary)',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {editable && <MenuBar editor={editor} />}
            <EditorContent
                editor={editor}
                style={{
                    padding: '16px',
                    flex: 1,
                    outline: 'none',
                }}
            />
            <style>{`
        .ProseMirror {
          outline: none;
          min-height: 150px;
          color: var(--text-primary);
          font-size: 14px;
          line-height: 1.6;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--text-muted);
          pointer-events: none;
          height: 0;
        }
        .ProseMirror blockquote {
          border-left: 3px solid var(--primary);
          padding-left: 16px;
          margin-left: 0;
          color: var(--text-secondary);
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 24px;
        }
        .ProseMirror h1 { font-size: 24px; font-weight: 700; margin-bottom: 16px; }
        .ProseMirror h2 { font-size: 20px; font-weight: 600; margin-bottom: 12px; }
        .ProseMirror img.editor-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        .ProseMirror [data-table-block] table {
          border-collapse: collapse;
          width: 100%;
          overflow: hidden;
        }
        .ProseMirror [data-table-block] th,
        .ProseMirror [data-table-block] td {
          border: 1px solid var(--border-default);
          padding: 8px 12px;
          text-align: left;
          vertical-align: top;
          min-width: 80px;
        }
        .ProseMirror [data-table-block] th {
          background: var(--bg-secondary);
          font-weight: 600;
        }
        .ProseMirror [data-table-block] td {
          background: var(--bg-primary);
        }
        .ProseMirror [data-table-block] tr:hover td {
          background: var(--bg-secondary);
        }
        .ProseMirror [data-table-block].ProseMirror-selectednode {
          outline: 2px solid var(--primary);
          border-radius: 4px;
        }
      `}</style>
        </div>
    );
}
