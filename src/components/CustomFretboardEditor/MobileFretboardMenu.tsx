import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { SelectButton } from 'primereact/selectbutton';
import AppSidebar from '../AppSidebar/AppSidebar';
import type { iCustomFretboardPreset, iMobileFretboardMenuProps } from '../../types/types';

const STRING_COUNT_OPTIONS = [
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
];

const MobileFretboardMenu = ({
  historyConfig,
  presets,
  onFretCountChange,
  onStringCountChange,
  onLoadPreset,
  onDeletePreset,
  onSavePreset,
  savePresetName,
  onSavePresetNameChange,
  overwriteWarning,
  onExportSvg,
  onClearAll,
}: iMobileFretboardMenuProps) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [saveInputOpen, setSaveInputOpen] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const handleHide = () => {
    setMenuVisible(false);
    setPresetsOpen(false);
    setSaveInputOpen(false);
  };

  const handlePresetSelect = (id: string) => {
    setSelectedPresetId(id);
    onLoadPreset(id);
  };

  const handlePresetDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (selectedPresetId === id) setSelectedPresetId(null);
    onDeletePreset(id);
  };

  const handleSave = () => {
    const trimmed = savePresetName.trim();
    if (!trimmed) return;
    onSavePreset(trimmed);
    setSaveInputOpen(false);
  };

  return (
    <>
      <Button
        icon='pi pi-cog'
        className='mobile-fretboard-cog-fab'
        onClick={() => setMenuVisible(v => !v)}
        aria-label='Open fretboard controls'
        text
      />

      <AppSidebar visible={menuVisible} onHide={handleHide} position='right'>
        <div className='mobile-fretboard-menu'>
          <div className='mobile-fretboard-menu__field'>
            <label>Fret Count</label>
            <InputNumber
              className='custom-fretboard-fret-count'
              value={historyConfig.numFrets}
              min={1}
              max={24}
              onValueChange={e => e.value !== null && onFretCountChange(e.value as number)}
              showButtons
              buttonLayout='horizontal'
              incrementButtonIcon='pi pi-plus'
              decrementButtonIcon='pi pi-minus'
            />
          </div>

          <div className='mobile-fretboard-menu__field'>
            <label>String Count</label>
            <SelectButton
              value={historyConfig.numStrings}
              options={STRING_COUNT_OPTIONS}
              onChange={e => e.value !== null && onStringCountChange(e.value)}
            />
          </div>

          <div
            className='mobile-fretboard-menu__accordion-row'
            onClick={() => setPresetsOpen(v => !v)}
            role='button'
            tabIndex={0}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setPresetsOpen(v => !v)}
            aria-expanded={presetsOpen}
          >
            <span>Presets</span>
            <i className={`pi pi-chevron-down mobile-fretboard-menu__caret${presetsOpen ? ' mobile-fretboard-menu__caret--open' : ''}`} />
          </div>

          {presetsOpen && (
            <div className='mobile-fretboard-menu__accordion-body mobile-fretboard-menu__accordion-body--open'>
              <div className='mobile-fretboard-menu__preset-list'>
                {presets.length === 0 && (
                  <p className='mobile-fretboard-menu__empty'>No Saved Presets</p>
                )}
                {presets.map((preset: iCustomFretboardPreset) => (
                  <div
                    key={preset.id}
                    className={`mobile-fretboard-menu__preset-item${selectedPresetId === preset.id ? ' mobile-fretboard-menu__preset-item--selected' : ''}`}
                    role='button'
                    tabIndex={0}
                    onClick={() => handlePresetSelect(preset.id)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handlePresetSelect(preset.id)}
                    aria-label={preset.name}
                  >
                    <span>{preset.name}</span>
                    <Button
                      icon='pi pi-trash'
                      severity='danger'
                      size='small'
                      text
                      onClick={e => handlePresetDelete(e, preset.id)}
                      aria-label={`Delete preset ${preset.name}`}
                    />
                  </div>
                ))}
              </div>

              <Button
                label='Save Preset'
                onClick={() => setSaveInputOpen(v => !v)}
                aria-expanded={saveInputOpen}
              />

              {saveInputOpen && (
                <div className='mobile-fretboard-menu__save-input-area'>
                  <InputText
                    placeholder='Preset name'
                    value={savePresetName}
                    onChange={e => onSavePresetNameChange(e.target.value)}
                  />
                  {overwriteWarning && (
                    <p className='custom-fretboard-overwrite-warning'>
                      This will overwrite the existing preset.
                    </p>
                  )}
                  <div className='mobile-fretboard-menu__save-actions'>
                    <Button
                      label='Cancel'
                      severity='secondary'
                      size='small'
                      onClick={() => setSaveInputOpen(false)}
                    />
                    <Button
                      label='Save'
                      size='small'
                      disabled={!savePresetName.trim()}
                      onClick={handleSave}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <Button label='Export SVG' size='small' onClick={onExportSvg} />
          <Button label='Clear All' size='small' severity='secondary' onClick={onClearAll} />
        </div>
      </AppSidebar>
    </>
  );
};

export default MobileFretboardMenu;
