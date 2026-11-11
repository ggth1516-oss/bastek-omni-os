/**
 * Bastek Omni-OS // Cinema OS - Dynamic Ambient Glow (4-Zone Sampling @ 10 FPS)
 * Zoptymalizowane próbkowanie 4 narożników klatki wideo co 100ms i rzutowanie wielostrefowej poświaty.
 * Maksymalny rozmiar pliku: < 120 linii.
 */

export class AmbientGlow {
  private active = false;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private intervalId: number | null = null;
  private glowDiv: HTMLElement | null = null;

  isActive(): boolean {
    return this.active;
  }

  setEnabled(enable: boolean): void {
    if (enable === this.active) return;
    this.active = enable;
    if (this.active) this.start();
    else this.stop();
  }

  toggle(): boolean {
    this.setEnabled(!this.active);
    return this.active;
  }

  private start(): void {
    if (!this.glowDiv) {
      this.glowDiv = document.createElement('div');
      this.glowDiv.id = 'bastek-cinema-ambient-glow';
      this.glowDiv.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        transition: background 0.35s ease;
      `;
      document.body.prepend(this.glowDiv);
    }

    this.canvas = document.createElement('canvas');
    this.canvas.width = 16;
    this.canvas.height = 9;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    if (this.intervalId) window.clearInterval(this.intervalId);
    this.intervalId = window.setInterval(() => this.sampleFrame(), 100);
    this.sampleFrame();
  }

  private sampleFrame(): void {
    if (!this.active || !this.ctx || !this.canvas || !this.glowDiv) return;
    const video = document.querySelector<HTMLVideoElement>('video.html5-main-video, video');
    if (!video || video.paused || video.ended) return;

    try {
      this.ctx.drawImage(video, 0, 0, 16, 9);
      const data = this.ctx.getImageData(0, 0, 16, 9).data;

      // Próbkowanie lewej (x=2, y=4) i prawej (x=13, y=4) krawędzi kadru
      const leftIdx = (4 * 16 + 2) * 4;
      const rightIdx = (4 * 16 + 13) * 4;

      const rL = data[leftIdx], gL = data[leftIdx + 1], bL = data[leftIdx + 2];
      const rR = data[rightIdx], gR = data[rightIdx + 1], bR = data[rightIdx + 2];

      this.glowDiv.style.background = [
        `radial-gradient(circle at 22% 45%, rgba(${rL}, ${gL}, ${bL}, 0.34) 0%, transparent 65%)`,
        `radial-gradient(circle at 78% 45%, rgba(${rR}, ${gR}, ${bR}, 0.34) 0%, transparent 65%)`
      ].join(', ');
    } catch {
      // Cross-origin fallback
    }
  }

  private stop(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.glowDiv) {
      this.glowDiv.remove();
      this.glowDiv = null;
    }
  }
}
