import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 1280;
const TOTAL_DURATION = 60000;

const narrativeScript = [
  {
    start: 0,
    end: 7000,
    text: "I should have asked for any room but 213. The hallway smells like rain-soaked carpet, and every footstep echoes like someone is following me."
  },
  {
    start: 7000,
    end: 14000,
    text: "The brass numbers glow dull red. Two. One. Three. The keycard shakes in my hand, but somehow the lock still clicks open."
  },
  {
    start: 14000,
    end: 24000,
    text: "Inside, the air is still. The wallpaper lifts in tiny blisters, breathing. Each breath reminds me I'm alone—at least, I want to believe I am."
  },
  {
    start: 24000,
    end: 34000,
    text: "The lights stutter. For a heartbeat, everything goes black, and in the dark something whispers right beside my ear."
  },
  {
    start: 34000,
    end: 44000,
    text: "When the lights return, my reflection is already staring back from the mirror. But it's smiling, and I'm not."
  },
  {
    start: 44000,
    end: 52000,
    text: "It raises a hand I haven't moved, beckoning me closer. I can hear a hotel lullaby, sung through gritted teeth."
  },
  {
    start: 52000,
    end: 60000,
    text: "I run. The hallway stretches forever, but the door keeps appearing ahead. Room 213 follows me—no matter where I go."
  }
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function drawHallway(ctx, t) {
  const perspective = 0.6 + t * 0.4;
  ctx.fillStyle = "#060608";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Floor gradient
  const floorGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT * 0.6, 0, CANVAS_HEIGHT);
  floorGradient.addColorStop(0, "#1a1424");
  floorGradient.addColorStop(1, "#050109");
  ctx.fillStyle = floorGradient;
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH * (0.2 - t * 0.1), CANVAS_HEIGHT * 0.6);
  ctx.lineTo(CANVAS_WIDTH * (0.8 + t * 0.1), CANVAS_HEIGHT * 0.6);
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.lineTo(0, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  // Walls
  const wallGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT * 0.6);
  wallGradient.addColorStop(0, "#1c1b3a");
  wallGradient.addColorStop(1, "#090512");
  ctx.fillStyle = wallGradient;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(CANVAS_WIDTH * (0.2 - t * 0.05), CANVAS_HEIGHT * 0.6);
  ctx.lineTo(CANVAS_WIDTH * (0.8 + t * 0.05), CANVAS_HEIGHT * 0.6);
  ctx.lineTo(CANVAS_WIDTH, 0);
  ctx.closePath();
  ctx.fill();

  // Ceiling light flicker
  const flicker = 0.8 + Math.sin(t * Math.PI * 4) * 0.2;
  ctx.fillStyle = `rgba(255, 240, 210, ${0.2 + flicker * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.15, CANVAS_WIDTH * 0.18, CANVAS_HEIGHT * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  return perspective;
}

function drawDoor(ctx, t, perspective) {
  const doorWidth = CANVAS_WIDTH * 0.26 * perspective;
  const doorHeight = CANVAS_HEIGHT * 0.38 * perspective;
  const doorX = (CANVAS_WIDTH - doorWidth) / 2;
  const doorY = CANVAS_HEIGHT * 0.25;

  const doorGradient = ctx.createLinearGradient(doorX, doorY, doorX + doorWidth, doorY + doorHeight);
  doorGradient.addColorStop(0, "#29121f");
  doorGradient.addColorStop(0.5, "#3a1528");
  doorGradient.addColorStop(1, "#200b17");
  ctx.fillStyle = doorGradient;
  ctx.fillRect(doorX, doorY, doorWidth, doorHeight);

  // Door frame
  ctx.strokeStyle = "#6f2d47";
  ctx.lineWidth = 6 * perspective;
  ctx.strokeRect(doorX, doorY, doorWidth, doorHeight);

  // Room number plaque
  const plaqueWidth = doorWidth * 0.32;
  const plaqueHeight = doorHeight * 0.12;
  const plaqueX = doorX + (doorWidth - plaqueWidth) / 2;
  const plaqueY = doorY + doorHeight * 0.25;

  ctx.fillStyle = "#161924";
  ctx.fillRect(plaqueX, plaqueY, plaqueWidth, plaqueHeight);
  ctx.strokeStyle = `rgba(255, 80, 120, ${0.4 + 0.6 * Math.sin(t * Math.PI * 3) ** 2})`;
  ctx.lineWidth = 4 * perspective;
  ctx.strokeRect(plaqueX, plaqueY, plaqueWidth, plaqueHeight);

  ctx.fillStyle = "#ff415f";
  ctx.font = `${34 * perspective}px "Fira Sans", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("213", plaqueX + plaqueWidth / 2, plaqueY + plaqueHeight / 2);

  // Handle glow
  const handleRadius = 10 * perspective;
  const handleX = doorX + doorWidth * (0.75 + 0.02 * Math.sin(t * 12));
  const handleY = doorY + doorHeight * 0.6;
  ctx.fillStyle = "#f1df93";
  ctx.beginPath();
  ctx.arc(handleX, handleY, handleRadius, 0, Math.PI * 2);
  ctx.fill();
}

