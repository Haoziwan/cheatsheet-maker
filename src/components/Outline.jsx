import { useMemo } from 'react';
import './Outline.css';

const Outline = ({ markdown, onHeadingClick }) => {
  // 解析Markdown标题
  const headings = useMemo(() => {
    if (!markdown) return [];
    
    const lines = markdown.split('\n');
    const headingRegex = /^(#{1,6})\s+(.+?)(?:\s+#*)?$/;
    const headings = [];
    
    lines.forEach((line, index) => {
      const match = line.match(headingRegex);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        headings.push({
          id: `heading-${index}`,
          level,
          text,
          lineNumber: index + 1
        });
      }
    });
    
    return headings;
  }, [markdown]);

  return (
    <div className="outline-panel">
      <div className="outline-header">
        <h3>Outline</h3>
      </div>
      <div className="outline-content">
        {headings.length > 0 ? (
          <ul className="outline-list">
            {headings.map((heading) => (
              <li 
                key={heading.id}
                className={`outline-item outline-item-level-${heading.level}`}
                onClick={() => onHeadingClick(heading.lineNumber)}
              >
                <span className="outline-text">{heading.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="outline-empty">No headings found</p>
        )}
      </div>
    </div>
  );
};

export default Outline;