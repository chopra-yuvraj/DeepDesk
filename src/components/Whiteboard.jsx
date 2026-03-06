// src/components/Whiteboard.jsx
/* Architect: Yuvraj Chopra | DeepDesk Dynamic */
import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

export default function Whiteboard({
  canvasData,
  setCanvasData,
  isMaximized,
  onMaximize,
}) {
  const canvasRef = useRef();
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#00f0ff");
  const [size, setSize] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(canvas.offsetWidth * dpr);
    canvas.height = Math.floor(canvas.offsetHeight * dpr);
    ctx.scale(dpr, dpr);

    if (canvasData && canvasData.imageData) {
      const imgData = new ImageData(
        new Uint8ClampedArray(canvasData.imageData),
        canvasData.width,
        canvasData.height
      );
      ctx.putImageData(imgData, 0, 0);
    }
  }, [canvasData, isMaximized]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const dpr = window.devicePixelRatio || 1;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      canvas.width = Math.floor(canvas.offsetWidth * dpr);
      canvas.height = Math.floor(canvas.offsetHeight * dpr);
      ctx.scale(dpr, dpr);

      ctx.putImageData(imageData, 0, 0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    return [(e.clientX - rect.left) * dpr, (e.clientY - rect.top) * dpr];
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
    <motion.div
      className={`whiteboard-container ${isMaximized ? "whiteboard-maximized" : ""}`}
      initial={!isMaximized ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="whiteboard-header-section">
        <h2 className="whiteboard-title">Whiteboard</h2>
        {!isMaximized && (
          <button
            className="whiteboard-expand-btn"
            onClick={onMaximize}
            aria-label="Expand whiteboard"
          >
            ⤢
          </button>
        )}
      </div>

      <div className="whiteboard-toolbar-section">
        <div className="whiteboard-control-group">
          <label htmlFor="wb-color">Color</label>
          <motion.input
            id="wb-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            whileHover={{ scale: 1.1 }}
            className="whiteboard-color-picker"
          />
        </div>

        <div className="whiteboard-control-group">
          <label htmlFor="wb-size">Size: {size}px</label>
          <motion.input
            id="wb-size"
            type="range"
            min="1"
            max="20"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="whiteboard-size-slider"
          />
        </div>

        <motion.button
          className="whiteboard-clear-btn"
          onClick={clear}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Clear
        </motion.button>
      </div>

      <div className="whiteboard-canvas-container">
        <canvas
          ref={canvasRef}
          className="whiteboard-canvas-element"
          width={isMaximized ? 1600 : 400}
          height={isMaximized ? 800 : 250}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
    </motion.div>
  );
}
