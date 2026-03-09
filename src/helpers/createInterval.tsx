import type { iCoords, iCreateInterval } from "../types/types";

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
        return 2
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
        return flat ? 3 : 4
      case 8:
        return 4;
      default:
        return 2;
    }
  };

  const root: iCoords = { fret: rootPosition, string: 1, color: colors.root };
  const intervalNote: iCoords = { fret: 6, string: intervalString(interval, flat), color: colors.interval };
  const unisonNote: iCoords | undefined = unison
    ? { fret: 1, string: unisonString(interval, flat), color: colors.unison }
    : undefined;

  return [root, intervalNote, ...(unisonNote ? [unisonNote] : [])];
};
