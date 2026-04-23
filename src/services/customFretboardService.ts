import type { iCustomFretboardPreset } from '../types/types';

const STORAGE_KEY = 'basscore__custom_fretboard_presets';

const read = (): iCustomFretboardPreset[] =>
  JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');

const write = (presets: iCustomFretboardPreset[]): void =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));

export const getAll = (): iCustomFretboardPreset[] => read();

export const getById = (id: string): iCustomFretboardPreset | undefined =>
  read().find(p => p.id === id);

export const getByName = (name: string): iCustomFretboardPreset | undefined =>
  read().find(p => p.name === name);

export const save = (
  preset: Omit<iCustomFretboardPreset, 'id' | 'createdAt' | 'updatedAt'>,
): iCustomFretboardPreset => {
  const now = new Date().toISOString();
  const full: iCustomFretboardPreset = {
    ...preset,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  write([...read(), full]);
  return full;
};

export const updateById = (
  id: string,
  partial: Partial<iCustomFretboardPreset>,
): void => {
  const presets = read().map(p =>
    p.id === id ? { ...p, ...partial, updatedAt: new Date().toISOString() } : p,
  );
  write(presets);
};

export const deleteById = (id: string): void =>
  write(read().filter(p => p.id !== id));
