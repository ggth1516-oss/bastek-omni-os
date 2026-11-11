/**
 * Bastek Omni-OS // Content UI - Contextual Actions & Obsidian Prompts Panel
 * Szybkie akcje kontekstowe oraz biblioteka szablonów promptów z theworks-vault z wyszukiwarką M3.
 * Maksymalny rozmiar pliku: < 190 linii.
 */

import { SVG_SEARCH, SVG_ACTIONS, SVG_OBSIDIAN } from '../svg-icons';
import type { VaultPromptItem } from '../../modules/local-mesh/vault-bridge';

export interface ActionRowItem {
  id: string;
  title: string;
  desc: string;
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export class ActionsPanel {
  private container: HTMLElement;
  private items: ActionRowItem[] = [];
  private prompts: VaultPromptItem[] = [];
  private vaultOnline = false;

  constructor(
    private activeContext: 'gemini' | 'flow' | 'youtube',
    private onExecute: (actionId: string) => void,
    private onFetchPrompts?: () => Promise<{ online: boolean; prompts: VaultPromptItem[] }>,
    private onInjectPrompt?: (promptText: string, title: string) => void
  ) {
    this.container = document.createElement('div');
    this.initItems();
    this.render();
    this.loadPrompts();
  }

  getElement(): HTMLElement {
    return this.container;
  }

  private async loadPrompts(): Promise<void> {
    if (!this.onFetchPrompts || this.activeContext === 'youtube') return;
    const res = await this.onFetchPrompts();
    this.prompts = res.prompts;
    this.vaultOnline = res.online;
    this.render();
  }

  private initItems(): void {
    if (this.activeContext === 'gemini') {
      this.items = [
        { id: 'refresh-telemetry', title: 'Odśwież telemetrię i zużycie tokenów', desc: 'Pobiera aktualny model i stan okna kontekstu (1M)' },
        { id: 'rescan-code', title: 'Przeskanuj bloki kodu i artefakty', desc: 'Zlicza wygenerowane skrypty i kroki w bieżącej sesji' },
        { id: 'scroll-latest', title: 'Przewiń do najnowszej odpowiedzi', desc: 'Natychmiastowe wyrównanie widoku do dołu' }
      ];
    } else if (this.activeContext === 'flow') {
      this.items = [
        { id: 'run-flow', title: 'Uruchom wykonanie przepływu', desc: 'Inicjalizuje graf powiązanych węzłów (Run / Cmd+Enter)' },
        { id: 'sync-mcp', title: 'Sprawdź połączenie z Local Mesh / Vault', desc: 'Weryfikuje status daemona VaultBridge na porcie 27123' }
      ];
    } else if (this.activeContext === 'youtube') {
      this.items = [
        { id: 'toggle-theater', title: 'Przełącz format Ultrawide 21:9', desc: 'Dopasowuje odtwarzacz wideo do pełnej panoramy' },
        { id: 'speed-1-5', title: 'Prędkość odtwarzania 1.5x', desc: 'Szybkie tempo nauki materiałów wideo' }
      ];
    }
  }

  private render(): void {
    const promptsHtml = (this.activeContext !== 'youtube' && this.prompts.length > 0) ? `
      <div style="border-top:1px solid var(--omni-border-subtle, #2d2f31);margin:10px 0 8px 0;padding-top:8px;display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:11.5px;font-weight:600;color:var(--omni-accent-primary, #a8c7fa);">SZABLONY PROMPTÓW (THEWORKS-VAULT):</span>
        <span style="font-size:10px;color:${this.vaultOnline ? '#10b981' : 'var(--omni-text-muted, #8e918f)'};">
          ${this.vaultOnline ? 'LIVE :27123' : 'SEED CACHE'}
        </span>
      </div>
      <div class="prompts-list">
        ${this.prompts.map((p, idx) => `
          <div class="m3-row-item prompt-row-item" data-prompt-idx="${idx}">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="color:var(--omni-accent-primary, #a8c7fa);display:flex;">${SVG_OBSIDIAN}</div>
              <div style="display:flex;flex-direction:column;gap:2px;">
                <span class="m3-row-title">${escapeHtml(p.title)}</span>
                <span style="font-size:11.5px;color:var(--omni-text-muted, #8e918f);">${escapeHtml(p.desc)}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    ` : '';

    this.container.innerHTML = `
      <div class="m3-search-pill">
        <div style="color:var(--omni-text-muted, #8e918f);display:flex;">${SVG_SEARCH}</div>
        <input class="m3-search-input" type="text" placeholder="Szukaj akcji lub szablonu promptu..." />
      </div>
      <div class="actions-list">
        ${this.items.map((it) => `
          <div class="m3-row-item action-row-item" data-action="${it.id}">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="color:var(--omni-accent-primary, #a8c7fa);display:flex;">${SVG_ACTIONS}</div>
              <div style="display:flex;flex-direction:column;gap:2px;">
                <span class="m3-row-title">${escapeHtml(it.title)}</span>
                <span style="font-size:11.5px;color:var(--omni-text-muted, #8e918f);">${escapeHtml(it.desc)}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      ${promptsHtml}
    `;

    const input = this.container.querySelector<HTMLInputElement>('.m3-search-input');
    input?.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      this.container.querySelectorAll<HTMLElement>('.m3-row-item').forEach((row) => {
        const text = row.textContent?.toLowerCase() || '';
        row.style.display = text.includes(q) ? 'flex' : 'none';
      });
    });

    this.container.querySelectorAll<HTMLElement>('.action-row-item').forEach((row) => {
      row.addEventListener('click', () => {
        const act = row.getAttribute('data-action');
        if (act) this.onExecute(act);
      });
    });

    this.container.querySelectorAll<HTMLElement>('.prompt-row-item').forEach((row) => {
      row.addEventListener('click', () => {
        const idx = Number(row.getAttribute('data-prompt-idx'));
        const p = this.prompts[idx];
        if (p && this.onInjectPrompt) {
          this.onInjectPrompt(p.promptText, p.title);
        }
      });
    });
  }
}
