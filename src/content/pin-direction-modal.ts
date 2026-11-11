/**
 * Bastek Omni-OS // Content UI - Pin Direction Modal (Krok 2)
 * Pozwala wybrać kierunek rozwijania menu Speed Dial oraz satelitów procesów po przypięciu do elementu (w Shadow DOM).
 * Maksymalny rozmiar pliku: < 175 linii.
 */

export interface PinDirectionResult {
  menuDirection: 'left' | 'right' | 'up' | 'down';
  satellitesDirection: 'left' | 'right' | 'up' | 'down';
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export class PinDirectionModal {
  private overlay: HTMLElement | null = null;
  private selectedMenu: 'left' | 'right' | 'up' | 'down' = 'left';
  private selectedSatellites: 'left' | 'right' | 'up' | 'down' = 'up';

  constructor(
    private shadowRoot: ShadowRoot,
    private targetSelector: string,
    initialX: number,
    initialY: number,
    private onConfirm: (res: PinDirectionResult) => void,
    private onCancel: () => void
  ) {
    this.selectedMenu = initialX > window.innerWidth / 2 ? 'left' : 'right';
    this.selectedSatellites = initialY > window.innerHeight / 2 ? 'up' : 'down';
    this.render();
  }

  private render(): void {
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(4px);
      z-index: 2147483647; display: flex; align-items: center; justify-content: center;
      font-family: 'Google Sans', Roboto, sans-serif; pointer-events: auto;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      background: var(--omni-bg-base, #1e1f20); border: 1px solid var(--omni-border-subtle, #444746); border-radius: 16px; width: 340px;
      padding: 20px; box-shadow: 0 16px 40px rgba(0,0,0,0.8); color: var(--omni-text-primary, #e3e3e3);
    `;

    card.innerHTML = `
      <div style="font-size:14px;font-weight:600;color:var(--omni-accent-primary, #a8c7fa);margin-bottom:4px;">Krok 2: Kierunek rozwijania</div>
      <div style="font-size:11.5px;color:var(--omni-text-muted, #8e918f);margin-bottom:14px;word-break:break-all;">
        Przypięto do: <span style="color:#c4c7c5;font-family:monospace;">${escapeHtml(this.targetSelector)}</span>
      </div>

      <div style="font-size:11.5px;color:#c4c7c5;margin-bottom:6px;font-weight:500;">1. Menu podręczne (Speed Dial):</div>
      <div class="dir-grid-menu" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:14px;">
        ${this.renderDirButton('menu', 'left', 'W lewo', this.selectedMenu === 'left')}
        ${this.renderDirButton('menu', 'right', 'W prawo', this.selectedMenu === 'right')}
        ${this.renderDirButton('menu', 'up', 'W górę', this.selectedMenu === 'up')}
        ${this.renderDirButton('menu', 'down', 'W dół', this.selectedMenu === 'down')}
      </div>

      <div style="font-size:11.5px;color:#c4c7c5;margin-bottom:6px;font-weight:500;">2. Aktywne procesy (Satelity AI):</div>
      <div class="dir-grid-sat" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:18px;">
        ${this.renderDirButton('sat', 'up', 'W górę', this.selectedSatellites === 'up')}
        ${this.renderDirButton('sat', 'down', 'W dół', this.selectedSatellites === 'down')}
        ${this.renderDirButton('sat', 'left', 'W lewo', this.selectedSatellites === 'left')}
        ${this.renderDirButton('sat', 'right', 'W prawo', this.selectedSatellites === 'right')}
      </div>

      <div style="display:flex;justify-content:flex-end;gap:8px;">
        <button class="m3-mini-btn btn-cancel" style="background:transparent;border:1px solid var(--omni-border-subtle, #444746);color:#c4c7c5;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;">
          Anuluj
        </button>
        <button class="m3-mini-btn btn-confirm" style="background:var(--omni-accent-primary, #a8c7fa);border:none;color:#041e49;font-weight:600;padding:6px 16px;border-radius:8px;cursor:pointer;font-size:12px;">
          Zatwierdź przypięcie
        </button>
      </div>
    `;

    this.overlay.appendChild(card);
    this.shadowRoot.appendChild(this.overlay);

    this.attachEvents();
  }

  private renderDirButton(type: 'menu' | 'sat', dir: string, label: string, active: boolean): string {
    const activeStyle = active
      ? 'background:var(--omni-bg-surface, #282a2c);border:1.5px solid var(--omni-accent-primary, #a8c7fa);color:var(--omni-accent-primary, #a8c7fa);'
      : 'background:#131314;border:1px solid var(--omni-border-subtle, #444746);color:var(--omni-text-muted, #8e918f);';
    return `
      <button class="dir-btn" data-type="${type}" data-dir="${dir}" style="padding:6px 10px;border-radius:6px;font-size:11.5px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;${activeStyle}">
        ${label}
      </button>
    `;
  }

  private attachEvents(): void {
    if (!this.overlay) return;

    this.overlay.querySelectorAll('.dir-btn[data-type="menu"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedMenu = btn.getAttribute('data-dir') as any;
        this.updateButtons('menu', this.selectedMenu);
      });
    });

    this.overlay.querySelectorAll('.dir-btn[data-type="sat"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedSatellites = btn.getAttribute('data-dir') as any;
        this.updateButtons('sat', this.selectedSatellites);
      });
    });

    this.overlay.querySelector('.btn-confirm')?.addEventListener('click', () => {
      this.close();
      this.onConfirm({ menuDirection: this.selectedMenu, satellitesDirection: this.selectedSatellites });
    });

    this.overlay.querySelector('.btn-cancel')?.addEventListener('click', () => {
      this.close();
      this.onCancel();
    });
  }

  private updateButtons(type: 'menu' | 'sat', selectedDir: string): void {
    if (!this.overlay) return;
    this.overlay.querySelectorAll(`.dir-btn[data-type="${type}"]`).forEach((b) => {
      const isAct = b.getAttribute('data-dir') === selectedDir;
      const el = b as HTMLElement;
      el.style.background = isAct ? 'var(--omni-bg-surface, #282a2c)' : '#131314';
      el.style.border = isAct ? '1.5px solid var(--omni-accent-primary, #a8c7fa)' : '1px solid var(--omni-border-subtle, #444746)';
      el.style.color = isAct ? 'var(--omni-accent-primary, #a8c7fa)' : 'var(--omni-text-muted, #8e918f)';
    });
  }

  close(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}
