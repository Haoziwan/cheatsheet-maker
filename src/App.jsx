import { useState, useRef, useEffect } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
import './App.css';

const defaultMarkdown = `# Markdown Cheatsheet

## Headers
# H1
## H2
### H3
#### H4
##### H5
###### H6

## Emphasis
**Bold** or __Bold__
*Italic* or _Italic_
***Bold Italic***
~~Strikethrough~~

## Lists
### Unordered
- Item 1
- Item 2
  - Sub Item 2a
  - Sub Item 2b

### Ordered
1. First
2. Second
3. Third

### Task List
- [x] Done task
- [ ] Todo task

## Links & Images
[Link Text](https://example.com)
![Image Alt](https://picsum.photos/150/100)

## Code
Inline \`code\` example.

\`\`\`javascript
// Code block
function hello() {
  console.log("Hello World");
}
\`\`\`

## Tables
| Header 1 | Header 2 |
| :------- | :------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

## Blockquotes
> This is a blockquote.
>
> > Nested blockquote.

## Math (KaTeX)
Inline: $E = mc^2$

Block:
$$
\\oint_C \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{enc}
$$

## Horizontal Rule
---

## Footnotes
Here is a footnote reference[^1].

[^1]: Here is the footnote.
`;

function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [columns, setColumns] = useState(5);
  const [fontSize, setFontSize] = useState(8);
  const [padding, setPadding] = useState(3); // mm
  const [gap, setGap] = useState(1); // mm
  const [lineHeight, setLineHeight] = useState(1.2);
  const [scale, setScale] = useState(0.6);
  const [orientation, setOrientation] = useState('landscape');
  const [splitSize, setSplitSize] = useState(50);
  const previewRef = useRef(null);
  const previewContainerRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        setScale(prev => Math.min(Math.max(prev + delta, 0.5), 3));
      }
    };

    const container = previewContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <div className="app">
      <Toolbar
        columns={columns}
        setColumns={setColumns}
        fontSize={fontSize}
        setFontSize={setFontSize}
        padding={padding}
        setPadding={setPadding}
        gap={gap}
        setGap={setGap}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
        scale={scale}
        setScale={setScale}
        orientation={orientation}
        setOrientation={setOrientation}
        previewRef={previewRef}
      />
      <div className="main-content">
        <div className="editor-panel" style={{ width: `${splitSize}%` }}>
          <Editor
            ref={editorRef}
            markdown={markdown}
            setMarkdown={setMarkdown}
          />
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
        <div
          className="preview-panel"
          style={{ width: `${100 - splitSize}%` }}
          ref={previewContainerRef}
        >
          <Preview
            ref={previewRef}
            markdown={markdown}
            columns={columns}
            fontSize={fontSize}
            padding={padding}
            gap={gap}
            lineHeight={lineHeight}
            scale={scale}
            setScale={setScale}
            orientation={orientation}
            onLineClick={(line) => editorRef.current?.scrollToLine(line)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
