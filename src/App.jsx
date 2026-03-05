/* Developed by Yuvraj Chopra | DeepDesk Hub */
import { useState, useCallback } from 'react';
import Timer from './components/Timer.jsx';
import TaskManager from './components/TaskManager.jsx';
import ExperimentLogger from './components/ExperimentLogger.jsx';
import Whiteboard from './components/Whiteboard.jsx';
import Footer from './components/Footer.jsx';

const NAV_ITEMS = [
    { id: 'all', label: '🏠 All Panels' },
    { id: 'timer', label: '⏱ Timer' },
    { id: 'tasks', label: '📋 Tasks' },
    { id: 'logger', label: '🔬 Logger' },
    { id: 'whiteboard', label: '🎨 Whiteboard' },
];

/* ---------- Theming Engine ---------- */
function toggleTheme(setIsDark) {
    setIsDark((prev) => {
        const next = !prev;
        if (next) {
            document.documentElement.classList.remove('light-theme');
        } else {
            document.documentElement.classList.add('light-theme');
        }
        return next;
    });
}

function App() {
    const [activePanel, setActivePanel] = useState('all');
    const [isDark, setIsDark] = useState(true);

    const handleThemeToggle = useCallback(() => {
        toggleTheme(setIsDark);
    }, []);

    const showPanel = (id) => activePanel === 'all' || activePanel === id;

    return (
        <>
            {/* ─── Navigation ─── */}
            <nav className="deepdesk-nav" aria-label="Main navigation">
                <div className="nav-brand">
                    <div className="nav-brand-icon" aria-hidden="true">D</div>
                    <span className="nav-brand-text">DeepDesk</span>
                </div>

                <ul className="nav-links" role="menubar">
                    {NAV_ITEMS.map((item) => (
                        <li key={item.id} role="none">
                            <button
                                className={`nav-link-btn ${activePanel === item.id ? 'active' : ''}`}
                                onClick={() => setActivePanel(item.id)}
                                role="menuitem"
                                id={`nav-${item.id}`}
                                aria-current={activePanel === item.id ? 'page' : undefined}
                            >
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>

                <button
                    className="theme-toggle-btn"
                    onClick={handleThemeToggle}
                    id="theme-toggle-btn"
                    aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                    title={isDark ? 'Light mode' : 'Dark mode'}
                >
                    {isDark ? '☀️' : '🌙'}
                </button>
            </nav>

            {/* ─── Main Content ─── */}
            <main className="deepdesk-main">
                <div className="panel-grid">
                    {showPanel('timer') && <Timer />}
                    {showPanel('tasks') && <TaskManager />}
                    {showPanel('logger') && <ExperimentLogger />}
                    {showPanel('whiteboard') && <Whiteboard />}
                </div>
            </main>

            {/* ─── Footer ─── */}
            <Footer />
        </>
    );
}

export default App;
