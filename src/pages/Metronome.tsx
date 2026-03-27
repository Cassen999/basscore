import { InputNumber } from "primereact/inputnumber";
import { Metronome } from "../components/Metronome";
import { useState } from "react";
import type { tSubdivision } from "../types/types";
import { Dropdown, type DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";

interface iSubdivisionMenu {
  name: string;
  value: tSubdivision;
}

export const MetronomePage = () => {
  const [bpm, setBpm] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [subDiv, setSubDiv] = useState<iSubdivisionMenu>({
    name: "Quarter Note",
    value: 4,
  });

  const subdivisions: iSubdivisionMenu[] = [
    { name: "Quarter Note", value: 4 },
    { name: "Eight Note", value: 8 },
    { name: "Sixteenth Note", value: 16 },
  ];

  return (
    <div className="metronome-container">
      <div className="metronome-controls">
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
        <label className="subdivision-input">
          Subdivision
          <Dropdown
            id="subdivision-input"
            value={subDiv}
            onChange={(e: DropdownChangeEvent) => setSubDiv(e.value)}
            options={subdivisions}
            optionLabel="name"
            placeholder="Subdivisions"
          />
        </label>
      </div>
      <Button
        label={isPlaying ? "Stop" : "Start"}
        onClick={() => setIsPlaying(!isPlaying)}
      />
      <Metronome bpm={bpm} subdivision={subDiv.value} isPlaying={isPlaying} />
    </div>
  );
};
