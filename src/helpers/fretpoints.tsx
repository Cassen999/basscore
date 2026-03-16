import type {
  iCoords,
  iPatterns,
  iScaleString,
  iCreateScale,
  iCreateInterval,
} from "../types/types";

export const createScale = (props: iCreateScale) => {
  const { scaleType, noteColor } = props;
  const patterns: iPatterns = {
    w: [1, 3, 5],
    l: [1, 2, 4],
    r: [1, 3, 4],
  };

  const determineScale = (): iScaleString[] => {
    switch (scaleType) {
      case "major":
        return [
          { string: 1, pattern: "w" },
          { string: 2, pattern: "w" },
          { string: 3, pattern: "l", shift: true },
          { string: 4, pattern: "l", shift: true },
        ];
      case "dorian":
        return [
          { string: 1, pattern: "r" },
          { string: 2, pattern: "w" },
          { string: 3, pattern: "w" },
          { string: 4, pattern: "w" },
        ];
      case "phrygian":
        return [
          { string: 1, pattern: "l" },
          { string: 2, pattern: "r" },
          { string: 3, pattern: "r" },
          { string: 4, pattern: "w" },
        ];
      case "lydian":
        return [
          { string: 1, pattern: "w" },
          { string: 2, pattern: "l", shift: true },
          { string: 3, pattern: "l", shift: true },
          { string: 4, pattern: "r", shift: true },
        ];
      case "mixolydian":
        return [
          { string: 1, pattern: "w" },
          { string: 2, pattern: "w" },
          { string: 3, pattern: "w" },
          { string: 4, pattern: "l", shift: true },
        ];
      case "minor":
        return [
          { string: 1, pattern: "r" },
          { string: 2, pattern: "r" },
          { string: 3, pattern: "w" },
          { string: 4, pattern: "w" },
        ];
      case "locrian":
        return [
          { string: 1, pattern: "l" },
          { string: 2, pattern: "l" },
          { string: 3, pattern: "r" },
          { string: 4, pattern: "r" },
        ];
    }
  };

  const constructStringPattern = (props: iScaleString[]): iCoords[] => {
    const coordsArray: iCoords[] = [];
    if (props.length > 0) {
      props.forEach((p) => {
        // sp = string pattern
        patterns[p.pattern].forEach((sp) => {
          if (p.shift) {
            coordsArray.push({
              string: p.string,
              fret: sp + 1,
              color: noteColor,
            });
          } else {
            coordsArray.push({ string: p.string, fret: sp, color: noteColor });
          }
        });
      });
    }
    return coordsArray;
  };

  return constructStringPattern(determineScale());
};

export const createInterval = ({
  interval,
  flat = false,
  unison = true,
  colors,
}: iCreateInterval): iCoords[] => {
  const rootPosition = (() => {
    switch (interval) {
      case 2:
        return flat ? 5 : 4;
      case 3:
        return flat ? 3 : 2;
      case 4:
        return 1;
      case 5:
        return flat ? 5 : 4;
      case 6:
        return flat ? 3 : 2;
      case 7:
        return flat ? 1 : 5;
      case 8:
        return 4;
      default:
        return 5;
    }
  })();

  const intervalString = (position: number, flat?: boolean): number => {
    switch (position) {
      case 2:
      case 3:
      case 4:
        return 1;
      case 5:
      case 6:
        return 2;
      case 7:
        return flat ? 2 : 3;
      case 8:
        return 3;
      default:
        return 1;
    }
  };

  const unisonString = (position: number, flat?: boolean) => {
    switch (position) {
      case 2:
      case 3:
      case 4:
        return 2;
      case 5:
      case 6:
        return 3;
      case 7:
        return flat ? 3 : 4;
      case 8:
        return 4;
      default:
        return 2;
    }
  };

  const root: iCoords = { fret: rootPosition, string: 1, color: colors.root };
  const intervalNote: iCoords = {
    fret: 6,
    string: intervalString(interval, flat),
    color: colors.interval,
  };
  const unisonNote: iCoords | undefined = unison
    ? { fret: 1, string: unisonString(interval, flat), color: colors.unison }
    : undefined;

  return [root, intervalNote, ...(unisonNote ? [unisonNote] : [])];
};
