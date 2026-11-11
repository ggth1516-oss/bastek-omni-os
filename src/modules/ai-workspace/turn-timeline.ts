/**
 * Bastek Omni-OS // AI Workspace - Turn Timeline & Live Token Navigator (Google M3)
 * Dyskretna oś czasu kroków z podglądem treści pytań na hover, dławieniem (debounce 200ms) i licznikiem tokenów 1M.
 * Maksymalny rozmiar pliku: < 165 linii.
 */

import { GeminiTelemetry } from './telemetry';

export class TurnTimeline {
  private container: HTMLElement | null = null;
  private observer: MutationObserver | null = null;
  private debounceTimer: number | null = null;
  private enabled = true;
  private lastSignature = '';
  private telemetry = new GeminiTelemetry();

  mount(targetShadow: ShadowRoot): void {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.className = 'google-timeline-bar';
    this.container.innerHTML = `
      <style>
        .google-timeline-bar {
          position: fixed;
          top: 72px;
          right: 32px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--omni-bg-base, rgba(30, 31, 32, 0.92));
          backdrop-filter: blur(10px);
          border: 1px solid var(--omni-border-subtle, #444746);
          border-radius: 20px;
          z-index: 2147483630;
          font-family: 'Google Sans', 'Google Sans Text', Roboto, sans-serif;
          font-size: 11.5px;
          max-width: 56vw;
          overflow-x: auto;
          box-shadow: 0 4px 16px rgba(0,0,0,0.45);
          pointer-events: auto;
        }
        .timeline-token-badge {
          color: var(--omni-accent-primary, #a8c7fa);
          background: rgba(168, 199, 250, 0.12);
          border: 1px solid rgba(168, 199, 250, 0.28);
          padding: 2px 8px;
          border-radius: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          font-weight: 600;
          white-space: nowrap;
          margin-right: 4px;
        }
        .timeline-label {
          color: var(--omni-text-muted, #8e918f);
          font-weight: 500;
          margin-right: 2px;
          font-size: 11px;
        }
        .timeline-pills {
          display: flex;
          gap: 5px;
        }
        .google-turn-pill {
          padding: 3px 8px;
          border-radius: 12px;
          background: var(--omni-bg-surface, #282a2c);
          border: 1px solid var(--omni-border-subtle, #444746);
          color: #c4c7c5;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          transition: all 0.18s ease;
          white-space: nowrap;
        }
        .google-turn-pill:hover {
          border-color: var(--omni-border-active, #a8c7fa);
          color: var(--omni-accent-primary, #a8c7fa);
          transform: translateY(-1px);
        }
      </style>
      <span class="timeline-token-badge" title="Szacowane zużycie okna kontekstowego modelu">0 tok (0.0%)</span>
      <span class="timeline-label">KROKI:</span>
      <div class="timeline-pills"></div>
    `;

    targetShadow.appendChild(this.container);
    this.updatePills();
    this.startObserver();
  }

  setEnabled(enable: boolean): void {
    this.enabled = enable;
    if (!this.container) return;
    if (!enable) {
      this.container.style.display = 'none';
    } else {
      this.lastSignature = '';
      this.updatePills();
    }
  }

  unmount(): void {
    if (this.observer) this.observer.disconnect();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (this.container) this.container.remove();
    this.container = null;
  }

  private startObserver(): void {
    this.observer = new MutationObserver(() => {
      if (this.debounceTimer !== null) return;
      this.debounceTimer = window.setTimeout(() => {
        this.debounceTimer = null;
        this.updatePills();
      }, 200);
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  private updatePills(): void {
    if (!this.container || !this.enabled) return;
    const listEl = this.container.querySelector('.timeline-pills');
    const tokenEl = this.container.querySelector('.timeline-token-badge');
    if (!listEl) return;

    const turns = Array.from(document.querySelectorAll('user-query, .user-query, [data-turn-role="user"]'));
    if (turns.length === 0) {
      this.container.style.display = 'none';
      return;
    }
    this.container.style.display = 'flex';

    const stats = this.telemetry.getLiveTokenStats();
    const formattedTok = stats.estimatedTokens >= 1000
      ? `${(stats.estimatedTokens / 1000).toFixed(1)}k`
      : `${stats.estimatedTokens}`;

    if (tokenEl) {
      tokenEl.textContent = `${formattedTok} / 1M (${stats.percentage}%)`;
    }

    const sig = `${turns.length}:${Math.floor(stats.estimatedTokens / 50)}`;
    if (sig === this.lastSignature) return;
    this.lastSignature = sig;

    listEl.innerHTML = '';
    turns.forEach((turnEl, idx) => {
      const rawText = (turnEl.textContent || '').replace(/\s+/g, ' ').trim();
      const snippet = rawText.length > 65 ? `${rawText.slice(0, 65)}...` : (rawText || `Pytanie #${idx + 1}`);

      const pill = document.createElement('button');
      pill.className = 'google-turn-pill';
      pill.textContent = `#${idx + 1}`;
      pill.title = `#${idx + 1}: ${snippet}`;
      pill.addEventListener('click', () => {
        turnEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      listEl.appendChild(pill);
    });
  }
}
