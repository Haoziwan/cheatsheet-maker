import { useState, useRef, useEffect } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
import FilePanel from './components/FilePanel';
import { useLocalStorage } from './utils/useLocalStorage';
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
| Header 1 | Header 2 | Header 3 |
| ------- | ------ | ------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

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

## Chart

` + '```mermaid' + `
pie title Programming Languages Usage
    "JavaScript" : 35
    "Python" : 25
    "Java" : 20
    "C++" : 12
    "Others" : 8
` + '```' + `

## HTML Support
<div style="background-color: #e8f4fd; padding: 15px; border-left: 4px solid #2196F3; border-radius: 4px; color: green;">
  <p>This is a <strong>HTML div element</strong> with inline styles.</p>
</div>
`;

function App() {
  const [markdown, setMarkdown] = useState('');
  const [columns, setColumns] = useLocalStorage('cheatsheet_columns', 5);
  const [fontSize, setFontSize] = useLocalStorage('cheatsheet_fontSize', 8);
  const [padding, setPadding] = useLocalStorage('cheatsheet_padding', 5);
  const [gap, setGap] = useLocalStorage('cheatsheet_gap', 1);
  const [lineHeight, setLineHeight] = useLocalStorage('cheatsheet_lineHeight', 1.2);
  const [scale, setScale] = useState(0.6);
  const [orientation, setOrientation] = useLocalStorage('cheatsheet_orientation', 'landscape');
  const [theme, setTheme] = useLocalStorage('cheatsheet_theme', 'classic');
  const [fontFamily, setFontFamily] = useLocalStorage('cheatsheet_fontFamily', 'inter');
  const [splitSize, setSplitSize] = useLocalStorage('cheatsheet_splitSize', 50);
  const [liveUpdate, setLiveUpdate] = useState(true);
  const [isFilePanelOpen, setIsFilePanelOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);

  const previewRef = useRef(null);
  const previewContainerRef = useRef(null);
  const editorRef = useRef(null);
  const markdownRef = useRef(markdown);

  // 保持 markdownRef 同步
  useEffect(() => {
    markdownRef.current = markdown;
  }, [markdown]);

  const defaultValues = {
    columns: 5,
    fontSize: 8,
    padding: 5,
    gap: 1,
    lineHeight: 1.2,
    orientation: 'landscape',
    theme: 'classic',
    fontFamily: 'inter'
  };

  // 初始化当前文件
  useEffect(() => {
    const savedFiles = localStorage.getItem('cheatsheet_files');
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles);
        if (parsedFiles.length > 0) {
          setCurrentFile(parsedFiles[0]);
          setMarkdown(parsedFiles[0].content);
        }
      } catch (e) {
        console.error('Failed to parse saved files:', e);
      }
    } else {
      const defaultFile = {
        id: Date.now(),
        name: 'Untitled',
        content: defaultMarkdown,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCurrentFile(defaultFile);
      setMarkdown(defaultMarkdown);
      localStorage.setItem('cheatsheet_files', JSON.stringify([defaultFile]));
    }
  }, []);

  // 保存当前文件到 localStorage (使用 ref 获取最新值)
  const saveCurrentFile = () => {
    if (!currentFile) return;

    const savedFiles = localStorage.getItem('cheatsheet_files');
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles);
        const updatedFiles = parsedFiles.map(f =>
          f.id === currentFile.id
            ? { ...f, content: markdownRef.current, updatedAt: new Date().toISOString() }
            : f
        );
        localStorage.setItem('cheatsheet_files', JSON.stringify(updatedFiles));
        console.log('Saved current file:', currentFile.name, 'Content length:', markdownRef.current.length);
      } catch (e) {
        console.error('Failed to save current file:', e);
      }
    }
  };

  // 自动保存当前文件
  useEffect(() => {
    if (!currentFile) return;
    
    // 使用防抖避免过于频繁的保存操作
    const timer = setTimeout(() => {
      saveCurrentFile();
    }, 1000); // 1秒防抖
    
    return () => clearTimeout(timer);
  }, [markdown, currentFile]); // 当markdown或currentFile变化时触发保存

  // 处理文件切换
  const handleFileChange = (file) => {
    // 先保存当前文件
    saveCurrentFile();
    // 再切换到新文件
    setCurrentFile(file);
    setMarkdown(file.content);
    setIsFilePanelOpen(false);
  };

  // 处理新建文件
  const handleNewFile = (file) => {
    // 先保存当前文件
    saveCurrentFile();
    // 再切换到新文件
    setCurrentFile(file);
    setMarkdown(file.content);
    setIsFilePanelOpen(false);
  };

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
        theme={theme}
        setTheme={setTheme}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        previewRef={previewRef}
        onFileClick={() => setIsFilePanelOpen(true)}
        defaultColumns={defaultValues.columns}
        defaultFontSize={defaultValues.fontSize}
        defaultPadding={defaultValues.padding}
        defaultGap={defaultValues.gap}
        defaultLineHeight={defaultValues.lineHeight}
        defaultOrientation={defaultValues.orientation}
        defaultTheme={defaultValues.theme}
        defaultFontFamily={defaultValues.fontFamily}
      />
      <FilePanel
        isOpen={isFilePanelOpen}
        onClose={() => setIsFilePanelOpen(false)}
        currentFile={currentFile}
        onFileChange={handleFileChange}
        onNewFile={handleNewFile}
        markdown={markdown}
      />
      <div className="main-content">
        <div className="editor-panel" style={{ width: `${splitSize}%` }}>
          <Editor
            key={currentFile?.id}
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
            theme={theme}
            fontFamily={fontFamily}
            onLineClick={(line) => editorRef.current?.scrollToLine(line)}
            liveUpdate={liveUpdate}
            setLiveUpdate={setLiveUpdate}
          />
        </div>
      </div>
    </div>
  );
}

export default App;