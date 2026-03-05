// src/components/Timer.jsx
/* Architect: Yuvraj Chopra | DeepDesk Dynamic */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Timer({
  timeLeft,
  isRunning,
  mode,
  custom,
  presets,
  onChange,
  isMaximized,
  onMaximize,
}) {
  const [displayMode, setDisplayMode] = useState(mode);

  useEffect(() => {
    setDisplayMode(mode);
  }, [mode]);

  const handlePreset = (preset) => {
    onChange({
      mode: preset.label,
      timeLeft: preset.minutes * 60 + preset.seconds,
      custom: { minutes: preset.minutes, seconds: preset.seconds },
      isRunning: false,
    });
    setDisplayMode(preset.label);
  };

  const handleCustom = (e) => {
    const { name, value } = e.target;
    const val = Math.max(0, Math.min(59, Number(value) || 0));
    const newCustom = { ...custom, [name]: val };
    onChange({
      mode: "Custom",
      custom: newCustom,
      timeLeft: newCustom.minutes * 60 + newCustom.seconds,
      isRunning: false,
    });
    setDisplayMode("Custom");
  };

  const toggle = () => onChange({ isRunning: !isRunning });

  const reset = () => {
    const resetTime =
      displayMode === "Custom"
        ? custom.minutes * 60 + custom.seconds
        : presets.find((p) => p.label === displayMode)?.minutes * 60 +
          (presets.find((p) => p.label === displayMode)?.seconds || 0);

    onChange({ timeLeft: resetTime || timeLeft, isRunning: false });
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <motion.div
      className={`timer-container ${isMaximized ? "timer-maximized" : ""}`}
      initial={!isMaximized ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="timer-header-section">
        <h2 className="timer-title">⏱ Pomodoro</h2>
        {!isMaximized && (
          <button
            className="timer-expand-btn"
            onClick={onMaximize}
            aria-label="Expand timer"
          >
            ⤢
          </button>
        )}
      </div>

      <div className="timer-presets-grid">
        {presets.map((preset) => (
          <motion.button
            key={preset.label}
            className={`timer-preset ${displayMode === preset.label ? "active" : ""}`}
            onClick={() => handlePreset(preset)}
            disabled={isRunning}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {preset.label}
          </motion.button>
        ))}
      </div>

      <motion.div
        className={`timer-custom-input-section ${displayMode === "Custom" ? "visible" : ""}`}
        initial={false}
        animate={{
          maxHeight: displayMode === "Custom" ? 100 : 0,
          opacity: displayMode === "Custom" ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="timer-custom-inputs">
          <div className="timer-input-group">
            <label>Minutes</label>
            <input
              type="number"
              name="minutes"
              min="0"
              max="99"
              value={custom.minutes}
              onChange={handleCustom}
              disabled={isRunning}
            />
          </div>
          <span className="timer-input-separator">:</span>
          <div className="timer-input-group">
            <label>Seconds</label>
            <input
              type="number"
              name="seconds"
              min="0"
              max="59"
              value={custom.seconds}
              onChange={handleCustom}
              disabled={isRunning}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="timer-display-section"
        initial={false}
        animate={{ scale: isMaximized ? 1.3 : 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="timer-time-display">
          <span className="timer-digits">{mm}:{ss}</span>
          <motion.div
            className="timer-indicator"
            animate={isRunning ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {isRunning ? "Running" : "Paused"}
          </motion.div>
        </div>
      </motion.div>

      <div className="timer-controls-section">
        <motion.button
          className={`timer-btn-play ${isRunning ? "pause" : "play"}`}
          onClick={toggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isRunning ? "⏸ Pause" : "▶ Start"}
        </motion.button>
        <motion.button
          className="timer-btn-reset"
          onClick={reset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ↻ Reset
        </motion.button>
      </div>

      <div className="timer-mode-tag">{displayMode}</div>
    </motion.div>
  );
}
