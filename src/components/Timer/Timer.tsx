import { Dialog } from 'primereact/dialog';
import type { iTimerDialogProps } from '../../types/types';
import { TimerControls } from '../TimerControls/TimerControls';

export const Timer = ({ visible, onHide, anchorRect }: iTimerDialogProps) => {
  const dialogStyle = anchorRect
    ? { marginTop: anchorRect.bottom + 8, marginLeft: anchorRect.left + anchorRect.width / 2 }
    : undefined;

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      modal={false}
      showHeader={false}
      position='top-left'
      draggable={false}
      resizable={false}
      style={dialogStyle}
      className='timer-dialog'
    >
      <TimerControls />
    </Dialog>
  );
};
