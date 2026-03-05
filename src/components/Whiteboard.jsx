/* Architect: Yuvraj Chopra | DeepDesk Pro */
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Footer from './Footer.jsx';

function Whiteboard({ onMaximize, isMaximized, onMinimize, canvasDataRef, index }) {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokeColor, setStrokeColor] = useState('#00f0ff');
    const [brushSize, setBrushSize] = useState(3);

    const initializeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const parentRect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        if (isMaximized) {
            canvas.width = window.innerWidth * dpr;
            canvas.height = (window.innerHeight - 60) * dpr;
        } else {
            canvas.width = parentRect.width * dpr;
            canvas.height = 280 * dpr;
        }

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctxRef.current = ctx;

        if (canvasDataRef?.current?.imageData) {
            ctx.putImageData(canvasDataRef.current.imageData, 0, 0);
        }
    }, [isMaximized, canvasDataRef]);

    useEffect(() => {
        initializeCanvas();
        window.addEventListener('resize', initializeCanvas);
        return () => window.removeEventListener('resize', initializeCanvas);
    }, [initializeCanvas]);

    const captureCanvasData = useCallback(() => {
        if (ctxRef.current && canvasRef.current && canvasDataRef) {
            canvasDataRef.current = {
                imageData: ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height),
            };
        }
    }, [canvasDataRef]);

    const getPointerPos = useCallback((e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }, []);

    const handleMouseDown = useCallback(
        (e) => {
            e.preventDefault();
            const ctx = ctxRef.current;
            if (!ctx) return;
            const pos = getPointerPos(e);
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = brushSize;
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            setIsDrawing(true);
        },
        [strokeColor, brushSize, getPointerPos]
    );

    const handleMouseMove = useCallback(
        (e) => {
            if (!isDrawing) return;
            e.preventDefault();
            const ctx = ctxRef.current;
            if (!ctx) return;
            const pos = getPointerPos(e);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        },
        [isDrawing, getPointerPos]
    );

    const handleMouseUp = useCallback(() => {
        setIsDrawing(false);
        if (ctxRef.current) ctxRef.current.closePath();
        captureCanvasData();
    }, [captureCanvasData]);

    const handleClear = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (canvasDataRef) canvasDataRef.current = null;
    }, [canvasDataRef]);

    const presetColors = ['#00f0ff', '#00ff88', '#a855f7', '#ff6b35', '#ff3b5c', '#ffd700', '#ffffff'];

    return (
        <>
            <motion.section
                layoutId={!isMaximized ? `whiteboard-${index}` : undefined}
                className={`card ${isMaximized ? 'card-maximized' : ''}`}
                id="whiteboard-panel"
                initial={!isMaximized ? { opacity: 0, y: 20 } : { opacity: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: !isMaximized ? index * 0.1 : 0 }}
            >
                <header className="card-header">
                    <h2 className="card-title">
                        <span>🎨</span> Architecture Whiteboard
                    </h2>
                    <div className="card-controls">
                        <span className="card-badge badge-orange">Canvas</span>
                        <button
                            className={`btn-maximize ${isMaximized ? 'hidden' : ''}`}
                            onClick={() => { captureCanvasData(); onMaximize(); }}
                            aria-label="Maximize whiteboard"
                        >
                            ⛶
                        </button>
                        <button
                            className={`btn-minimize ${!isMaximized ? 'hidden' : ''}`}
                            onClick={() => { captureCanvasData(); onMinimize(); }}
                            aria-label="Minimize whiteboard"
                        >
                            ⛶
                        </button>
                    </div>
                </header>

                <div className={`whiteboard-container ${isMaximized ? 'whiteboard-container-max' : ''}`}>
                    <div className="whiteboard-toolbar">
                        <label htmlFor="wb-color-picker">Color</label>
                        <input
                            type="color"
                            className="color-picker"
                            id="wb-color-picker"
                            value={strokeColor}
                            onChange={(e) => setStrokeColor(e.target.value)}
                        />
                        {presetColors.map((color) => (
                            <button
                                key={color}
                                className="btn-icon"
                                onClick={() => setStrokeColor(color)}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: color,
                                    border: strokeColor === color ? '2px solid var(--text-primary)' : '2px solid var(--border-default)',
                                    cursor: 'pointer',
                                    padding: 0,
                                    boxShadow: strokeColor === color ? `0 0 8px ${color}` : 'none',
                                    transition: 'all 150ms ease',
                                }}
                            />
                        ))}

                        <label htmlFor="wb-brush-size" style={{ marginLeft: 'auto' }}>
                            Size: {brushSize}px
                        </label>
                        <input
                            type="range"
                            className="brush-size-slider"
                            id="wb-brush-size"
                            min="1"
                            max="20"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                        />

                        <button
                            className="btn btn-danger btn-icon"
                            onClick={handleClear}
                            aria-label="Clear canvas"
                        >
                            🗑
                        </button>
                    </div>

                    <div className="canvas-wrapper">
                        <canvas
                            ref={canvasRef}
                            className="whiteboard-canvas"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleMouseDown}
                            onTouchMove={handleMouseMove}
                            onTouchEnd={handleMouseUp}
                        />
                    </div>
                </div>
            </motion.section>
            {isMaximized && <Footer />}
        </>
    );
}

export default Whiteboard;
