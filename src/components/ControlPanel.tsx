import { Card } from "primereact/card";
import type { iControlElementGroups, iControlProps } from "../types/types";
import type { ReactNode } from "react";

const ControlPanel = (props: iControlProps) => {
  const elementMapping = (): ReactNode => {
    const { elements } = props;
    return elements.map((el) => {
      if (el && typeof el === "object" && "type" in el) {
        return (
          <div>
            {elements.map((el) => {
              return <div className="control-element">{el as ReactNode}</div>;
            })}
          </div>
        );
      } else {
        const elGroup = el as iControlElementGroups;
        return (
          <div className="control-group">
            <span>{elGroup.title}</span>
            <div className='mapped-controls'>
              {elGroup.elements.map((el) => (
                <div>{el}</div>
              ))}
            </div>
          </div>
        );
      }
    });
  };
  return <Card {...props?.cardProps}>{elementMapping()}</Card>;
};

export default ControlPanel;
