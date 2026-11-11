/**
 * Bastek Omni-OS // AI Workspace - Width Override
 * Likwidacja kagańców szerokości czatu Google Gemini (zarówno tradycyjnych, jak i NetJet Atomic CSS).
 * Maksymalny rozmiar pliku: < 100 linii.
 */

const STYLE_ID = 'bastek-gemini-fullwidth-override';

const FULLWIDTH_CSS = `
  /* 1. Usunięcie sztywnych limitów z kontenerów głównych czatu */
  .conversation-container {
    max-width: 100% !important;
    width: 100% !important;
    padding-left: clamp(16px, 3vw, 48px) !important;
    padding-right: clamp(16px, 3vw, 48px) !important;
    box-sizing: border-box !important;
  }

  /* 2. Zdjęcie kagańców szerokości z zapytań i odpowiedzi */
  user-query,
  model-response,
  response-element,
  .response-container-has-overflow,
  .md-content,
  .md-content > *,
  .presentation-container {
    max-width: 100% !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  /* 3. Neutralizacja kagańców NetJet / Atomic CSS (islands-BAC6RwGR.css) */
  .xzhckgz,
  .xo1k9tj,
  .xo1k9tj.xo1k9tj,
  .x4y6ppb,
  .x4y6ppb.x4y6ppb,
  .x1ikqzku,
  .xov22wm,
  .xryzdfw {
    max-width: 100% !important;
    width: 100% !important;
  }

  /* 4. Skasowanie nienaturalnego przesunięcia kontenerów zapytań kontenerowych */
  .x1j02wbg,
  .x1j02wbg.x1j02wbg {
    inset-inline-start: 0 !important;
    width: 100% !important;
  }

  /* 5. Rozciągnięcie dolnego pola wprowadzania tekstu */
  .input-area-container,
  .initial-input-area-container,
  .bottom-container,
  .input-area {
    max-width: 100% !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  /* 6. Zapewnienie pełnej szerokości bloków kodu */
  code-block,
  .code-container,
  pre {
    max-width: 100% !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
`;

export class WidthOverride {
  private active = false;

  isActive(): boolean {
    return this.active;
  }

  setEnabled(enable: boolean): void {
    if (enable) this.enable();
    else this.disable();
  }

  enable(): void {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = FULLWIDTH_CSS;
    document.head.appendChild(style);
    this.active = true;
  }

  disable(): void {
    const style = document.getElementById(STYLE_ID);
    if (style) style.remove();
    this.active = false;
  }

  toggle(): boolean {
    this.setEnabled(!this.active);
    return this.active;
  }
}
