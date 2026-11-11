/**
 * Bastek Omni-OS // AI Workspace - Anti-Jump Scroll Lock
 * Stabilizuje skakanie ekranu podczas strumieniowania długich odpowiedzi Gemini.
 * Maksymalny rozmiar pliku: < 60 linii.
 */

const SCROLL_STYLE_ID = 'bastek-gemini-scroll-lock-override';

const SCROLL_CSS = `
  body.bastek-scroll-locked *,
  body.bastek-scroll-locked infinite-scroller.chat-history,
  body.bastek-scroll-locked .chat-history-scroll-container,
  body.bastek-scroll-locked bard-sidenav-content,
  body.bastek-scroll-locked mat-sidenav-content {
    overflow-anchor: none !important;
  }
`;

export class ScrollLock {
  private locked = false;

  constructor() {
    this.injectStyles();
  }

  private injectStyles(): void {
    if (!document.getElementById(SCROLL_STYLE_ID)) {
      const style = document.createElement('style');
      style.id = SCROLL_STYLE_ID;
      style.textContent = SCROLL_CSS;
      document.head.appendChild(style);
    }
  }

  isLocked(): boolean {
    return this.locked;
  }

  setLock(enable: boolean): void {
    this.locked = enable;
    document.body.classList.toggle('bastek-scroll-locked', enable);
  }

  toggle(): boolean {
    this.setLock(!this.locked);
    return this.locked;
  }
}
