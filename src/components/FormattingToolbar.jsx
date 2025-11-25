import React from 'react';
import { Bold, Italic, Strikethrough, Code, Link, Heading1, Heading2, Heading3, List, ListOrdered } from 'lucide-react';
import './FormattingToolbar.css';

const FormattingToolbar = ({ position, onFormat, visible }) => {
    if (!visible) return null;

    const tools = [
        { icon: <Bold size={16} />, action: 'bold', title: 'Bold' },
        { icon: <Italic size={16} />, action: 'italic', title: 'Italic' },
        { icon: <Strikethrough size={16} />, action: 'strikethrough', title: 'Strikethrough' },
        { icon: <Code size={16} />, action: 'code', title: 'Inline Code' },
        { icon: <Link size={16} />, action: 'link', title: 'Link' },
        { icon: <List size={16} />, action: 'unordered-list', title: 'Unordered List' },
        { icon: <ListOrdered size={16} />, action: 'ordered-list', title: 'Ordered List' },
        { icon: <Heading1 size={16} />, action: 'h1', title: 'Heading 1' },
        { icon: <Heading2 size={16} />, action: 'h2', title: 'Heading 2' },
        { icon: <Heading3 size={16} />, action: 'h3', title: 'Heading 3' },
    ];

    return (
        <div
            className="formatting-toolbar"
            style={{
                top: position.top,
                left: position.left,
            }}
            onMouseDown={(e) => e.preventDefault()} // Prevent losing focus from editor
        >
            {tools.map((tool) => (
                <button
                    key={tool.action}
                    className="formatting-tool-btn"
                    onClick={() => onFormat(tool.action)}
                    title={tool.title}
                >
                    {tool.icon}
                </button>
            ))}
        </div>
    );
};

export default FormattingToolbar;
