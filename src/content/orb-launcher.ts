/**
 * Bastek Omni-OS // Content UI - Nexus Orb FAB & Drag Orchestrator
 * Pływająca kulka akcji (FAB 60px) z obsługą D&D obiektów, trybu dowolnego i śledzenia przypięcia DOM (pinnedSelector).
 * Maksymalny rozmiar pliku: < 235 linii.
 */

import { SVG_SPARKLE } from './svg-icons';
import type { OrbPositionConfig, OrbCorner } from '../types';

export class OrbLauncher {
  private dockEl: HTMLElement;
  private orbBtn: HTMLElement;
  private spinnerEl: HTMLElement;
  private badgeEl: HTMLElement;

  private isDragging = false;
  private hasMoved = false;
  private freeMode = false;
  private pinnedSelector: string | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private initialLeft = 0;
  private initialTop = 0;

  constructor(
    private shadowRoot: ShadowRoot,
    private onOrbClick: () => void,
    private onPositionChange: (pos: OrbPositionConfig) => void,
    private onOrientationChange: (isRightSide: boolean, isBottomSide: boolean) => void,
    private onDropData?: (files: File[], text: string) => void
  ) {
    this.dockEl = document.createElement('div');
    this.dockEl.className = 'orb-dock';
    this.dockEl.innerHTML = `
      <div class="main-orb-wrapper">
        <div class="main-orb-spinner"></div>
        <div class="process-counter-badge">0</div>
        <div class="main-orb" title="Kliknij: Menu | Przeciągnij: Przestaw | Upuść plik/tekst do Schowka">${SVG_SPARKLE}</div>
      </div>
    `;
    this.spinnerEl = this.dockEl.querySelector('.main-orb-spinner')!;
    this.badgeEl = this.dockEl.querySelector('.process-counter-badge')!;
    this.orbBtn = this.dockEl.querySelector('.main-orb')!;

    this.setupDragAndClick();
    this.setupDropZone();
    this.setupViewportListeners();
    this.shadowRoot.appendChild(this.dockEl);
  }

  getDockElement(): HTMLElement { return this.dockEl; }

  setThinking(isThinking: boolean, activeCount: number): void {
    this.spinnerEl.classList.toggle('is-active', isThinking);
    this.badgeEl.textContent = String(activeCount);
    this.badgeEl.classList.toggle('is-visible', activeCount > 0);
  }

  setOpen(isOpen: boolean): void {
    this.orbBtn.classList.toggle('is-open', isOpen);
  }

  setFreeMode(free: boolean): void {
    this.freeMode = free;
    if (free) this.pinnedSelector = null;
    this.orbBtn.style.cursor = free ? 'grab' : 'pointer';
  }

  pinToCoordinates(x: number, y: number, selector?: string): void {
    this.setFreeMode(false);
    this.pinnedSelector = selector || null;
    this.placeFixed(x, y);
  }

  applyPosition(pos: OrbPositionConfig): void {
    this.setFreeMode(!!pos.freeMode);
    this.pinnedSelector = pos.pinnedSelector || null;
    if (this.pinnedSelector && this.syncPinnedElementPosition()) return;
    if (pos.customX !== undefined || pos.customY !== undefined) {
      this.placeFixed(pos.customX ?? window.innerWidth - 76, pos.customY ?? window.innerHeight - 76);
      return;
    }
    this.dockToCorner(pos.corner || 'bottom-right');
  }

  private placeFixed(x: number, y: number): void {
    const { safeX, safeY } = this.clampCoords(x, y);
    this.dockEl.style.bottom = 'auto';
    this.dockEl.style.right = 'auto';
    this.dockEl.style.left = `${safeX}px`;
    this.dockEl.style.top = `${safeY}px`;
    this.checkOrientation(safeX, safeY);
  }

  private syncPinnedElementPosition(): boolean {
    if (!this.pinnedSelector || this.freeMode) return false;
    try {
      const el = document.querySelector<HTMLElement>(this.pinnedSelector);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return false;

      let targetX = rect.right + 12;
      const targetY = rect.top + (rect.height - 60) / 2;
      if (targetX + 72 > window.innerWidth) targetX = Math.max(12, rect.left - 72);
      this.placeFixed(Math.round(targetX), Math.round(targetY));
      return true;
    } catch {
      return false;
    }
  }

