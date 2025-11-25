import { useRef, useState, forwardRef, useImperativeHandle, useCallback, useMemo, useDeferredValue } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Eye, Edit3, Columns, Download, Maximize, X } from 'lucide-react';
import MonacoEditor from '@monaco-editor/react';
import MermaidDiagram from './MermaidDiagram';
import FormattingToolbar from './FormattingToolbar';
import ImageRenderer from './ImageRenderer';
import imageStorage from '../utils/imageStorage';
import 'katex/dist/katex.min.css';
import './Editor.css';

// Preprocess markdown to handle **text:** patterns
const preprocessMarkdown = (markdown) => {
    // Match **text with punctuation** and add space before closing **
    // Supports: :;,!?.()[]{}\"'<>-–—/\\|@#$%^&*+=~`
    // Both English and Chinese punctuation
    return markdown.replace(/\*\*([^*]+?)([：:;,!?。，；！？\)\]\}\"'》>\\-–—\\/\\\\|@#$%^&*+=~`])\*\*/g, '**$1$2** ');
};

const Editor = forwardRef(({ markdown, setMarkdown }, ref) => {
    const editorRef = useRef(null);
    const previewRef = useRef(null);
    const [viewMode, setViewMode] = useState('edit'); // 'edit', 'preview', 'split'
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Use deferred value for markdown to prevent blocking the UI during typing
    // This allows the editor to remain responsive even if the preview takes time to render
    const deferredMarkdown = useDeferredValue(markdown);

    // Memoize preprocessed markdown to avoid unnecessary regex operations
    const preprocessedMarkdown = useMemo(() => {
        return preprocessMarkdown(deferredMarkdown);
    }, [deferredMarkdown]);

    useImperativeHandle(ref, () => ({
        scrollToLine: (line) => {
            if (editorRef.current) {
                editorRef.current.revealLineInCenter(line);
                editorRef.current.setPosition({ lineNumber: line, column: 1 });
                editorRef.current.focus();
            }
        }
    }));

    const scrollToMarkdownLine = (line) => {
        if (!previewRef.current || previewRef.current.classList.contains('hidden')) return;

        // Find the closest element with a data-line attribute <= line
        let target = null;
        for (let i = line; i >= 1; i--) {
            target = previewRef.current.querySelector(`[data-line="${i}"]`);
            if (target) break;
        }

        if (target) {
            const container = previewRef.current;
            // Calculate position relative to container to avoid window shaking
            // caused by scrollIntoView() bubbling up
            const targetRect = target.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const relativeTop = targetRect.top - containerRect.top;

            // Scroll to center
            container.scrollTo({
                top: container.scrollTop + relativeTop - container.clientHeight / 2 + targetRect.height / 2,
                behavior: 'smooth'
            });
        }
    };

    const [toolbarVisible, setToolbarVisible] = useState(false);
    const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

    const handleFormat = (type) => {
        if (!editorRef.current) return;

        const editor = editorRef.current;
        const selection = editor.getSelection();
        const text = editor.getModel().getValueInRange(selection);

        let newText = text;
        let range = selection;

        switch (type) {
            case 'bold':
                newText = `**${text}**`;
                break;
            case 'italic':
                newText = `*${text}*`;
                break;
            case 'strikethrough':
                newText = `~~${text}~~`;
                break;
            case 'code':
                newText = `\`${text}\``;
                break;
            case 'link':
                newText = `[${text}](url)`;
                break;
            case 'h1':
                newText = `# ${text}`;
                break;
            case 'h2':
                newText = `## ${text}`;
                break;
            case 'h3':
                newText = `### ${text}`;
                break;
            case 'unordered-list':
                newText = text.split('\n').map(line => `- ${line}`).join('\n');
                break;
            case 'ordered-list':
                newText = text.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
                break;
            default:
                return;
        }

        editor.executeEdits('toolbar', [{
            range: range,
            text: newText,
            forceMoveMarkers: true
        }]);

        editor.focus();
        setToolbarVisible(false);
    };

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;

        // 处理图片上传
        const handleImageUpload = async (files) => {
            if (!files || files.length === 0) return;

            for (const file of files) {
                if (file.type.startsWith('image/')) {
                    try {
                        // 保存图片到IndexedDB
                        const imageId = await imageStorage.saveImage(file);

                        // 在光标位置插入图片引用
                        const position = editor.getPosition();
                        const range = new monaco.Range(
                            position.lineNumber,
                            position.column,
                            position.lineNumber,
                            position.column
                        );

                        const imageName = file.name || 'image';
                        const imageMarkdown = `![${imageName}](${imageId})\n`;

                        editor.executeEdits('image-upload', [{
                            range: range,
                            text: imageMarkdown,
                            forceMoveMarkers: true
                        }]);

                        // 更新光标位置到插入图片后
                        const newPosition = {
                            lineNumber: position.lineNumber + 1,
                            column: 1
                        };
                        editor.setPosition(newPosition);
                        editor.focus();
                    } catch (error) {
                        console.error('Failed to upload image:', error);
                        alert('图片上传失败，请重试');
                    }
                }
            }
        };


        // 监听粘贴事件
        const domNode = editor.getDomNode();
        if (domNode) {
            domNode.addEventListener('paste', async (e) => {
                const items = e.clipboardData?.items;
                if (!items) return;

                // 先检查是否有图片
                let hasImage = false;
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.startsWith('image/')) {
                        hasImage = true;
                        break;
                    }
                }

                // 如果有图片，阻止默认行为并处理图片
                if (hasImage) {
                    e.preventDefault();
                    e.stopPropagation();

                    const files = [];
                    for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        if (item.type.startsWith('image/')) {
                            const file = item.getAsFile();
                            if (file) files.push(file);
                        }
                    }

                    if (files.length > 0) {
                        await handleImageUpload(files);
                    }
                }
            });


            // 监听拖拽事件
            domNode.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });

            domNode.addEventListener('drop', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const files = Array.from(e.dataTransfer?.files || []);
                const imageFiles = files.filter(f => f.type.startsWith('image/'));

                if (imageFiles.length > 0) {
                    await handleImageUpload(imageFiles);
                }
            });
        }

        const updateToolbarPosition = () => {
            const selection = editor.getSelection();
            if (!selection || selection.isEmpty()) {
                setToolbarVisible(false);
                return;
            }

            const position = editor.getScrolledVisiblePosition(selection.getEndPosition());
            const domNode = editor.getDomNode();

            if (position && domNode) {
                const rect = domNode.getBoundingClientRect();
                const toolbarWidth = 320; // Approximate width of toolbar
                const viewportWidth = window.innerWidth;

                let left = rect.left + position.left;
                let top = rect.top + position.top;

                // Adjust horizontal position if toolbar would be clipped
                // Center the toolbar by default
                const centeredLeft = left - toolbarWidth / 2;

                // Check if toolbar would overflow on the left
                if (centeredLeft < 10) {
                    left = toolbarWidth / 2 + 10; // Add padding from edge
                }
                // Check if toolbar would overflow on the right
                else if (centeredLeft + toolbarWidth > viewportWidth - 10) {
                    left = viewportWidth - toolbarWidth / 2 - 10;
                } else {
                    left = centeredLeft + toolbarWidth / 2;
                }

                setToolbarPosition({
                    top: top,
                    left: left
                });
                setToolbarVisible(true);
            }
        };

        editor.onDidChangeCursorSelection((e) => {
            if (e.selection.isEmpty()) {
                setToolbarVisible(false);
            } else if (e.source === 'keyboard') {
                updateToolbarPosition();
            }
        });

        editor.onMouseUp(() => {
            updateToolbarPosition();
        });

        editor.onMouseDown((e) => {
            setToolbarVisible(false);
            // Sync only on double click
            if (e.event.browserEvent.detail === 2 && e.target.position) {
                scrollToMarkdownLine(e.target.position.lineNumber);
            }
        });
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
    // Memoize components to prevent unnecessary re-renders
    const components = useMemo(() => ({
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
        img: (props) => <ImageRenderer {...props} />,
        code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            // Check if it's a mermaid diagram
            if (!inline && language === 'mermaid') {
                return (
                    <MermaidDiagram
                        chart={String(children).replace(/\n$/, '')}
                        dataLine={node?.position?.start?.line}
                    />
                );
            }

            // Default code rendering
            return inline ? (
                <code className={className} {...props}>
                    {children}
                </code>
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        },
    }), []);

    return (
        <div className={`editor ${isFullscreen ? 'editor-fullscreen' : ''}`}>
            <FormattingToolbar
                visible={toolbarVisible}
                position={toolbarPosition}
                onFormat={handleFormat}
            />
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
                    <button
                        className="editor-download-btn"
                        onClick={() => {
                            const blob = new Blob([markdown], { type: 'text/markdown' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'cheatsheet.md';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }}
                        title="Download Markdown"
                    >
                        <Download size={14} />
                    </button>
                    <button
                        className="editor-fullscreen-btn"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <X size={14} /> : <Maximize size={14} />}
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
                    ref={previewRef}
                    className={`editor-pane editor-pane-preview ${viewMode === 'edit' ? 'hidden' : ''} ${viewMode === 'split' ? 'split' : ''}`}
                    onClick={handlePreviewClick}
                >
                    {viewMode !== 'edit' && (
                        <div className="markdown-body">
                            <ReactMarkdown
                                remarkPlugins={[remarkMath, remarkGfm]}
                                rehypePlugins={[rehypeKatex]}
                                components={components}
                            >
                                {preprocessedMarkdown}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

Editor.displayName = 'Editor';

export default Editor;
