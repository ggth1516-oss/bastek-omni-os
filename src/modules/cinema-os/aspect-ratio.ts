/**
 * Bastek Omni-OS // Cinema OS - Aspect Ratio Controller
 * Skalowanie i kadrowanie 21:9 Ultrawide eliminujące czarne pasy na monitorach panoramicznych.
 * Maksymalny rozmiar pliku: < 90 linii.
 */

import { CinemaOsd } from './osd';

export class AspectRatioController {
  private ultrawide = false;

  constructor(private osd: CinemaOsd) {}

  isUltrawide(): boolean {
    return this.ultrawide;
  }

  toggleUltrawide(): boolean {
    this.setUltrawide(!this.ultrawide, true);
    return this.ultrawide;
  }

  setUltrawide(enable: boolean, showOsd = false): void {
    const changed = this.ultrawide !== enable;
    this.ultrawide = enable;
    this.applyRatio();
    const video = document.querySelector<HTMLVideoElement>('video.html5-main-video, video');
    if (video && (showOsd || changed)) {
      this.osd.show(this.ultrawide ? 'FORMAT: 21:9 ULTRAWIDE (ZOOM)' : 'FORMAT: 16:9 STANDARD');
    }
  }

  private applyRatio(): void {
    const video = document.querySelector<HTMLVideoElement>('video.html5-main-video, video');
    if (!video) return;

    if (this.ultrawide) {
      video.style.transform = 'scale(1.334)';
      video.style.transformOrigin = 'center center';
      video.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
      video.style.transform = 'scale(1)';
    }
  }
}