  private clampCoords(x: number, y: number): { safeX: number; safeY: number } {
    return {
      safeX: Math.max(16, Math.min(Math.max(16, window.innerWidth - 76), x)),
      safeY: Math.max(50, Math.min(Math.max(50, window.innerHeight - 76), y))
    };
  }

  private dockToCorner(corner: OrbCorner): void {
    this.pinnedSelector = null;
    this.dockEl.style.left = 'auto';
    this.dockEl.style.right = 'auto';
    this.dockEl.style.top = 'auto';
    this.dockEl.style.bottom = 'auto';

    const isBottom = corner.startsWith('bottom');
    const isRight = corner.endsWith('right');
    if (isBottom) this.dockEl.style.bottom = '24px';
    else this.dockEl.style.top = '76px';
    if (isRight) this.dockEl.style.right = '24px';
    else this.dockEl.style.left = '24px';

    this.checkOrientation(isRight ? window.innerWidth - 60 : 60, isBottom ? window.innerHeight - 60 : 80);
  }

  private setupViewportListeners(): void {
    window.addEventListener('resize', () => {
      if (!this.syncPinnedElementPosition()) this.clampToViewport();
    });
    window.addEventListener('scroll', () => {
      if (this.pinnedSelector) this.syncPinnedElementPosition();
    }, { passive: true, capture: true });
  }

  private clampToViewport(): void {
    const rect = this.dockEl.getBoundingClientRect();
    const { safeX, safeY } = this.clampCoords(rect.left, rect.top);
    if (this.dockEl.style.left && this.dockEl.style.left !== 'auto') this.dockEl.style.left = `${safeX}px`;
    if (this.dockEl.style.top && this.dockEl.style.top !== 'auto') this.dockEl.style.top = `${safeY}px`;
    const cur = this.dockEl.getBoundingClientRect();
    this.checkOrientation(cur.left, cur.top);
  }

  private setupDropZone(): void {
    this.orbBtn.addEventListener('dragenter', (e) => { e.preventDefault(); this.orbBtn.classList.add('is-drag-target'); });
    this.orbBtn.addEventListener('dragover', (e) => { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; this.orbBtn.classList.add('is-drag-target'); });
    this.orbBtn.addEventListener('dragleave', (e) => { if (e.target === this.orbBtn) this.orbBtn.classList.remove('is-drag-target'); });
    this.orbBtn.addEventListener('drop', (e) => {
      e.preventDefault();
      this.orbBtn.classList.remove('is-drag-target');
      const files = Array.from(e.dataTransfer?.files || []);
      const text = e.dataTransfer?.getData('text/plain') || e.dataTransfer?.getData('text/uri-list') || '';
      if (this.onDropData) this.onDropData(files, text);
    });
  }

  private setupDragAndClick(): void {
    this.orbBtn.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button !== 0 || !this.freeMode) return;
      this.isDragging = true;
      this.hasMoved = false;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      const rect = this.dockEl.getBoundingClientRect();
      this.initialLeft = rect.left;
      this.initialTop = rect.top;
      this.placeFixed(this.initialLeft, this.initialTop);
      this.orbBtn.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.isDragging || !this.freeMode) return;
      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - this.dragStartY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) this.hasMoved = true;
      this.placeFixed(this.initialLeft + dx, this.initialTop + dy);
    });

    window.addEventListener('mouseup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.orbBtn.style.cursor = this.freeMode ? 'grab' : 'pointer';
      if (!this.hasMoved) this.onOrbClick();
      else {
        const r = this.dockEl.getBoundingClientRect();
        const { safeX, safeY } = this.clampCoords(Math.round(r.left), Math.round(r.top));
        this.placeFixed(safeX, safeY);
        const c = this.detectNearestCorner(safeX, safeY);
        this.onPositionChange({ corner: c, customX: safeX, customY: safeY, freeMode: true });
      }
    });

    this.orbBtn.addEventListener('click', (e) => {
      if (!this.freeMode) {
        e.stopPropagation();
        this.onOrbClick();
      }
    });
  }

  private checkOrientation(x: number, y: number): void {
    this.onOrientationChange(x > window.innerWidth / 2, y > window.innerHeight / 2);
  }

  private detectNearestCorner(x: number, y: number): OrbCorner {
    const isRight = x > window.innerWidth / 2;
    const isBottom = y > window.innerHeight / 2;
    return isBottom ? (isRight ? 'bottom-right' : 'bottom-left') : (isRight ? 'top-right' : 'top-left');
  }
}
