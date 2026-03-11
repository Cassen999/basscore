import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  iControlsContext,
  iIntervalColors,
  tColorType,
  tInterval,
  tScaleType,
} from "../types/types";

const ControlsContext = createContext<iControlsContext | null>(null);

export const ControlsProvider = ({ children }: { children: ReactNode }) => {
  const rootStyles = getComputedStyle(document.documentElement);
  const baseNoteColor = rootStyles.getPropertyValue('--primary-color');
  const intervalNoteColor = rootStyles.getPropertyValue('--secondary-color');
  const unisonNoteColor = rootStyles.getPropertyValue('--tertiary-color');
  const [interval, setInterval] = useState<tInterval>(2);
  const [showUnison, setShowUnison] = useState<boolean>(true);
  const [rootColor, setRootColor] = useState<tColorType>(baseNoteColor);
  const [intervalColor, setIntervalColor] = useState<tColorType>(intervalNoteColor);
  const [unisonColor, setUnisonColor] = useState<tColorType>(unisonNoteColor);
  const [displayedScales, setDisplayedScales] = useState<tScaleType>("major");
  const [scaleNoteColor, setScaleNoteColor] =
    useState<tColorType>(baseNoteColor);

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
  };

  const value = useMemo(
    (): iControlsContext => ({
      interval: interval,
      setInterval: setInterval,
      intervalColors: intervalColors,
      showUnison: showUnison,
      setShowUnison: setShowUnison,
      displayedScales: displayedScales,
      setDisplayedScales: setDisplayedScales,
      scaleNoteColor: scaleNoteColor,
      setScaleNoteColor: setScaleNoteColor,
    }),
    [
      interval,
      rootColor,
      intervalColor,
      unisonColor,
      showUnison,
      displayedScales,
      scaleNoteColor,
    ],
  );

  return (
    <ControlsContext.Provider value={value}>
      {children}
    </ControlsContext.Provider>
  );
};

export const useControls = () => {
  const context = useContext(ControlsContext);
  if (!context)
    throw new Error(
      "useControls must be used within a ControlsContext Provider",
    );
  return context;
};
