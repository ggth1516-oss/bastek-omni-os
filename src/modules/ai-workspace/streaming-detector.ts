/**
 * Bastek Omni-OS // AI Workspace - Streaming & Thinking Detector
 * Obserwuje stan generowania odpowiedzi w Gemini (z dławieniem debounce 200ms) i raportuje go do background workera.
 * Maksymalny rozmiar pliku: < 115 linii.
 */

import { MessageBus } from '../../core/bus';

export class StreamingDetector {
  private observer: MutationObserver | null = null;
  private isThinking = false;
  private checkInterval: number | null = null;
  private debounceTimer: number | null = null;

  start(): void {
    this.checkState();
    this.observer = new MutationObserver(() => this.scheduleCheck());
    this.observer.observe(document.body, { childList: true, subtree: true });

    // Okresowy fall-back polling co 1.5s
    this.checkInterval = window.setInterval(() => this.checkState(), 1500);
  }

  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.isThinking) {
      this.report(false);
    }
  }

  private scheduleCheck(): void {
    if (this.debounceTimer !== null) return;
    this.debounceTimer = window.setTimeout(() => {
      this.debounceTimer = null;
      this.checkState();
    }, 200);
  }

  private checkState(): void {
    const isStreamingNow = this.detectStreamingInDom();
    if (isStreamingNow !== this.isThinking) {
      this.isThinking = isStreamingNow;
      this.report(isStreamingNow);
    }
  }

  private detectStreamingInDom(): boolean {
    const stopBtn = document.querySelector(
      'button[aria-label*="Zatrzymaj"], button[aria-label*="Stop"], button.stop-generating-button, [data-test-id="stop-generating"], .stop-button'
    );
    if (stopBtn && stopBtn.clientWidth > 0) return true;

    const streamingIndicator = document.querySelector(
      '.sparkle-streaming, .animate-spin, .generating-indicator'
    );
    if (streamingIndicator) return true;

    return false;
  }

  private async report(isThinking: boolean): Promise<void> {
    try {
      const host = window.location.hostname;
      const service = host.includes('aistudio') || host.includes('flow') ? 'flow' : 'gemini';
      await MessageBus.sendToBackground({
        type: 'TAB_THINKING_UPDATE',
        payload: {
          isThinking,
          service,
          title: document.title.replace(' - Google Gemini', '').trim() || 'Gemini Czat'
        }
      });
    } catch {
      // Ignorujemy błędy komunikacji
    }
  }
}
