export interface iCoords {
  string: number;
  fret: number;
  /** @default false If true, circle will be a different color to denote root note */
  root?: boolean;
  /** @default false If true, circle will be a different color to denote a unison note */
  unison?: boolean;
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

export interface iConvertInterval {
  interval: number;
  showUnison?: boolean;
  flat?: boolean;
}

export type tConvertedInterval = iCoords[];

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

export interface iCreateInterval {
  interval: 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** @default false */
  flat?: boolean;
  /** @default true If true, will show the interval note's unison note */
  unison?: boolean;
}
