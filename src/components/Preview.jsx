import { forwardRef, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './Preview.css';

const Preview = forwardRef(({ markdown, columns, fontSize, padding, gap, scale }, ref) => {
    const measureRef = useRef(null);
    const pagesContainerRef = useRef(null);

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

    useEffect(() => {
        const measureEl = measureRef.current;
        if (!measureEl) return;

        // Compute column width/height in px based on A4 landscape and current paddings/gaps
        const pageWidthPx = mmToPx(297);
        const pageHeightPx = mmToPx(210);
        const paddingPx = mmToPx(padding);
        const gapPx = mmToPx(gap);
        const contentWidthPx = pageWidthPx - paddingPx * 2;
        const totalPaddingPx = gapPx * columns; // Total padding for all columns
        const columnWidthPx = (contentWidthPx - totalPaddingPx) / columns;
        const columnHeightPx = pageHeightPx - paddingPx * 2;

        // Prepare measurer styles
        measureEl.style.width = `${columnWidthPx - gapPx}px`;
        measureEl.style.fontSize = `${fontSize}pt`;
        measureEl.style.paddingLeft = `${gap/2}mm`;
        measureEl.style.paddingRight = `${gap/2}mm`;

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
            page.style.fontSize = `${fontSize}pt`;
            page.style.padding = `${padding}mm`;

            const grid = document.createElement('div');
            grid.className = 'page-columns';
            grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
            grid.style.gap = '0mm'; // Remove gap as we'll use padding instead

            const cols = [];
            for (let i = 0; i < columns; i++) {
                const col = document.createElement('div');
                col.className = 'page-column';
                col.style.height = `${columnHeightPx}px`;
                col.style.paddingLeft = `${gap/2}mm`;
                col.style.paddingRight = `${gap/2}mm`;
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
    }, [markdown, columns, fontSize, padding, gap]);

    return (
        <div className="preview">
            <div className="preview-header">
                <span className="preview-title">PDF Preview</span>
                <span className="preview-info">
                    {columns} columns · {fontSize}pt · {padding}mm pad · {gap}mm gap
                </span>
            </div>
            <div className="preview-content">
                <div
                    className="preview-scaler"
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        zoom: scale,
                        minWidth: '297mm',
                        minHeight: '210mm'
                    }}
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
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                            h1: (props) => <h1 className="md-h1" {...props} />,
                            h2: (props) => <h2 className="md-h2" {...props} />,
                            h3: (props) => <h3 className="md-h3" {...props} />,
                            h4: (props) => <h4 className="md-h4" {...props} />,
                            h5: (props) => <h5 className="md-h5" {...props} />,
                            h6: (props) => <h6 className="md-h6" {...props} />,
                            p: (props) => <p className="md-p" {...props} />,
                            ul: (props) => <ul className="md-ul" {...props} />,
                            ol: (props) => <ol className="md-ol" {...props} />,
                            li: (props) => <li className="md-li" {...props} />,
                            code: ({ inline, ...props }) =>
                                inline ?
                                    <code className="md-code-inline" {...props} /> :
                                    <code className="md-code-block" {...props} />,
                            pre: (props) => <pre className="md-pre" {...props} />,
                            blockquote: (props) => <blockquote className="md-blockquote" {...props} />,
                            table: (props) => <table className="md-table" {...props} />,
                            thead: (props) => <thead className="md-thead" {...props} />,
                            tbody: (props) => <tbody className="md-tbody" {...props} />,
                            tr: (props) => <tr className="md-tr" {...props} />,
                            th: (props) => <th className="md-th" {...props} />,
                            td: (props) => <td className="md-td" {...props} />,
                            a: (props) => <a className="md-link" {...props} />,
                            strong: (props) => <strong className="md-strong" {...props} />,
                            em: (props) => <em className="md-em" {...props} />,
                            hr: (props) => <hr className="md-hr" {...props} />,
                        }}
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
