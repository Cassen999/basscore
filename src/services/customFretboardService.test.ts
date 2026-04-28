import { describe, it, expect, beforeEach, vi } from 'vitest'

// jsdom's localStorage is non-functional in this environment — provide a real in-memory implementation
const store: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (key: string): string | null => store[key] ?? null,
  setItem: (key: string, value: string): void => { store[key] = value },
  removeItem: (key: string): void => { delete store[key] },
  clear: (): void => { Object.keys(store).forEach(k => delete store[k]) },
})
import { getAll, getById, getByName, save, updateById, deleteById } from './customFretboardService'
import type { iCustomFretboardPreset, iFretboardConfig } from '../types/types'

const STORAGE_KEY = 'basscore__custom_fretboard_presets'

const baseConfig: iFretboardConfig = {
  width: 700,
  height: 200,
  numFrets: 12,
  numStrings: 4,
  fretpointRadius: 12,
}

const makePreset = (overrides: Partial<iCustomFretboardPreset> = {}): iCustomFretboardPreset => ({
  id: 'test-id',
  name: 'Test Preset',
  coords: [],
  fretboardConfig: baseConfig,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

describe('customFretboardService', () => {
  beforeEach(() => localStorage.clear())

  describe('getAll', () => {
    it('returns an empty array when no presets are stored', () => {
      expect(getAll()).toEqual([])
    })

    it('returns all stored presets', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([makePreset()]))
      expect(getAll()).toHaveLength(1)
      expect(getAll()[0].name).toBe('Test Preset')
    })
  })

  describe('getById', () => {
    it('returns undefined when no preset matches the id', () => {
      expect(getById('missing-id')).toBeUndefined()
    })

    it('returns the matching preset', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([makePreset()]))
      expect(getById('test-id')?.name).toBe('Test Preset')
    })
  })

  describe('getByName', () => {
    it('returns undefined when no preset matches the name', () => {
      expect(getByName('Missing')).toBeUndefined()
    })

    it('returns the matching preset', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([makePreset()]))
      expect(getByName('Test Preset')?.id).toBe('test-id')
    })
  })

  describe('save', () => {
    it('returns the saved preset with a generated id and timestamps', () => {
      const result = save({ name: 'New', coords: [], fretboardConfig: baseConfig })
      expect(result.id).toBeTruthy()
      expect(result.createdAt).toBeTruthy()
      expect(result.updatedAt).toBeTruthy()
    })

    it('persists the preset so getAll returns it', () => {
      save({ name: 'New', coords: [], fretboardConfig: baseConfig })
      expect(getAll()).toHaveLength(1)
      expect(getAll()[0].name).toBe('New')
    })

    it('appends to existing presets without overwriting them', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([makePreset()]))
      save({ name: 'Second', coords: [], fretboardConfig: baseConfig })
      expect(getAll()).toHaveLength(2)
    })
  })

  describe('updateById', () => {
    it('updates the name of the matching preset', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([makePreset()]))
      updateById('test-id', { name: 'Updated' })
      expect(getById('test-id')?.name).toBe('Updated')
    })

    it('sets a new updatedAt timestamp', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([makePreset()]))
      updateById('test-id', { name: 'Updated' })
      expect(getById('test-id')?.updatedAt).not.toBe('2024-01-01T00:00:00.000Z')
    })

    it('does not affect other presets', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([makePreset({ id: 'p1', name: 'One' }), makePreset({ id: 'p2', name: 'Two' })]),
      )
      updateById('p1', { name: 'Updated' })
      expect(getById('p2')?.name).toBe('Two')
    })
  })

  describe('deleteById', () => {
    it('removes the matching preset', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([makePreset()]))
      deleteById('test-id')
      expect(getAll()).toHaveLength(0)
    })

    it('does not affect other presets', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([makePreset({ id: 'p1' }), makePreset({ id: 'p2' })]),
      )
      deleteById('p1')
      expect(getAll()).toHaveLength(1)
      expect(getAll()[0].id).toBe('p2')
    })
  })
})
