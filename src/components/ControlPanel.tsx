import { Card } from "primereact/card";
import type { iControlElementGroups, iControlProps } from "../types/types";
import { useState, type ReactNode } from "react";
import { useControls } from "../contexts/ControlsContext";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import pentagram from "../assets/pentagram.png";

const ControlPanel = (props: iControlProps) => {
  const { isMobile } = useControls();
  const [visible, setVisible] = useState<boolean>(false);

  const btnLabel = (
    <div className={`controls-btn-label ${visible ? 'flip-btn-label' : ''}`}>
      <img src={pentagram} />
      <i className='pi pi-angle-right' style={{ color: 'black' }} />
    </div>
  );

  const elementMapping = (): ReactNode => {
    const { elements } = props;
    return elements.map((el, i) => {
      if (el && typeof el === "object" && "type" in el) {
        return (
          <div>
            {elements.map((el) => {
              return (
                <div key={i} className="control-element">
                  {el as ReactNode}
                </div>
              );
            })}
          </div>
        );
      } else {
        const elGroup = el as iControlElementGroups;
        return (
          <div className="control-group" key={i}>
            <span>{elGroup.title}</span>
            <div className="mapped-controls">
              {elGroup.elements.map((el, index) => (
                <div key={index}>{el}</div>
              ))}
            </div>
          </div>
        );
      }
    });
  };

  const controlCard = <Card {...props?.cardProps}>{elementMapping()}</Card>;
  return (
    <div>
      {isMobile ? (
        <div className='mobile-controls'>
          <Sidebar
            visible={visible}
            position="left"
            onHide={() => setVisible(false)}
          >
            {controlCard}
          </Sidebar>
          <Button className='mobile-btn' onClick={() => setVisible(true)}>
            {btnLabel}
          </Button>
        </div>
      ) : (
        controlCard
      )}
    </div>
  );
};

export default ControlPanel;
