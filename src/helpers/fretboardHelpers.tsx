import type { iCoords, iFretboardConfig } from "../types/types";

// possibly user settings
const circleRadius = 8;
const maxStroke = 3;
const margin = circleRadius + maxStroke / 2 + 2;

export const getY = (
  stringIndex: number,
  fretboardConfig: iFretboardConfig,
) => {
  const { numStrings, height } = fretboardConfig;

  return (
    margin + (numStrings - stringIndex) * ((height - 2 * margin) / (numStrings - 1))
  );
};

export const getX = (fretIndex: number, fretboardConfig: iFretboardConfig) => {
  const { width, numFrets } = fretboardConfig;

  return margin + fretIndex * ((width - 2 * margin) / numFrets);
};

export const getColor = () => {};

export const mapFretPoints = (
  coords: iCoords[],
  fretboardConfig: iFretboardConfig,
) => {
  const getCircleX = (fretIndex: number) =>
    (getX(fretIndex - 1, fretboardConfig) + getX(fretIndex, fretboardConfig)) /
    2;

  const getCircleY = (stringIndex: number) =>
    getY(stringIndex, fretboardConfig);

  return coords.map((coord, i) => {
    const { string, fret, color } = coord;
    return (
      <circle
        key={`fretpoint-${i}`}
        cx={getCircleX(fret)}
        cy={getCircleY(string)}
        r={fretboardConfig.fretpointRadius}
        fill={color as string}
      />
    );
  });
};
