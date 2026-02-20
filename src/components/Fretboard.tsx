import type { iFretboardProps } from "../types/types";
import {
  fretboardHeight,
  fretboardWidth,
  getX,
  getY,
  mapFretPoints,
} from "../helpers/fretboardHelpers";

const Fretboard = (props?: iFretboardProps) => {
  const numFrets = props?.numFrets ?? 5;
  const numStrings = props?.numStrings ?? 4;
  return (
    <svg
      width={fretboardWidth}
      height={fretboardHeight}
      style={{ background: "white" }}
    >
      {/* Fret Lines */}
      {Array.from({ length: numFrets + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={getX(i, numFrets)}
          y1={getY(1, numFrets, numStrings)}
          x2={getX(i, numFrets)}
          y2={getY(numStrings, numFrets, numStrings)}
          stroke="#888"
          strokeWidth={2}
        />
      ))}

      {/* String Lines */}
      {Array.from({ length: numStrings }).map((_, i) => (
        <line
          key={`string-${i}`}
          x1={getX(0, numFrets)}
          y1={getY(i + 1, numFrets, numStrings)}
          x2={getX(numFrets, numFrets)}
          y2={getY(i + 1, numFrets, numStrings)}
          stroke="#ccc"
          strokeWidth={3 - i * 0.5}
        />
      ))}

      {/** If coordinates are given map the fret points */}
      {props?.coords && mapFretPoints(props.coords, numFrets, numStrings)}
    </svg>
  );
};

export default Fretboard;
