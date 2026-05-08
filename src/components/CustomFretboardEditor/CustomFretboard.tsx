import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { ColorPicker } from 'primereact/colorpicker';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { SelectButton } from 'primereact/selectbutton';
import { useControls } from '../../contexts/ControlsContext';
import { useCustomFretboardHistory } from '../../hooks/useCustomFretboardHistory';
import { useIsMobile } from '../../hooks/useIsMobile';
import * as customFretboardService from '../../services/customFretboardService';
import type { iCoords, iControlElementGroups, iCustomFretboardPreset, iDragState, iFretboardConfig } from '../../types/types';
import { findAvailableFret, snapToCell } from '../../helpers/fretboardHelpers';
import ControlPanel from '../ControlPanel/ControlPanel';
import CustomFretboardEditor from './CustomFretboardEditor';
import FretpointContextMenu from './FretpointContextMenu';
import MobileFretboardMenu from './MobileFretboardMenu';

const INITIAL_CONFIG: iFretboardConfig = {
  width: 700,
  height: 200,
  numFrets: 12,
  numStrings: 4,
  fretpointRadius: 12,
};

const MOBILE_INITIAL_CONFIG: iFretboardConfig = {
  ...INITIAL_CONFIG,
  numFrets: 7,
  fretpointRadius: 16,
};

const STRING_COUNT_OPTIONS = [
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
];

const trimCoords = (c: iCoords[], config: iFretboardConfig): iCoords[] =>
  c.filter(dot => dot.fret <= config.numFrets && dot.string <= config.numStrings);

