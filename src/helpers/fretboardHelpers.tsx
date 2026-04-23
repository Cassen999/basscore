import type { iCoords, iFretboardConfig } from "../types/types";

const maxStroke = 3;

const getMargin = (config: iFretboardConfig) =>
  config.fretpointRadius + maxStroke / 2 + 2;

export const getY = (
  stringIndex: number,
  fretboardConfig: iFretboardConfig,
) => {
  const { numStrings, height } = fretboardConfig;
  const margin = getMargin(fretboardConfig);

  return (
    margin + (numStrings - stringIndex) * ((height - 2 * margin) / (numStrings - 1))
  );
};

export const getX = (fretIndex: number, fretboardConfig: iFretboardConfig) => {
  const { width, numFrets } = fretboardConfig;
  const margin = getMargin(fretboardConfig);

  return margin + fretIndex * ((width - 2 * margin) / numFrets);
};

export const getColor = () => {};

export const snapToCell = (
  mouseX: number,
  mouseY: number,
  config: iFretboardConfig,
): { string: number; fret: number } => {
  const { numFrets, numStrings } = config;

  let closestFret = 1;
  let minFretDist = Infinity;
  for (let f = 1; f <= numFrets; f++) {
    const cellCenterX = (getX(f - 1, config) + getX(f, config)) / 2;
    const dist = Math.abs(mouseX - cellCenterX);
    if (dist < minFretDist) {
      minFretDist = dist;
      closestFret = f;
    }
  }

  let closestString = 1;
  let minStringDist = Infinity;
  for (let s = 1; s <= numStrings; s++) {
    const dist = Math.abs(mouseY - getY(s, config));
    if (dist < minStringDist) {
      minStringDist = dist;
      closestString = s;
    }
  }

  return {
    string: Math.max(1, Math.min(numStrings, closestString)),
    fret: Math.max(1, Math.min(numFrets, closestFret)),
  };
};

export const findAvailableFret = (
  string: number,
  targetFret: number,
  direction: 1 | -1,
  coords: iCoords[],
  excludeId: string,
  config: iFretboardConfig,
): number | null => {
  const { numFrets } = config;
  const occupied = new Set(
    coords.filter(d => d.string === string && d.id !== excludeId).map(d => d.fret),
  );

  if (!occupied.has(targetFret)) return targetFret;

  for (let f = targetFret + direction; f >= 1 && f <= numFrets; f += direction) {
    if (!occupied.has(f)) return f;
  }

  const reverseDir = (-direction) as 1 | -1;
  for (let f = targetFret + reverseDir; f >= 1 && f <= numFrets; f += reverseDir) {
    if (!occupied.has(f)) return f;
  }

  return null;
};

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
