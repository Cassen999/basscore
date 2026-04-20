import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { iTimerContext, tTimerStatus } from '../types/types';

const TimerContext = createContext<iTimerContext | null>(null);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [duration, setDuration] = useState<number | null>(null);
  const [accumulated, setAccumulated] = useState<number>(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [status, setStatus] = useState<tTimerStatus>('idle');
  const [displayMs, setDisplayMs] = useState<number>(0); // internal only — not exposed in context

  const pad = (n: number) => String(n).padStart(2, '0');

  // Mirror of startedAt as a ref so pause() can read the current value
  // synchronously without doubling accummulator in strict mode
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== 'running') {
      setDisplayMs(duration !== null ? Math.max(0, duration * 1000 - accumulated) : 0);
      return;
    }
    const id = setInterval(() => {
      const elapsed = accumulated + (startedAtRef.current !== null ? Date.now() - startedAtRef.current : 0);
      setDisplayMs(duration !== null ? Math.max(0, duration * 1000 - elapsed) : 0);
    }, 100);
    return () => clearInterval(id);
  }, [status, accumulated, startedAt, duration]);

  const start = useCallback(() => {
    const now = Date.now();
    startedAtRef.current = now;
    setStartedAt(now);
    setStatus('running');
  }, []);

  const pause = useCallback(() => {
    const elapsed = startedAtRef.current !== null ? Date.now() - startedAtRef.current : 0;
    startedAtRef.current = null;
    setAccumulated((acc) => acc + elapsed);
    setStartedAt(null);
    setStatus('paused');
  }, []);

  const restart = useCallback(() => {
    const now = Date.now();
    startedAtRef.current = now;
    setAccumulated(0);
    setStartedAt(now);
    setStatus('running');
  }, []);

  const stop = useCallback(() => {
    startedAtRef.current = null;
    setStartedAt(null);
    setAccumulated(0);
    setStatus('idle');
  }, []);

  const value = useMemo(
    (): iTimerContext => ({
      duration,
      setDuration,
      accumulated,
      formattedTime: `${pad(Math.floor(displayMs / 60000))}:${pad(Math.floor((displayMs % 60000) / 1000))}`,
      status,
      start,
      pause,
      restart,
      stop,
    }),
    [duration, accumulated, startedAt, displayMs, status, start, pause, restart, stop],
  );

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimer must be used within a TimerProvider');
  return context;
};
