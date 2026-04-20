import type { CardProps } from "primereact/card";
import type { ColorPickerChangeEvent } from 'primereact/colorpicker';
import type { Dispatch, ReactNode, SetStateAction } from "react";

// Shared Types
export type tColorType = ColorPickerChangeEvent['value'];

// Fretboard Types
export interface iCoords {
  string: number;
  fret: number;
  color: tColorType;
}

export interface iFretboardProps {
  /** List of fret coordinates */
  coords?: iCoords[];
}

export interface iFretboardConfig {
  /** @default 700 Width of fretboard in px */
  width: number;
  /** @default 200 Height of fretboard in px */
  height: number;
  /** @default 6 Number of frets to display */
  numFrets: number;
  /** @default 4 Number of strings to display */
  numStrings: number;
  /** @default 8 Radius of fretpoint dot in px */
  fretpointRadius: number;
}

// Scale Types
export type tScaleType = 'major' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'minor' | 'locrian';

export type tPatternNumber = 1 | 2 | 3 | 4 | 5;

export type tPatternArray = [tPatternNumber, tPatternNumber, tPatternNumber];

export interface iPatterns {
  w: tPatternArray;
  l: tPatternArray;
  r: tPatternArray;
}

export interface iScaleString {
  string: number;
  pattern: 'w' | 'l' | 'r';
  shift?: boolean;
}

export interface iCreateScale {
  scaleType: tScaleType;
  noteColor: tColorType;
}

export interface iScaleSelectItems {
  name: string;
  value: tScaleType;
}

// Interval Types
export type tInterval = 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type tNoteType = 'root' | 'interval' | 'unison';

export interface iColor {
  color: tColorType;
  setColor: Dispatch<SetStateAction<tColorType>>;
}

export interface iCreateInterval {
  interval: tInterval;
  /** @default false */
  flat?: boolean;
  /** @default true If true, will show the interval note's unison note */
  unison?: boolean;
  colors: {
    root: string,
    interval: string,
    unison: string,
  }
}

/** strings can be colors as css would allow */
export interface iIntervalColors {
  /** @default #a78bfa  for root.color */
  root: iColor;
  /** @default #f7b0d3 for interval.color */
  interval: iColor;
  /** @default #94e0ed for unison.color */
  unison: iColor;
}

export interface iIntervalSelectItems {
  name: string;
  value: tInterval;
}

// Controls Types
export interface iControlsContext {
  /** @default 2 */
  interval: tInterval;
  intervalColors: iIntervalColors;
  setInterval: Dispatch<SetStateAction<tInterval>>,
  showUnison: boolean;
  setShowUnison: Dispatch<SetStateAction<boolean>>,
  displayedScales: tScaleType;
  setDisplayedScales: Dispatch<SetStateAction<tScaleType>>
  scaleNoteColor: tColorType;
  setScaleNoteColor: Dispatch<SetStateAction<tColorType>>
  fretboardConfig: iFretboardConfig;
  setFretboardConfig: Dispatch<SetStateAction<iFretboardConfig>>;
}

export interface iControlElementGroups {
  title: string;
  elements: ReactNode[];
}

export interface iControlProps {
  cardProps?: CardProps;
  elements: ReactNode[] | iControlElementGroups[];
}

// Metronome Types
export type tSubdivision = 0.25 | 0.5 | 1 | 2 | 4;

export interface iSubdivisionMenu {
  name: string;
  value: tSubdivision;
}

export interface iTimeSigMenu {
  name: string;
  /** Full time signature string, e.g. "4/4". Numerator is parsed for bpMeasure. */
  value: string;
}

export interface iMetronome {
  bpm: number;
  subdivision: tSubdivision;
  isPlaying: boolean;
  volume: number;
  /** Number of beats per measure (numerator of time signature) */
  bpMeasure: number;
}

// Timer Types
/** 'idle' = not started or stopped; 'running' = counting; 'paused' = mid-session hold */
export type tTimerStatus = 'idle' | 'running' | 'paused';

export interface iTimerContext {
  /** Countdown duration in seconds selected by the user. null = no limit (stopwatch mode). */
  duration: number | null;
  setDuration: Dispatch<SetStateAction<number | null>>;
  /** Milliseconds accumulated before the current run started. Resets to 0 on restart/stop. */
  accumulated: number;
  /** Remaining time formatted as MM:SS */
  formattedTime: string;
  status: tTimerStatus;
  /** Start or resume the timer */
  start: () => void;
  /** Pause without resetting elapsed time */
  pause: () => void;
  /** Reset elapsed time and begin counting immediately */
  restart: () => void;
  /** Stop and reset to idle */
  stop: () => void;
}

export interface iTimerDialogProps {
  visible: boolean;
  onHide: () => void;
  /** Bounding rect of the trigger button — used to anchor the dialog position */
  anchorRect: DOMRect | null;
}
