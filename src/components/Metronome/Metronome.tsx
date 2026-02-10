import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";

export const Metronome = () => {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);

  const clickRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const playClick = () => {
    const ctx = clickRef?.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "square";
    oscillator.frequency.value = 1000; // Frequency in Hz

    gainNode.gain.setValueAtTime(1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.05);
  };

  const start = () => {
    if (!clickRef.current) {
      clickRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }

    setIsPlaying(true);

    const interval = (60 / bpm) * 1000;
    timerRef.current = window.setInterval(playClick, interval);
  };

  const stop = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    stop();
    start();
  }, [bpm]);

  return (
    <div className="metronome-container">
      <h1>Metronome BPM: {bpm}</h1>

      <div>
        <Button onClick={isPlaying ? stop : start}>
          {isPlaying ? "Stop" : "Start"}
        </Button>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <label>BPM: </label>

        <input
          type="number"
          min="40"
          max="240"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
        />
      </div>
    </div>
  );
};
