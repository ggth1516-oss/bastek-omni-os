/**
 * Bastek Omni-OS // Content UI - Google Toast
 * Dyskretny snackbar w stylu Google Material 3.
 * Maksymalny rozmiar pliku: < 50 linii.
 */

export class GoogleToast {
  private element: HTMLElement | null = null;
  private timer: number | null = null;

  constructor(private shadowRoot: ShadowRoot) {}

  show(message: string, durationMs = 2600): void {
    if (!this.element) {
      this.element = document.createElement('div');
      this.element.className = 'google-toast';
      this.shadowRoot.appendChild(this.element);
    }

    this.element.textContent = message;
    this.element.classList.add('is-show');

    if (this.timer) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.element?.classList.remove('is-show');
    }, durationMs);
  }
}
