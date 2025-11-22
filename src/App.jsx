import { useState, useRef } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
import './App.css';

const defaultMarkdown = `# Markdown Cheatsheet

## Headers
# H1 Header
## H2 Header
### H3 Header

## Text Formatting
**Bold text** and *italic text*
~~Strikethrough~~

## Lists
- Item 1
- Item 2
  - Nested item

1. First
2. Second

## Code
Inline \`code\` and:

\`\`\`javascript
function hello() {
  console.log("Hello!");
}
\`\`\`

## Math Formulas
Inline math: $E = mc^2$

Block math:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## Tables
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

## Links
[Link text](https://example.com)

## Blockquotes
> This is a quote

## Horizontal Rule
---
`;

function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [columns, setColumns] = useState(4);
  const [fontSize, setFontSize] = useState(8);
  const [splitSize, setSplitSize] = useState(50);
  const previewRef = useRef(null);

  return (
    <div className="app">
      <Toolbar
        columns={columns}
        setColumns={setColumns}
        fontSize={fontSize}
        setFontSize={setFontSize}
        previewRef={previewRef}
      />
      <div className="main-content">
        <div className="editor-panel" style={{ width: `${splitSize}%` }}>
          <Editor markdown={markdown} setMarkdown={setMarkdown} />
        </div>
        <div
          className="resize-handle"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startSize = splitSize;

            const handleMouseMove = (e) => {
              const delta = ((e.clientX - startX) / window.innerWidth) * 100;
              const newSize = Math.min(Math.max(startSize + delta, 20), 80);
              setSplitSize(newSize);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <div className="resize-handle-bar"></div>
        </div>
        <div className="preview-panel" style={{ width: `${100 - splitSize}%` }}>
          <Preview
            ref={previewRef}
            markdown={markdown}
            columns={columns}
            fontSize={fontSize}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
