/**
 * Bastek Omni-OS // AI Workspace - Zen Mode (De-Slop UI)
 * Ukrywa banery reklamowe, karty subskrypcji Gemini Advanced oraz zbędne podpowiedzi.
 * Maksymalny rozmiar pliku: < 75 linii.
 */

const ZEN_STYLE_ID = 'bastek-gemini-zen-mode-override';

const ZEN_CSS = `
  /* Ukrywanie nachalnych banerów promocyjnych i upselli */
  .gemini-advanced-upsell,
  .promo-banner,
  .upsell-card,
  [data-test-id*="upsell"],
  .side-navigation-v2-footer-promo,
  .trial-banner,
  .experiment-banner {
    display: none !important;
  }

  /* Zwężenie i dyskretny wygląd przycisków sugerowanych pytań */
  .follow-up-suggestions-container button,
  [data-test-id*="suggestion"] {
    opacity: 0.75;
    transform: scale(0.95);
    transition: opacity 0.2s ease;
  }
  .follow-up-suggestions-container button:hover,
  [data-test-id*="suggestion"]:hover {
    opacity: 1;
  }
`;

export class ZenMode {
  private active = false;

  isActive(): boolean {
    return this.active;
  }

  setEnabled(enable: boolean): void {
    if (enable) this.enable();
    else this.disable();
  }

  enable(): void {
    if (document.getElementById(ZEN_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = ZEN_STYLE_ID;
    style.textContent = ZEN_CSS;
    document.head.appendChild(style);
    this.active = true;
  }

  disable(): void {
    const style = document.getElementById(ZEN_STYLE_ID);
    if (style) style.remove();
    this.active = false;
  }

  toggle(): boolean {
    this.setEnabled(!this.active);
    return this.active;
  }
}
