/**
 * Bastek Omni-OS // Content UI - Save & Export Panel
 * Zapisywanie rozmów, artefaktów i plików projektu do ZIP/MD/Notatek studyjnych.
 * Maksymalny rozmiar pliku: < 160 linii.
 */

import {
  SVG_ZIP_ARCHIVE,
  SVG_MARKDOWN,
  SVG_CANVAS,
  SVG_OBSIDIAN,
  SVG_FLOW_LOGO,
  SVG_YOUTUBE_LOGO
} from '../svg-icons';

export class SavePanel {
  private container: HTMLElement;

  constructor(
    private activeContext: 'gemini' | 'flow' | 'youtube',
    private onExecute: (actionId: string) => void
  ) {
    this.container = document.createElement('div');
    this.render();
  }

  getElement(): HTMLElement {
    return this.container;
  }

  private render(): void {
    let contextItemsHtml = '';

    if (this.activeContext === 'gemini') {
      contextItemsHtml = `
        <div class="m3-row-item" data-action="export-zip">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="color:#a8c7fa;display:flex;">${SVG_ZIP_ARCHIVE}</div>
            <div style="display:flex;flex-direction:column;gap:2px;">
              <span class="m3-row-title">Eksportuj rozmowę i media do ZIP (CRC32)</span>
              <span style="font-size:11.5px;color:#8e918f;">Paczka archiwum z kodem i wygenerowanymi obrazami</span>
            </div>
          </div>
        </div>

        <div class="m3-row-item" data-action="export-md">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="color:#a8c7fa;display:flex;">${SVG_MARKDOWN}</div>
            <div style="display:flex;flex-direction:column;gap:2px;">
              <span class="m3-row-title">Eksportuj do Markdown (AI Bundle)</span>
              <span style="font-size:11.5px;color:#8e918f;">Plik .md z indeksem drzewa ASCII</span>
            </div>
          </div>
        </div>

        <div class="m3-row-item" data-action="harvest-canvas">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="color:#a8c7fa;display:flex;">${SVG_CANVAS}</div>
            <div style="display:flex;flex-direction:column;gap:2px;">
              <span class="m3-row-title">Pobierz pliki projektu z Canvas do ZIP</span>
              <span style="font-size:11.5px;color:#8e918f;">Automatyczna ekstrakcja z edytora Canvas</span>
            </div>
          </div>
        </div>
      `;
    } else if (this.activeContext === 'flow') {
      contextItemsHtml = `
        <div class="m3-row-item" data-action="export-flow-json">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="color:#a8c7fa;display:flex;">${SVG_FLOW_LOGO}</div>
            <div style="display:flex;flex-direction:column;gap:2px;">
              <span class="m3-row-title">Eksportuj konfigurację modelu i promptów do JSON</span>
              <span style="font-size:11.5px;color:#8e918f;">Pełna topologia promptów i parametrów</span>
            </div>
          </div>
        </div>
      `;
    } else if (this.activeContext === 'youtube') {
      contextItemsHtml = `
        <div class="m3-row-item" data-action="capture-frame">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="color:#a8c7fa;display:flex;">${SVG_YOUTUBE_LOGO}</div>
            <div style="display:flex;flex-direction:column;gap:2px;">
              <span class="m3-row-title">Zapisz klatkę wideo w 4K (PNG)</span>
              <span style="font-size:11.5px;color:#8e918f;">Bezstratny zrzut klatki wideo</span>
            </div>
          </div>
        </div>

        <div class="m3-row-item" data-action="export-study-note">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="color:#a8c7fa;display:flex;">${SVG_MARKDOWN}</div>
            <div style="display:flex;flex-direction:column;gap:2px;">
              <span class="m3-row-title">Zapisz notatkę studyjną z linkiem czasowym</span>
              <span style="font-size:11.5px;color:#8e918f;">Karta Markdown z timestampem i zrzutem klatki</span>
            </div>
          </div>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div style="font-size:12px;color:#8e918f;margin-bottom:12px;">Dostępne formaty eksportu w bieżącym kontekście:</div>
      ${contextItemsHtml}
      <div style="border-top:1px solid #2d2f31;margin:12px 0 8px 0;padding-top:8px;"></div>
      <div class="m3-row-item" data-action="save-vault">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="color:#a8c7fa;display:flex;">${SVG_OBSIDIAN}</div>
          <div style="display:flex;flex-direction:column;gap:2px;">
            <span class="m3-row-title" style="color:#a8c7fa;">Zapisz do theworks-vault</span>
            <span style="font-size:11.5px;color:#8e918f;">Bezpośredni zapis do lokalnego skarbca</span>
          </div>
        </div>
      </div>
    `;

    this.container.querySelectorAll<HTMLElement>('.m3-row-item').forEach((item) => {
      item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        if (action) this.onExecute(action);
      });
    });
  }
}
