import { Download, FileText, Settings } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Toolbar.css';

function Toolbar({ columns, setColumns, fontSize, setFontSize, previewRef }) {
    const handleExportPDF = async () => {
        if (!previewRef.current) return;

        try {
            const previewElement = previewRef.current;

            // Capture the preview as canvas
            const canvas = await html2canvas(previewElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // Calculate PDF dimensions (A4)
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Create PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
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
                    <FileText size={20} />
                    <h1>Markdown Cheatsheet</h1>
                </div>
            </div>

            <div className="toolbar-center">
                <div className="toolbar-control">
                    <label className="label">Columns</label>
                    <select
                        className="select"
                        value={columns}
                        onChange={(e) => setColumns(Number(e.target.value))}
                    >
                        <option value={2}>2 Columns</option>
                        <option value={3}>3 Columns</option>
                        <option value={4}>4 Columns</option>
                        <option value={5}>5 Columns</option>
                        <option value={6}>6 Columns</option>
                    </select>
                </div>

                <div className="toolbar-control">
                    <label className="label">Font Size</label>
                    <select
                        className="select"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                    >
                        <option value={6}>6pt</option>
                        <option value={7}>7pt</option>
                        <option value={8}>8pt</option>
                        <option value={9}>9pt</option>
                        <option value={10}>10pt</option>
                        <option value={11}>11pt</option>
                        <option value={12}>12pt</option>
                    </select>
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
