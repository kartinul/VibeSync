import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ProgressBar,
  Slider,
  Label,
  Button,
} from "@fluentui/react-components";
import {
  Settings24Regular,
  Play48Filled,
  Pause48Filled,
  Next24Filled,
  Previous24Filled,
  Dismiss24Regular,
  Power24Filled,
  Speaker224Filled,
  Add24Filled,
  MusicNote2Filled,
} from "@fluentui/react-icons";
import "./App.css";

type MoodKey = "focused" | "stressed" | "sad" | "happy";

interface Track {
  name: string;
  artist: string;
  bpm: number;
  art: string;
  mood: MoodKey;
}

interface MoodData {
  name: string;
  icon: string;
  desc: string;
  color: string;
  bg: string;
  conf: number;
  emotions: Record<string, number>;
  tracks: Array<{ name: string; artist: string; bpm: number; art: string }>;
}

const MOODS: Record<MoodKey, MoodData> = {
  focused: {
    name: "Focused",
    icon: "🎯",
    desc: "Deep work mode active",
    color: "var(--blue)",
    bg: "rgba(58, 141, 255, 0.15)",
    conf: 88,
    emotions: { focused: 78, neutral: 15, happy: 5, stressed: 2 },
    tracks: [
      { name: "Ambient Flow", artist: "Deep Focus", bpm: 80, art: "🌊" },
      { name: "Neural Pathways", artist: "Brain.fm", bpm: 85, art: "🧠" },
    ],
  },
  stressed: {
    name: "Stressed",
    icon: "😤",
    desc: "Tension detected — calming...",
    color: "var(--coral)",
    bg: "rgba(255, 94, 94, 0.15)",
    conf: 91,
    emotions: { stressed: 72, focused: 18, neutral: 7, happy: 3 },
    tracks: [
      { name: "Weightless", artist: "Marconi Union", bpm: 60, art: "☁️" },
      { name: "Quiet Mind", artist: "Zen Mix", bpm: 54, art: "🧘" },
    ],
  },
  sad: {
    name: "Sad",
    icon: "😔",
    desc: "Lifting spirits...",
    color: "var(--purple)",
    bg: "rgba(168, 85, 247, 0.15)",
    conf: 84,
    emotions: { sad: 68, neutral: 20, stressed: 8, happy: 4 },
    tracks: [
      { name: "Sunrise", artist: "Lofi Girl", bpm: 90, art: "☀️" },
      { name: "Bloom", artist: "Spring Mix", bpm: 96, art: "🌸" },
    ],
  },
  happy: {
    name: "Happy",
    icon: "😄",
    desc: "Riding the positive wave",
    color: "var(--green)",
    bg: "var(--green-dim)",
    conf: 95,
    emotions: { happy: 82, focused: 10, neutral: 6, stressed: 2 },
    tracks: [
      { name: "Vibrant Energy", artist: "Electric Soul", bpm: 124, art: "⚡" },
      { name: "Golden Hour", artist: "Sunset Mix", bpm: 105, art: "🌇" },
    ],
  },
};

