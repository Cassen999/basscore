import { useState } from 'react';
import type { iCoords, iFretboardConfig } from '../types/types';

interface iHistorySnapshot {
  coords: iCoords[];
  fretboardConfig: iFretboardConfig;
}

export const useCustomFretboardHistory = (initial: iHistorySnapshot) => {
  const [past, setPast] = useState<iHistorySnapshot[]>([]);
  const [present, setPresent] = useState<iHistorySnapshot>(initial);
  const [future, setFuture] = useState<iHistorySnapshot[]>([]);

  const setHistory = (snapshot: iHistorySnapshot) => {
    setPast(prev => [...prev, present]);
    setPresent(snapshot);
    setFuture([]);
  };

  const undo = () => {
    if (past.length === 0) return;
    const next = [...past];
    const popped = next.pop()!;
    setPast(next);
    setFuture(f => [present, ...f]);
    setPresent(popped);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = [...future];
    const popped = next.shift()!;
    setFuture(next);
    setPast(p => [...p, present]);
    setPresent(popped);
  };

  return {
    present,
    setHistory,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
};
