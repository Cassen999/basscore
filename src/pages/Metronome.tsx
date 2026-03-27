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
        <div className="bpm-input">
          <label htmlFor="bpm-input">BPM</label>
          <InputNumber
            id="bpm-input"
            min={40}
            max={240}
            value={bpm}
            onValueChange={(e) => setBpm(e.value!!)}
          />
        </div>
        <div className="subdivision-input">
          <label htmlFor="subdivision-input">Subdivision</label>
          <Dropdown
            id="subdivision-input"
            value={subDiv}
            onChange={(e: DropdownChangeEvent) => setSubDiv(e.value)}
            options={subdivisions}
            optionLabel="name"
            placeholder="Subdivisions"
          />
        </div>
      </div>
      <Button
        label={isPlaying ? "Stop" : "Start"}
        onClick={() => setIsPlaying(!isPlaying)}
      />
      <Metronome bpm={bpm} subdivision={subDiv.value} isPlaying={isPlaying} />
    </div>
  );
};