function drawInterior(ctx, t) {
  ctx.fillStyle = "#050308";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Back wall
  const wallGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT * 0.2, 0, CANVAS_HEIGHT * 0.7);
  wallGradient.addColorStop(0, "#101125");
  wallGradient.addColorStop(1, "#04030a");
  ctx.fillStyle = wallGradient;
  ctx.fillRect(CANVAS_WIDTH * 0.1, CANVAS_HEIGHT * 0.25, CANVAS_WIDTH * 0.8, CANVAS_HEIGHT * 0.55);

  // Peeling wallpaper effect
  ctx.strokeStyle = `rgba(255, 120, 150, ${0.08 + 0.12 * Math.sin(t * Math.PI * 6)})`;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 12; i += 1) {
    const x = CANVAS_WIDTH * (0.18 + 0.05 * i);
    const height = CANVAS_HEIGHT * (0.05 + 0.1 * Math.sin(t * (i + 1)));
    ctx.beginPath();
    ctx.moveTo(x, CANVAS_HEIGHT * 0.3);
    ctx.quadraticCurveTo(x + 12, CANVAS_HEIGHT * 0.35 + height, x + 24, CANVAS_HEIGHT * 0.42);
    ctx.stroke();
  }

  // Bed silhouette
  ctx.fillStyle = "#09040d";
  ctx.fillRect(CANVAS_WIDTH * 0.12, CANVAS_HEIGHT * 0.58, CANVAS_WIDTH * 0.76, CANVAS_HEIGHT * 0.18);
  ctx.fillStyle = "#181227";
  ctx.fillRect(CANVAS_WIDTH * 0.12, CANVAS_HEIGHT * 0.53, CANVAS_WIDTH * 0.76, CANVAS_HEIGHT * 0.07);

  // Window lightning flicker
  const lightning = Math.max(0, Math.sin((t + 0.1) * Math.PI * 8));
  ctx.fillStyle = `rgba(180, 200, 255, ${0.05 + lightning * 0.4})`;
  ctx.fillRect(CANVAS_WIDTH * 0.3, CANVAS_HEIGHT * 0.28, CANVAS_WIDTH * 0.4, CANVAS_HEIGHT * 0.2);
}

