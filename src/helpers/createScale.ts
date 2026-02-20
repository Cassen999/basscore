import type { iCoords, iPatterns, iScaleString, tCreateScale } from "../types/types";

export const createScale = (scaleType: tCreateScale) => {
  const patterns: iPatterns = {
    w: [1, 3, 5],
    l: [1, 2, 4],
    r: [1, 3, 4],
  };

  const determineScale = (): iScaleString[] => {
    switch (scaleType) {
      case 'major':
        return [
          { string: 1, pattern: 'w'},
          { string: 2, pattern: 'w'},
          { string: 3, pattern: 'l', shift: true},
          { string: 4, pattern: 'l', shift: true},
        ];
      case 'dorian':
        return [
          {string: 1, pattern: 'r'},
          {string: 2, pattern: 'w'},
          {string: 3, pattern: 'w'},
          {string: 4, pattern: 'w'},
        ];
      case 'phrygian':
        return [
          {string: 1, pattern: 'l'},
          {string: 2, pattern: 'r'},
          {string: 3, pattern: 'r'},
          {string: 4, pattern: 'w'},
        ];
      case 'lydian':
        return [
          {string: 1, pattern: 'w'},
          {string: 2, pattern: 'l', shift: true},
          {string: 3, pattern: 'l', shift: true},
          {string: 4, pattern: 'r', shift: true},
        ];
      case 'mixolydian':
        return [
          {string: 1, pattern: 'w'},
          {string: 2, pattern: 'w'},
          {string: 3, pattern: 'w'},
          {string: 4, pattern: 'l', shift: true},
        ];
      case 'minor':
        return [
          {string: 1, pattern: 'r'},
          {string: 2, pattern: 'r'},
          {string: 3, pattern: 'w'},
          {string: 4, pattern: 'w'},
        ];
      case 'locrian':
        return [
          {string: 1, pattern: 'l'},
          {string: 2, pattern: 'l'},
          {string: 3, pattern: 'r'},
          {string: 4, pattern: 'r'},
        ];
    }
  }
  
  const constructStringPattern = (props: iScaleString[]): iCoords[] => {
    const coordsArray: iCoords[] = [];
    if (props.length > 0) {
      props.forEach((p) => {
        // sp = string pattern
        patterns[p.pattern].forEach((sp) => {
          if (p.shift) {
            coordsArray.push({ string: p.string, fret: sp + 1})
          } else {
            coordsArray.push({ string: p.string, fret: sp })
          }
        })
      })
    }
    return coordsArray;
  };

  return constructStringPattern(determineScale());
}