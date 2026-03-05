// src/App.jsx
/* Built By: Yuvraj Chopra | DeepDesk Minimal */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Timer from "./components/Timer.jsx";
import TaskManager from "./components/TaskManager.jsx";
import Whiteboard from "./components/Whiteboard.jsx";
import Soundscape from "./components/Soundscape.jsx";
import VisionBoard from "./components/VisionBoard.jsx";

const POMODORO_PRESETS = [
  { label: "Pomodoro", minutes: 25, seconds: 0 },
  { label: "Short Break", minutes: 5, seconds: 0 },
  { label: "Long Break", minutes: 15, seconds: 0 },
];

const GRID_CARDS = [
  { id: "timer", label: "⏱ Timer" },
  { id: "tasks", label: "📋 Tasks" },
  { id: "soundscape", label: "🎵 Soundscape" },
  { id: "whiteboard", label: "🎨 Whiteboard" },
  { id: "visionboard", label: "🎯 Vision Board" },
];

function getClock() {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")} ${ampm}`;
}

export default function App() {
  // Live Clock - Updates every second
  const [clock, setClock] = useState(() => getClock());
  useEffect(() => {
    const interval = setInterval(() => setClock(getClock()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer State - Shared across minimized and maximized views
  const [timerState, setTimerState] = useState({
    timeLeft: 25 * 60,
    isRunning: false,
    mode: "Pomodoro",
    custom: { minutes: 25, seconds: 0 },
  });

  // Timer effect - manages the countdown timer
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

  // Auto-stop timer when it reaches 0
  useEffect(() => {
    if (timerState.timeLeft === 0 && timerState.isRunning) {
      setTimerState((prev) => ({ ...prev, isRunning: false }));
    }
  }, [timerState.timeLeft, timerState.isRunning]);

  // Task State - Persisted to localStorage
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

  // Whiteboard State - Persisted to localStorage for drawing
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

  // Maximized Card - Only one card can be maximized at a time
  const [maximized, setMaximized] = useState(null);

  // Handler functions
  const handleMaximize = (id) => setMaximized(id);
  const handleMinimize = () => setMaximized(null);
  const updateTimer = (data) => setTimerState((prev) => ({ ...prev, ...data }));
  const updateCanvasData = useCallback((data) => setCanvasData(data), []);

  return (
    <div className="deepdesk-root">
      {/* Header with live clock */}
      <header className="deepdesk-header">
        <div className="header-content">
          <h1 className="app-title">DeepDesk</h1>
          <div className="live-clock">{clock}</div>
        </div>
      </header>

      {/* Main grid of cards */}
      <AnimatePresence>
        <main
          className={`panel-grid ${maximized ? "has-maximized" : ""}`}
          key="hub"
        >
          {GRID_CARDS.map((card) => (
            <motion.section
              key={card.id}
              layoutId={card.id}
              className={`card ${maximized === card.id ? "card-max" : ""}`}
              transition={{
                layout: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
              }}
              style={{
                zIndex: maximized === card.id ? 10 : 1,
                pointerEvents: maximized && maximized !== card.id ? "none" : "auto",
              }}
            >
              {/* Timer Card */}
              {card.id === "timer" && (
                <Timer
                  timeLeft={timerState.timeLeft}
                  isRunning={timerState.isRunning}
                  mode={timerState.mode}
                  custom={timerState.custom}
                  presets={POMODORO_PRESETS}
                  onChange={updateTimer}
                  isMaximized={maximized === "timer"}
                  onMaximize={() => handleMaximize("timer")}
                  onMinimize={handleMinimize}
                  clock={clock}
                />
              )}

              {/* Tasks Card */}
              {card.id === "tasks" && (
                <TaskManager
                  tasks={tasks}
                  setTasks={setTasks}
                  isMaximized={maximized === "tasks"}
                  onMaximize={() => handleMaximize("tasks")}
                  onMinimize={handleMinimize}
                />
              )}

              {/* Whiteboard Card */}
              {card.id === "whiteboard" && (
                <Whiteboard
                  canvasData={canvasData}
                  setCanvasData={updateCanvasData}
                  isMaximized={maximized === "whiteboard"}
                  onMaximize={() => handleMaximize("whiteboard")}
                  onMinimize={handleMinimize}
                />
              )}

              {/* Soundscape Card */}
              {card.id === "soundscape" && (
                <Soundscape
                  isMaximized={maximized === "soundscape"}
                  onMaximize={() => handleMaximize("soundscape")}
                  onMinimize={handleMinimize}
                />
              )}

              {/* Vision Board Card */}
              {card.id === "visionboard" && (
                <VisionBoard
                  isMaximized={maximized === "visionboard"}
                  onMaximize={() => handleMaximize("visionboard")}
                  onMinimize={handleMinimize}
                />
              )}
            </motion.section>
          ))}
        </main>
      </AnimatePresence>

      {/* Footer */}
      <footer className="deepdesk-footer">
        <span className="footer-text">Built by Yuvraj Chopra</span>
      </footer>
    </div>
  );
}