function drawWhispers(ctx, t) {
  const layers = 6;
  for (let i = 0; i < layers; i += 1) {
    const opacity = 0.05 + 0.02 * i + Math.sin((t + i) * 6) * 0.01;
    ctx.strokeStyle = `rgba(255, 190, 255, ${opacity})`;
    ctx.lineWidth = 2;
    const radius = CANVAS_WIDTH * (0.1 + i * 0.06);
    ctx.beginPath();
    ctx.ellipse(
      CANVAS_WIDTH * 0.6 + Math.sin(t * 12 + i) * 20,
      CANVAS_HEIGHT * 0.45 + Math.cos(t * 8 + i) * 16,
      radius,
      radius * 0.6,
      Math.sin(t * 2) * 0.2,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}

function drawReflection(ctx, t) {
  ctx.fillStyle = "#030105";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Mirror frame
  const mirrorX = CANVAS_WIDTH * 0.2;
  const mirrorY = CANVAS_HEIGHT * 0.18;
  const mirrorWidth = CANVAS_WIDTH * 0.6;
  const mirrorHeight = CANVAS_HEIGHT * 0.45;

  ctx.fillStyle = "#1a0f1f";
  ctx.fillRect(mirrorX - 20, mirrorY - 16, mirrorWidth + 40, mirrorHeight + 32);

  // Mirror surface
  const mirrorGradient = ctx.createLinearGradient(mirrorX, mirrorY, mirrorX + mirrorWidth, mirrorY + mirrorHeight);
  mirrorGradient.addColorStop(0, "#2c2948");
  mirrorGradient.addColorStop(0.5, "#0d0b16");
  mirrorGradient.addColorStop(1, "#161432");
  ctx.fillStyle = mirrorGradient;
  ctx.fillRect(mirrorX, mirrorY, mirrorWidth, mirrorHeight);

  // Reflection silhouette and smile
  const faceY = mirrorY + mirrorHeight * 0.35;
  const faceWidth = mirrorWidth * 0.38;
  const faceHeight = mirrorHeight * 0.65;
  ctx.fillStyle = `rgba(35, 31, 66, ${0.8 + 0.1 * Math.sin(t * 4)})`;
  ctx.beginPath();
  ctx.ellipse(mirrorX + mirrorWidth / 2, faceY, faceWidth, faceHeight, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(255, 60, 90, ${0.3 + 0.4 * Math.sin(t * Math.PI * 5) ** 2})`;
  ctx.lineWidth = 6;
  ctx.beginPath();
  const smileWidth = faceWidth * 0.8;
  const smileHeight = 30 + Math.sin(t * 6) * 10;
  ctx.moveTo(mirrorX + mirrorWidth / 2 - smileWidth / 2, faceY + faceHeight * 0.35);
  ctx.quadraticCurveTo(
    mirrorX + mirrorWidth / 2,
    faceY + faceHeight * 0.35 + smileHeight,
    mirrorX + mirrorWidth / 2 + smileWidth / 2,
    faceY + faceHeight * 0.35
  );
  ctx.stroke();

  // Eyes
  ctx.fillStyle = `rgba(255, 240, 220, ${0.5 + 0.3 * Math.sin(t * 12)})`;
  const eyeOffset = faceWidth * 0.25;
  const eyeY = faceY - faceHeight * 0.1;
  ctx.beginPath();
  ctx.ellipse(mirrorX + mirrorWidth / 2 - eyeOffset, eyeY, 18, 26, 0, 0, Math.PI * 2);
  ctx.ellipse(mirrorX + mirrorWidth / 2 + eyeOffset, eyeY, 18, 26, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawEscape(ctx, t) {
  ctx.fillStyle = "#05030a";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Stretching hallway effect
  const stretch = 1 + t * 1.5;
  const centerX = CANVAS_WIDTH / 2 + Math.sin(t * Math.PI * 6) * 30;
  const centerY = CANVAS_HEIGHT * 0.4;

  for (let i = 0; i < 12; i += 1) {
    const factor = 1 + i * 0.15 * stretch;
    const opacity = 0.08 + i * 0.03;
    ctx.strokeStyle = `rgba(255, 90, 120, ${opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - CANVAS_WIDTH * 0.45 * factor, centerY - CANVAS_HEIGHT * 0.1 * factor);
    ctx.lineTo(centerX, centerY - CANVAS_HEIGHT * 0.2 * factor);
    ctx.lineTo(centerX + CANVAS_WIDTH * 0.45 * factor, centerY - CANVAS_HEIGHT * 0.1 * factor);
    ctx.lineTo(centerX, centerY + CANVAS_HEIGHT * 0.6 * factor);
    ctx.closePath();
    ctx.stroke();
  }

  // Door flashes
  const flash = Math.max(0, Math.sin((t + 0.2) * Math.PI * 10));
  ctx.fillStyle = `rgba(255, 80, 120, ${flash * 0.4})`;
  ctx.fillRect(centerX - 80, CANVAS_HEIGHT * 0.25, 160, CANVAS_HEIGHT * 0.3);
}

function drawVignette(ctx) {
  const gradient = ctx.createRadialGradient(
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    CANVAS_HEIGHT * 0.25,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    CANVAS_HEIGHT * 0.68
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.65)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawDust(ctx, t) {
  for (let i = 0; i < 50; i += 1) {
    const x = (i * 97 + Math.sin(t * 3 + i) * 120) % CANVAS_WIDTH;
    const progress = (t * 0.2 + i * 0.02) % 1;
    const y = progress * CANVAS_HEIGHT;
    const size = 2 + (i % 4);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + 0.1 * Math.sin(t * 10 + i)})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const scenes = [
  {
    start: 0,
    end: 12000,
    draw: (ctx, elapsed) => {
      const t = clamp(elapsed, 0, 1);
      const perspective = drawHallway(ctx, t);
      drawDoor(ctx, t, perspective);
    }
  },
  {
    start: 12000,
    end: 24000,
    draw: (ctx, elapsed) => {
      const t = clamp(elapsed, 0, 1);
      drawInterior(ctx, t * 0.7);
      drawWhispers(ctx, t);
    }
  },
  {
    start: 24000,
    end: 36000,
    draw: (ctx, elapsed) => {
      const t = clamp(elapsed, 0, 1);
      drawInterior(ctx, t);
      drawWhispers(ctx, t * 1.8);
    }
  },
  {
    start: 36000,
    end: 48000,
    draw: (ctx, elapsed) => {
      const t = clamp(elapsed, 0, 1);
      drawReflection(ctx, t);
    }
  },
  {
    start: 48000,
    end: TOTAL_DURATION,
    draw: (ctx, elapsed) => {
      const t = clamp(elapsed, 0, 1);
      drawEscape(ctx, t);
    }
  }
];

export default function StoryExperience() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [voices, setVoices] = useState([]);
  const playedSegmentsRef = useRef(new Set());
  const preferredVoiceRef = useRef(null);

  const activeSegmentIndex = useMemo(() => {
    return narrativeScript.findIndex((segment) => elapsed >= segment.start && elapsed < segment.end);
  }, [elapsed]);

  const resetSpeech = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    playedSegmentsRef.current.clear();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hydrateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      preferredVoiceRef.current =
        available.find((voice) => /(alloy|neural|natural)/i.test(voice.name)) ||
        available.find((voice) => voice.name.toLowerCase().includes("english") && voice.lang.startsWith("en")) ||
        available[0] ||
        null;
    };
    hydrateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", hydrateVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", hydrateVoices);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext("2d");
    const ctx = ctxRef.current;
    ctx.fillStyle = "#05030a";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawDoor(ctx, 0, 0.6);
    drawVignette(ctx);
  }, []);

  const speakSegment = useCallback((segment) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    const utterance = new window.SpeechSynthesisUtterance(segment.text);
    utterance.pitch = 0.95;
    utterance.rate = 0.92;
    utterance.volume = 0.98;
    if (preferredVoiceRef.current) {
      utterance.voice = preferredVoiceRef.current;
      utterance.lang = preferredVoiceRef.current.lang;
    }
    window.speechSynthesis.speak(utterance);
  }, []);

  const renderFrame = useCallback(
    (timestamp) => {
      if (!isPlaying) return;
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const current = timestamp - startTimeRef.current;
      const clampedElapsed = Math.min(current, TOTAL_DURATION);
      setElapsed(clampedElapsed);

      const ctx = ctxRef.current;
      if (!ctx) return;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const scene = scenes.find((entry) => clampedElapsed >= entry.start && clampedElapsed < entry.end) || scenes.at(-1);
      const localProgress = (clampedElapsed - scene.start) / (scene.end - scene.start || 1);
      scene.draw(ctx, localProgress);

      drawDust(ctx, clampedElapsed / TOTAL_DURATION);
      drawVignette(ctx);

      if (clampedElapsed >= TOTAL_DURATION) {
        setIsPlaying(false);
        setIsFinished(true);
        startTimeRef.current = null;
        return;
      }

      animationRef.current = requestAnimationFrame(renderFrame);
    },
    [isPlaying]
  );

  useEffect(() => {
    if (!isPlaying) return undefined;
    animationRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, renderFrame]);

  useEffect(() => {
    if (!isPlaying || typeof window === "undefined" || !window.speechSynthesis) return;
    narrativeScript.forEach((segment, index) => {
      if (elapsed >= segment.start && !playedSegmentsRef.current.has(index)) {
        playedSegmentsRef.current.add(index);
        speakSegment(segment);
      }
    });
  }, [elapsed, isPlaying, speakSegment]);

  const handlePlay = useCallback(() => {
    resetSpeech();
    setIsFinished(false);
    setIsPlaying(true);
    setElapsed(0);
    startTimeRef.current = null;
  }, [resetSpeech]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setIsFinished(false);
    startTimeRef.current = null;
    resetSpeech();
  }, [resetSpeech]);

  const progress = clamp(elapsed / TOTAL_DURATION, 0, 1);

  return (
    <section className="experience">
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="story-canvas" />
        <div className="timecode">
          <span>{Math.floor(elapsed / 1000).toString().padStart(2, "0")}s</span>
          <span> / 60s</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      <div className="controls">
        {!isPlaying && (
          <button type="button" className="primary" onClick={handlePlay}>
            {isFinished ? "Replay Room 213" : "Enter Room 213"}
          </button>
        )}
        {isPlaying && (
          <button type="button" className="ghost" onClick={handleStop}>
            Leave the Room
          </button>
        )}
      </div>
      <div className="script">
        <h2>Whispered Narrative</h2>
        <ul>
          {narrativeScript.map((segment, index) => {
            const isActive = index === activeSegmentIndex;
            return (
              <li key={segment.start} className={isActive ? "active" : ""}>
                <span className="timestamp">
                  {Math.floor(segment.start / 1000)
                    .toString()
                    .padStart(2, "0")}
                  s
                </span>
                <p>{segment.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="hint">
        Tip: For a more lifelike voice, choose a neural English voice in your browser&apos;s speech settings before pressing play.
      </p>
      <style jsx>{`
        .experience {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 2rem 1.5rem 3rem;
          max-width: 960px;
          margin: 0 auto;
        }

        .canvas-wrapper {
          position: relative;
          align-self: center;
          width: min(420px, 90vw);
        }

        .story-canvas {
          width: 100%;
          aspect-ratio: 9 / 16;
          border-radius: 28px;
          overflow: hidden;
          border: 2px solid rgba(255, 82, 110, 0.25);
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
          background: #05030a;
        }

        .timecode {
          position: absolute;
          top: 14px;
          right: 18px;
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(6, 4, 12, 0.6);
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 92, 130, 0.3);
        }

        .progress-bar {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-bar__fill {
          height: 100%;
          background: linear-gradient(90deg, #ff305f, #ff8a6b);
          transition: width 120ms linear;
        }

        .controls {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        button {
          cursor: pointer;
          padding: 0.85rem 1.8rem;
          border-radius: 999px;
          border: none;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 600;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        button.primary {
          background: linear-gradient(120deg, #ff3b6c, #ff9c5f);
          color: #fff;
          box-shadow: 0 18px 35px rgba(255, 64, 112, 0.35);
        }

        button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 45px rgba(255, 64, 112, 0.45);
        }

        button.ghost {
          background: rgba(8, 5, 20, 0.7);
          color: #ff9ab8;
          border: 1px solid rgba(255, 92, 130, 0.35);
        }

        .script {
          background: rgba(6, 5, 18, 0.75);
          border-radius: 22px;
          padding: 1.8rem;
          border: 1px solid rgba(255, 82, 110, 0.18);
          box-shadow: inset 0 0 24px rgba(255, 30, 90, 0.08);
        }

        .script h2 {
          margin: 0 0 1rem;
          letter-spacing: 0.12em;
          font-size: 0.95rem;
          text-transform: uppercase;
          color: rgba(255, 180, 200, 0.9);
        }

        .script ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .script li {
          display: grid;
          grid-template-columns: 3rem 1fr;
          gap: 1rem;
          padding: 0.8rem 1rem;
          border-radius: 18px;
          background: rgba(15, 10, 28, 0.45);
          border: 1px solid transparent;
          transition: border 0.2s ease, background 0.2s ease;
        }

        .script li.active {
          border-color: rgba(255, 92, 130, 0.45);
          background: rgba(255, 70, 110, 0.12);
          box-shadow: 0 12px 30px rgba(255, 50, 100, 0.12);
        }

        .script .timestamp {
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 180, 210, 0.65);
        }

        .script p {
          margin: 0;
          line-height: 1.55;
          color: rgba(240, 230, 255, 0.86);
        }

        .hint {
          text-align: center;
          font-size: 0.85rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255, 160, 200, 0.55);
        }

        @media (max-width: 720px) {
          .experience {
            padding: 1.5rem 1rem 2.5rem;
          }

          .script li {
            grid-template-columns: 1fr;
          }

          .script .timestamp {
            order: -1;
            margin-bottom: 0.35rem;
          }
        }
      `}</style>
    </section>
  );
}
