/**
 * Bastek Omni-OS // Core - Persistent Settings Store
 * Zarządzanie trwałymi preferencjami użytkownika (Full-width, Anti-jump, Motyw, Orb Position itp.)
 * Maksymalny rozmiar pliku: < 120 linii.
 */

import type { OrbPositionConfig, OrbCorner, OmniThemePreset } from '../types';

export interface OmniSettings {
  fullWidth: boolean;
  scrollLock: boolean;
  zenMode: boolean;
  turnTimeline: boolean;
  ultrawideCinema: boolean;
  ambientGlow: boolean;
  themePreset: OmniThemePreset;
  orbPosition: OrbPositionConfig;
  domainPositions?: Record<string, OrbPositionConfig>;
}

export const DEFAULT_SETTINGS: OmniSettings = {
  fullWidth: false,
  scrollLock: false,
  zenMode: false,
  turnTimeline: true,
  ultrawideCinema: false,
  ambientGlow: false,
  themePreset: 'm3',
  orbPosition: {
    corner: 'bottom-right',
    freeMode: false
  },
  domainPositions: {}
};

export class SettingsStore {
  private static instance: SettingsStore;
  private settings: OmniSettings = { ...DEFAULT_SETTINGS };
  private listeners: ((s: OmniSettings) => void)[] = [];

  static getInstance(): SettingsStore {
    if (!SettingsStore.instance) {
      SettingsStore.instance = new SettingsStore();
    }
    return SettingsStore.instance;
  }

  async load(): Promise<OmniSettings> {
    try {
      const data = await chrome.storage.local.get('bastek_omni_settings');
      if (data && data.bastek_omni_settings) {
        this.settings = { ...DEFAULT_SETTINGS, ...data.bastek_omni_settings };
      }
    } catch {
      // Fallback do pamięci lokalnej
    }
    return this.settings;
  }

  get(): OmniSettings {
    return this.settings;
  }

  async set<K extends keyof OmniSettings>(key: K, value: OmniSettings[K]): Promise<void> {
    this.settings[key] = value;
    try {
      await chrome.storage.local.set({ bastek_omni_settings: this.settings });
    } catch {
      // cichy zapis
    }
    this.notify();
  }

  async setPosition(corner: OrbCorner, customX?: number, customY?: number): Promise<void> {
    this.settings.orbPosition = { corner, customX, customY };
    try {
      await chrome.storage.local.set({ bastek_omni_settings: this.settings });
    } catch {
      // cichy zapis
    }
    this.notify();
  }

  getPositionForDomain(domain: string): OrbPositionConfig {
    if (this.settings.domainPositions && this.settings.domainPositions[domain]) {
      return this.settings.domainPositions[domain];
    }
    return { corner: 'bottom-right', freeMode: false };
  }

  async setPositionForDomain(domain: string, pos: OrbPositionConfig): Promise<void> {
    if (!this.settings.domainPositions) this.settings.domainPositions = {};
    this.settings.domainPositions[domain] = pos;
    this.settings.orbPosition = pos;
    try {
      await chrome.storage.local.set({ bastek_omni_settings: this.settings });
    } catch {
      // cichy zapis
    }
    this.notify();
  }

  subscribe(listener: (s: OmniSettings) => void): () => void {
    this.listeners.push(listener);
    listener(this.settings);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    for (const l of this.listeners) l(this.settings);
  }
}
