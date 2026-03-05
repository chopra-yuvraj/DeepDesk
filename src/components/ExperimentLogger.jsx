/* Developed by Yuvraj Chopra | DeepDesk Hub */
import { useState, useCallback } from 'react';

const CATEGORIES = [
    { value: 'hypothesis', label: '🧪 Hypothesis', color: 'var(--accent-cyan)' },
    { value: 'observation', label: '👁 Observation', color: 'var(--accent-purple)' },
    { value: 'result', label: '📊 Result', color: 'var(--accent-green)' },
];

function ExperimentLogger() {
    const [logs, setLogs] = useState([]);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('hypothesis');
    const [content, setContent] = useState('');

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            const trimTitle = title.trim();
            const trimContent = content.trim();
            if (!trimTitle || !trimContent) return;

            const newLog = {
                id: Date.now(),
                title: trimTitle,
                category,
                content: trimContent,
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            };

            setLogs((prev) => [newLog, ...prev]);
            setTitle('');
            setContent('');
        },
        [title, category, content]
    );

    const handleDelete = useCallback((id) => {
        setLogs((prev) => prev.filter((log) => log.id !== id));
    }, []);

    const getCategoryColor = (cat) => {
        const found = CATEGORIES.find((c) => c.value === cat);
        return found ? found.color : 'var(--text-secondary)';
    };

    const getCategoryLabel = (cat) => {
        const found = CATEGORIES.find((c) => c.value === cat);
        return found ? found.label : cat;
    };

    return (
        <section className="card" id="logger-panel" aria-label="Experiment Logger">
            <header className="card-header">
                <h2 className="card-title">
                    <span className="icon">🔬</span> Experiment Logger
                </h2>
                <span className="card-badge badge-purple">{logs.length} Logs</span>
            </header>

            <form className="logger-form" onSubmit={handleSubmit}>
                <fieldset>
                    <legend>New Log Entry</legend>
                    <div className="field-group">
                        <label htmlFor="log-title">Title</label>
                        <input
                            type="text"
                            className="input-field"
                            id="log-title"
                            placeholder="Enter experiment title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <label htmlFor="log-category">Category</label>
                        <select
                            className="input-field"
                            id="log-category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="log-content">Notes</label>
                        <textarea
                            className="input-field"
                            id="log-content"
                            placeholder="Record your observations, hypotheses, or results..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                        />
                    </div>
                </fieldset>

                <button
                    type="submit"
                    className="btn btn-primary mt-sm"
                    id="log-submit-btn"
                    style={{ width: '100%' }}
                >
                    📝 Save Log Entry
                </button>
            </form>

            {logs.length > 0 && (
                <div className="logger-timeline mt-md">
                    {logs.map((log) => (
                        <article className="log-entry" key={log.id} style={{ borderLeftColor: getCategoryColor(log.category) }}>
                            <div className="log-entry-header">
                                <span
                                    className="log-entry-category"
                                    style={{ color: getCategoryColor(log.category) }}
                                >
                                    {getCategoryLabel(log.category)}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="log-entry-time">{log.timestamp}</span>
                                    <button
                                        className="log-entry-delete"
                                        onClick={() => handleDelete(log.id)}
                                        aria-label={`Delete log: ${log.title}`}
                                        id={`log-delete-${log.id}`}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                            <div className="log-entry-title">{log.title}</div>
                            <div className="log-entry-content">{log.content}</div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default ExperimentLogger;
