import { useEffect, useRef, useState } from "react";
import type { iMetronome } from "../../types/types";

export const Metronome = (props: iMetronome) => {
  const { bpm, subdivision, isPlaying, volume, bpMeasure } = props;
  const [beatCount, setBeatCount] = useState<number>(0);

  const dotCount: number = subdivision * bpMeasure;

  // Refs so playClick can read current values without stale closure
  const beatCountRef = useRef<number>(0);
  const dotCountRef = useRef<number>(dotCount);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const kickBufferRef = useRef<AudioBuffer | null>(null);
  const hiHatBufferRef = useRef<AudioBuffer | null>(null);
  // Keep dotCountRef in sync with derived dotCount
  useEffect(() => {
    dotCountRef.current = dotCount;
  }, [dotCount]);

  useEffect(() => {
    const ctx = new AudioContext();
    const gainNode = ctx.createGain();

    gainNode.gain.value = volume;
    gainNode.connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainRef.current = gainNode;

    const loadBuffer = (path: string) =>
      fetch(path).then((res) => res.arrayBuffer()).then((data) => ctx!.decodeAudioData(data));

    loadBuffer("./sounds/soft-kick.wav").then((buffer) => { kickBufferRef.current = buffer; });
    loadBuffer("./sounds/closed-hi-hat.wav").then((buffer) => { hiHatBufferRef.current = buffer; });

    return () => {
      ctx?.close();
    };
  }, []);

  const playClick = () => {
    const ctx = audioCtxRef?.current;
    const masterGain = gainRef.current;
    if (!ctx || !masterGain) return;

    const currentCount: number = beatCountRef.current;
    const isDownbeat: boolean = currentCount % dotCountRef.current === 0;
    const buffer = isDownbeat ? kickBufferRef.current : hiHatBufferRef.current;

    if (!buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(masterGain);
    source.start();

    const nextCount: number = currentCount + 1;
    beatCountRef.current = nextCount;
    setBeatCount(nextCount);
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

  // Reset beat position when subdivision or time signature changes so dots don't start mid-cycle
  useEffect(() => {
    beatCountRef.current = 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBeatCount(0);
  }, [subdivision, bpMeasure]);

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
        if (timerRef.current != null) {
          clearInterval(timerRef.current);
        }

        // Fire immediately so the first pill and first sound are in sync,
        // then continue on the interval
        playClick();
        timerRef.current = window.setInterval(playClick, interval);
      })()
    } else {
      // Stop Metronome — reset so next Start always begins at pill 0
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      beatCountRef.current = 0;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBeatCount(0);
    }
  }, [isPlaying, bpm, subdivision]);

  // activeDotIndex trails beatCount by 1 — pill N lights up when click N fires
  const activeDotIndex: number = (beatCount - 1 + dotCount) % dotCount;

  return (
    <div className="beat-dots-container">
      <div className="beat-dots-grid">
        {Array.from({ length: dotCount }, (_: unknown, i: number) => {
          const isActive: boolean = isPlaying && beatCount > 0 && i === activeDotIndex;
          return (
            <div
              key={isActive ? `active-${beatCount}` : i}
              className={`beat-dot${isActive ? " beat-dot--active" : ""}`}
            />
          );
        })}
      </div>
    </div>
  );
};
