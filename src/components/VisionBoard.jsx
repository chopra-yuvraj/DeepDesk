/* Architect: Yuvraj Chopra | DeepDesk Pro */
import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Footer from './Footer.jsx';

function VisionBoard({ onMaximize, isMaximized, onMinimize, index }) {
    const [images, setImages] = useState([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const dropZoneRef = useRef(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImages(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    src: event.target.result,
                    name: file.name
                }]);
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const handleRemoveImage = useCallback((id) => {
        setImages(prev => prev.filter(img => img.id !== id));
    }, []);

    const handleClear = useCallback(() => {
        setImages([]);
    }, []);

    return (
        <>
            <motion.section
                layoutId={!isMaximized ? `visionboard-${index}` : undefined}
                className={`card ${isMaximized ? 'card-maximized' : ''}`}
                id="visionboard-panel"
                initial={!isMaximized ? { opacity: 0, y: 20 } : { opacity: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: !isMaximized ? index * 0.1 : 0 }}
            >
                <header className="card-header">
                    <h2 className="card-title">
                        <span>🎯</span> Vision Board
                    </h2>
                    <div className="card-controls">
                        <span className="card-badge badge-yellow">{images.length} Images</span>
                        <button
                            className={`btn-maximize ${isMaximized ? 'hidden' : ''}`}
                            onClick={onMaximize}
                            aria-label="Maximize vision board"
                        >
                            ⛶
                        </button>
                        <button
                            className={`btn-minimize ${!isMaximized ? 'hidden' : ''}`}
                            onClick={onMinimize}
                            aria-label="Minimize vision board"
                        >
                            ⛶
                        </button>
                    </div>
                </header>

                <div className={`visionboard-container ${isMaximized ? 'visionboard-container-max' : ''}`}>
                    <div
                        ref={dropZoneRef}
                        className={`visionboard-dropzone ${isDraggingOver ? 'dragging' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="dropzone-content">
                            <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</span>
                            <p>Drag and drop images here</p>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                or paste images from clipboard
                            </span>
                        </div>
                    </div>

                    {images.length > 0 && (
                        <>
                            <div className="visionboard-grid">
                                {images.map((image) => (
                                    <motion.div
                                        key={image.id}
                                        className="visionboard-item"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <img src={image.src} alt={image.name} />
                                        <button
                                            className="visionboard-remove"
                                            onClick={() => handleRemoveImage(image.id)}
                                            aria-label={`Remove ${image.name}`}
                                        >
                                            ✕
                                        </button>
                                    </motion.div>
                                ))}
                            </div>

                            <button
                                className="btn btn-danger"
                                onClick={handleClear}
                                style={{ width: '100%', marginTop: '1rem' }}
                            >
                                Clear All
                            </button>
                        </>
                    )}
                </div>
            </motion.section>
            {isMaximized && <Footer />}
        </>
    );
}

export default VisionBoard;