import type { CardProps } from "primereact/card";
import type { ColorPickerChangeEvent } from 'primereact/colorpicker';
import type { Dispatch, ReactNode, SetStateAction } from "react";

export interface iCoords {
  string: number;
  fret: number;
  color: tColorType;
}

export interface iFretboardProps {
  /** List of fret coordinates */
  coords?: iCoords[];
  /** @default 5 Number of frets to render */
  numFrets?: 5 | 6;
  /** @default 4 Number of strings to render */
  numStrings?: 4 | 5 | 6
  /** @default 500 Width of fretboard in px */
  width?: number;
  /** @default 200 Height of fretboard in px */
  height?: number;
}

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

export type tCreateScale = 'major' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'minor' | 'locrian'; 
export type tInterval = 2 | 3 | 4 | 5 | 6 | 7 | 8

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

export type tColorType = ColorPickerChangeEvent['value'];

export type tNoteType = 'root' | 'interval' | 'unison';

export interface iColor {
  color: tColorType;
  setColor: Dispatch<SetStateAction<tColorType>>
}

/** strings can be colors as css would allow */
export interface iIntervalColors {
  /** @default #FFC5D3 for root.color */
  root: iColor;
  /** @default #C9A0DC for interval.color */
  interval: iColor;
  /** @default #75DAD7 for unison.color */
  unison: iColor;
}

export interface iControlsContext {
  /** @default 2 */
  interval: tInterval;
  intervalColors: iIntervalColors;
  setInterval: Dispatch<SetStateAction<tInterval>>,
  showUnison: boolean;
  setShowUnison: Dispatch<SetStateAction<boolean>>,
}

export interface iControlElementGroups {
  title: string;
  elements: ReactNode[];
}

export interface iControlProps {
  cardProps?: CardProps;
  elements: ReactNode[] | iControlElementGroups[];
}

export interface iIntervalSelectItems {
  name: string;
  value: tInterval;
}
