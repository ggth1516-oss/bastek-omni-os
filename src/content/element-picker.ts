/**
 * Bastek Omni-OS // Content UI - Interactive Element Picker
 * Wskazywanie elementu strony i przejście do Kroku 2 wyboru kierunku (osadzone w Shadow DOM).
 * Maksymalny rozmiar pliku: < 190 linii.
 */

import { PinDirectionModal } from './pin-direction-modal';

export interface PinTargetResult {
  selector: string;
  x: number;
  y: number;
  element: HTMLElement;
  menuDirection: 'left' | 'right' | 'up' | 'down';
  satellitesDirection: 'left' | 'right' | 'up' | 'down';
}

export class ElementPicker {
  private overlay: HTMLElement | null = null;
  private banner: HTMLElement | null = null;
  private currentTarget: HTMLElement | null = null;
  private isActive = false;

  private onSelectCallback: ((res: PinTargetResult) => void) | null = null;
  private onCancelCallback: (() => void) | null = null;

  constructor(private shadowRoot: ShadowRoot) {}

  start(onSelect: (res: PinTargetResult) => void, onCancel?: () => void): void {
    if (this.isActive) return;
    this.isActive = true;
    this.onSelectCallback = onSelect;
    this.onCancelCallback = onCancel || null;

    this.createDomElements();
    this.attachEvents();
  }

  stop(): void {
    if (!this.isActive) return;
    this.isActive = false;
    this.removeDomElements();
    this.detachEvents();
  }

  private createDomElements(): void {
    this.banner = document.createElement('div');
    this.banner.style.cssText = `
      position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
      background: var(--omni-bg-base, #1e1f20); border: 1px solid var(--omni-accent-primary, #a8c7fa); color: #f1f3f4;
      padding: 10px 20px; border-radius: 24px; font-size: 13px;
      font-family: 'Google Sans', Roboto, sans-serif; font-weight: 500;
      z-index: 2147483647; box-shadow: 0 10px 30px rgba(0,0,0,0.8);
      pointer-events: none; display: flex; align-items: center; gap: 12px;
    `;
    this.banner.innerHTML = `
      <span style="color:var(--omni-accent-primary, #a8c7fa);display:flex;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/>
        </svg>
      </span>
      <span>Kliknij element na stronie, aby przypiąć kulkę (Esc = Anuluj)</span>
    `;
    this.shadowRoot.appendChild(this.banner);

    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed; pointer-events: none; border: 2px solid var(--omni-accent-primary, #a8c7fa);
      background: rgba(168, 199, 250, 0.15); border-radius: 8px;
      z-index: 2147483646; display: none; transition: all 0.08s ease-out;
    `;
    this.shadowRoot.appendChild(this.overlay);
    document.body.style.cursor = 'crosshair';
  }

  private removeDomElements(): void {
    if (this.banner) { this.banner.remove(); this.banner = null; }
    if (this.overlay) { this.overlay.remove(); this.overlay = null; }
    document.body.style.cursor = '';
  }

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isActive) return;
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    if (!el || el.id === 'bastek-omni-cockpit-root' || el.closest('#bastek-omni-cockpit-root')) return;

    this.currentTarget = el;
    const rect = el.getBoundingClientRect();
    if (this.overlay) {
      this.overlay.style.display = 'block';
      this.overlay.style.left = `${rect.left}px`;
      this.overlay.style.top = `${rect.top}px`;
      this.overlay.style.width = `${rect.width}px`;
      this.overlay.style.height = `${rect.height}px`;
    }
  };

  private handleClick = (e: MouseEvent): void => {
    if (!this.isActive) return;
    e.preventDefault();
    e.stopPropagation();

    if (this.currentTarget) {
      const targetEl = this.currentTarget;
      const rect = targetEl.getBoundingClientRect();
      const pos = this.calculateSmartPosition(rect);
      const sel = this.getSelector(targetEl);

      this.stop();

      new PinDirectionModal(
        this.shadowRoot,
        sel,
        pos.x,
        pos.y,
        (dirs) => {
          if (this.onSelectCallback) {
            this.onSelectCallback({
              selector: sel,
              x: pos.x,
              y: pos.y,
              element: targetEl,
              menuDirection: dirs.menuDirection,
              satellitesDirection: dirs.satellitesDirection
            });
          }
        },
        () => {
          if (this.onCancelCallback) this.onCancelCallback();
        }
      );
    }
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.isActive) {
      this.stop();
      if (this.onCancelCallback) this.onCancelCallback();
    }
  };

  private attachEvents(): void {
    window.addEventListener('mousemove', this.handleMouseMove, true);
    window.addEventListener('click', this.handleClick, true);
    window.addEventListener('keydown', this.handleKeyDown, true);
  }

  private detachEvents(): void {
    window.removeEventListener('mousemove', this.handleMouseMove, true);
    window.removeEventListener('click', this.handleClick, true);
    window.removeEventListener('keydown', this.handleKeyDown, true);
  }

  private calculateSmartPosition(rect: DOMRect): { x: number; y: number } {
    const orbSize = 60;
    const margin = 12;
    let targetX = rect.right + margin;
    let targetY = rect.top + (rect.height - orbSize) / 2;

    if (targetX + orbSize + margin > window.innerWidth) {
      targetX = Math.max(margin, rect.left - orbSize - margin);
    }
    targetY = Math.max(50, Math.min(window.innerHeight - orbSize - margin, targetY));
    return { x: Math.round(targetX), y: Math.round(targetY) };
  }

  private getSelector(el: HTMLElement): string {
    if (el.id) return `#${CSS.escape(el.id)}`;
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.trim().split(/\s+/).slice(0, 2).map((c) => CSS.escape(c)).join('.');
      if (classes) return `${el.tagName.toLowerCase()}.${classes}`;
    }
    return el.tagName.toLowerCase();
  }
}
