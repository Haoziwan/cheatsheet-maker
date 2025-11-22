import { useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Eye, Edit3, Columns } from 'lucide-react';
import MonacoEditor from '@monaco-editor/react';
import 'katex/dist/katex.min.css';
import './Editor.css';

const Editor = forwardRef(({ markdown, setMarkdown }, ref) => {
    const editorRef = useRef(null);
    const [viewMode, setViewMode] = useState('edit'); // 'edit', 'preview', 'split'

    useImperativeHandle(ref, () => ({
        scrollToLine: (line) => {
            if (editorRef.current) {
                editorRef.current.revealLineInCenter(line);
                editorRef.current.setPosition({ lineNumber: line, column: 1 });
                editorRef.current.focus();
            }
        }
    }));

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
    };

    const handlePreviewClick = (e) => {
        if (!editorRef.current) return;

        // Find the closest element with a data-line attribute
        const target = e.target.closest('[data-line]');
        if (target) {
            const line = parseInt(target.getAttribute('data-line'), 10);
            if (!isNaN(line)) {
                editorRef.current.revealLineInCenter(line);
                editorRef.current.setPosition({ lineNumber: line, column: 1 });
                editorRef.current.focus();
            }
        }
    };

    // Debounce function to prevent excessive updates and cursor jumping
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const debouncedSetMarkdown = useCallback(
        debounce((value) => {
            setMarkdown(value);
        }, 300),
        [setMarkdown]
    );

    const handleEditorChange = (value) => {
        debouncedSetMarkdown(value || '');
    };

    // Custom components to inject source line numbers
    const components = {
        p: ({ node, ...props }) => <p data-line={node?.position?.start?.line} {...props} />,
        h1: ({ node, ...props }) => <h1 data-line={node?.position?.start?.line} {...props} />,
        h2: ({ node, ...props }) => <h2 data-line={node?.position?.start?.line} {...props} />,
        h3: ({ node, ...props }) => <h3 data-line={node?.position?.start?.line} {...props} />,
        h4: ({ node, ...props }) => <h4 data-line={node?.position?.start?.line} {...props} />,
        h5: ({ node, ...props }) => <h5 data-line={node?.position?.start?.line} {...props} />,
        h6: ({ node, ...props }) => <h6 data-line={node?.position?.start?.line} {...props} />,
        li: ({ node, ...props }) => <li data-line={node?.position?.start?.line} {...props} />,
        blockquote: ({ node, ...props }) => <blockquote data-line={node?.position?.start?.line} {...props} />,
        pre: ({ node, ...props }) => <pre data-line={node?.position?.start?.line} {...props} />,
        table: ({ node, ...props }) => <table data-line={node?.position?.start?.line} {...props} />,
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
                    <MonacoEditor
                        height="100%"
                        language="markdown"
                        theme="vs-dark"
                        defaultValue={markdown}
                        onChange={handleEditorChange}
                        onMount={handleEditorDidMount}
                        options={{
                            minimap: { enabled: false },
                            wordWrap: 'on',
                            fontSize: 14,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 16, bottom: 16 },
                            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                        }}
                    />
                </div>
                <div
                    className={`editor-pane editor-pane-preview ${viewMode === 'edit' ? 'hidden' : ''} ${viewMode === 'split' ? 'split' : ''}`}
                    onClick={handlePreviewClick}
                >
                    <div className="markdown-body">
                        <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={components}
                        >
                            {markdown}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
});

Editor.displayName = 'Editor';

export default Editor;
