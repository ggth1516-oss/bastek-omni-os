/**
 * Bastek Omni-OS // Content UI - Settings Panel
 * Przestrzenna siatka rogów (2x2), blokada ruchu, przypinanie DOM, wybór 6 motywów Style Lab i przełączniki.
 * Maksymalny rozmiar pliku: < 210 linii.
 */

import type { OmniSettings } from '../../core/settings';
import type { OrbCorner, OmniThemePreset } from '../../types';

const THEME_PRESETS: { id: OmniThemePreset; label: string; color: string }[] = [
  { id: 'm3', label: 'Google M3 Dark', color: '#a8c7fa' },
  { id: 'obsidian', label: 'Cyber Obsidian', color: '#c58af9' },
  { id: 'matrix', label: 'Emerald Terminal', color: '#34d399' },
  { id: 'neon', label: 'Neon Hyperwave', color: '#38bdf8' },
  { id: 'titanium', label: 'Titanium Slate', color: '#e2e8f0' },
  { id: 'solar', label: 'Warm Amber', color: '#fbc02d' }
];

export class SettingsPanel {
  private container: HTMLElement;

  constructor(
    private activeContext: 'gemini' | 'flow' | 'youtube',
    private currentSettings: OmniSettings,
    private onCornerChanged: (corner: OrbCorner) => void,
    private onFreeMode: () => void,
    private onPinElement: () => void,
    private onSettingChanged: (key: keyof OmniSettings, val: boolean) => void,
    private onThemeChanged?: (theme: OmniThemePreset) => void
  ) {
    this.container = document.createElement('div');
    this.render();
  }

  getElement(): HTMLElement {
    return this.container;
  }

