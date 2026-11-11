/**
 * Bastek Omni-OS // Content UI - Thinking Tab Satellites
 * Pionowy stos myślących kart (satelity) rosnący nad głównym przyciskiem.
 * Maksymalny rozmiar pliku: < 160 linii.
 */

import type { ThinkingTabInfo } from '../types';
import { SVG_SPARKLE_SMALL, SVG_FLOW_LOGO, SVG_YOUTUBE_LOGO } from './svg-icons';

export class SatellitesStack {
  private container: HTMLElement;
  private tabs: ThinkingTabInfo[] = [];

  constructor(
    private parentElement: HTMLElement,
    private onFocusTab: (tabId: number) => void
  ) {
    this.container = document.createElement('div');
    this.container.className = 'orb-satellites-top';
    this.parentElement.appendChild(this.container);
  }

  updateTabs(tabs: ThinkingTabInfo[]): void {
    this.tabs = tabs;
    this.render();
  }

  getCount(): number {
    return this.tabs.length;
  }

  setDirection(dir: 'left' | 'right' | 'up' | 'down'): void {
    this.container.style.left = 'auto';
    this.container.style.right = 'auto';
    this.container.style.top = 'auto';
    this.container.style.bottom = 'auto';

    if (dir === 'up') {
      this.container.style.bottom = '72px';
      this.container.style.left = '6px';
      this.container.style.flexDirection = 'column-reverse';
    } else if (dir === 'down') {
      this.container.style.top = '72px';
      this.container.style.left = '6px';
      this.container.style.flexDirection = 'column';
    } else if (dir === 'left') {
      this.container.style.right = '72px';
      this.container.style.top = '6px';
      this.container.style.flexDirection = 'row-reverse';
    } else if (dir === 'right') {
      this.container.style.left = '72px';
      this.container.style.top = '6px';
      this.container.style.flexDirection = 'row';
    }
  }

  setOrientation(isBottomSide: boolean): void {
    if (isBottomSide) {
      this.container.style.top = 'auto';
      this.container.style.bottom = '72px';
      this.container.style.flexDirection = 'column-reverse';
    } else {
      this.container.style.bottom = 'auto';
      this.container.style.top = '72px';
      this.container.style.flexDirection = 'column';
    }
  }

  private render(): void {
    this.container.innerHTML = '';
    if (this.tabs.length === 0) {
      this.container.style.display = 'none';
      return;
    }

    this.container.style.display = 'flex';

    for (const tab of this.tabs) {
      const bubble = document.createElement('div');
      bubble.className = 'satellite-bubble';
      bubble.title = `${tab.title} (Kliknij, aby przejść)`;

      let iconHtml = SVG_SPARKLE_SMALL;
      if (tab.service === 'flow') iconHtml = SVG_FLOW_LOGO;
      else if (tab.service === 'youtube') iconHtml = SVG_YOUTUBE_LOGO;

      bubble.innerHTML = `
        ${iconHtml}
        <div class="satellite-dot-pulse"></div>
      `;

      bubble.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onFocusTab(tab.tabId);
      });

      this.container.appendChild(bubble);
    }
  }
}
