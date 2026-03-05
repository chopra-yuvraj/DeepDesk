// src/components/Timer.jsx
/* Built By: Yuvraj Chopra | DeepDesk Minimal */
import { useEffect, useRef, useState } from "react";

export default function Timer({
  timeLeft,
  isRunning,
  mode,
  custom,
  presets,
  onChange,
  isMaximized,
  onMaximize,
  onMinimize,
  clock,
}) {
  const [displayMode, setDisplayMode] = useState(mode);

  // Sync display mode when mode changes
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

    onChange({
      timeLeft: resetTime || timeLeft,
      isRunning: false,
    });
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className={`timer-root${isMaximized ? " timer-max" : ""}`}>
      {/* Header */}
      <div className="timer-header">
        <h2>⏱ Pomodoro Timer</h2>
        <button
          className="timer-btn-icon"
          onClick={isMaximized ? onMinimize : onMaximize}
          aria-label={isMaximized ? "Minimize" : "Maximize"}
        >
          {isMaximized ? "−" : "⤢"}
        </button>
      </div>

      {/* Current time display */}
      {isMaximized && clock && (
        <div className="timer-current-time">
          Current time: {clock}
        </div>
      )}

      {/* Preset Buttons */}
      <div className="timer-presets">
        {presets.map((p) => (
          <button
            key={p.label}
            className={`timer-preset-btn ${displayMode === p.label ? "active" : ""}`}
            onClick={() => handlePreset(p)}
            disabled={isRunning}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Mode */}
      <div className={`timer-custom ${displayMode === "Custom" ? "active" : ""}`}>
        <div className="custom-inputs">
          <div className="custom-input-group">
            <label>Minutes</label>
            <input
              type="number"
              name="minutes"
              min="0"
              max="59"
              value={custom.minutes}
              onChange={handleCustom}
              disabled={isRunning}
              aria-label="Custom Minutes"
            />
          </div>
          <span className="custom-separator">:</span>
          <div className="custom-input-group">
            <label>Seconds</label>
            <input
              type="number"
              name="seconds"
              min="0"
              max="59"
              value={custom.seconds}
              onChange={handleCustom}
              disabled={isRunning}
              aria-label="Custom Seconds"
            />
          </div>
        </div>
      </div>

      {/* Timer Display */}
      <div className="timer-display">
        <div className="timer-digits">{mm}:{ss}</div>
        <div className="timer-status">
          {isRunning ? "Running..." : "Paused"}
        </div>
      </div>

      {/* Controls */}
      <div className="timer-controls">
        <button
          className={`timer-btn-main ${isRunning ? "pause" : "play"}`}
          onClick={toggle}
          aria-label={isRunning ? "Pause" : "Start"}
        >
          {isRunning ? "⏸ Pause" : "▶ Start"}
        </button>
        <button
          className="timer-btn-secondary"
          onClick={reset}
          aria-label="Reset"
        >
          ↻ Reset
        </button>
      </div>

      {/* Mode indicator */}
      <div className="timer-mode-indicator">
        Mode: <strong>{displayMode}</strong>
      </div>
    </div>
  );
}
