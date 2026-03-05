// src/components/Whiteboard.jsx
/* Built By: Yuvraj Chopra | DeepDesk Minimal */
import { useRef, useEffect, useState, useCallback } from "react";

export default function Whiteboard({
  canvasData,
  setCanvasData,
  isMaximized,
  onMaximize,
  onMinimize,
}) {
  const canvasRef = useRef();
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#00f0ff");
  const [size, setSize] = useState(3);

  // Initialize canvas with saved data
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    // Set canvas resolution
    canvas.width = Math.floor(canvas.offsetWidth * dpr);
    canvas.height = Math.floor(canvas.offsetHeight * dpr);
    ctx.scale(dpr, dpr);

    // Restore canvas data if available
    if (canvasData && canvasData.imageData) {
      const imgData = new ImageData(
        new Uint8ClampedArray(canvasData.imageData),
        canvasData.width,
        canvasData.height
      );
      ctx.putImageData(imgData, 0, 0);
    }
  }, [canvasData, isMaximized]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Save current canvas data
      const dpr = window.devicePixelRatio || 1;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Resize canvas
      canvas.width = Math.floor(canvas.offsetWidth * dpr);
      canvas.height = Math.floor(canvas.offsetHeight * dpr);
      ctx.scale(dpr, dpr);

      // Restore canvas data
      ctx.putImageData(imageData, 0, 0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save canvas data when unmounting or on changes
  useEffect(() => {
    return () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setCanvasData({
        width: canvas.width,
        height: canvas.height,
        imageData: Array.from(imageData.data),
      });
    };
  }, [setCanvasData]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (e.touches) {
      return [
        (e.touches[0].clientX - rect.left) * dpr,
        (e.touches[0].clientY - rect.top) * dpr,
      ];
    }
    return [
      (e.clientX - rect.left) * dpr,
      (e.clientY - rect.top) * dpr,
    ];
  };

  const startDraw = (e) => {
    setDrawing(true);
    const [x, y] = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawing) return;
    const [x, y] = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const endDraw = () => {
    setDrawing(false);
    saveCanvas();
  };

  const saveCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasData({
      width: canvas.width,
      height: canvas.height,
      imageData: Array.from(imageData.data),
    });
  }, [setCanvasData]);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasData({
      width: canvas.width,
      height: canvas.height,
      imageData: Array(canvas.width * canvas.height * 4).fill(0),
    });
  };

  return (
    <div className={`whiteboard-root${isMaximized ? " whiteboard-max" : ""}`}>
      {/* Header */}
      <div className="whiteboard-header">
        <h2>🎨 Whiteboard</h2>
        <button
          className="whiteboard-btn-icon"
          onClick={isMaximized ? onMinimize : onMaximize}
          aria-label={isMaximized ? "Minimize" : "Maximize"}
        >
          {isMaximized ? "−" : "⤢"}
        </button>
      </div>

      {/* Toolbar */}
      <div className="whiteboard-toolbar">
        <div className="toolbar-group">
          <label htmlFor="color-picker">Color</label>
          <input
            id="color-picker"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Brush Color"
            className="color-picker"
          />
        </div>

        <div className="toolbar-group">
          <label htmlFor="size-slider">Size: {size}px</label>
          <input
            id="size-slider"
            type="range"
            min="1"
            max="20"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            aria-label="Brush Size"
            className="size-slider"
          />
        </div>

        <button className="whiteboard-btn-clear" onClick={clear} aria-label="Clear">
          🗑 Clear
        </button>
      </div>

      {/* Canvas */}
      <div className="whiteboard-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="whiteboard-canvas"
          width={isMaximized ? 1200 : 400}
          height={isMaximized ? 700 : 250}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
    </div>
  );
}
