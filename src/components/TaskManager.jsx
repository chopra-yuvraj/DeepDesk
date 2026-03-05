/* Architect: Yuvraj Chopra | DeepDesk Pro */
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Footer from './Footer.jsx';

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

function TaskManager({ onMaximize, isMaximized, onMinimize, index }) {
    const [tasks, setTasks] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [priority, setPriority] = useState('medium');

    useEffect(() => {
        const savedTasks = localStorage.getItem('deepdesk_tasks');
        if (savedTasks) {
            try {
                const parsed = JSON.parse(savedTasks);
                if (Array.isArray(parsed) && parsed.every(validateTask)) {
                    setTasks(parsed);
                }
            } catch (e) {
                console.error('Failed to load tasks from localStorage:', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('deepdesk_tasks', JSON.stringify(tasks));
    }, [tasks]);

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
    }, []);

    const completedCount = tasks.filter((t) => t.completed).length;

    return (
        <>
            <motion.section
                layoutId={!isMaximized ? `taskmanager-${index}` : undefined}
                className={`card ${isMaximized ? 'card-maximized' : ''}`}
                id="task-manager-panel"
                initial={!isMaximized ? { opacity: 0, y: 20 } : { opacity: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: !isMaximized ? index * 0.1 : 0 }}
            >
                <header className="card-header">
                    <h2 className="card-title">
                        <span>📋</span> Task Manager
                    </h2>
                    <div className="card-controls">
                        <span className="card-badge badge-green">{tasks.length} Tasks</span>
                        <button
                            className={`btn-maximize ${isMaximized ? 'hidden' : ''}`}
                            onClick={onMaximize}
                            aria-label="Maximize task manager"
                        >
                            ⛶
                        </button>
                        <button
                            className={`btn-minimize ${!isMaximized ? 'hidden' : ''}`}
                            onClick={onMinimize}
                            aria-label="Minimize task manager"
                        >
                            ⛶
                        </button>
                    </div>
                </header>

                <div className="input-row mb-md">
                    <input
                        type="text"
                        className="input-field"
                        placeholder="What needs to be done?"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        aria-label="New task text"
                    />
                    <select
                        className="input-field"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        aria-label="Task priority"
                        style={{ maxWidth: '130px' }}
                    >
                        <option value="high">🔴 High</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="low">🟢 Low</option>
                    </select>
                    <button
                        className="btn btn-primary"
                        onClick={handleAdd}
                        aria-label="Add task"
                    >
                        + Add
                    </button>
                </div>

                <div className={`task-list ${isMaximized ? 'task-list-max' : ''}`} role="list">
                    {tasks.length === 0 ? (
                        <div className="task-empty">
                            <p>No tasks yet. Add one above to get started.</p>
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
                        <span>{completedCount} of {tasks.length} completed</span>
                        <span>
                            {tasks.length - completedCount === 0
                                ? '🎉 All done!'
                                : `${tasks.length - completedCount} remaining`}
                        </span>
                    </div>
                )}
            </motion.section>
            {isMaximized && <Footer />}
        </>
    );
}

export default TaskManager;
