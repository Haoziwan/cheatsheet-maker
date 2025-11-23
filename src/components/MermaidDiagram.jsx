import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with configuration
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'inherit',
    fontSize: 12,
});

const MermaidDiagram = ({ chart, dataLine, onRender }) => {
    const elementRef = useRef(null);
    const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        if (elementRef.current && chart) {
            const renderDiagram = async () => {
                try {
                    // Clear previous content
                    elementRef.current.innerHTML = '';

                    // Render the diagram
                    const { svg } = await mermaid.render(idRef.current, chart);
                    elementRef.current.innerHTML = svg;
                    if (onRender) onRender();
                } catch (error) {
                    console.error('Mermaid rendering error:', error);
                    elementRef.current.innerHTML = `<div style="color: red; padding: 8px; border: 1px solid red; border-radius: 4px; font-size: 0.85em;">
                        <strong>Mermaid Error:</strong><br/>
                        ${error.message || 'Failed to render diagram'}
                    </div>`;
                    if (onRender) onRender();
                }
            };

            renderDiagram();
        }
    }, [chart, onRender]);

    return (
        <div
            ref={elementRef}
            className="mermaid-diagram"
            data-line={dataLine}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0.8em 0',
                padding: '0.5em',
            }}
        />
    );
};

export default MermaidDiagram;
