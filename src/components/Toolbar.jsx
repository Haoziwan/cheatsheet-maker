import { Download, Github, RectangleHorizontal, RectangleVertical, RotateCcw } from 'lucide-react';
import themes from '../styles/themes';
import fonts from '../styles/fonts';
import './Toolbar.css';

function Toolbar({
    columns, setColumns,
    fontSize, setFontSize,
    padding, setPadding,
    gap, setGap,
    lineHeight, setLineHeight,
    orientation, setOrientation,
    theme, setTheme,
    fontFamily, setFontFamily,
    previewRef,
    // 添加reset功能所需的默认值
    defaultColumns,
    defaultFontSize,
    defaultPadding,
    defaultGap,
    defaultLineHeight,
    defaultOrientation,
    defaultTheme,
    defaultFontFamily
}) {
    const handleExportPDF = () => {
        // Trigger browser print dialog
        // The @media print styles in Preview.css will handle the layout
        // to ensure only the preview pages are printed in A4 landscape
        window.print();
    };

    // 添加reset功能
    const handleReset = () => {
        setColumns(defaultColumns);
        setFontSize(defaultFontSize);
        setPadding(defaultPadding);
        setGap(defaultGap);
        setLineHeight(defaultLineHeight);
        setOrientation(defaultOrientation);
        setTheme(defaultTheme);
        setFontFamily(defaultFontFamily);
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
                    <label className="label">Theme</label>
                    <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="select"
                    >
                        {Object.entries(themes).map(([key, themeData]) => (
                            <option key={key} value={key}>
                                {themeData.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="toolbar-control">
                    <label className="label">Font</label>
                    <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="select"
                    >
                        {Object.entries(fonts).map(([key, fontData]) => (
                            <option key={key} value={key}>
                                {fontData.name}
                            </option>
                        ))}
                    </select>
                </div>

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

                <div className="toolbar-control">
                    <label className="label">Orientation</label>
                    <div className="orientation-toggle">
                        <button
                            className={`icon-btn ${orientation === 'landscape' ? 'active' : ''}`}
                            onClick={() => setOrientation('landscape')}
                            title="Landscape"
                        >
                            <RectangleHorizontal size={18} />
                        </button>
                        <button
                            className={`icon-btn ${orientation === 'portrait' ? 'active' : ''}`}
                            onClick={() => setOrientation('portrait')}
                            title="Portrait"
                        >
                            <RectangleVertical size={18} />
                        </button>
                    </div>
                </div>

                <button
                    className="btn btn-secondary btn-reset"
                    onClick={handleReset}
                    title="Reset to default settings"
                >
                    <RotateCcw size={16} />
                </button>
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