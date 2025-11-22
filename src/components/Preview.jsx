import { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './Preview.css';

const Preview = forwardRef(({ markdown, columns, fontSize }, ref) => {
    return (
        <div className="preview">
            <div className="preview-header">
                <span className="preview-title">PDF Preview</span>
                <span className="preview-info">
                    {columns} columns · {fontSize}pt
                </span>
            </div>
            <div className="preview-content">
                <div
                    ref={ref}
                    className="preview-page"
                    style={{
                        columnCount: columns,
                        fontSize: `${fontSize}pt`,
                    }}
                >
                    <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                            h1: ({ node, ...props }) => <h1 className="md-h1" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="md-h2" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="md-h3" {...props} />,
                            h4: ({ node, ...props }) => <h4 className="md-h4" {...props} />,
                            h5: ({ node, ...props }) => <h5 className="md-h5" {...props} />,
                            h6: ({ node, ...props }) => <h6 className="md-h6" {...props} />,
                            p: ({ node, ...props }) => <p className="md-p" {...props} />,
                            ul: ({ node, ...props }) => <ul className="md-ul" {...props} />,
                            ol: ({ node, ...props }) => <ol className="md-ol" {...props} />,
                            li: ({ node, ...props }) => <li className="md-li" {...props} />,
                            code: ({ node, inline, ...props }) =>
                                inline ?
                                    <code className="md-code-inline" {...props} /> :
                                    <code className="md-code-block" {...props} />,
                            pre: ({ node, ...props }) => <pre className="md-pre" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="md-blockquote" {...props} />,
                            table: ({ node, ...props }) => <table className="md-table" {...props} />,
                            thead: ({ node, ...props }) => <thead className="md-thead" {...props} />,
                            tbody: ({ node, ...props }) => <tbody className="md-tbody" {...props} />,
                            tr: ({ node, ...props }) => <tr className="md-tr" {...props} />,
                            th: ({ node, ...props }) => <th className="md-th" {...props} />,
                            td: ({ node, ...props }) => <td className="md-td" {...props} />,
                            a: ({ node, ...props }) => <a className="md-link" {...props} />,
                            strong: ({ node, ...props }) => <strong className="md-strong" {...props} />,
                            em: ({ node, ...props }) => <em className="md-em" {...props} />,
                            hr: ({ node, ...props }) => <hr className="md-hr" {...props} />,
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
