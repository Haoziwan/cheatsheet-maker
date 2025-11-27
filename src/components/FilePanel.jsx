import { useState, useEffect } from 'react';
import { File, Plus, Trash2, Edit2, Check, X, Image, Copy, Link, Eye, Github } from 'lucide-react';
import imageStorage from '../utils/imageStorage';
import githubSync from '../utils/githubSync';
import SyncSettings from './SyncSettings';
import './FilePanel.css';

function FilePanel({ isOpen, onClose, currentFile, onFileChange, onNewFile, markdown, toolbarSettings }) {
    const [files, setFiles] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [images, setImages] = useState([]);
    const [showImages, setShowImages] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showSync, setShowSync] = useState(false);

    // 定义模板配置
    const templates = {
        note: {
            name: 'Note Template',
            description: 'Simple vertical layout with single column',
            toolbarSettings: {
                columns: 1,
                fontSize: 12,
                padding: 15,
                gap: 5,
                lineHeight: 1.5,
                orientation: 'portrait',
                theme: 'classic',
                fontFamily: 'inter'
            }
        },
        cheatsheet: {
            name: 'Cheatsheet Template',
            description: 'Default cheatsheet layout',
            toolbarSettings: {
                columns: 5,
                fontSize: 8,
                padding: 5,
                gap: 1,
                lineHeight: 1.2,
                orientation: 'landscape',
                theme: 'classic',
                fontFamily: 'inter'
            }
        }
    };

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
            const defaultToolbarSettings = {
                columns: 5,
                fontSize: 8,
                padding: 5,
                gap: 1,
                lineHeight: 1.2,
                orientation: 'landscape',
                theme: 'classic',
                fontFamily: 'inter'
            };

            const defaultFile = {
                id: Date.now(),
                name: 'Untitled',
                content: markdown,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                toolbarSettings: defaultToolbarSettings
            };
            setFiles([defaultFile]);
            localStorage.setItem('cheatsheet_files', JSON.stringify([defaultFile]));
        }
    }, [isOpen]);

    // 加载图片列表
    useEffect(() => {
        if (isOpen && showImages) {
            loadImages();
        }
    }, [isOpen, showImages]);

    const loadImages = async () => {
        try {
            const allImages = await imageStorage.getAllImages();
            setImages(allImages);
        } catch (error) {
            console.error('Failed to load images:', error);
        }
    };

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
            updatedAt: new Date().toISOString(),
            toolbarSettings: toolbarSettings || {
                columns: 5,
                fontSize: 8,
                padding: 5,
                gap: 1,
                lineHeight: 1.2,
                orientation: 'landscape',
                theme: 'classic',
                fontFamily: 'inter'
            }
        };
        const updatedFiles = [...files, newFile];
        saveFiles(updatedFiles);
        onNewFile(newFile);
    };

    // 基于模板创建新文件
    const handleCreateFromTemplate = (templateKey) => {
        const template = templates[templateKey];
        const newFile = {
            id: Date.now(),
            name: `${template.name}`,
            content: '', // 模板不保存内容
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            toolbarSettings: { ...template.toolbarSettings }
        };
        const updatedFiles = [...files, newFile];
        saveFiles(updatedFiles);
        onNewFile(newFile);
        setShowTemplates(false); // 创建后关闭模板选择界面
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

    // 删除图片
    const handleDeleteImage = async (imageId) => {
        if (confirm('Are you sure you want to delete this image?')) {
            try {
                await imageStorage.deleteImage(imageId);
                setImages(images.filter(img => img.id !== imageId));
                if (previewImage && previewImage.id === imageId) {
                    setPreviewImage(null);
                }
            } catch (error) {
                console.error('Failed to delete image:', error);
                alert('Failed to delete image');
            }
        }
    };

    // 复制图片链接
    const handleCopyLink = (imageId) => {
        const link = `![image](${imageId})`;
        navigator.clipboard.writeText(link).then(() => {
            alert('Image link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy link:', err);
            alert('Failed to copy link');
        });
    };

    // 预览图片
    const handlePreviewImage = async (image) => {
        setPreviewImage(image);
    };

    // 关闭预览
    const handleClosePreview = () => {
        setPreviewImage(null);
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

    const handlePushFiles = async (token, owner, repo) => {
        // 1. Upload index file (metadata)
        const indexContent = JSON.stringify(files.map(f => ({
            id: f.id,
            name: f.name,
            createdAt: f.createdAt,
            updatedAt: f.updatedAt,
            toolbarSettings: f.toolbarSettings
        })), null, 2);

        await githubSync.uploadFile(token, owner, repo, 'files.json', indexContent, 'Update file index');

        // 2. Upload each file content
        for (const file of files) {
            const filename = `content/${file.id}.md`;
            await githubSync.uploadFile(token, owner, repo, filename, file.content, `Update ${file.name}`);
        }
    };

    const handlePullFiles = async (token, owner, repo) => {
        // 1. Get index file
        const indexContent = await githubSync.getFileContent(token, owner, repo, 'files.json');
        if (!indexContent) {
            throw new Error('No files found in repository');
        }

        const remoteFiles = JSON.parse(indexContent);
        const mergedFiles = [...files];
        let updatedCount = 0;

        // 2. Merge files
        for (const remoteFile of remoteFiles) {
            const localFileIndex = mergedFiles.findIndex(f => f.id === remoteFile.id);
            const localFile = mergedFiles[localFileIndex];

            // Determine if we should update (if local doesn't exist or remote is newer)
            // For simplicity in "Restore" scenario, we can just overwrite if remote exists
            // But let's check timestamps to be safe, or just overwrite if it's a "Pull" action

            let shouldUpdate = false;
            if (!localFile) {
                shouldUpdate = true;
            } else {
                const remoteDate = new Date(remoteFile.updatedAt);
                const localDate = new Date(localFile.updatedAt);
                if (remoteDate > localDate) {
                    shouldUpdate = true;
                }
            }

            if (shouldUpdate) {
                const content = await githubSync.getFileContent(token, owner, repo, `content/${remoteFile.id}.md`);
                if (content !== null) {
                    const newFile = {
                        ...remoteFile,
                        content: content
                    };

                    if (localFileIndex !== -1) {
                        mergedFiles[localFileIndex] = newFile;
                    } else {
                        mergedFiles.push(newFile);
                    }
                    updatedCount++;
                }
            }
        }

        if (updatedCount > 0) {
            // Sort by updated time
            mergedFiles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            saveFiles(mergedFiles);

            // If current file was updated, refresh it
            if (currentFile) {
                const updatedCurrent = mergedFiles.find(f => f.id === currentFile.id);
                if (updatedCurrent && updatedCurrent.updatedAt !== currentFile.updatedAt) {
                    onFileChange(updatedCurrent);
                }
            }

            alert(`Successfully pulled ${updatedCount} files from GitHub.`);
        } else {
            alert('Local files are already up to date.');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="file-panel-overlay" onClick={onClose}></div>
            <div className="file-panel">
                <div className="file-panel-header">
                    <div className="file-panel-header-content">
                        <h2>{showImages ? 'Images' : 'Files'}</h2>
                    </div>
                    <div className="header-actions">
                        <button className="btn-icon" onClick={() => setShowSync(true)} title="Sync to GitHub">
                            <Github size={20} />
                        </button>
                        <button className="btn-close" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="file-panel-actions">
                    {!showImages && !showTemplates ? (
                        <>
                            <button className="btn btn-primary" onClick={handleNewFile}>
                                <Plus size={16} />
                                New File
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowTemplates(true)}>
                                <Plus size={16} />
                                Template
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowImages(true)}>
                                <Image size={16} />
                                Images
                            </button>
                        </>
                    ) : showTemplates ? (
                        <button className="btn btn-secondary" onClick={() => setShowTemplates(false)}>
                            <File size={16} />
                            Back to Files
                        </button>
                    ) : (
                        <button className="btn btn-secondary" onClick={() => setShowImages(false)}>
                            <File size={16} />
                            Back to Files
                        </button>
                    )}
                </div>

                <div className="file-list">
                    {!showImages && !showTemplates ? (
                        files.map(file => (
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
                        ))
                    ) : showTemplates ? (
                        Object.entries(templates).map(([key, template]) => (
                            <div
                                key={key}
                                className="file-item template-item"
                                onClick={() => handleCreateFromTemplate(key)}
                            >
                                <div className="file-item-main">
                                    <File size={16} className="file-icon" />
                                    <div className="file-info">
                                        <div className="file-name">{template.name}</div>
                                        <div className="file-meta">
                                            {template.description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        images.map(image => (
                            <div key={image.id} className="file-item">
                                <div className="file-item-main">
                                    <Image size={16} className="file-icon" />
                                    <div className="file-info">
                                        <div className="file-name">{image.name}</div>
                                        <div className="file-meta">
                                            Added: {formatDate(new Date(image.timestamp).toISOString())}
                                        </div>
                                    </div>
                                </div>
                                <div className="file-actions">
                                    <button
                                        className="btn-icon"
                                        onClick={() => handlePreviewImage(image)}
                                        title="Preview"
                                    >
                                        <Eye size={14} />
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleCopyLink(image.id)}
                                        title="Copy Link"
                                    >
                                        <Link size={14} />
                                    </button>
                                    <button
                                        className="btn-icon btn-danger"
                                        onClick={() => handleDeleteImage(image.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 图片预览模态框 */}
            {previewImage && (
                <div className="image-preview-overlay" onClick={handleClosePreview}>
                    <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
                        <div className="image-preview-header">
                            <h3>{previewImage.name}</h3>
                            <button className="btn-close" onClick={handleClosePreview}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="image-preview-content">
                            <img src={previewImage.data} alt={previewImage.name} />
                        </div>
                    </div>
                </div>
            )}

            <SyncSettings
                isOpen={showSync}
                onClose={() => setShowSync(false)}
                onPush={handlePushFiles}
                onPull={handlePullFiles}
            />
        </>
    );
}

export default FilePanel;