import { Download, Github, Settings, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Toolbar.css';

function Toolbar({
    columns, setColumns,
    fontSize, setFontSize,
    padding, setPadding,
    gap, setGap,
    scale, setScale,
    previewRef
}) {
    const handleExportPDF = async () => {
        if (!previewRef.current) return;

        try {
            const pagesContainer = previewRef.current;
            const scalerElement = pagesContainer.parentElement;

            // 保存当前的zoom值并临时移除
            const originalZoom = scalerElement.style.zoom;
            scalerElement.style.zoom = '1';

            // 等待浏览器重新渲染
            await new Promise(resolve => setTimeout(resolve, 100));

            // Collect page elements
            const pageElements = pagesContainer.querySelectorAll('.preview-page');

            // Create PDF (landscape)
            const pdf = new jsPDF('l', 'mm', 'a4');

            // Render each page to canvas and add to PDF
            for (let i = 0; i < pageElements.length; i++) {
                const pageEl = pageElements[i];
                const canvas = await html2canvas(pageEl, {
                    scale: 4,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: pageEl.scrollWidth,
                    windowHeight: pageEl.scrollHeight
                });

                const imgWidthMM = 297;
                const imgHeightMM = 210;
                const imgData = canvas.toDataURL('image/png');

                if (i > 0) pdf.addPage('a4', 'l');
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMM, imgHeightMM);
            }

            // 恢复原来的zoom值
            scalerElement.style.zoom = originalZoom;

            pdf.save('cheatsheet.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    return (
        <div className="toolbar">
            <div className="toolbar-left">
                <div className="toolbar-brand">
                    <a href="https://github.com/Haoziwan/cheatsheet-maker" target="_blank" rel="noopener noreferrer">
                        <Github size={20} />
                    </a>
                    <h1>cheatsheet maker</h1>
                </div>
            </div>

            <div className="toolbar-center">
                <div className="toolbar-control">
                    <label className="label">Columns</label>
                    <input
                        type="number"
                        min="1"
                        max="6"
                        value={columns}
                        onChange={(e) => setColumns(Number(e.target.value))}
                        className="number-input"
                    />
                </div>

                <div className="toolbar-control">
                    <label className="label">Font (pt)</label>
                    <input
                        type="number"
                        min="6"
                        max="16"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="number-input"
                    />
                </div>

                <div className="toolbar-control">
                    <label className="label">Padding (mm)</label>
                    <input
                        type="number"
                        min="0"
                        max="50"
                        value={padding}
                        onChange={(e) => setPadding(Number(e.target.value))}
                        className="number-input"
                    />
                </div>

                <div className="toolbar-control">
                    <label className="label">Gap (mm)</label>
                    <input
                        type="number"
                        min="0"
                        max="20"
                        value={gap}
                        onChange={(e) => setGap(Number(e.target.value))}
                        className="number-input"
                    />
                </div>

                <div className="toolbar-control zoom-control">
                    <button className="icon-btn" onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} title="Zoom Out">
                        <ZoomOut size={16} />
                    </button>
                    <span className="zoom-label">{Math.round(scale * 100)}%</span>
                    <button className="icon-btn" onClick={() => setScale(s => Math.min(s + 0.1, 3))} title="Zoom In">
                        <ZoomIn size={16} />
                    </button>
                    <button className="icon-btn" onClick={() => setScale(1)} title="Reset Zoom">
                        <RotateCcw size={14} />
                    </button>
                </div>
            </div>

            <div className="toolbar-right">
                <button
                    className="btn btn-primary"
                    onClick={handleExportPDF}
                >
                    <Download size={16} />
                    Export PDF
                </button>
            </div>
        </div>
    );
}

export default Toolbar;
