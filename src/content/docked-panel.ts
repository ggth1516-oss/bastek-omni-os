/**
 * Bastek Omni-OS // Content UI - Docked Flyout Panel
 * Panel boczny zadokowany bezpiecznie obok kulek (zero zasłaniania przycisków).
 * Maksymalny rozmiar pliku: < 150 linii.
 */

export class DockedPanel {
  private panel: HTMLElement;
  private iconEl: HTMLElement;
  private titleEl: HTMLElement;
  private bodyEl: HTMLElement;
  private closeBtn: HTMLElement;
  private isOpenState = false;

  constructor(
    private parentElement: HTMLElement,
    private onClose: () => void
  ) {
    this.panel = document.createElement('div');
    this.panel.className = 'docked-panel';
    this.panel.innerHTML = `
      <div class="panel-header">
        <div class="panel-header-title">
          <span class="panel-icon-box"></span>
          <span class="panel-title-text">Panel</span>
        </div>
        <button class="panel-close-btn" title="Zamknij (Esc)" style="display:flex;align-items:center;justify-content:center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="panel-body"></div>
    `;

    this.iconEl = this.panel.querySelector('.panel-icon-box')!;
    this.titleEl = this.panel.querySelector('.panel-title-text')!;
    this.bodyEl = this.panel.querySelector('.panel-body')!;
    this.closeBtn = this.panel.querySelector('.panel-close-btn')!;

    this.closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
      this.onClose();
    });

    this.parentElement.appendChild(this.panel);
  }

  isOpen(): boolean {
    return this.isOpenState;
  }

  open(title: string, iconSvg: string, content: HTMLElement): void {
    this.titleEl.textContent = title;
    this.iconEl.innerHTML = iconSvg;
    this.bodyEl.innerHTML = '';
    this.bodyEl.appendChild(content);

    this.isOpenState = true;
    this.panel.classList.add('is-open');
  }

  close(): void {
    this.isOpenState = false;
    this.panel.classList.remove('is-open');
  }

  setOrientation(isRightSide: boolean, isBottomSide: boolean): void {
    if (isRightSide) {
      this.panel.style.left = 'auto';
      this.panel.style.right = '0';
    } else {
      this.panel.style.right = 'auto';
      this.panel.style.left = '0';
    }

    if (isBottomSide) {
      this.panel.style.top = 'auto';
      this.panel.style.bottom = '84px';
    } else {
      this.panel.style.bottom = 'auto';
      this.panel.style.top = '84px';
    }
  }
}
