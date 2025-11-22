import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Eye, EyeOff, Edit3, Columns } from 'lucide-react';
import 'katex/dist/katex.min.css';
import './Editor.css';

function Editor({ markdown, setMarkdown }) {
    const textareaRef = useRef(null);
    const [viewMode, setViewMode] = useState('edit'); // 'edit', 'preview', 'split'

    useEffect(() => {
        // Auto-resize textarea only in edit or split mode
        if (viewMode !== 'preview') {
            const textarea = textareaRef.current;
            if (textarea) {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            }
        }
    }, [markdown, viewMode]);

    const handleKeyDown = (e) => {
        // Tab key support
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newValue = markdown.substring(0, start) + '  ' + markdown.substring(end);
            setMarkdown(newValue);

            // Set cursor position after the inserted spaces
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 2;
            }, 0);
        }
    };

    const toggleViewMode = () => {
        if (viewMode === 'edit') setViewMode('split');
        else if (viewMode === 'split') setViewMode('preview');
        else setViewMode('edit');
    };

    return (
        <div className="editor">
            <div className="editor-header">
                <div className="editor-header-left">
                    <span className="editor-title">Markdown Editor</span>
                    <span className="editor-info">
                        {markdown.length} chars · {markdown.split('\n').length} lines
                    </span>
                </div>
                <div className="editor-header-right">
                    <button
                        className={`editor-toggle-btn ${viewMode === 'edit' ? 'active' : ''}`}
                        onClick={() => setViewMode('edit')}
                        title="Edit Only"
                    >
                        <Edit3 size={14} />
                    </button>
                    <button
                        className={`editor-toggle-btn ${viewMode === 'split' ? 'active' : ''}`}
                        onClick={() => setViewMode('split')}
                        title="Split View"
                    >
                        <Columns size={14} />
                    </button>
                    <button
                        className={`editor-toggle-btn ${viewMode === 'preview' ? 'active' : ''}`}
                        onClick={() => setViewMode('preview')}
                        title="Preview Only"
                    >
                        <Eye size={14} />
                    </button>
                </div>
            </div>
            <div className="editor-content">
                <div className={`editor-pane editor-pane-edit ${viewMode === 'preview' ? 'hidden' : ''} ${viewMode === 'split' ? 'split' : ''}`}>
                    <textarea
                        ref={textareaRef}
                        className="editor-textarea"
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Start typing your markdown here..."
                        spellCheck={false}
                    />
                </div>
                <div className={`editor-pane editor-pane-preview ${viewMode === 'edit' ? 'hidden' : ''} ${viewMode === 'split' ? 'split' : ''}`}>
                    <div className="markdown-body">
                        <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                        >
                            {markdown}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Editor;