export const CustomFretboard = () => {
  const { setFretboardConfig, scaleNoteColor, setScaleNoteColor, longPressThreshold } = useControls();
  const isMobile = useIsMobile();

  const { present, setHistory, undo, redo, canUndo, canRedo } = useCustomFretboardHistory({
    coords: [],
    fretboardConfig: isMobile ? MOBILE_INITIAL_CONFIG : INITIAL_CONFIG,
  });
  const { coords, fretboardConfig: historyConfig } = present;

  const [dragState, setDragState] = useState<iDragState | null>(null);
  const [selectedDotId, setSelectedDotId] = useState<string | null>(null);
  const [applyToAll, setApplyToAll] = useState(false);
  const [presets, setPresets] = useState<iCustomFretboardPreset[]>(() => customFretboardService.getAll());
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [lastLoadedPresetName, setLastLoadedPresetName] = useState<string | null>(null);
  const [savePresetDialog, setSavePresetDialog] = useState({ visible: false, name: '' });
  const [exportDialog, setExportDialog] = useState({ visible: false, fileName: 'fretboard' });

  // Mobile-specific state
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuAnchorEl, setContextMenuAnchorEl] = useState<HTMLElement | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFretboardConfig(historyConfig);
  }, [historyConfig, setFretboardConfig]);

  const handleDeleteSelectedDot = useCallback(() => {
    if (!selectedDotId) return;
    const newCoords = coords.filter(d => d.id !== selectedDotId);
    setSelectedDotId(null);
    setContextMenuVisible(false);
    setHistory({ coords: newCoords, fretboardConfig: historyConfig });
  }, [selectedDotId, coords, historyConfig, setHistory]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        redo();
        return;
      }
      if (e.ctrlKey && e.key === 'z') {
        undo();
        return;
      }
      if (e.key === 'Delete' && selectedDotId !== null) {
        handleDeleteSelectedDot();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, selectedDotId, handleDeleteSelectedDot]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!selectedDotId) return;
      const target = e.target as Node;
      if (svgRef.current?.contains(target)) return;
      if (controlsRef.current?.contains(target)) return;
      const isInOverlay = !!(target as Element).closest?.(
        '.p-colorpicker-panel, .p-dropdown-panel, .p-dialog, .p-dialog-mask, .p-dialog-content, .p-overlaypanel',
      );
      if (isInOverlay) return;
      setContextMenuVisible(false);
      setSelectedDotId(null);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [selectedDotId]);

  const resolvedPrimaryColor = useMemo(
    () => getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
    [],
  );

  const handleCellClick = (string: number, fret: number) => {
    const dot = coords.find(d => d.string === string && d.fret === fret);

    if (dot) {
      if (dot.id === selectedDotId) {
        setSelectedDotId(null);
      } else {
        setSelectedDotId(dot.id ?? null);
      }
      return;
    }

    if (selectedDotId !== null) {
      setSelectedDotId(null);
    } else {
      const newDot: iCoords = {
        id: crypto.randomUUID(),
        string,
        fret,
        color: scaleNoteColor ?? resolvedPrimaryColor,
      };
      setSelectedDotId(newDot.id!);
      setHistory({ coords: [...coords, newDot], fretboardConfig: historyConfig });
    }
  };

  const handleDotMouseDown = (id: string) => {
    const dot = coords.find(d => d.id === id);
    if (!dot) return;
    setDragState({
      dotId: id,
      previewString: dot.string,
      previewFret: dot.fret,
      dragDirection: 1,
      prevPreviewFret: dot.fret,
    });
  };

  const handleBackgroundClick = () => setSelectedDotId(null);

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragState || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { string: rawString, fret: rawFret } = snapToCell(mouseX, mouseY, historyConfig);

    const direction: 1 | -1 =
      rawFret > dragState.prevPreviewFret
        ? 1
        : rawFret < dragState.prevPreviewFret
          ? -1
          : dragState.dragDirection;

    const isOccupied = coords.some(
      d => d.string === rawString && d.fret === rawFret && d.id !== dragState.dotId,
    );

    let newPreviewString = dragState.previewString;
    let newPreviewFret = dragState.previewFret;

    if (!isOccupied) {
      newPreviewString = rawString;
      newPreviewFret = rawFret;
    } else {
      const available = findAvailableFret(
        rawString,
        rawFret,
        direction,
        coords,
        dragState.dotId,
        historyConfig,
      );
      if (available !== null) {
        newPreviewString = rawString;
        newPreviewFret = available;
      }
    }

    setDragState({
      ...dragState,
      previewString: newPreviewString,
      previewFret: newPreviewFret,
      dragDirection: direction,
      prevPreviewFret: rawFret,
    });
  };

  const handleSvgMouseUp = () => {
    if (!dragState) return;
    const dot = coords.find(d => d.id === dragState.dotId);
    if (dot && (dot.string !== dragState.previewString || dot.fret !== dragState.previewFret)) {
      const newCoords = coords.map(d =>
        d.id === dragState.dotId
          ? { ...d, string: dragState.previewString, fret: dragState.previewFret }
          : d,
      );
      setSelectedDotId(dragState.dotId);
      setHistory({ coords: newCoords, fretboardConfig: historyConfig });
    }
    setDragState(null);
  };

  const handleColorChange = (color: string) => {
    if (selectedDotId) {
      const newCoords = applyToAll
        ? coords.map(d => ({ ...d, color }))
        : coords.map(d => (d.id === selectedDotId ? { ...d, color } : d));
      setHistory({ coords: newCoords, fretboardConfig: historyConfig });
    } else {
      setScaleNoteColor(color);
      if (applyToAll && coords.length > 0) {
        setHistory({ coords: coords.map(d => ({ ...d, color })), fretboardConfig: historyConfig });
      }
    }
  };

  const handleFretCountChange = (numFrets: number) => {
    const newConfig = { ...historyConfig, numFrets };
    setHistory({ coords: trimCoords(coords, newConfig), fretboardConfig: newConfig });
  };

  const handleStringCountChange = (numStrings: number) => {
    const newConfig = { ...historyConfig, numStrings };
    setHistory({ coords: trimCoords(coords, newConfig), fretboardConfig: newConfig });
  };

  const handleDotLabelChange = (id: string, value: string) => {
    const trimmed = value.slice(0, 2);
    const newCoords = coords.map(d =>
      d.id === id ? { ...d, label: trimmed || undefined } : d,
    );
    setHistory({ coords: newCoords, fretboardConfig: historyConfig });
  };

  const handleOpenSaveModal = () =>
    setSavePresetDialog({ visible: true, name: lastLoadedPresetName ?? '' });

  const handleConfirmSave = (name?: string) => {
    const saveName = (name ?? savePresetDialog.name).trim();
    if (!saveName) return;
    const existing = customFretboardService.getByName(saveName);
    if (existing) {
      customFretboardService.updateById(existing.id, {
        coords,
        fretboardConfig: historyConfig,
        name: saveName,
      });
    } else {
      customFretboardService.save({ name: saveName, coords, fretboardConfig: historyConfig });
    }
    setPresets(customFretboardService.getAll());
    setSavePresetDialog({ visible: false, name: '' });
  };

  const handleLoadPreset = (id: string) => {
    const preset = customFretboardService.getById(id);
    if (!preset) return;
    setHistory({ coords: preset.coords, fretboardConfig: preset.fretboardConfig });
    setSelectedDotId(null);
    setLastLoadedPresetName(preset.name);
  };

  const handleDeletePreset = (id: string) => {
    customFretboardService.deleteById(id);
    setPresets(customFretboardService.getAll());
    if (selectedPresetId === id) setSelectedPresetId(null);
  };

  const handleExportClick = () =>
    setExportDialog({ visible: true, fileName: lastLoadedPresetName ?? 'fretboard' });

  const exportSvg = async (fileName: string) => {
    const svg = svgRef.current;
    if (!svg) return;

    const fretLineEl = svg.querySelector('.fret-lines');
    const fretLineStroke = fretLineEl
      ? getComputedStyle(fretLineEl).stroke
      : '#AFAFAF';

    const markerEl = svg.querySelector('.custom-fretboard-editor__position-marker');
    const markerFill = markerEl ? getComputedStyle(markerEl).fill : '#AFAFAF';

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll('[data-export-remove]').forEach(el => el.remove());

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = [
      `.fret-lines { stroke: ${fretLineStroke}; }`,
      `.string-lines { stroke: ${fretLineStroke}; }`,
      `.custom-fretboard-editor__position-marker { fill: ${markerFill}; }`,
    ].join(' ');
    defs.appendChild(style);
    clone.insertBefore(defs, clone.firstChild);

    const svgStr = new XMLSerializer().serializeToString(clone);

    if (isMobile && navigator.canShare?.({ files: [new File([svgStr], `${fileName}.svg`, { type: 'image/svg+xml' })] })) {
      await navigator.share({ files: [new File([svgStr], `${fileName}.svg`, { type: 'image/svg+xml' })] });
      return;
    }

    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportDialog({ visible: false, fileName: 'fretboard' });
  };

  const handleMobileExport = () => exportSvg(lastLoadedPresetName ?? 'fretboard');

  // Mobile context menu handlers
  const positionAnchor = (clientX: number, clientY: number) => {
    if (!anchorRef.current) return;
    anchorRef.current.style.left = `${clientX}px`;
    anchorRef.current.style.top = `${clientY}px`;
  };

  const handleTouchTapCell = (string: number, fret: number) => {
    if (contextMenuVisible) {
      setContextMenuVisible(false);
      setSelectedDotId(null);
      return;
    }
    const newDot: iCoords = {
      id: crypto.randomUUID(),
      string,
      fret,
      color: resolvedPrimaryColor,
    };
    setHistory({ coords: [...coords, newDot], fretboardConfig: historyConfig });
  };

  const handleLongPressCell = (string: number, fret: number, clientX: number, clientY: number) => {
    const newDot: iCoords = {
      id: crypto.randomUUID(),
      string,
      fret,
      color: resolvedPrimaryColor,
    };
    setHistory({ coords: [...coords, newDot], fretboardConfig: historyConfig });
    setSelectedDotId(newDot.id!);
    positionAnchor(clientX, clientY);
    setContextMenuAnchorEl(anchorRef.current);
    setContextMenuVisible(true);
  };

  const handleLongPressDot = (id: string, clientX: number, clientY: number) => {
    setSelectedDotId(id);
    positionAnchor(clientX, clientY);
    setContextMenuAnchorEl(anchorRef.current);
    setContextMenuVisible(true);
  };

  const handleContextMenuClose = () => {
    setContextMenuVisible(false);
    setSelectedDotId(null);
  };

  const handleMobileReset = () => {
    if (!selectedDotId) return;
    const newCoords = coords.map(d =>
      d.id === selectedDotId ? { ...d, color: resolvedPrimaryColor, label: undefined } : d,
    );
    setHistory({ coords: newCoords, fretboardConfig: historyConfig });
  };

  const handleApplyToAllChange = (val: boolean) => {
    setApplyToAll(val);
    if (val && selectedDotId) {
      const activeDot = coords.find(d => d.id === selectedDotId);
      if (activeDot) {
        setHistory({
          coords: coords.map(d => ({ ...d, color: activeDot.color })),
          fretboardConfig: historyConfig,
        });
      }
    }
  };

  const selectedDot = coords.find(d => d.id === selectedDotId) ?? null;

  const colorPickerLabel = useMemo(() => {
    if (applyToAll) return 'Color (All Dots)';
    if (selectedDotId) return 'Selected Dot Color';
    return 'New Dot Color';
  }, [applyToAll, selectedDotId]);

  const colorPickerValue = selectedDot
    ? (selectedDot.color as string)
    : (scaleNoteColor as string);

  const overwriteWarning = !!(
    savePresetDialog.name.trim() &&
    customFretboardService.getByName(savePresetDialog.name.trim()) !== undefined
  );

  const mobileOverwriteWarning = !!(
    savePresetDialog.name.trim() &&
    customFretboardService.getByName(savePresetDialog.name.trim()) !== undefined
  );

  const presetOptions = presets.map(p => ({ label: p.name, value: p.id }));

  const controlElements: iControlElementGroups[] = [
    {
      title: 'Fret Count',
      elements: [
        <InputNumber
          key='fret-count'
          className='custom-fretboard-fret-count'
          value={historyConfig.numFrets}
          min={1}
          max={24}
          onValueChange={e => e.value !== null && handleFretCountChange(e.value as number)}
          showButtons
          buttonLayout='horizontal'
          incrementButtonIcon='pi pi-plus'
          decrementButtonIcon='pi pi-minus'
        />,
      ],
    },
    {
      title: 'String Count',
      elements: [
        <SelectButton
          key='string-count'
          value={historyConfig.numStrings}
          options={STRING_COUNT_OPTIONS}
          onChange={e => e.value !== null && handleStringCountChange(e.value)}
        />,
      ],
    },
    {
      title: colorPickerLabel,
      elements: [
        <div key='color-picker' className='custom-fretboard-color-group'>
          <ColorPicker
            value={colorPickerValue as string}
            onChange={e => handleColorChange(`#${e.value}`)}
          />
          <div className='custom-fretboard-apply-all'>
            <Checkbox
              inputId='apply-to-all'
              checked={applyToAll}
              onChange={e => setApplyToAll(!!e.checked)}
            />
            <label htmlFor='apply-to-all'>Apply to all</label>
          </div>
        </div>,
      ],
    },
    ...(selectedDotId
      ? [
          {
            title: 'Dot Label',
            elements: [
              <InputText
                key='dot-label'
                maxLength={2}
                placeholder='Label'
                value={selectedDot?.label ?? ''}
                onChange={e => handleDotLabelChange(selectedDotId, e.target.value)}
              />,
            ],
          },
        ]
      : []),
    {
      title: 'Presets',
      elements: [
        <Button key='save-preset' label='Save Preset' onClick={handleOpenSaveModal} size='small' />,
        <div key='load-preset' className='custom-fretboard-preset-row'>
          <Dropdown
            value={selectedPresetId}
            options={presetOptions}
            onChange={e => setSelectedPresetId(e.value)}
            placeholder='Select preset'
            emptyMessage='No Saved Presets'
            className='custom-fretboard-preset-dropdown'
          />
          <Button
            label='Load'
            size='small'
            disabled={!selectedPresetId}
            onClick={() => selectedPresetId && handleLoadPreset(selectedPresetId)}
          />
          <Button
            label='Delete'
            size='small'
            severity='danger'
            disabled={!selectedPresetId}
            onClick={() => selectedPresetId && handleDeletePreset(selectedPresetId)}
          />
        </div>,
      ],
    },
    {
      title: 'Actions',
      elements: [
        <div key='actions' className='custom-fretboard-actions'>
          <Button label='Undo' size='small' disabled={!canUndo} onClick={undo} />
          <Button label='Redo' size='small' disabled={!canRedo} onClick={redo} />
          <Button
            label='Delete'
            size='small'
            severity='danger'
            disabled={!selectedDotId}
            onClick={handleDeleteSelectedDot}
          />
          <Button
            label='Clear All'
            size='small'
            severity='secondary'
            onClick={() => {
              setSelectedDotId(null);
              setHistory({ coords: [], fretboardConfig: historyConfig });
            }}
          />
          <Button label='Export SVG' size='small' onClick={handleExportClick} />
        </div>,
      ],
    },
  ];

  return (
    <div className='custom-fretboard-container'>
      <h1 className='page-title'>Custom Fretboard</h1>

      {/* Mobile layout */}
      {isMobile && (
        <div className='custom-fretboard-page-section custom-fretboard-page-section--mobile'>
          <div className='custom-fretboard-editor-wrapper'>
            <span className='custom-fretboard-label'>NUT</span>
            <CustomFretboardEditor
              coords={coords}
              fretboardConfig={historyConfig}
              dragState={dragState}
              selectedDotId={selectedDotId}
              resolvedPrimaryColor={resolvedPrimaryColor}
              svgRef={svgRef}
              onCellClick={handleCellClick}
              onDotMouseDown={handleDotMouseDown}
              onSvgMouseMove={handleSvgMouseMove}
              onSvgMouseUp={handleSvgMouseUp}
              onBackgroundClick={handleBackgroundClick}
              rotated
              isMobile
              onLongPressDot={handleLongPressDot}
              onLongPressCell={handleLongPressCell}
              onTouchTapCell={handleTouchTapCell}
              longPressThreshold={longPressThreshold}
              isContextMenuOpen={contextMenuVisible}
              onContextMenuDismiss={handleContextMenuClose}
            />
            <span className='custom-fretboard-label'>BRIDGE</span>
          </div>

          <div
            ref={anchorRef}
            style={{ position: 'fixed', width: 0, height: 0, pointerEvents: 'none' }}
          />

          <FretpointContextMenu
            dot={selectedDot}
            visible={contextMenuVisible}
            anchorEl={contextMenuAnchorEl}
            applyToAll={applyToAll}
            onClose={handleContextMenuClose}
            onColorChange={handleColorChange}
            onApplyToAllChange={handleApplyToAllChange}
            onLabelChange={label => selectedDotId && handleDotLabelChange(selectedDotId, label)}
            onReset={handleMobileReset}
            onDelete={handleDeleteSelectedDot}
          />

          <MobileFretboardMenu
            coords={coords}
            historyConfig={historyConfig}
            presets={presets}
            onFretCountChange={handleFretCountChange}
            onStringCountChange={handleStringCountChange}
            onLoadPreset={handleLoadPreset}
            onDeletePreset={handleDeletePreset}
            onSavePreset={handleConfirmSave}
            savePresetName={savePresetDialog.name}
            onSavePresetNameChange={name => setSavePresetDialog(prev => ({ ...prev, name }))}
            overwriteWarning={mobileOverwriteWarning}
            onExportSvg={handleMobileExport}
            onClearAll={() => {
              setSelectedDotId(null);
              setHistory({ coords: [], fretboardConfig: historyConfig });
            }}
          />
        </div>
      )}

      {/* Desktop layout */}
      {!isMobile && (
        <div className='custom-fretboard-page-section'>
          <div className='page-subsection'>
            <CustomFretboardEditor
              coords={coords}
              fretboardConfig={historyConfig}
              dragState={dragState}
              selectedDotId={selectedDotId}
              resolvedPrimaryColor={resolvedPrimaryColor}
              svgRef={svgRef}
              onCellClick={handleCellClick}
              onDotMouseDown={handleDotMouseDown}
              onSvgMouseMove={handleSvgMouseMove}
              onSvgMouseUp={handleSvgMouseUp}
              onBackgroundClick={handleBackgroundClick}
            />
          </div>

          <div className='page-subsection fretboard-controls-panel' ref={controlsRef}>
            <ControlPanel
              cardProps={{ header: 'Fretboard Controls' }}
              elements={controlElements}
            />
          </div>
        </div>
      )}

      {/* Save Preset Dialog — desktop only */}
      {!isMobile && (
        <Dialog
          header='Save Preset'
          visible={savePresetDialog.visible}
          onHide={() => setSavePresetDialog({ visible: false, name: '' })}
          footer={
            <div>
              <Button
                label='Cancel'
                severity='secondary'
                onClick={() => setSavePresetDialog({ visible: false, name: '' })}
              />
              <Button
                label='Save'
                disabled={!savePresetDialog.name.trim()}
                onClick={() => handleConfirmSave()}
              />
            </div>
          }
        >
          <InputText
            value={savePresetDialog.name}
            onChange={e => setSavePresetDialog(prev => ({ ...prev, name: e.target.value }))}
            placeholder='Preset name'
            autoFocus
          />
          {overwriteWarning && (
            <p className='custom-fretboard-overwrite-warning'>
              This will overwrite the existing preset.
            </p>
          )}
        </Dialog>
      )}

      {/* Export SVG Dialog — desktop only */}
      {!isMobile && (
        <Dialog
          header='Export SVG'
          visible={exportDialog.visible}
          onHide={() => setExportDialog({ visible: false, fileName: 'fretboard' })}
          footer={
            <div>
              <Button
                label='Cancel'
                severity='secondary'
                onClick={() => setExportDialog({ visible: false, fileName: 'fretboard' })}
              />
              <Button label='Export' onClick={() => exportSvg(exportDialog.fileName)} />
            </div>
          }
        >
          <InputText
            value={exportDialog.fileName}
            onChange={e => setExportDialog(prev => ({ ...prev, fileName: e.target.value }))}
            placeholder='File name'
            autoFocus
          />
          <p className='custom-fretboard-export-hint'>
            Will be saved as <strong>{exportDialog.fileName || 'fretboard'}.svg</strong>
          </p>
        </Dialog>
      )}
    </div>
  );
};
