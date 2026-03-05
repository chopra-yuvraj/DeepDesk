/* Developed by Yuvraj Chopra | DeepDesk Hub */
import { useState, useCallback } from 'react';

/* ---------- Prop Validation Utility ---------- */
function validateTask(task) {
    if (typeof task !== 'object' || task === null) return false;
    if (typeof task.id !== 'number') return false;
    if (typeof task.text !== 'string' || task.text.trim() === '') return false;
    if (typeof task.completed !== 'boolean') return false;
    if (!['high', 'medium', 'low'].includes(task.priority)) return false;
    return true;
}

/* ---------- Task Item Sub-Component ---------- */
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
                id={`task-toggle-${task.id}`}
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
                id={`task-delete-${task.id}`}
            >
                ✕
            </button>
        </article>
    );
}

/* ---------- Main TaskManager Component ---------- */
function TaskManager() {
    const [tasks, setTasks] = useState([]);
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
    }, []);

    const completedCount = tasks.filter((t) => t.completed).length;

    return (
        <section className="card" id="task-manager-panel" aria-label="Task Manager">
            <header className="card-header">
                <h2 className="card-title">
                    <span className="icon">📋</span> Task Manager
                </h2>
                <span className="card-badge badge-green">{tasks.length} Tasks</span>
            </header>

            <div className="input-row mb-md">
                <input
                    type="text"
                    className="input-field"
                    placeholder="What needs to be done?"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    id="task-input"
                    aria-label="New task text"
                />
                <select
                    className="input-field"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    id="task-priority-select"
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
                    id="task-add-btn"
                    aria-label="Add task"
                >
                    + Add
                </button>
            </div>

            <div className="task-list" role="list">
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
        </section>
    );
}

export default TaskManager;
