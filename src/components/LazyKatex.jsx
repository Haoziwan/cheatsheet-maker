import React, { useState, useEffect, useRef, useMemo } from 'react';
import katex from 'katex';

const LazyKatex = ({ math, block = false, onRender, strategy = 'visible' }) => {
    // strategy: 'visible' (IntersectionObserver), 'async' (setTimeout), 'immediate' (render now)
    const [isVisible, setIsVisible] = useState(strategy === 'immediate');
    const containerRef = useRef(null);

    useEffect(() => {
        if (strategy === 'visible') {
            const observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) {
                        setIsVisible(true);
                        observer.disconnect();
                    }
                },
                { rootMargin: '200px' }
            );

            if (containerRef.current) {
                observer.observe(containerRef.current);
            }

            return () => observer.disconnect();
        } else if (strategy === 'async') {
            // Delay rendering to unblock main thread
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 10);
            return () => clearTimeout(timer);
        }
    }, [strategy]);

    const renderedHtml = useMemo(() => {
        if (!isVisible) return null;
        try {
            // Remove zero-width spaces and other potential invisible characters that KaTeX doesn't like
            const cleanMath = math ? math.replace(/[\u200B-\u200D\uFEFF]/g, '') : '';
            return katex.renderToString(cleanMath, {
                displayMode: block,
                throwOnError: false,
                strict: false
            });
        } catch (e) {
            console.error("Katex error:", e);
            return `<span class="error">Error rendering formula</span>`;
        }
    }, [math, block, isVisible]);

    // Notify parent when rendered
    useEffect(() => {
        if (isVisible && renderedHtml && onRender) {
            onRender();
        }
    }, [isVisible, renderedHtml, onRender]);

    const Container = block ? 'div' : 'span';

    if (!isVisible) {
        return (
            <Container
                ref={containerRef}
                className={block ? 'math-placeholder-block' : 'math-placeholder-inline'}
                style={{
                    opacity: 0.5,
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                    display: block ? 'block' : 'inline',
                    padding: '2px',
                    background: 'rgba(128,128,128,0.1)',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                }}
                title={math}
            >
                {block ? `$$ ${math} $$` : `$${math}$`}
            </Container>
        );
    }

    return (
        <Container
            ref={containerRef}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
            className={block ? 'katex-block' : 'katex-inline'}
        />
    );
};

export default React.memo(LazyKatex);
