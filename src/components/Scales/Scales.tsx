import { SelectButton } from "primereact/selectbutton";
import ControlPanel from "../ControlPanel/ControlPanel";
import Fretboard from "../Fretboard/Fretboard";
import { useControls } from "../../contexts/ControlsContext";
import { createScale } from "../../helpers/fretpoints";
import type {
  iControlElementGroups,
  iScaleSelectItems,
} from "../../types/types";
import { ColorPicker } from "primereact/colorpicker";
import { useEffect, type ReactNode } from "react";

const scaleOptions: iScaleSelectItems[] = [
  { name: "Major", value: "major" },
  { name: "Dorian", value: "dorian" },
  { name: "Phrygian", value: "phrygian" },
  { name: "Lydian", value: "lydian" },
  { name: "Mixolydian", value: "mixolydian" },
  { name: "Minor", value: "minor" },
  { name: "Locrian", value: "locrian" },
];

export const Scales = () => {
  const {
    scaleNoteColor,
    setScaleNoteColor,
    setDisplayedScales,
    displayedScales,
    fretboardConfig,
    setFretboardConfig,
  } = useControls();

  useEffect(() => setFretboardConfig({ ...fretboardConfig, numFrets: 5 }), [])

  const noteColorControls = (): ReactNode => {
    return (
      <div className="scale-cp">
        <ColorPicker
          className="color-picker"
          title="Scale Note Color"
          value={scaleNoteColor as string}
          onChange={(e) => setScaleNoteColor(`#${e.value}`)}
        />
      </div>
    );
  };

  const scaleSelect = () => {
    return (
      <div className="interval-select">
        <SelectButton
          value={displayedScales}
          options={scaleOptions}
          onChange={(e) => setDisplayedScales(e.value)}
          optionLabel="name"
        />
      </div>
    );
  };

  const controlsElements: iControlElementGroups[] = [
    {
      title: "Scale",
      elements: [scaleSelect()],
    },
    {
      title: "Note Color",
      elements: [noteColorControls()],
    },
  ];

  const activeScaleIndex = scaleOptions.findIndex(s => s.value === displayedScales);

  return (
    <div className="scales-container">
      <h1 className="page-title">Scales and Positions</h1>

      <div className='scale-page-section'>
        <div className="page-subsection fretboard-controls-panel">
          <ControlPanel
            cardProps={{
              header: "Fretboard Controls",
            }}
            elements={controlsElements}
          />
        </div>

        <div className="page-subsection">
          <h2 className="page-subtitle">{scaleOptions[activeScaleIndex].name} (Position {activeScaleIndex + 1})</h2>
          <Fretboard
            coords={createScale({
              scaleType: displayedScales,
              noteColor: scaleNoteColor,
            })}
          />
        </div>
      </div>
    </div>
  );
};
