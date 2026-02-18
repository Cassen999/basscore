export interface iCoords {
  string: number;
  fret: number;
  showUnison?: boolean;
}

export interface iFretboardProps {
  coords?: iCoords[];
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
