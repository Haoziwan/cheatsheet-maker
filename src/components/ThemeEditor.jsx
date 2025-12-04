import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import './ThemeEditor.css';

function ThemeEditor({ isOpen, onClose, theme, themeKey, onSave, originalTheme }) {
    const [code, setCode] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (theme) {
            setCode(JSON.stringify(theme, null, 4));
        }
    }, [theme]);

    const handleSave = () => {
        try {
            const parsedTheme = JSON.parse(code);
            // Basic validation
            if (!parsedTheme.name || !parsedTheme.styles) {
                throw new Error('Theme must have a name and styles object');
            }
            onSave(themeKey, parsedTheme);
            onClose();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleReset = () => {
        // Reset to original theme if available, otherwise use current theme
        const themeToReset = originalTheme || theme;
        if (themeToReset) {
            setCode(JSON.stringify(themeToReset, null, 4));
            setError(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="theme-editor-overlay">
            <div className="theme-editor-modal">
                <div className="theme-editor-header">
                    <h3>Edit Theme: {theme?.name || themeKey}</h3>
                    <button className="icon-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="theme-editor-content">
                    <textarea
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value);
                            setError(null);
                        }}
                        className="theme-code-editor"
                        spellCheck="false"
                    />
                    {error && <div className="theme-editor-error">{error}</div>}
                </div>
                <div className="theme-editor-footer">
                    <button className="btn btn-secondary" onClick={handleReset}>
                        <RotateCcw size={16} /> Reset
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        <Save size={16} /> Save & Apply
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ThemeEditor;
