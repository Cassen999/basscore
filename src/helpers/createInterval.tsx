import type { iCoords, iCreateInterval } from "../types/types";

export const createInterval = ({
  interval,
  flat = false,
  unison = true,
}: iCreateInterval): iCoords[] => {
  const root: iCoords = {
    fret: 5,
    string: 1,
    root: true,
  };

  const intervalNote: iCoords = {
    fret: 6,
    string: 1,
  };

  const unisonNote: iCoords = {
    fret: 1,
    string: 2,
    unison: true,
  };

  switch (interval) {
    case 2:
      root.fret = flat ? 5 : 4;
      break;

    case 3:
      root.fret = flat ? 3 : 4;
      break;

    case 4:
      root.fret = 1;
      break;

    case 5:
      root.fret = flat ? 5 : 4;
      intervalNote.string = 2;
      if (unison) unisonNote.string = 3;
      break;

    case 6:
      root.fret = flat ? 3 : 2;
      intervalNote.string = 2;
      if (unison) unisonNote.string = 3;
      break;

    case 7:
      root.fret = flat ? 1 : 5;
      intervalNote.string = flat ? 2 : 3;
      if (unison) unisonNote.string = flat ? 3 : 4;
      break;

    case 8:
      root.fret = 4;
      intervalNote.string = 3;
      if (unison) unisonNote.string = 4;
      break;
  }

  return [root, intervalNote, ...(unison ? [unisonNote] : [])];
};
