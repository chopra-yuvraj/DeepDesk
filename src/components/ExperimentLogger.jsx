// src/components/ExperimentLogger.jsx
/* Architect: Yuvraj Chopra | DeepDesk Dynamic */
import { useState, useCallback } from "react";
import { motion } from "framer-motion";

export default function ExperimentLogger({
  isMaximized,
  onMaximize,
}) {
  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("deepdesk_experiments");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("observation");
  const [notes, setNotes] = useState("");

  const addLog = useCallback(() => {
    if (!title.trim() || !notes.trim()) return;

    const newLog = {
      id: Date.now(),
      title: title.trim(),
      category,
      notes: notes.trim(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    localStorage.setItem("deepdesk_experiments", JSON.stringify(updated));
    setTitle("");
    setNotes("");
    setCategory("observation");
  }, [title, category, notes, logs]);

  const deleteLog = useCallback(
    (id) => {
      const updated = logs.filter((log) => log.id !== id);
      setLogs(updated);
      localStorage.setItem("deepdesk_experiments", JSON.stringify(updated));
    },
    [logs]
  );

  const clearAll = useCallback(() => {
    if (confirm("Clear all experiments?")) {
      setLogs([]);
      localStorage.removeItem("deepdesk_experiments");
    }
  }, []);

  return (
    <motion.div
      className={`experiment-container ${isMaximized ? "experiment-maximized" : ""}`}
      initial={!isMaximized ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="experiment-header-section">
        <h2 className="experiment-title">Experiment Logger</h2>
        {!isMaximized && (
          <button
            className="experiment-expand-btn"
            onClick={onMaximize}
            aria-label="Expand experiment logger"
          >
            ⤢
          </button>
        )}
      </div>

      <div className="experiment-input-section">
        <div className="experiment-input-group">
          <label htmlFor="exp-title">Title</label>
          <input
            id="exp-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLog()}
            placeholder="Experiment title..."
            className="experiment-input"
          />
        </div>

        <div className="experiment-input-group">
          <label htmlFor="exp-category">Category</label>
          <select
            id="exp-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="experiment-select"
          >
            <option value="observation">Observation</option>
            <option value="hypothesis">Hypothesis</option>
            <option value="result">Result</option>
            <option value="insight">Insight</option>
            <option value="note">Note</option>
          </select>
        </div>
      </div>

      <div className="experiment-textarea-group">
        <label htmlFor="exp-notes">Notes</label>
        <textarea
          id="exp-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Detailed notes and observations..."
          className="experiment-textarea"
          rows={isMaximized ? 8 : 4}
        />
      </div>

      <div className="experiment-button-group">
        <motion.button
          className="experiment-add-btn"
          onClick={addLog}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Add Log
        </motion.button>
        {logs.length > 0 && (
          <motion.button
            className="experiment-clear-btn"
            onClick={clearAll}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear All
          </motion.button>
        )}
      </div>

      {logs.length > 0 && (
        <div className="experiment-logs-list">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              className={`experiment-log-item category-${log.category}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="experiment-log-header">
                <div>
                  <h4 className="experiment-log-title">{log.title}</h4>
                  <span className="experiment-log-meta">
                    {log.date} at {log.time}
                  </span>
                </div>
                <motion.button
                  className="experiment-log-delete"
                  onClick={() => deleteLog(log.id)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>
              <span className={`experiment-category-tag category-${log.category}`}>
                {log.category}
              </span>
              <p className="experiment-log-notes">{log.notes}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
