import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type { iControlsContext, tInterval } from "../types/types";

const ControlsContext = createContext<iControlsContext | null>(null);

export const ControlsProvider = ({ children }: { children: ReactNode }) => {
  const [interval, setInterval] = useState<tInterval>(2);

  const value = useMemo((): iControlsContext => ({
    interval: interval,
    setInterval: setInterval,
  }), [
    interval,
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
