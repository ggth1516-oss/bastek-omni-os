/**
 * Bastek Omni-OS // Cinema OS - On-Screen Display (OSD)
 * Wizualny wskaźnik potwierdzający zmiany głośności, prędkości i formatu 21:9 (izolowany w Shadow DOM).
 * Maksymalny rozmiar pliku: < 65 linii.
 */

export class CinemaOsd {
  private element: HTMLElement | null = null;
  private timer: number | null = null;
  private targetRoot: ShadowRoot | HTMLElement | null = null;

  setRoot(root: ShadowRoot | HTMLElement): void {
    this.targetRoot = root;
  }

  show(text: string): void {
    if (!this.element) {
      this.element = document.createElement('div');
      this.element.style.cssText = `
        position: fixed;
        top: 40px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(10, 10, 15, 0.88);
        backdrop-filter: blur(12px);
        border: 1px solid var(--omni-accent-primary, rgba(245, 158, 11, 0.5));
        border-radius: 8px;
        padding: 8px 18px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        color: var(--omni-accent-primary, #fbbf24);
        z-index: 2147483647;
        pointer-events: none;
        box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        transition: opacity 0.2s ease;
      `;
      (this.targetRoot || document.body).appendChild(this.element);
    }

    this.element.textContent = text;
    this.element.style.opacity = '1';

    if (this.timer) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      if (this.element) this.element.style.opacity = '0';
    }, 1800);
  }
}
