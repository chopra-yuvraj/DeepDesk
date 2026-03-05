// src/App.jsx
/* Architect: Yuvraj Chopra | DeepDesk Dynamic */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Timer from "./components/Timer.jsx";
import TaskManager from "./components/TaskManager.jsx";
import Whiteboard from "./components/Whiteboard.jsx";
import VisionBoard from "./components/VisionBoard.jsx";
import ExperimentLogger from "./components/ExperimentLogger.jsx";
import FloatingSoundscape from "./components/FloatingSoundscape.jsx";

const POMODORO_PRESETS = [
  { label: "Pomodoro", minutes: 25, seconds: 0 },
  { label: "Short Break", minutes: 5, seconds: 0 },
  { label: "Long Break", minutes: 15, seconds: 0 },
];

const GRID_CARDS = [
  { id: "timer", label: "⏱ Timer" },
  { id: "tasks", label: "📋 Tasks" },
  { id: "experiments", label: "📝 Experiments" },
  { id: "whiteboard", label: "🎨 Whiteboard" },
  { id: "visionboard", label: "🎯 Vision Board" },
];

function getClock() {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default function App() {
  const [clock, setClock] = useState(() => getClock());
  useEffect(() => {
    const interval = setInterval(() => setClock(getClock()), 1000);
    return () => clearInterval(interval);
  }, []);

  const [timerState, setTimerState] = useState({
    timeLeft: 25 * 60,
    isRunning: false,
    mode: "Pomodoro",
    custom: { minutes: 25, seconds: 0 },
  });

  useEffect(() => {
    if (!timerState.isRunning) return;
    const interval = setInterval(() => {
      setTimerState((prev) => ({
        ...prev,
        timeLeft: Math.max(prev.timeLeft - 1, 0),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerState.isRunning]);

  useEffect(() => {
    if (timerState.timeLeft === 0 && timerState.isRunning) {
      setTimerState((prev) => ({ ...prev, isRunning: false }));
    }
  }, [timerState.timeLeft, timerState.isRunning]);

  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("deepdesk_tasks")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("deepdesk_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const [canvasData, setCanvasData] = useState(() => {
    try {
      const saved = localStorage.getItem("deepdesk_canvas");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (canvasData) {
      localStorage.setItem("deepdesk_canvas", JSON.stringify(canvasData));
    }
  }, [canvasData]);

  const [visionImages, setVisionImages] = useState(() => {
    try {
      const saved = localStorage.getItem("deepdesk_vision");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("deepdesk_vision", JSON.stringify(visionImages));
  }, [visionImages]);

  const [maximized, setMaximized] = useState(null);

  const updateTimer = (data) => setTimerState((prev) => ({ ...prev, ...data }));
  const updateCanvasData = useCallback((data) => setCanvasData(data), []);

  return (
    <div className="deepdesk-root">
      <header className="deepdesk-header">
        <div className="header-content">
          <div className="app-branding">
            <h1 className="app-title">DeepDesk</h1>
          </div>
          <div className="live-clock-container">
            <div className="live-clock">{clock}</div>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={maximized ? `maximized-${maximized}` : "grid"}
          className={`panel-grid ${maximized ? "grid-maximized" : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!maximized && (
            <>
              {GRID_CARDS.map((card) => (
                <motion.section
                  key={card.id}
                  layoutId={card.id}
                  className="card"
                  whileHover={{ y: -2 }}
                  transition={{
                    layout: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
                    hover: { duration: 0.2 },
                  }}
                  onClick={() => setMaximized(card.id)}
                  style={{ cursor: "pointer" }}
                >
                  {card.id === "timer" && (
                    <Timer
                      timeLeft={timerState.timeLeft}
                      isRunning={timerState.isRunning}
                      mode={timerState.mode}
                      custom={timerState.custom}
                      presets={POMODORO_PRESETS}
                      onChange={updateTimer}
                      isMaximized={false}
                      onMaximize={() => setMaximized("timer")}
                    />
                  )}
                  {card.id === "tasks" && (
                    <TaskManager
                      tasks={tasks}
                      setTasks={setTasks}
                      isMaximized={false}
                      onMaximize={() => setMaximized("tasks")}
                    />
                  )}
                  {card.id === "whiteboard" && (
                    <Whiteboard
                      canvasData={canvasData}
                      setCanvasData={updateCanvasData}
                      isMaximized={false}
                      onMaximize={() => setMaximized("whiteboard")}
                    />
                  )}
                  {card.id === "visionboard" && (
                    <VisionBoard
                      images={visionImages}
                      setImages={setVisionImages}
                      isMaximized={false}
                      onMaximize={() => setMaximized("visionboard")}
                    />
                  )}
                  {card.id === "experiments" && (
                    <ExperimentLogger
                      isMaximized={false}
                      onMaximize={() => setMaximized("experiments")}
                    />
                  )}
                </motion.section>
              ))}
            </>
          )}

          {maximized && (
            <motion.section
              key={`max-${maximized}`}
              layoutId={maximized}
              className="card-maximized-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                className="maximize-close-btn"
                onClick={() => setMaximized(null)}
                aria-label="Close maximized view"
              >
                ✕
              </button>

              {maximized === "timer" && (
                <Timer
                  timeLeft={timerState.timeLeft}
                  isRunning={timerState.isRunning}
                  mode={timerState.mode}
                  custom={timerState.custom}
                  presets={POMODORO_PRESETS}
                  onChange={updateTimer}
                  isMaximized={true}
                  onMaximize={() => {}}
                />
              )}
              {maximized === "tasks" && (
                <TaskManager
                  tasks={tasks}
                  setTasks={setTasks}
                  isMaximized={true}
                  onMaximize={() => {}}
                />
              )}
              {maximized === "whiteboard" && (
                <Whiteboard
                  canvasData={canvasData}
                  setCanvasData={updateCanvasData}
                  isMaximized={true}
                  onMaximize={() => {}}
                />
              )}
              {maximized === "visionboard" && (
                <VisionBoard
                  images={visionImages}
                  setImages={setVisionImages}
                  isMaximized={true}
                  onMaximize={() => {}}
                />
              )}
              {maximized === "experiments" && (
                <ExperimentLogger
                  isMaximized={true}
                  onMaximize={() => {}}
                />
              )}
            </motion.section>
          )}
        </motion.main>
      </AnimatePresence>

      <FloatingSoundscape />

      <footer className="deepdesk-footer">
        <span className="footer-text">Built by Yuvraj Chopra</span>
      </footer>
    </div>
  );
}
