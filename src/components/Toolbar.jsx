import { Download, Github } from 'lucide-react';
import './Toolbar.css';

function Toolbar({
    columns, setColumns,
    fontSize, setFontSize,
    padding, setPadding,
    gap, setGap,
    lineHeight, setLineHeight,
    previewRef
}) {
    const handleExportPDF = () => {
        // Trigger browser print dialog
        // The @media print styles in Preview.css will handle the layout
        // to ensure only the preview pages are printed in A4 landscape
        window.print();
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

                <div className="toolbar-control">
                    <label className="label">Line Height</label>
                    <input
                        type="number"
                        min="0.8"
                        max="2.5"
                        step="0.1"
                        value={lineHeight}
                        onChange={(e) => setLineHeight(Number(e.target.value))}
                        className="number-input"
                    />
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
