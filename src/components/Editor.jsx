import { useRef, useEffect } from 'react';
import './Editor.css';

function Editor({ markdown, setMarkdown }) {
    const textareaRef = useRef(null);

    useEffect(() => {
        // Auto-resize textarea
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    }, [markdown]);

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

    return (
        <div className="editor">
            <div className="editor-header">
                <span className="editor-title">Markdown Editor</span>
                <span className="editor-info">
                    {markdown.length} characters · {markdown.split('\n').length} lines
                </span>
            </div>
            <div className="editor-content">
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
        </div>
    );
}

export default Editor;
