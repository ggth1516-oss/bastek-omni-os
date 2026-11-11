/**
 * Bastek Omni-OS // Content UI - Real Clipboard & File Drop Manager
 * Wyświetla historię Ctrl+C, skopiowany kod, pliki oraz obiekty upuszczone na Nexus Orb (D&D).
 * Zabezpieczony przed XSS (escapeHtml) oraz wyciekami subskrypcji.
 * Maksymalny rozmiar pliku: < 200 linii.
 */

import { ClipboardStore, type ClipboardItem } from '../../modules/clipboard/clipboard-store';
import { SVG_CLIPBOARD, SVG_CODE } from '../svg-icons';

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class ClipboardPanel {
  private container: HTMLElement;
  private store = ClipboardStore.getInstance();
  private unsubscribe: (() => void) | null = null;

  constructor(
    private onInjectText: (text: string) => void,
    private onToast: (msg: string) => void
  ) {
    this.container = document.createElement('div');
    this.init();
  }

  getElement(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  private async init(): Promise<void> {
    await this.store.load();
    this.render();
    this.unsubscribe = this.store.subscribe(() => {
      if (!this.container.isConnected && this.unsubscribe) {
        this.destroy();
        return;
      }
      this.render();
    });
  }

  private render(): void {
    const items = this.store.getEntries();

    this.container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <span style="font-size:12px;color:var(--omni-text-muted, #8e918f);">Elementy w schowku (${items.length}):</span>
        ${items.length > 0 ? `<button class="m3-mini-btn clear-all-btn" style="background:transparent;border:1px solid var(--omni-border-subtle, #444746);color:var(--omni-text-primary, #e2e2e2);font-size:11px;padding:3px 8px;border-radius:6px;cursor:pointer;">Wyczyść</button>` : ''}
      </div>

      <div class="clipboard-items-list" style="display:flex;flex-direction:column;gap:8px;">
        ${items.length === 0 ? `
          <div style="padding:28px 16px;text-align:center;color:var(--omni-text-muted, #8e918f);font-size:12.5px;background:var(--omni-bg-surface, #282a2c);border-radius:12px;border:1px dashed var(--omni-border-subtle, #444746);">
            Schowek jest pusty.<br/>
            <span style="font-size:11.5px;color:var(--omni-accent-primary, #a8c7fa);display:block;margin-top:4px;">
              Skopiuj tekst (Cmd+C) lub przeciągnij plik/kod bezpośrednio na Nexus Orb!
            </span>
          </div>
        ` : items.map((item) => this.renderItem(item)).join('')}
      </div>
    `;

    this.attachItemEvents();
  }

  private renderItem(item: ClipboardItem): string {
    const timeStr = new Date(item.timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    const isImage = item.type === 'image';
    const isFile = item.type === 'file';
    const isDataUrl = item.content.startsWith('data:');
    const safeTitle = escapeHtml(item.title);
    const safePreview = isFile
      ? `Plik: ${escapeHtml(item.fileName || item.title)} (${escapeHtml(item.fileSize || '')})`
      : escapeHtml(item.content.slice(0, 70));

    return `
      <div class="m3-row-item clip-item-row" data-id="${escapeHtml(item.id)}" style="padding:10px 12px;align-items:flex-start;">
        <div style="display:flex;gap:10px;width:100%;">
          ${isImage ? `
            <img src="${escapeHtml(item.content)}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;border:1px solid var(--omni-border-subtle, #444746);flex-shrink:0;" />
          ` : `
            <div style="color:var(--omni-accent-primary, #a8c7fa);display:flex;margin-top:2px;flex-shrink:0;">
              ${item.type === 'code' ? SVG_CODE : SVG_CLIPBOARD}
            </div>
          `}
          
          <div style="display:flex;flex-direction:column;gap:3px;flex:1;overflow:hidden;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="m3-row-title" style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${safeTitle}
              </span>
              <span style="font-size:10.5px;color:var(--omni-text-muted, #8e918f);">${timeStr}</span>
            </div>
            
            ${!isImage ? `
              <div style="font-size:11.5px;color:var(--omni-text-muted, #8e918f);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                ${safePreview}
              </div>
            ` : ''}

            <div style="display:flex;gap:6px;margin-top:6px;">
              <button class="m3-mini-btn action-copy" data-id="${escapeHtml(item.id)}" style="background:var(--omni-bg-surface, #282a2c);border:1px solid var(--omni-border-subtle, #444746);color:var(--omni-accent-primary, #a8c7fa);font-size:11px;padding:3px 8px;border-radius:4px;cursor:pointer;">
                Kopiuj
              </button>
              ${!isImage && !isDataUrl ? `
                <button class="m3-mini-btn action-paste" data-id="${escapeHtml(item.id)}" style="background:var(--omni-bg-surface, #282a2c);border:1px solid var(--omni-border-subtle, #444746);color:#c4c7c5;font-size:11px;padding:3px 8px;border-radius:4px;cursor:pointer;">
                  Wklej do czatu
                </button>
              ` : ''}
              ${(isImage || isFile) ? `
                <button class="m3-mini-btn action-download" data-id="${escapeHtml(item.id)}" style="background:var(--omni-bg-surface, #282a2c);border:1px solid var(--omni-border-subtle, #444746);color:#c4c7c5;font-size:11px;padding:3px 8px;border-radius:4px;cursor:pointer;">
                  Pobierz
                </button>
              ` : ''}
              <button class="m3-mini-btn action-delete" data-id="${escapeHtml(item.id)}" style="background:transparent;border:none;color:var(--omni-text-muted, #8e918f);font-size:11px;padding:3px 6px;cursor:pointer;margin-left:auto;">
                Usuń
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private attachItemEvents(): void {
    const clearBtn = this.container.querySelector('.clear-all-btn');
    clearBtn?.addEventListener('click', async (e) => {
      e.stopPropagation();
      await this.store.clearAll();
      this.onToast('Wyczyszczono schowek');
    });

    this.container.querySelectorAll('.action-copy').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const item = this.store.getEntries().find((it) => it.id === id);
        if (item) {
          await navigator.clipboard.writeText(item.content);
          this.onToast('Skopiowano do schowka systemowego');
        }
      });
    });

    this.container.querySelectorAll('.action-paste').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const item = this.store.getEntries().find((it) => it.id === id);
        if (item) {
          this.onInjectText(item.content);
          this.onToast('Wklejono treść do czatu');
        }
      });
    });

    this.container.querySelectorAll('.action-download').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const item = this.store.getEntries().find((it) => it.id === id);
        if (item) {
          const a = document.createElement('a');
          a.href = item.content.startsWith('data:')
            ? item.content
            : URL.createObjectURL(new Blob([item.content], { type: 'text/plain;charset=utf-8' }));
          a.download = item.fileName || 'schowek-plik.txt';
          document.body.appendChild(a);
          a.click();
          a.remove();
          this.onToast('Pobrano plik');
        }
      });
    });

    this.container.querySelectorAll('.action-delete').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (id) {
          await this.store.removeEntry(id);
          this.onToast('Usunięto wpis');
        }
      });
    });
  }
}
