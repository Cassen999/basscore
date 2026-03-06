import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type { iControlsContext, iIntervalColors, tColorType, tInterval } from "../types/types";

const ControlsContext = createContext<iControlsContext | null>(null);

export const ControlsProvider = ({ children }: { children: ReactNode }) => {
  const [interval, setInterval] = useState<tInterval>(2);
  const [rootColor, setRootColor] = useState<tColorType>('#FFC5D3');
  const [intervalColor, setIntervalColor] = useState<tColorType>('#C9A0DC');
  const [unisonColor, setUnisonColor] = useState<tColorType>('#75DAD7');

  const intervalColors: iIntervalColors = {
    root: {
      color: rootColor,
      setColor: setRootColor,
    },
    interval: {
      color: intervalColor,
      setColor: setIntervalColor,
    },
    unison: {
      color: unisonColor,
      setColor: setUnisonColor,
    },
  }

  const value = useMemo((): iControlsContext => ({
    interval: interval,
    setInterval: setInterval,
    intervalColors: intervalColors,
  }), [
    interval,
    rootColor,
    intervalColor,
    unisonColor,
  ]);

  return (
    <ControlsContext.Provider value={value}>
      {children}
    </ControlsContext.Provider>
  )
}

export const useControls = () => {
  const context = useContext(ControlsContext);
  if (!context) throw new Error('useControls must be used within a ControlsContext Provider');
  return context;
}
