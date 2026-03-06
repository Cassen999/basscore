import type { iCoords } from "../types/types";

// possibly user settings
const circleRadius = 8;
const maxStroke = 3;
const margin = circleRadius + maxStroke / 2 + 2;
export const fretboardWidth = 500;
export const fretboardHeight = 200;

export const getY = (stringIndex: number, numFrets: number, numStrings: number) =>
  margin +
  (numStrings - stringIndex) * ((fretboardHeight - 2 * margin) / numFrets);

export const getX = (fretIndex: number, numFrets: number) =>
  margin + fretIndex * ((fretboardWidth - 2 * margin) / numFrets);

export const getColor = () => {}

export const mapFretPoints = (coords: iCoords[], numFrets: number, numStrings: number) => {
  const getCircleX = (fretIndex: number) =>
    (getX(fretIndex - 1, numFrets) + getX(fretIndex, numFrets)) / 2;

  const getCircleY = (stringIndex: number) => getY(stringIndex, numFrets, numStrings);

  return coords.map((coord, i) => {
    const { string, fret, color } = coord;
    return (
      <circle
        key={`fretpoint-${i}`}
        cx={getCircleX(fret)}
        cy={getCircleY(string)}
        r={8}
        fill={color as string}
      />
    );
  });
};
