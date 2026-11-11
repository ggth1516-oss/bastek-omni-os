/**
 * Bastek Omni-OS // Content UI - Cascading Speed Dial Sub-Buttons
 * 5 okrągłych kulek (44px) ze stabilnym menu i pływającymi etykietami na hover (zero skakania).
 * Maksymalny rozmiar pliku: < 170 linii.
 */

import {
  SVG_PROFILE,
  SVG_CLIPBOARD,
  SVG_SAVE,
  SVG_ACTIONS,
  SVG_SETTINGS
} from './svg-icons';

export interface SpeedDialItem {
  id: string;
  label: string;
  iconSvg: string;
}

const DIAL_ITEMS: SpeedDialItem[] = [
  { id: 'profile', label: 'Profile', iconSvg: SVG_PROFILE },
  { id: 'clipboard', label: 'Schowek', iconSvg: SVG_CLIPBOARD },
  { id: 'save', label: 'Zapisz', iconSvg: SVG_SAVE },
  { id: 'actions', label: 'Akcje', iconSvg: SVG_ACTIONS },
  { id: 'settings', label: 'Ustawienia', iconSvg: SVG_SETTINGS }
];

export class SpeedDialStack {
  private container: HTMLElement;
  private buttons: Map<string, HTMLElement> = new Map();
  private isOpen = false;
  private activeId: string | null = null;

  constructor(
    private parentElement: HTMLElement,
    private onButtonClick: (id: string) => void
  ) {
    this.container = document.createElement('div');
    this.container.className = 'cascade-stack-left';
    this.parentElement.appendChild(this.container);
    this.render();
  }

  isMenuOpen(): boolean {
    return this.isOpen;
  }

  open(): void {
    this.isOpen = true;
    this.container.classList.add('is-open');
  }

  close(): void {
    this.isOpen = false;
    this.container.classList.remove('is-open');
    this.setActiveButton(null);
  }

  toggle(): boolean {
    if (this.isOpen) this.close();
    else this.open();
    return this.isOpen;
  }

  setActiveButton(id: string | null): void {
    this.activeId = id;
    this.container.classList.toggle('has-active', id !== null);
    this.buttons.forEach((btn, btnId) => {
      btn.classList.toggle('is-active', btnId === id);
    });
  }

  setDirection(dir: 'left' | 'right' | 'up' | 'down'): void {
    this.container.style.left = 'auto';
    this.container.style.right = 'auto';
    this.container.style.top = 'auto';
    this.container.style.bottom = 'auto';

    if (dir === 'left') {
      this.container.style.right = '72px';
      this.container.style.top = '6px';
      this.container.style.flexDirection = 'row-reverse';
    } else if (dir === 'right') {
      this.container.style.left = '72px';
      this.container.style.top = '6px';
      this.container.style.flexDirection = 'row';
    } else if (dir === 'up') {
      this.container.style.bottom = '72px';
      this.container.style.left = '6px';
      this.container.style.flexDirection = 'column-reverse';
    } else if (dir === 'down') {
      this.container.style.top = '72px';
      this.container.style.left = '6px';
      this.container.style.flexDirection = 'column';
    }
  }

  setOrientation(isRightSide: boolean, isBottomSide = true): void {
    if (isRightSide) {
      this.container.style.left = 'auto';
      this.container.style.right = '72px';
      this.container.style.flexDirection = 'row-reverse';
    } else {
      this.container.style.right = 'auto';
      this.container.style.left = '72px';
      this.container.style.flexDirection = 'row';
    }
    this.container.classList.toggle('tooltip-flip-bottom', !isBottomSide);
  }

  private render(): void {
    this.container.innerHTML = '';
    this.buttons.clear();

    for (const item of DIAL_ITEMS) {
      const btn = document.createElement('button');
      btn.className = 'dial-sub-btn';
      btn.setAttribute('data-dial-id', item.id);
      btn.title = item.label;
      btn.innerHTML = `
        <div class="dial-icon-box">${item.iconSvg}</div>
        <div class="dial-tooltip">${item.label}</div>
      `;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setActiveButton(item.id);
        this.onButtonClick(item.id);
      });

      this.buttons.set(item.id, btn);
      this.container.appendChild(btn);
    }
  }
}
