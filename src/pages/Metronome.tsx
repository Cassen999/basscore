import { InputNumber } from "primereact/inputnumber";
import { Metronome } from "../components/Metronome";
import { useState } from "react";
import type { tSubdivision } from "../types/types";
import { Dropdown, type DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";

interface iSubdivisionMenu {
  name: string;
  value: tSubdivision;
}

const subdivisions: iSubdivisionMenu[] = [
  { name: "Whole Note", value: 0.25 },
  { name: "Half Note", value: 0.5 },
  { name: "Quarter Note", value: 1 },
  { name: "Eight Note", value: 2 },
  { name: "Sixteenth Note", value: 4 },
];

export const MetronomePage = () => {
  const [bpm, setBpm] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [subDiv, setSubDiv] = useState<tSubdivision>(subdivisions[2].value);

  return (
    <div className="metronome-container">
      <div className="metronome-controls">
        <Tooltip
          target=".bpm-inputnumber"
          content="How many beats per measure?"
          mouseTrack
          mouseTrackLeft={10}
        />
        <label className="bpm-inputnumber">
          BPM
          <InputNumber
            inputId="bpm-input"
            name="bpm"
            min={40}
            max={240}
            value={bpm}
            onValueChange={(e) => setBpm(e.value!!)}
          />
        </label>
        <Tooltip
          target=".subdivision-input"
          content="What type of notes? Default is Quarter Note"
          mouseTrack
          mouseTrackLeft={10}
        />
        <label className="subdivision-input">
          Subdivision
          <Dropdown
            id="subdivision-input"
            value={subDiv}
            onChange={(e: DropdownChangeEvent) => {
              setSubDiv(e.value);
            }}
            options={subdivisions}
            optionLabel="name"
            optionValue="value"
            placeholder="Subdivisions"
          />
        </label>
      </div>
      <Button
        label={isPlaying ? "Stop" : "Start"}
        onClick={() => setIsPlaying(!isPlaying)}
      />
      <Metronome bpm={bpm} subdivision={subDiv} isPlaying={isPlaying} />
    </div>
  );
};