const VisionEngine: React.FC<{ currentMood: MoodKey; isActive: boolean }> = ({
  currentMood,
  isActive,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
    setupCamera();
    const videoElem = videoRef.current;
    return () => {
      const stream = videoElem?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mood = MOODS[currentMood];
      const color = isActive
        ? getComputedStyle(document.documentElement)
            .getPropertyValue(mood.color.replace("var(", "").replace(")", ""))
            .trim() || "#1DB954"
        : "#606070";

      const boxW = 240;
      const boxH = 240;
      const boxY = 120;
      const boxX = 100;

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.setLineDash([]);

      ctx.lineWidth = 3;
      const len = 24;
      ctx.beginPath();
      ctx.moveTo(boxX, boxY + len);
      ctx.lineTo(boxX, boxY);
      ctx.lineTo(boxX + len, boxY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(boxX + boxW - len, boxY);
      ctx.lineTo(boxX + boxW, boxY);
      ctx.lineTo(boxX + boxW, boxY + len);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(boxX, boxY + boxH - len);
      ctx.lineTo(boxX, boxY + boxH);
      ctx.lineTo(boxX + len, boxY + boxH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(boxX + boxW - len, boxY + boxH);
      ctx.lineTo(boxX + boxW, boxY + boxH);
      ctx.lineTo(boxX + boxW, boxY + boxH - len);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = "bold 11px 'DM Mono'";
      ctx.fillText(
        isActive ? `[ VISION ACTIVE ]` : `[ STANDBY ]`,
        boxX + 5,
        boxY - 10,
      );
      ctx.fillText(
        isActive ? `VIBE: ${mood.name.toUpperCase()}` : `AUTO SYNC PAUSED`,
        boxX + 5,
        boxY + boxH + 15,
      );

      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [currentMood, isActive]);

  return (
    <div className="cam-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-feed"
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="vision-overlay"
      />
    </div>
  );
};

const SpotifyLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.298c-.218.358-.679.471-1.038.254-2.812-1.718-6.353-2.107-10.521-1.153-.41.094-.814-.162-.908-.571-.094-.41.163-.814.572-.908 4.564-1.042 8.48-.593 11.633 1.331.359.218.471.679.254 1.038zm1.47-3.253c-.275.446-.853.587-1.299.313-3.219-1.978-8.127-2.551-11.934-1.397-.502.152-1.03-.135-1.182-.637-.152-.502.135-1.03.637-1.182 4.352-1.32 9.76-.669 13.465 1.606.446.274.587.853.313 1.299zm.127-3.41c-3.859-2.292-10.232-2.504-13.911-1.387-.593.18-1.22-.155-1.399-.748-.18-.593.155-1.22.748-1.399 4.232-1.285 11.272-.99 15.66 1.615.533.317.708 1.007.392 1.541-.317.533-1.007.707-1.541.392z" />
  </svg>
);

function App() {
  const [confirmedMood, setConfirmedMood] = useState<MoodKey>("focused");
  const [detectedMood, setDetectedMood] = useState<MoodKey>("focused");

  // Track State
  const [currentTrack, setCurrentTrack] = useState<Track>({
    ...MOODS.focused.tracks[0],
    mood: "focused",
  });
  const [queuedTrack, setQueuedTrack] = useState<Track>({
    ...MOODS.focused.tracks[1],
    mood: "focused",
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSyncActive, setIsSyncActive] = useState(true);
  const [delaySecs, setDelaySecs] = useState(30);
  const [progress, setProgress] = useState(0);
  const [seekValue, setSeekValue] = useState(0); // Current seconds
  const [volume, setVolume] = useState(70);
  const trackDuration = 240; // 4 minutes in seconds

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNext = useCallback(() => {
    // Switch to the track that was waiting in the queue
    setCurrentTrack(queuedTrack);
    
    // Prep the NEXT track for the current confirmed mood
    const moodTracks = MOODS[queuedTrack.mood].tracks;
    const currentIndex = moodTracks.findIndex((t) => t.name === queuedTrack.name);
    const nextIndex = (currentIndex + 1) % moodTracks.length;
    
    setQueuedTrack({ 
      ...moodTracks[nextIndex], 
      mood: queuedTrack.mood 
    });
    setSeekValue(0);
  }, [queuedTrack]);

  // Improved Playback Engine
  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      if (isPlaying) {
        const deltaTime = (now - lastTime) / 1000;
        setSeekValue((s) => {
          const nextVal = s + deltaTime;
          if (nextVal >= trackDuration) {
            handleNext();
            return 0;
          }
          return nextVal;
        });
      }
      lastTime = now;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, handleNext]);

  useEffect(() => {
    if (isSyncActive && detectedMood !== confirmedMood) {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setConfirmedMood(detectedMood);
            // LOCK the new track into the queue only now
            setQueuedTrack({
              ...MOODS[detectedMood].tracks[0],
              mood: detectedMood,
            });
            return 0;
          }
          return p + (100 / (delaySecs * 10));
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isSyncActive, detectedMood, confirmedMood, delaySecs]);

  const currentMoodData = MOODS[confirmedMood];
  const targetMoodData = MOODS[detectedMood];
  const isLocking = isSyncActive && detectedMood !== confirmedMood;

  return (
    <div
      className="app-container"
      style={{
        background: `radial-gradient(circle at 50% 50%, ${isSyncActive ? currentMoodData.bg : "rgba(0,0,0,0)"}, var(--bg))`,
      }}
    >
      <div className="noise" />

      <main className="main-grid" style={{ position: "relative", zIndex: 2 }}>
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div className="master-switch-container">
            <button
              className={`huge-sync-toggle ${isSyncActive ? "active" : ""}`}
              onClick={() => setIsSyncActive(!isSyncActive)}
            >
              <div className="toggle-icon">
                <Power24Filled />
              </div>
              <div className="toggle-label">
                <span className="toggle-text">
                  {isSyncActive ? "SYNCING ACTIVE" : "SYNCING PAUSED"}
                </span>
                <span className="toggle-subtext">
                  {isSyncActive ? "SYSTEM ONLINE" : "STANDBY MODE"}
                </span>
              </div>
            </button>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <span className="card-title">Vision Engine</span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {isSyncActive && (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      background: "var(--coral)",
                      borderRadius: "50%",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                )}
                <span
                  className="mono"
                  style={{
                    color: isSyncActive ? "var(--coral)" : "var(--dim)",
                    fontSize: 9,
                  }}
                >
                  LIVE FEED
                </span>
              </div>
            </div>
            <div className="card-body">
              <VisionEngine
                currentMood={detectedMood}
                isActive={isSyncActive}
              />

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {Object.entries(targetMoodData.emotions).map(([name, val]) => (
                  <div
                    key={name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        fontSize: "10px",
                        width: "65px",
                        color: "var(--muted)",
                      }}
                    >
                      {name}
                    </span>
                    <ProgressBar
                      value={isSyncActive ? val / 100 : 0}
                      color="brand"
                      style={{ height: 3 }}
                    />
                    <span
                      className="mono"
                      style={{
                        fontSize: "10px",
                        color: "var(--dim)",
                        width: "35px",
                        textAlign: "right",
                      }}
                    >
                      {isSyncActive ? `${val}%` : "0%"}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "32px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: "10px",
                      color: isLocking ? targetMoodData.color : "var(--dim)",
                    }}
                  >
                    {isLocking
                      ? `LOCKING ${detectedMood.toUpperCase()} VIBE`
                      : "VIBE STABILITY"}
                  </span>
                  <span
                    className="mono"
                    style={{ fontSize: "10px", color: "var(--muted)" }}
                  >
                    {isSyncActive
                      ? `${Math.round((progress / 100) * delaySecs)}s / ${delaySecs}s`
                      : "--"}
                  </span>
                </div>
                <ProgressBar
                  value={progress / 100}
                  color={isLocking ? "brand" : "success"}
                  style={{ height: 6 }}
                />
              </div>

              <div
                style={{
                  marginTop: "32px",
                  paddingTop: "24px",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <span
                  className="card-title"
                  style={{ display: "block", marginBottom: "16px" }}
                >
                  MOOD SIMULATOR
                </span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(Object.keys(MOODS) as MoodKey[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setDetectedMood(m);
                        setProgress(0);
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: "1px solid var(--border)",
                        background:
                          detectedMood === m
                            ? MOODS[m].bg
                            : "rgba(255,255,255,0.02)",
                        color:
                          detectedMood === m ? MOODS[m].color : "var(--muted)",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontFamily: "var(--font-mono)",
                        transition: "all 0.2s",
                      }}
                    >
                      {MOODS[m].icon} {MOODS[m].name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Player Column */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h1
                className="text-syne"
                style={{ fontSize: "24px", margin: 0, lineHeight: 1 }}
              >
                VibeSync
              </h1>
              <span
                className="text-mono"
                style={{
                  fontSize: "9px",
                  color: "var(--dim)",
                  letterSpacing: "0.1em",
                  marginTop: "4px",
                }}
              >
                VERSION 2.0.5 STABLE
              </span>
            </div>
            <button
              className="settings-btn"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border)",
                color: "#fff",
                padding: "8px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              {isSettingsOpen ? <Dismiss24Regular /> : <Settings24Regular />}
            </button>
          </header>

          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <span className="card-title">
                {isSettingsOpen ? "APP PREFERENCES" : "ACTIVE VIBE STREAM"}
              </span>
              <div className="spotify-badge">
                <SpotifyLogo />
                <span
                  className="mono"
                  style={{
                    color: "var(--green)",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  CONNECTED
                </span>
              </div>
            </div>

            <div className="card-body">
              {isSettingsOpen ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "32px",
                    padding: "10px",
                  }}
                >
                  <div>
                    <Label
                      style={{
                        display: "block",
                        marginBottom: "16px",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Mood Sync Lock (s)
                    </Label>
                    <Slider
                      value={delaySecs}
                      min={5}
                      max={60}
                      step={5}
                      onChange={(_, d) => setDelaySecs(d.value)}
                    />
                  </div>
                  <Button
                    appearance="subtle"
                    icon={<Power24Filled />}
                    style={{
                      color: "var(--coral)",
                      marginTop: "auto",
                      textAlign: "left",
                      justifyContent: "flex-start",
                    }}
                  >
                    Logout from Spotify
                  </Button>
                </div>
              ) : (
                <div className="player-container">
                  <div style={{ width: "100%", marginBottom: "24px" }}>
                    <div className="vibe-card-layout">
                      <div className="conf-section">
                        <span
                          className="conf-val"
                          style={{
                            color: isSyncActive
                              ? currentMoodData.color
                              : "var(--dim)",
                          }}
                        >
                          {isSyncActive ? `${currentMoodData.conf}%` : "--%"}
                        </span>
                        <span className="conf-lbl">CONFIDENCE</span>
                      </div>

                      <div className="mood-info-refined">
                        <div className="mood-emoji-wrap">
                          {isSyncActive ? currentMoodData.icon : "💤"}
                        </div>
                        <div className="mood-text-wrap">
                          <h2
                            className="mood-title-refined"
                            style={{
                              color: isSyncActive
                                ? currentMoodData.color
                                : "var(--text)",
                            }}
                          >
                            {isSyncActive ? currentMoodData.name : "STANDBY"}
                          </h2>
                          <p className="mood-status-refined">
                            {isSyncActive
                              ? currentMoodData.desc
                              : "SYSTEM WAITING..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="album-art-large">{currentTrack.art}</div>
                  <div className="track-meta-large">
                    <h3 className="track-name-large">{currentTrack.name}</h3>
                    <p className="artist-name-large">{currentTrack.artist}</p>
                  </div>

                  <div className="playback-seek">
                    <ProgressBar
                      value={seekValue / trackDuration}
                      color="brand"
                      style={{ height: 4 }}
                    />
                    <div className="time-row">
                      <span>{formatTime(seekValue)}</span>
                      <span>{formatTime(trackDuration)}</span>
                    </div>
                  </div>

                  <div className="player-controls-main">
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--muted)",
                        cursor: "pointer",
                        fontSize: "20px",
                      }}
                    >
                      <Previous24Filled />
                    </button>
                    <button
                      className="play-pause-huge"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause48Filled /> : <Play48Filled />}
                    </button>
                    <button
                      onClick={handleNext}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--muted)",
                        cursor: "pointer",
                        fontSize: "20px",
                      }}
                    >
                      <Next24Filled />
                    </button>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      marginTop: "8px",
                    }}
                  >
                    <Speaker224Filled
                      style={{ color: "var(--dim)", fontSize: "16px" }}
                    />
                    <Slider
                      value={volume}
                      onChange={(_, d) => setVolume(d.value)}
                      style={{ flex: 1 }}
                    />
                  </div>

                  <div
                    style={{
                      width: "100%",
                      marginTop: "auto",
                      paddingTop: "32px",
                    }}
                  >
                    <span
                      className="card-title"
                      style={{ display: "block", marginBottom: "16px" }}
                    >
                      {isLocking ? "TARGETING NEW VIBE" : "MOOD QUEUE"}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        padding: "16px",
                        background: isLocking
                          ? MOODS[detectedMood].bg
                          : "rgba(255,255,255,0.02)",
                        borderRadius: "16px",
                        border: `1px solid ${isLocking ? MOODS[detectedMood].color : "var(--border)"}`,
                        transition: "all 0.5s ease",
                      }}
                    >
                      <div
                        className="mono"
                        style={{
                          fontSize: "11px",
                          color: isLocking
                            ? MOODS[detectedMood].color
                            : "var(--dim)",
                          width: "24px",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        {isLocking ? <Add24Filled /> : <MusicNote2Filled />}
                      </div>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                        }}
                      >
                        {isLocking
                          ? MOODS[detectedMood].tracks[0].art
                          : queuedTrack.art}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "15px", fontWeight: 700 }}>
                          {isLocking
                            ? MOODS[detectedMood].tracks[0].name
                            : queuedTrack.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--dim)" }}>
                          {isLocking
                            ? MOODS[detectedMood].tracks[0].artist
                            : queuedTrack.artist}
                          {isLocking && ` (Queuing for ${detectedMood})`}
                        </div>
                      </div>
                      <div
                        className="mono"
                        style={{
                          fontSize: "10px",
                          color: isLocking
                            ? MOODS[detectedMood].color
                            : "var(--dim)",
                        }}
                      >
                        {isLocking ? "QUEUING..." : `${queuedTrack.bpm} BPM`}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
