import { forwardRef, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MermaidDiagram from './MermaidDiagram';
import themes from '../styles/themes';
import fonts from '../styles/fonts';
import 'katex/dist/katex.min.css';
import './Preview.css';

const Preview = forwardRef(({ markdown, columns, fontSize, padding, gap, lineHeight, scale, setScale, orientation, theme, fontFamily, onLineClick, liveUpdate, setLiveUpdate }, ref) => {
    const measureRef = useRef(null);
    const pagesContainerRef = useRef(null);
    const layoutTimeoutRef = useRef(null);

    const pxPerMmRef = useRef(null);
    const mmToPx = (mm) => {
        if (pxPerMmRef.current == null) {
            const div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.left = '-9999px';
            div.style.top = '-9999px';
            div.style.width = '1mm';
            document.body.appendChild(div);
            pxPerMmRef.current = div.getBoundingClientRect().width;
            document.body.removeChild(div);
        }
        return mm * pxPerMmRef.current;
    };

    const handlePageClick = (e) => {
        if (!onLineClick) return;
        const target = e.target.closest('[data-line]');
        if (target) {
            const line = parseInt(target.getAttribute('data-line'), 10);
            if (!isNaN(line)) {
                onLineClick(line);
            }
        }
    };

    // Load Google Fonts if needed
    useEffect(() => {
        const selectedFont = fonts[fontFamily];
        if (selectedFont?.googleFont) {
            const linkId = `google-font-${fontFamily}`;
            // Check if font is already loaded
            if (!document.getElementById(linkId)) {
                const link = document.createElement('link');
                link.id = linkId;
                link.rel = 'stylesheet';
                link.href = `https://fonts.googleapis.com/css2?family=${selectedFont.googleFont}&display=swap`;
                document.head.appendChild(link);
            }
        }
    }, [fontFamily]);

    const updateLayout = () => {
        // 只有当实时更新开启时才执行渲染逻辑
        if (!liveUpdate) return;

        const measureEl = measureRef.current;
        if (!measureEl) return;

        // Compute column width/height in px based on A4 landscape and current paddings/gaps
        const isLandscape = orientation === 'landscape';
        const widthMm = isLandscape ? 297 : 210;
        const heightMm = isLandscape ? 210 : 297;

        const pageWidthPx = mmToPx(widthMm);
        const pageHeightPx = mmToPx(heightMm);
        const paddingPx = mmToPx(padding);
        const gapPx = mmToPx(gap);
        const contentWidthPx = pageWidthPx - paddingPx * 2;
        const totalPaddingPx = gapPx * columns; // Total padding for all columns
        const columnWidthPx = (contentWidthPx - totalPaddingPx) / columns;
        const columnHeightPx = pageHeightPx - paddingPx * 2;

        // Prepare measurer styles
        measureEl.style.width = `${columnWidthPx - gapPx}px`;
        measureEl.style.fontSize = `${fontSize}pt`;
        measureEl.style.lineHeight = lineHeight;
        measureEl.style.paddingLeft = `${gap / 2}mm`;
        measureEl.style.paddingRight = `${gap / 2}mm`;

        const container = pagesContainerRef.current;
        if (!container) return;
        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '12mm';
        const children = Array.from(measureEl.children);

        const createPage = () => {
            const page = document.createElement('div');
            page.className = 'preview-page';
            page.style.width = `${widthMm}mm`;
            page.style.height = `${heightMm}mm`;
            page.style.fontSize = `${fontSize}pt`;
            page.style.lineHeight = lineHeight;
            page.style.padding = `${padding}mm`;

            // Apply theme
            const currentTheme = themes[theme] || themes.classic;
            if (currentTheme.cssVars) {
                Object.entries(currentTheme.cssVars).forEach(([key, value]) => {
                    page.style.setProperty(key, value);
                });
            }

            // Apply background and text colors
            if (currentTheme.cssVars['--theme-bg']) {
                page.style.background = currentTheme.cssVars['--theme-bg'];
            }
            if (currentTheme.cssVars['--theme-text']) {
                page.style.color = currentTheme.cssVars['--theme-text'];
            }

            // Apply font family
            const selectedFont = fonts[fontFamily] || fonts['times-new-roman'];
            page.style.fontFamily = selectedFont.family;

            const grid = document.createElement('div');
            grid.className = 'page-columns';
            grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
            grid.style.gap = '0mm'; // Remove gap as we'll use padding instead

            const cols = [];
            for (let i = 0; i < columns; i++) {
                const col = document.createElement('div');
                col.className = 'page-column';
                col.style.height = `${columnHeightPx}px`;
                col.style.paddingLeft = `${gap / 2}mm`;
                col.style.paddingRight = `${gap / 2}mm`;
                grid.appendChild(col);
                cols.push(col);
            }

            page.appendChild(grid);
            container.appendChild(page);
            return cols;
        };

        let cols = createPage();
        let colIndex = 0;

        children.forEach((child) => {
            const node = child.cloneNode(true);
            cols[colIndex].appendChild(node);
            const overflow = cols[colIndex].scrollHeight > cols[colIndex].clientHeight;
            if (overflow) {
                cols[colIndex].removeChild(node);
                colIndex += 1;
                if (colIndex >= columns) {
                    cols = createPage();
                    colIndex = 0;
                }
                cols[colIndex].appendChild(node);
                // If still overflow, the block is taller than a single column; allow it to overflow within a fresh column to avoid clipping
                if (cols[colIndex].scrollHeight > cols[colIndex].clientHeight) {
                    cols[colIndex].style.overflow = 'visible';
                }
            }
        });
    };

    useEffect(() => {
        updateLayout();
    }, [markdown, columns, fontSize, padding, gap, lineHeight, orientation, theme, fontFamily, liveUpdate]);

    const handleResourceLoad = () => {
        // Debounce layout updates from resource loading (images, mermaid)
        if (layoutTimeoutRef.current) {
            clearTimeout(layoutTimeoutRef.current);
        }
        layoutTimeoutRef.current = setTimeout(() => {
            updateLayout();
        }, 100);
    };

    // 手动更新函数
    const handleManualUpdate = () => {
        // 强制重新渲染，即使实时更新关闭
        const measureEl = measureRef.current;
        if (!measureEl) return;

        // Compute column width/height in px based on A4 landscape and current paddings/gaps
        const isLandscape = orientation === 'landscape';
        const widthMm = isLandscape ? 297 : 210;
        const heightMm = isLandscape ? 210 : 297;

        const pageWidthPx = mmToPx(widthMm);
        const pageHeightPx = mmToPx(heightMm);
        const paddingPx = mmToPx(padding);
        const gapPx = mmToPx(gap);
        const contentWidthPx = pageWidthPx - paddingPx * 2;
        const totalPaddingPx = gapPx * columns; // Total padding for all columns
        const columnWidthPx = (contentWidthPx - totalPaddingPx) / columns;
        const columnHeightPx = pageHeightPx - paddingPx * 2;

        // Prepare measurer styles
        measureEl.style.width = `${columnWidthPx - gapPx}px`;
        measureEl.style.fontSize = `${fontSize}pt`;
        measureEl.style.lineHeight = lineHeight;
        measureEl.style.paddingLeft = `${gap / 2}mm`;
        measureEl.style.paddingRight = `${gap / 2}mm`;

        const container = pagesContainerRef.current;
        if (!container) return;
        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '12mm';
        const children = Array.from(measureEl.children);

        const createPage = () => {
            const page = document.createElement('div');
            page.className = 'preview-page';
            page.style.width = `${widthMm}mm`;
            page.style.height = `${heightMm}mm`;
            page.style.fontSize = `${fontSize}pt`;
            page.style.lineHeight = lineHeight;
            page.style.padding = `${padding}mm`;

            // Apply theme
            const currentTheme = themes[theme] || themes.classic;
            if (currentTheme.cssVars) {
                Object.entries(currentTheme.cssVars).forEach(([key, value]) => {
                    page.style.setProperty(key, value);
                });
            }

            // Apply background and text colors
            if (currentTheme.cssVars['--theme-bg']) {
                page.style.background = currentTheme.cssVars['--theme-bg'];
            }
            if (currentTheme.cssVars['--theme-text']) {
                page.style.color = currentTheme.cssVars['--theme-text'];
            }

            // Apply font family
            const selectedFont = fonts[fontFamily] || fonts['times-new-roman'];
            page.style.fontFamily = selectedFont.family;

            const grid = document.createElement('div');
            grid.className = 'page-columns';
            grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
            grid.style.gap = '0mm'; // Remove gap as we'll use padding instead

            const cols = [];
            for (let i = 0; i < columns; i++) {
                const col = document.createElement('div');
                col.className = 'page-column';
                col.style.height = `${columnHeightPx}px`;
                col.style.paddingLeft = `${gap / 2}mm`;
                col.style.paddingRight = `${gap / 2}mm`;
                grid.appendChild(col);
                cols.push(col);
            }

            page.appendChild(grid);
            container.appendChild(page);
            return cols;
        };

        let cols = createPage();
        let colIndex = 0;

        children.forEach((child) => {
            const node = child.cloneNode(true);
            cols[colIndex].appendChild(node);
            const overflow = cols[colIndex].scrollHeight > cols[colIndex].clientHeight;
            if (overflow) {
                cols[colIndex].removeChild(node);
                colIndex += 1;
                if (colIndex >= columns) {
                    cols = createPage();
                    colIndex = 0;
                }
                cols[colIndex].appendChild(node);
                // If still overflow, the block is taller than a single column; allow it to overflow within a fresh column to avoid clipping
                if (cols[colIndex].scrollHeight > cols[colIndex].clientHeight) {
                    cols[colIndex].style.overflow = 'visible';
                }
            }
        });
    };

    // Custom components to inject source line numbers and apply theme styles
    const currentTheme = themes[theme] || themes.classic;
    const themeStyles = currentTheme.styles || {};

    const components = {
        h1: (props) => <h1 className="md-h1" style={themeStyles.h1} data-line={props.node?.position?.start?.line} {...props} />,
        h2: (props) => <h2 className="md-h2" style={themeStyles.h2} data-line={props.node?.position?.start?.line} {...props} />,
        h3: (props) => <h3 className="md-h3" style={themeStyles.h3} data-line={props.node?.position?.start?.line} {...props} />,
        h4: (props) => <h4 className="md-h4" style={themeStyles.h4 || themeStyles.h3} data-line={props.node?.position?.start?.line} {...props} />,
        h5: (props) => <h5 className="md-h5" style={themeStyles.h5 || themeStyles.h3} data-line={props.node?.position?.start?.line} {...props} />,
        h6: (props) => <h6 className="md-h6" style={themeStyles.h6 || themeStyles.h3} data-line={props.node?.position?.start?.line} {...props} />,
        p: (props) => {
            const style = themeStyles.paragraph || {};
            return <p className="md-p" style={style} data-line={props.node?.position?.start?.line} {...props} />;
        },
        ul: (props) => <ul className="md-ul" {...props} />,
        ol: (props) => <ol className="md-ol" {...props} />,
        li: (props) => <li className="md-li" data-line={props.node?.position?.start?.line} {...props} />,
        code: ({ inline, className, children, node, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            // Heuristic: It's a block if it has a language or contains newlines
            // (Markdown inline code newlines are normalized to spaces)
            const isBlock = match || String(children).includes('\n');

            // Check if it's a mermaid diagram
            if (!inline && language === 'mermaid') {
                return (
                    <MermaidDiagram
                        chart={String(children).replace(/\n$/, '')}
                        dataLine={node?.position?.start?.line}
                        onRender={handleResourceLoad}
                    />
                );
            }

            return isBlock ? (
                <SyntaxHighlighter
                    style={prism}
                    language={language || 'text'}
                    PreTag="div"
                    className="md-code-block"
                    customStyle={{
                        margin: '0.4em 0',
                        padding: '0.6em',
                        fontSize: '0.75em',
                        borderRadius: '4px',
                        lineHeight: '1.4',
                        ...(themeStyles.codeBlock || {}),
                    }}
                    codeTagProps={{
                        style: {
                            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                        }
                    }}
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code className="md-code-inline" style={themeStyles.codeInline} {...props}>
                    {children}
                </code>
            );
        },
        pre: (props) => <div className="md-pre" data-line={props.node?.position?.start?.line} {...props} />,
        blockquote: (props) => {
            const style = themeStyles.blockquote || {};
            return <blockquote className="md-blockquote" style={style} data-line={props.node?.position?.start?.line} {...props} />;
        },
        table: (props) => {
            const style = themeStyles.table?.boxShadow ? { boxShadow: themeStyles.table.boxShadow } : {};
            return <table className="md-table" style={style} data-line={props.node?.position?.start?.line} {...props} />;
        },
        thead: (props) => <thead className="md-thead" {...props} />,
        tbody: (props) => <tbody className="md-tbody" {...props} />,
        tr: (props) => <tr className="md-tr" {...props} />,
        th: (props) => {
            const style = {};
            if (themeStyles.table) {
                if (themeStyles.table.headerBg) style.background = themeStyles.table.headerBg;
                if (themeStyles.table.headerColor) style.color = themeStyles.table.headerColor;
                if (themeStyles.table.headerFontWeight) style.fontWeight = themeStyles.table.headerFontWeight;
                if (themeStyles.table.headerTextShadow) style.textShadow = themeStyles.table.headerTextShadow;
                if (themeStyles.table.cellBorder) style.border = themeStyles.table.cellBorder;
            }
            return <th className="md-th" style={style} {...props} />;
        },
        td: (props) => {
            const style = {};
            if (themeStyles.table?.cellBorder) {
                style.border = themeStyles.table.cellBorder;
            }
            if (themeStyles.table?.cellColor) {
                style.color = themeStyles.table.cellColor;
            }
            return <td className="md-td" style={style} {...props} />;
        },
        a: (props) => <a className="md-link" style={themeStyles.link} {...props} />,
        strong: (props) => {
            const style = themeStyles.strong || {};
            return <strong className="md-strong" style={style} {...props} />;
        },
        em: (props) => <em className="md-em" {...props} />,
        hr: (props) => <hr className="md-hr" {...props} />,
        img: (props) => (
            <img
                className="md-img"
                data-line={props.node?.position?.start?.line}
                onLoad={handleResourceLoad}
                onError={handleResourceLoad}
                {...props}
            />
        ),
    };

    return (
        <div className="preview">
            <div className="preview-header">
                <div className="preview-header-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="preview-title">PDF Preview</span>
                        <button
                            className={`icon-btn ${liveUpdate ? 'active' : ''}`}
                            onClick={() => setLiveUpdate(!liveUpdate)}
                            title={liveUpdate ? "Disable live update" : "Enable live update"}
                            style={{
                                backgroundColor: liveUpdate ? 'var(--color-accent-primary)' : '#e0e0e0',
                                color: liveUpdate ? 'white' : '#666',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 'auto',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                border: 'none',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {liveUpdate ? 'ON' : 'OFF'}
                        </button>
                    </div>
                    <span className="preview-info">
                        {columns} cols · {fontSize}pt · {padding}mm pad · {gap}mm gap
                    </span>
                </div>
                <div className="preview-controls">
                    <button className="icon-btn" onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} title="Zoom Out">
                        <ZoomOut size={16} />
                    </button>
                    <span className="zoom-label">{Math.round(scale * 100)}%</span>
                    <button className="icon-btn" onClick={() => setScale(s => Math.min(s + 0.1, 3))} title="Zoom In">
                        <ZoomIn size={16} />
                    </button>
                    <button className="icon-btn" onClick={handleManualUpdate} title="Manual Update (Click if loading failed)">
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>
            <div className="preview-content">
                <style>
                    {`
                            @media print {
                                @page {
                                    size: A4 ${orientation};
                                    margin: 0;
                                }
                                .preview-page {
                                    width: ${orientation === 'landscape' ? 297 : 210}mm !important;
                                    height: ${orientation === 'landscape' ? 210 : 297}mm !important;
                                }
                            }
                        `}
                </style>
                <div
                    className="preview-scaler"
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        zoom: scale,
                        minWidth: `${orientation === 'landscape' ? 297 : 210}mm`,
                        minHeight: `${orientation === 'landscape' ? 210 : 297}mm`,
                        margin: 'auto'
                    }}
                    onClick={handlePageClick}
                >
                    <div
                        ref={(el) => {
                            pagesContainerRef.current = el;
                            if (typeof ref === 'function') ref(el);
                            else if (ref) ref.current = el;
                        }}
                    />
                </div>
                {/* Hidden measurer */}
                <div
                    ref={measureRef}
                    style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }}
                    className="md-measurer"
                >
                    <ReactMarkdown
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                        components={components}
                    >
                        {markdown}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
});

Preview.displayName = 'Preview';

export default Preview;
