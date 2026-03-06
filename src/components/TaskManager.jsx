/* Architect: Yuvraj Chopra | DeepDesk Pro */
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

function validateTask(task) {
    if (typeof task !== 'object' || task === null) return false;
    if (typeof task.id !== 'number') return false;
    if (typeof task.text !== 'string' || task.text.trim() === '') return false;
    if (typeof task.completed !== 'boolean') return false;
    if (!['high', 'medium', 'low'].includes(task.priority)) return false;
    return true;
}

function TaskItem({ task, onToggle, onDelete }) {
    if (!validateTask(task)) return null;

    const priorityClass =
        task.priority === 'high'
            ? 'priority-high'
            : task.priority === 'medium'
                ? 'priority-medium'
                : 'priority-low';

    return (
        <article className={`task-item ${task.completed ? 'completed' : ''}`}>
            <button
                className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                onClick={() => onToggle(task.id)}
                aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
                {task.completed ? '✓' : ''}
            </button>
            <div className="task-content">
                <span className="task-text">{task.text}</span>
            </div>
            <span className={`task-priority ${priorityClass}`}>{task.priority}</span>
            <button
                className="task-delete-btn"
                onClick={() => onDelete(task.id)}
                aria-label={`Delete task: ${task.text}`}
            >
                ✕
            </button>
        </article>
    );
}

function TaskManager({ tasks = [], setTasks = () => {}, onMaximize = () => {}, isMaximized = false }) {
    const [inputValue, setInputValue] = useState('');
    const [priority, setPriority] = useState('medium');

    const handleAdd = useCallback(() => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;

        const newTask = {
            id: Date.now(),
            text: trimmed,
            completed: false,
            priority: priority,
        };

        if (!validateTask(newTask)) return;

        setTasks((prev) => [newTask, ...prev]);
        setInputValue('');
    }, [inputValue, priority]);

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter') handleAdd();
        },
        [handleAdd]
    );

    const handleToggle = useCallback((id) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    }, []);

    const handleDelete = useCallback((id) => {
        setTasks((prev) => prev.filter((task) => task.id !== id));
    }, [setTasks]);

    return (
        <motion.div
            className={`task-manager-container ${isMaximized ? "task-manager-maximized" : ""}`}
            initial={!isMaximized ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="task-header-section">
                <h2 className="task-title">Tasks</h2>
                {!isMaximized && (
                    <button
                        className="task-expand-btn"
                        onClick={onMaximize}
                        aria-label="Expand task manager"
                    >
                        ⤢
                    </button>
                )}
            </div>

            <div className="task-input-section">
                <input
                    type="text"
                    className="task-input"
                    placeholder="Add a new task..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-label="New task text"
                />
                <div className="task-priority-buttons">
                    {['high', 'medium', 'low'].map((p) => (
                        <button
                            key={p}
                            className={`task-priority-btn ${priority === p ? 'active' : ''}`}
                            onClick={() => setPriority(p)}
                            aria-label={`Set priority to ${p}`}
                        >
                            {p.charAt(0).toUpperCase()}
                        </button>
                    ))}
                </div>
                <motion.button
                    className="task-add-btn"
                    onClick={handleAdd}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Add task"
                >
                    +
                </motion.button>
            </div>

            <div className={`task-list ${isMaximized ? 'task-list-max' : ''}`} role="list">
                {tasks.length === 0 ? (
                    <div className="task-empty">
                        <p>No tasks yet. Add one to get started.</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>

            {tasks.length > 0 && (
                <div className="task-stats">
                    <span>{tasks.filter(t => t.completed).length} of {tasks.length} done</span>
                </div>
            )}
        </motion.div>
    );
}

export default TaskManager;
