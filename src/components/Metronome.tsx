import { useEffect, useRef } from "react";
import type { iMetronome } from "../types/types";

export const Metronome = (props: iMetronome) => {
  const { bpm, subdivision, isPlaying, volume } = props;

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  let gainRef = useRef<GainNode | null>(null);
  let gainNode: GainNode | null = null;
  let ctx: AudioContext | null = null;

  useEffect(() => {
    ctx = new AudioContext();
    gainNode = ctx.createGain()

    gainNode.gain.value = volume;
    gainNode.connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainRef.current = gainNode;

    return () => {
      ctx?.close();
    };
  }, []);

  const playClick = () => {
    const ctx = audioCtxRef?.current;
    const masterGain = gainRef.current;
    if (!ctx || !masterGain) return;

    const oscillator = ctx.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.value = 500; // Frequency in Hz

    const sliderGain = ctx.createGain();

    // Connect oscillator to gain node and gain node to context
    oscillator.connect(sliderGain);
    sliderGain.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Set gain node volume
    sliderGain.gain.setValueAtTime(volume, ctx.currentTime);
    sliderGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.05);
  };

  const setVolume = (value: number) => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setTargetAtTime(
        value,
        audioCtxRef.current.currentTime,
        0.01
      )
    }
  }

  // Volume control
  useEffect(() => {
    setVolume(volume);
  }, [volume]);

  // Controls beat subdivision and audio context
  useEffect(() => {
    const interval = (60 / bpm) * 1000 / subdivision;
    if (isPlaying) {
      (async () => {
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        // Resume audio
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        // Clear existing timer
        if (timerRef.current ?? null) {
          clearInterval(timerRef.current!!);
        }

        // Start new timer
        timerRef.current = window.setInterval(playClick, interval);
      })()
    } else {
      // Stop Metronome
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
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
