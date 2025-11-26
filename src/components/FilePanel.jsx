import { useState, useEffect } from 'react';
import { File, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import './FilePanel.css';

function FilePanel({ isOpen, onClose, currentFile, onFileChange, onNewFile, markdown }) {
    const [files, setFiles] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');

    // 从 localStorage 加载文件列表（每次打开面板时重新加载）
    useEffect(() => {
        if (!isOpen) return;

        const savedFiles = localStorage.getItem('cheatsheet_files');
        if (savedFiles) {
            try {
                const parsedFiles = JSON.parse(savedFiles);
                // 按更新时间排序，最新的在最上面
                const sortedFiles = parsedFiles.sort((a, b) =>
                    new Date(b.updatedAt) - new Date(a.updatedAt)
                );
                setFiles(sortedFiles);
                console.log('Loaded files:', sortedFiles.map(f => ({ name: f.name, contentLength: f.content.length, updatedAt: f.updatedAt })));
            } catch (e) {
                console.error('Failed to parse saved files:', e);
                setFiles([]);
            }
        } else {
            // 如果没有保存的文件，创建一个默认文件
            const defaultFile = {
                id: Date.now(),
                name: 'Untitled',
                content: markdown,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            setFiles([defaultFile]);
            localStorage.setItem('cheatsheet_files', JSON.stringify([defaultFile]));
        }
    }, [isOpen]);

    // 保存文件列表到 localStorage
    const saveFiles = (updatedFiles) => {
        setFiles(updatedFiles);
        localStorage.setItem('cheatsheet_files', JSON.stringify(updatedFiles));
    };

    // 创建新文件
    const handleNewFile = () => {
        const newFile = {
            id: Date.now(),
            name: 'Untitled',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const updatedFiles = [...files, newFile];
        saveFiles(updatedFiles);
        onNewFile(newFile);
    };

    // 删除文件
    const handleDeleteFile = (fileId) => {
        if (files.length === 1) {
            alert('Cannot delete the last file');
            return;
        }
        if (confirm('Are you sure you want to delete this file?')) {
            const updatedFiles = files.filter(file => file.id !== fileId);
            saveFiles(updatedFiles);

            // 如果删除的是当前文件，切换到第一个文件
            if (currentFile && currentFile.id === fileId) {
                onFileChange(updatedFiles[0]);
            }
        }
    };

    // 开始重命名
    const handleStartRename = (file) => {
        setEditingId(file.id);
        setEditingName(file.name);
    };

    // 确认重命名
    const handleConfirmRename = (fileId) => {
        if (!editingName.trim()) {
            alert('File name cannot be empty');
            return;
        }
        const updatedFiles = files.map(file =>
            file.id === fileId
                ? { ...file, name: editingName.trim() }
                : file
        );
        saveFiles(updatedFiles);
        setEditingId(null);
        setEditingName('');
    };

    // 取消重命名
    const handleCancelRename = () => {
        setEditingId(null);
        setEditingName('');
    };

    // 格式化日期
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="file-panel-overlay" onClick={onClose}></div>
            <div className="file-panel">
                <div className="file-panel-header">
                    <h2>Files</h2>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="file-panel-actions">
                    <button className="btn btn-primary" onClick={handleNewFile}>
                        <Plus size={16} />
                        New File
                    </button>
                </div>

                <div className="file-list">
                    {files.map(file => (
                        <div
                            key={file.id}
                            className={`file-item ${currentFile && currentFile.id === file.id ? 'active' : ''}`}
                        >
                            <div className="file-item-main" onClick={() => onFileChange(file)}>
                                <File size={16} className="file-icon" />
                                <div className="file-info">
                                    {editingId === file.id ? (
                                        <div className="file-name-edit">
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleConfirmRename(file.id);
                                                    } else if (e.key === 'Escape') {
                                                        handleCancelRename();
                                                    }
                                                }}
                                                autoFocus
                                            />
                                            <button
                                                className="btn-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleConfirmRename(file.id);
                                                }}
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCancelRename();
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="file-name">{file.name}</div>
                                            <div className="file-meta">
                                                Updated: {formatDate(file.updatedAt)}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            {editingId !== file.id && (
                                <div className="file-actions">
                                    <button
                                        className="btn-icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartRename(file);
                                        }}
                                        title="Rename"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        className="btn-icon btn-danger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteFile(file.id);
                                        }}
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default FilePanel;