  private render(): void {
    const pos = this.currentSettings.orbPosition || { corner: 'bottom-right', freeMode: false };
    const curCorner = pos.corner || 'bottom-right';
    const isFree = !!pos.freeMode;
    const isPinned = !!pos.pinnedSelector;
    const curTheme = this.currentSettings.themePreset || 'm3';

    let switchesHtml = '';
    if (this.activeContext === 'gemini') {
      switchesHtml = `
        ${this.renderSwitch('fullWidth', 'Pełna szerokość czatu (Full-Width)', '100% szerokości z neutralizacją kagańców NetJet', this.currentSettings.fullWidth)}
        ${this.renderSwitch('scrollLock', 'Blokada skakania ekranu (Anti-Jump)', 'Zapobiega uciekaniu widoku podczas streamingu', this.currentSettings.scrollLock)}
        ${this.renderSwitch('zenMode', 'Tryb Zen (Czysty pulpit)', 'Ukrywa zbędne banery promocyjne i powiadomienia', this.currentSettings.zenMode)}
        ${this.renderSwitch('turnTimeline', 'Boczna oś czasu i licznik tokenów', 'Szybka nawigacja po krokach i telemetria 1M', this.currentSettings.turnTimeline)}
      `;
    } else if (this.activeContext === 'youtube') {
      switchesHtml = `
        ${this.renderSwitch('ultrawideCinema', 'Format Ultrawide 21:9', 'Dopasowanie do monitorów panoramicznych', this.currentSettings.ultrawideCinema)}
        ${this.renderSwitch('ambientGlow', 'Poświata Ambient Glow (4-strefowa)', 'Immersyjne podświetlenie tła wokół wideo', this.currentSettings.ambientGlow)}
      `;
    } else {
      switchesHtml = `
        <div style="font-size:12px;color:var(--omni-text-muted, #8e918f);padding:8px 0;">Brak dedykowanych przełączników dla tego serwisu.</div>
      `;
    }

    const hostname = window.location.hostname;

    this.container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <span style="font-size:11.5px;font-weight:600;color:var(--omni-accent-primary, #a8c7fa);">POŁOŻENIE PRZYCISKU:</span>
        <span style="font-size:11px;color:var(--omni-text-muted, #8e918f);background:var(--omni-bg-base, #1e1f20);padding:2px 8px;border-radius:10px;border:1px solid var(--omni-border-subtle, #444746);">
          ${hostname}
        </span>
      </div>
      <div style="font-size:11px;color:var(--omni-text-muted, #8e918f);margin-bottom:6px;">
        ${isFree ? 'Aktywny tryb dowolny (ruch odblokowany)' : isPinned ? `Przypięto do: ${pos.pinnedSelector}` : 'Narożnik zablokowany (kliknij Dowolne, by przestawić)'}:
      </div>
      
      <div class="corner-grid">
        <button class="corner-option-btn ${!isFree && !isPinned && curCorner === 'top-left' ? 'is-active' : ''}" data-corner="top-left">
          <span class="corner-dot-box corner-dot-tl"></span>
          <span>Lewy górny</span>
        </button>
        <button class="corner-option-btn ${!isFree && !isPinned && curCorner === 'top-right' ? 'is-active' : ''}" data-corner="top-right">
          <span class="corner-dot-box corner-dot-tr"></span>
          <span>Prawy górny</span>
        </button>
        <button class="corner-option-btn ${!isFree && !isPinned && curCorner === 'bottom-left' ? 'is-active' : ''}" data-corner="bottom-left">
          <span class="corner-dot-box corner-dot-bl"></span>
          <span>Lewy dolny</span>
        </button>
        <button class="corner-option-btn ${!isFree && !isPinned && curCorner === 'bottom-right' ? 'is-active' : ''}" data-corner="bottom-right">
          <span class="corner-dot-box corner-dot-br"></span>
          <span>Prawy dolny</span>
        </button>
      </div>

      <div class="pos-mode-actions">
        <button class="pos-mode-btn free-mode-btn ${isFree ? 'is-active' : ''}" title="Odblokuj swobodne przeciąganie w dowolne miejsce ekranu">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>
          </svg>
          <span>Dowolne</span>
        </button>

        <button class="pos-mode-btn pin-element-btn ${isPinned ? 'is-active' : ''}" title="Wskaż myszką element na stronie i przypnij do niego kulkę">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-2l-2-3V6a5 5 0 0 0-10 0v6l-2 3v2z"/>
          </svg>
          <span>Przypnij</span>
        </button>
      </div>

      <div style="border-top:1px solid var(--omni-border-subtle, #2d2f31);margin:10px 0 8px 0;"></div>
      <div style="font-size:11.5px;font-weight:600;color:var(--omni-accent-primary, #a8c7fa);margin-bottom:6px;">MOTYW KOLORYSTYCZNY (STYLE LAB):</div>
      <div class="corner-grid">
        ${THEME_PRESETS.map((t) => `
          <button class="theme-preset-btn ${curTheme === t.id ? 'is-active' : ''}" data-theme-id="${t.id}">
            <span style="width:10px;height:10px;border-radius:50%;background:${t.color};flex-shrink:0;"></span>
            <span>${t.label}</span>
          </button>
        `).join('')}
      </div>
      
      <div style="border-top:1px solid var(--omni-border-subtle, #2d2f31);margin:10px 0 8px 0;"></div>
      <div style="font-size:11.5px;font-weight:600;color:var(--omni-accent-primary, #a8c7fa);margin-bottom:6px;">PREFERENCJE SERWISU:</div>
      <div class="switches-list">
        ${switchesHtml}
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    this.container.querySelectorAll<HTMLElement>('.corner-option-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const corner = btn.getAttribute('data-corner') as OrbCorner;
        if (corner) {
          this.container.querySelectorAll('.corner-option-btn, .pos-mode-btn').forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          this.onCornerChanged(corner);
        }
      });
    });

    const freeBtn = this.container.querySelector('.free-mode-btn');
    freeBtn?.addEventListener('click', () => {
      this.container.querySelectorAll('.corner-option-btn, .pos-mode-btn').forEach((b) => b.classList.remove('is-active'));
      freeBtn.classList.add('is-active');
      this.onFreeMode();
    });

    const pinBtn = this.container.querySelector('.pin-element-btn');
    pinBtn?.addEventListener('click', () => {
      this.container.querySelectorAll('.corner-option-btn, .pos-mode-btn').forEach((b) => b.classList.remove('is-active'));
      pinBtn.classList.add('is-active');
      this.onPinElement();
    });

    this.container.querySelectorAll<HTMLElement>('.theme-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const themeId = btn.getAttribute('data-theme-id') as OmniThemePreset;
        if (themeId && this.onThemeChanged) {
          this.container.querySelectorAll('.theme-preset-btn').forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          this.onThemeChanged(themeId);
        }
      });
    });

    this.container.querySelectorAll<HTMLInputElement>('.m3-switch input').forEach((inp) => {
      inp.addEventListener('change', () => {
        const key = inp.getAttribute('data-key') as keyof OmniSettings;
        if (key) this.onSettingChanged(key, inp.checked);
      });
    });
  }

  private renderSwitch(key: keyof OmniSettings, title: string, sub: string, checked: boolean): string {
    return `
      <div class="m3-switch-row">
        <div class="m3-switch-info">
          <span class="m3-switch-title">${title}</span>
          <span class="m3-switch-sub">${sub}</span>
        </div>
        <label class="m3-switch">
          <input type="checkbox" data-key="${key}" ${checked ? 'checked' : ''} />
          <span class="m3-slider"></span>
        </label>
      </div>
    `;
  }
}
