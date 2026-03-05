/* Architect: Yuvraj Chopra | DeepDesk Pro */
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Timer from './components/Timer.jsx';
import TaskManager from './components/TaskManager.jsx';
import Whiteboard from './components/Whiteboard.jsx';
import Soundscape from './components/Soundscape.jsx';
import VisionBoard from './components/VisionBoard.jsx';
import Footer from './components/Footer.jsx';

const GRID_CARDS = [
    { id: 'timer', label: '⏱ Timer', icon: '⏱' },
    { id: 'tasks', label: '📋 Tasks', icon: '📋' },
    { id: 'soundscape', label: '🎵 Soundscape', icon: '🎵' },
    { id: 'whiteboard', label: '🎨 Whiteboard', icon: '🎨' },
    { id: 'visionboard', label: '🎯 Vision Board', icon: '🎯' },
];

function App() {
    const [isDark, setIsDark] = useState(true);
    const [maximizedComponent, setMaximizedComponent] = useState(null);
    const canvasDataRef = useRef(null);

    const handleThemeToggle = useCallback(() => {
        setIsDark((prev) => {
            const next = !prev;
            if (next) {
                document.documentElement.classList.remove('light-theme');
            } else {
                document.documentElement.classList.add('light-theme');
            }
            return next;
        });
    }, []);

    return (
        <div className="deepdesk-container">
            {/* ─── Grid Hub Layout ─── */}
            <AnimatePresence mode="wait">
                {!maximizedComponent && (
                    <motion.main
                        key="hub"
                        className="deepdesk-grid-hub"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="hub-header">
                            <div className="hub-brand">
                                <motion.div
                                    className="hub-brand-icon"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    D
                                </motion.div>
                                <span className="hub-brand-text">DeepDesk Pro</span>
                            </div>
                            <button
                                className="theme-toggle-btn"
                                onClick={handleThemeToggle}
                                aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                            >
                                {isDark ? '☀️' : '🌙'}
                            </button>
                        </div>

                        <div className="panel-grid">
                            {GRID_CARDS.map((card, index) => {
                                const componentMap = {
                                    timer: <Timer onMaximize={() => setMaximizedComponent('timer')} canvasDataRef={canvasDataRef} index={index} />,
                                    tasks: <TaskManager onMaximize={() => setMaximizedComponent('tasks')} index={index} />,
                                    soundscape: <Soundscape onMaximize={() => setMaximizedComponent('soundscape')} index={index} />,
                                    whiteboard: <Whiteboard onMaximize={() => setMaximizedComponent('whiteboard')} canvasDataRef={canvasDataRef} index={index} />,
                                    visionboard: <VisionBoard onMaximize={() => setMaximizedComponent('visionboard')} index={index} />,
                                };
                                return componentMap[card.id];
                            })}
                        </div>
                        <Footer />
                    </motion.main>
                )}
            </AnimatePresence>

            {/* ─── Maximized Views ─── */}
            <AnimatePresence mode="wait">
                {maximizedComponent === 'timer' && (
                    <motion.div key="timer-max" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Timer isMaximized onMinimize={() => setMaximizedComponent(null)} canvasDataRef={canvasDataRef} />
                    </motion.div>
                )}
                {maximizedComponent === 'tasks' && (
                    <motion.div key="tasks-max" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <TaskManager isMaximized onMinimize={() => setMaximizedComponent(null)} />
                    </motion.div>
                )}
                {maximizedComponent === 'soundscape' && (
                    <motion.div key="sound-max" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Soundscape isMaximized onMinimize={() => setMaximizedComponent(null)} />
                    </motion.div>
                )}
                {maximizedComponent === 'whiteboard' && (
                    <motion.div key="wb-max" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Whiteboard isMaximized onMinimize={() => setMaximizedComponent(null)} canvasDataRef={canvasDataRef} />
                    </motion.div>
                )}
                {maximizedComponent === 'visionboard' && (
                    <motion.div key="vb-max" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <VisionBoard isMaximized onMinimize={() => setMaximizedComponent(null)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
