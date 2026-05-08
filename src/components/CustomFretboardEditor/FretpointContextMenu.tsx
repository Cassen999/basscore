import { useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { ColorPicker } from 'primereact/colorpicker';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import type { iFretpointContextMenuProps } from '../../types/types';

const FretpointContextMenu = ({
  dot,
  visible,
  anchorEl,
  applyToAll,
  onClose,
  onColorChange,
  onApplyToAllChange,
  onLabelChange,
  onReset,
  onDelete,
}: iFretpointContextMenuProps) => {
  const overlayRef = useRef<OverlayPanel>(null);

  useEffect(() => {
    if (!overlayRef.current) return;
    if (visible && anchorEl) {
      overlayRef.current.show(null, anchorEl);
    } else {
      overlayRef.current.hide();
    }
  }, [visible, anchorEl]);

  const handleReset = () => {
    onReset();
  };

  return (
    <OverlayPanel
      ref={overlayRef}
      className='fretpoint-context-menu'
      onHide={onClose}
      dismissable={false}
    >
      <div className='fretpoint-context-menu__header'>
        <h3 className='fretpoint-context-menu__title'>Dot Settings</h3>
        <Button icon='pi pi-times' text onClick={onClose} aria-label='Close' />
      </div>

      <div className='fretpoint-context-menu__color-row'>
        <ColorPicker
          key={dot?.id}
          value={String(dot?.color ?? '').replace('#', '')}
          onChange={e => onColorChange(`#${e.value}`)}
        />
        <div className='fretpoint-context-menu__apply-all'>
          <Checkbox
            inputId='ctx-apply-to-all'
            checked={applyToAll}
            onChange={e => onApplyToAllChange(!!e.checked)}
          />
          <label htmlFor='ctx-apply-to-all'>Apply to all</label>
        </div>
      </div>

      {dot && (
        <InputText
          maxLength={2}
          placeholder='Label'
          value={dot.label ?? ''}
          onChange={e => onLabelChange(e.target.value)}
        />
      )}

      <div className='fretpoint-context-menu__actions'>
        <Button label='Reset' severity='secondary' text onClick={handleReset} />
        <Button label='Delete' severity='danger' onClick={onDelete} />
      </div>
    </OverlayPanel>
  );
};

export default FretpointContextMenu;
