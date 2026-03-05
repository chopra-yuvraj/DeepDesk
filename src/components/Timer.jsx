/* Architect: Yuvraj Chopra | DeepDesk Pro */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Footer from './Footer.jsx';

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

function Timer({ onMaximize, isMaximized, onMinimize, index }) {
    const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [sessions, setSessions] = useState(0);
    const intervalRef = useRef(null);

    const totalDuration = isBreak ? BREAK_DURATION : WORK_DURATION;

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }

        if (timeLeft === 0) {
            clearInterval(intervalRef.current);
            if (!isBreak) {
                setSessions((prev) => prev + 1);
                setIsBreak(true);
                setTimeLeft(BREAK_DURATION);
                setIsRunning(true);
            } else {
                setIsBreak(false);
                setTimeLeft(WORK_DURATION);
                setIsRunning(false);
            }
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning, timeLeft, isBreak]);

    const handleStart = useCallback(() => {
        setIsRunning((prev) => !prev);
    }, []);

    const handleReset = useCallback(() => {
        clearInterval(intervalRef.current);
        setIsRunning(false);
        setIsBreak(false);
        setTimeLeft(WORK_DURATION);
        setSessions(0);
    }, []);

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');

    const circumference = 2 * Math.PI * 88;
    const progress = ((totalDuration - timeLeft) / totalDuration) * circumference;

    const sessionDots = Array.from({ length: 4 }, (_, i) => i);

    return (
        <>
            <motion.section
                layoutId={!isMaximized ? `timer-${index}` : undefined}
                className={`card ${isMaximized ? 'card-maximized' : ''}`}
                id="timer-panel"
                initial={!isMaximized ? { opacity: 0, y: 20 } : { opacity: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: !isMaximized ? index * 0.1 : 0 }}
            >
                <header className="card-header">
                    <h2 className="card-title">
                        <span>⏱</span> Pomodoro Timer
                    </h2>
                    <div className="card-controls">
                        <span className={`card-badge ${isBreak ? 'badge-green' : 'badge-cyan'}`}>
                            {isBreak ? 'Break' : 'Focus'}
                        </span>
                        <button
                            className={`btn-maximize ${isMaximized ? 'hidden' : ''}`}
                            onClick={onMaximize}
                            aria-label="Maximize timer"
                        >
                            ⛶
                        </button>
                        <button
                            className={`btn-minimize ${!isMaximized ? 'hidden' : ''}`}
                            onClick={onMinimize}
                            aria-label="Minimize timer"
                        >
                            ⛶
                        </button>
                    </div>
                </header>

                <div className={`timer-display ${isMaximized ? 'timer-container-max' : ''}`}>
                    <div className="timer-ring-container">
                        <svg className="timer-ring" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
                            <circle className="timer-ring-bg" cx="100" cy="100" r="88" />
                            <circle
                                className={`timer-ring-progress ${isBreak ? 'break-mode' : ''}`}
                                cx="100"
                                cy="100"
                                r="88"
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - progress}
                            />
                        </svg>
                        <div className="timer-time-display">
                            <div className="timer-digits">{minutes}:{seconds}</div>
                            <div className="timer-label">{isBreak ? 'Break Time' : 'Stay Focused'}</div>
                        </div>
                    </div>

                    <div className="timer-controls">
                        <button
                            className="btn btn-primary"
                            onClick={handleStart}
                            aria-label={isRunning ? 'Pause timer' : 'Start timer'}
                        >
                            {isRunning ? '⏸ Pause' : '▶ Start'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={handleReset}
                            aria-label="Reset timer"
                        >
                            ↻ Reset
                        </button>
                    </div>

                    <div className="timer-sessions">
                        <span>Sessions:</span>
                        {sessionDots.map((i) => (
                            <span
                                key={i}
                                className={`session-dot ${i < sessions ? 'filled' : ''}`}
                                aria-label={i < sessions ? 'Completed session' : 'Pending session'}
                            />
                        ))}
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)' }}>
                            {sessions}/4
                        </span>
                    </div>
                </div>
            </motion.section>
            {isMaximized && <Footer />}
        </>
    );
}

export default Timer;
