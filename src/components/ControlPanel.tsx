import { Card } from "primereact/card";
import type { iControlProps } from "../types/types";

const ControlPanel = (props: iControlProps) => {
  return (
    <Card {...props?.cardProps}>
      {props.elements.map((el) => {
        return <div className="control-element">{el}</div>;
      })}
    </Card>
  );
};

export default ControlPanel;
