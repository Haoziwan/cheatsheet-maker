import { useState, useEffect } from 'react';
import imageStorage from '../utils/imageStorage';

const ImageRenderer = ({ src, alt, node, onLoad, onError, ...props }) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // 检查是否是我们的图片ID格式 (img-xxx)
    const isStoredImage = src && src.startsWith('img-');

    useEffect(() => {
        if (isStoredImage) {
            setLoading(true);
            imageStorage.getImage(src)
                .then(imageData => {
                    if (imageData && imageData.data) {
                        setImageSrc(imageData.data);
                        setError(false);
                        // 调用onLoad回调
                        if (onLoad) onLoad();
                    } else {
                        setError(true);
                        // 调用onError回调
                        if (onError) onError();
                    }
                })
                .catch(err => {
                    console.error('Failed to load image:', err);
                    setError(true);
                    // 调用onError回调
                    if (onError) onError();
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [src, isStoredImage, onLoad, onError]);

    if (loading && isStoredImage) {
        return (
            <span
                style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    background: '#f0f0f0',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#666'
                }}
            >
                加载图片中...
            </span>
        );
    }

    if (error || (!imageSrc && isStoredImage)) {
        return (
            <span
                style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    background: '#ffe6e6',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#d32f2f'
                }}
            >
                图片加载失败: {alt || src}
            </span>
        );
    }

    return (
        <img
            src={imageSrc}
            alt={alt}
            data-line={node?.position?.start?.line}
            style={{ maxWidth: '100%', height: 'auto' }}
            onLoad={onLoad}
            onError={onError}
            {...props}
        />
    );
};

export default ImageRenderer;
