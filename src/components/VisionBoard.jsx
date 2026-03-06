// src/components/VisionBoard.jsx
/* Architect: Yuvraj Chopra | DeepDesk Dynamic */
import { useCallback, useRef } from "react";
import { motion } from "framer-motion";

export default function VisionBoard({
  images,
  setImages,
  isMaximized,
  onMaximize,
}) {
  const dropZoneRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            src: event.target.result,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, [setImages]);

  const handleRemoveImage = useCallback(
    (id) => {
      setImages((prev) => prev.filter((img) => img.id !== id));
    },
    [setImages]
  );

  const handleClear = useCallback(() => {
    setImages([]);
  }, [setImages]);

  return (
    <motion.div
      className={`visionboard-container ${isMaximized ? "visionboard-maximized" : ""}`}
      initial={!isMaximized ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="visionboard-header-section">
        <h2 className="visionboard-title">Vision Board</h2>
        {!isMaximized && (
          <button
            className="visionboard-expand-btn"
            onClick={onMaximize}
            aria-label="Expand vision board"
          >
            ⤢
          </button>
        )}
      </div>

      <div className="visionboard-dropzone" ref={dropZoneRef} onDragOver={handleDragOver} onDrop={handleDrop}>
        <div className="visionboard-dropzone-content">
          <p>Drag and drop images here</p>
          <span style={{ fontSize: "12px", opacity: 0.6 }}>
            or click to select files
          </span>
        </div>
      </div>

      {images.length > 0 && (
        <>
          <div className="visionboard-grid">
            {images.map((image) => (
              <motion.div
                key={image.id}
                className="visionboard-grid-item"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <img src={image.src} alt={image.name} />
                <motion.button
                  className="visionboard-remove-btn"
                  onClick={() => handleRemoveImage(image.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </motion.div>
            ))}
          </div>

          <motion.button
            className="visionboard-clear-all-btn"
            onClick={handleClear}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear All
          </motion.button>
        </>
      )}
    </motion.div>
  );
}
