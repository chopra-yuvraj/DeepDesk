/* Developed by Yuvraj Chopra | DeepDesk Hub */
import { useRef, useState, useEffect, useCallback } from 'react';

function Whiteboard() {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokeColor, setStrokeColor] = useState('#00f0ff');
    const [brushSize, setBrushSize] = useState(3);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            const imageData = ctxRef.current
                ? ctxRef.current.getImageData(0, 0, canvas.width, canvas.height)
                : null;

            canvas.width = rect.width * dpr;
            canvas.height = 350 * dpr;
            canvas.style.height = '350px';

            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctxRef.current = ctx;

            if (imageData) {
                ctx.putImageData(imageData, 0, 0);
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const getPointerPos = useCallback((e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
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
        if (ctxRef.current) {
            ctxRef.current.closePath();
        }
    }, []);

    const handleClear = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, []);

    const presetColors = ['#00f0ff', '#00ff88', '#a855f7', '#ff6b35', '#ff3b5c', '#ffd700', '#ffffff'];

    return (
        <section className="card" id="whiteboard-panel" aria-label="Architecture Whiteboard">
            <header className="card-header">
                <h2 className="card-title">
                    <span className="icon">🎨</span> Whiteboard
                </h2>
                <span className="card-badge badge-orange">Canvas</span>
            </header>

            <div className="whiteboard-container">
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
                            aria-label={`Set color to ${color}`}
                            style={{
                                width: '24px',
                                height: '24px',
                                minWidth: '24px',
                                minHeight: '24px',
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
                        id="wb-clear-btn"
                        aria-label="Clear canvas"
                        title="Clear canvas"
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
        </section>
    );
}

export default Whiteboard;
