import { useEffect, useRef } from "react";
import type { iMetronome } from "../types/types";

export const Metronome = (props: iMetronome) => {
  const { bpm, subdivision, isPlaying } = props;

  useEffect(() => {
    if (!isPlaying) return;
    stop();
  }, [bpm]);

  const clickRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const playClick = () => {
    const ctx = clickRef?.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "square";
    oscillator.frequency.value = 500; // Frequency in Hz

    gainNode.gain.setValueAtTime(1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.05);
  };

  // Controls beat subdivision and audio context
  useEffect(() => {
    if (isPlaying) {
      if (!clickRef.current) {
        clickRef.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
      } else {
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
        } else {
          throw new Error('Error with timer ref')
        }
      }
      const interval = (60 / bpm) * 1000 / subdivision;
      timerRef.current = window.setInterval(playClick, interval);
    } else {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    }
  }, [isPlaying, bpm, subdivision]);

  return (
    <div className="start-metronome-btn">
      {/* <Button onClick={isPlaying ? stop : start}>
        {isPlaying ? "Stop" : "Start"}
      </Button> */}
    </div>
  );
};
