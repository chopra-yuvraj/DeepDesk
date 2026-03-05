// src/components/FloatingSoundscape.jsx
/* Architect: Yuvraj Chopra | DeepDesk Dynamic */
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingSoundscape() {
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef({});
  const gainsRef = useRef({});
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [activeSound, setActiveSound] = useState(null);

  const SOUNDSCAPES = [
    { id: "rain", label: "🌧 Rain", freq: 120, type: "sine" },
    { id: "whitenoise", label: "❄ White Noise", freq: null, type: "whitenoise" },
    { id: "cyberpunk", label: "⚡ Cyberpunk", freq: 150, type: "triangle" },
  ];

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const createWhiteNoiseBuffer = useCallback((ctx) => {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    return source;
  }, []);

  const startSound = useCallback(
    (soundId) => {
      const ctx = initAudioContext();
      if (oscillatorsRef.current[soundId]) return;

      const soundObj = SOUNDSCAPES.find((s) => s.id === soundId);
      const gainNode = ctx.createGain();
      gainNode.gain.value = volume * 0.1;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      if (soundId === "whitenoise") {
        const noiseSource = createWhiteNoiseBuffer(ctx);
        noiseSource.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(ctx.destination);
        oscillatorsRef.current[soundId] = noiseSource;
        noiseSource.start(0);
      } else {
        const osc = ctx.createOscillator();
        osc.frequency.value = soundObj.freq;
        osc.type = soundObj.type;

        if (soundId === "cyberpunk") {
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.value = 5;
          lfoGain.gain.value = 50;
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          oscillatorsRef.current[`${soundId}-lfo`] = lfo;
          lfo.start();
        }

        osc.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(ctx.destination);
        oscillatorsRef.current[soundId] = osc;
        osc.start();
      }

      gainsRef.current[soundId] = gainNode;
      analyserRef.current = analyser;
    },
    [volume, SOUNDSCAPES, initAudioContext, createWhiteNoiseBuffer]
  );

  const stopSound = useCallback((soundId) => {
    const osc = oscillatorsRef.current[soundId];
    const lfo = oscillatorsRef.current[`${soundId}-lfo`];
    if (osc) {
      try {
        osc.stop();
      } catch (e) {
        console.log("Oscillator already stopped");
      }
      delete oscillatorsRef.current[soundId];
    }
    if (lfo) {
      try {
        lfo.stop();
      } catch (e) {
        console.log("LFO already stopped");
      }
      delete oscillatorsRef.current[`${soundId}-lfo`];
    }
  }, []);

  const handleSoundToggle = useCallback(
    (soundId) => {
      setActiveSound((prev) => {
        const newSound = prev === soundId ? null : soundId;

        if (prev && prev !== soundId) {
          stopSound(prev);
        }

        if (newSound && newSound !== prev) {
          startSound(newSound);
          localStorage.setItem("soundscape_activeSound", newSound);
        } else if (!newSound) {
          localStorage.removeItem("soundscape_activeSound");
        }

        return newSound;
      });
    },
    [startSound, stopSound]
  );

  const handleVolumeChange = useCallback((e) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    localStorage.setItem("soundscape_volume", newVolume);

    Object.values(gainsRef.current).forEach((gainNode) => {
      if (gainNode && audioContextRef.current) {
        gainNode.gain.setValueAtTime(newVolume * 0.1, audioContextRef.current.currentTime);
      }
    });
  }, []);

  const visualizeAudio = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current || !isOpen) return;

    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "rgba(10, 10, 15, 0.05)";
    ctx.fillRect(0, 0, width, height);

    const barWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      const hue = (i / dataArray.length) * 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth;
    }

    animationIdRef.current = requestAnimationFrame(visualizeAudio);
  }, [isOpen]);

  useEffect(() => {
    const saved = localStorage.getItem("soundscape_activeSound");
    const savedVolume = localStorage.getItem("soundscape_volume");
    if (savedVolume) setVolume(Number(savedVolume));
    if (saved) {
      startSound(saved);
      setActiveSound(saved);
    }
  }, [startSound]);

  useEffect(() => {
    if (activeSound && analyserRef.current && isOpen) {
      visualizeAudio();
    }
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [activeSound, visualizeAudio, isOpen]);

  useEffect(() => {
    return () => {
      if (activeSound) stopSound(activeSound);
    };
  }, [activeSound, stopSound]);

  return (
    <>
      <motion.button
        className="floating-fab-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={activeSound ? { boxShadow: "0 0 20px rgba(0, 240, 255, 0.6)" } : {}}
        transition={{ duration: 0.3 }}
        aria-label="Toggle soundscape"
      >
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          🎵
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="floating-soundscape-popup"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {activeSound && (
              <canvas
                ref={canvasRef}
                className="floating-soundscape-visualizer"
                width={240}
                height={60}
              />
            )}

            <div className="floating-soundscape-buttons">
              {SOUNDSCAPES.map((sound) => (
                <motion.button
                  key={sound.id}
                  className={`floating-sound-btn ${activeSound === sound.id ? "active" : ""}`}
                  onClick={() => handleSoundToggle(sound.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {sound.label}
                </motion.button>
              ))}
            </div>

            <div className="floating-volume-control">
              <label>Vol: {Math.round(volume * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="floating-volume-slider"
              />
            </div>

            {activeSound && (
              <div className="floating-status-indicator">● Playing</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
