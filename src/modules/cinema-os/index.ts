/**
 * Bastek Omni-OS // Cinema OS Coordinator
 * Koordynuje tryb kinowy, skalowanie 21:9 Ultrawide, tempo, zrzuty 4K i notatki studyjne.
 * Maksymalny rozmiar pliku: < 120 linii.
 */

import type { ExtensionModule } from '../../types';
import { CinemaOsd } from './osd';
import { AspectRatioController } from './aspect-ratio';
import { PlaybackSpeedController } from './playback-speed';
import { AmbientGlow } from './ambient-glow';
import { VideoFrameCapture } from './frame-capture';

export class CinemaOsModule implements ExtensionModule {
  id = 'cinema-os' as const;
  name = 'Cinema OS (YouTube & Video Supercharge)';
  version = '1.2.0';

  private osd = new CinemaOsd();
  private aspect = new AspectRatioController(this.osd);
  private speed = new PlaybackSpeedController(this.osd);
  private glow = new AmbientGlow();
  private capture = new VideoFrameCapture();

  isAvailableOn(url: URL): boolean {
    return url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');
  }

  async mount(shadowRoot: ShadowRoot): Promise<void> {
    this.osd.setRoot(shadowRoot);
    this.setupKeyboardShortcuts();
  }

  async unmount(): Promise<void> {
    this.aspect.setUltrawide(false);
    this.glow.setEnabled(false);
  }

  toggleUltrawide(): boolean {
    return this.aspect.toggleUltrawide();
  }

  setUltrawide(enable: boolean, showOsd = false): void {
    this.aspect.setUltrawide(enable, showOsd);
  }

  setAspectRatio(ratio: string): void {
    try {
      this.aspect.setUltrawide(ratio === '21:9', true);
    } catch {}
  }

  setPlaybackSpeed(speed: number): void {
    this.speed.setSpeed(speed);
  }

  setAmbientGlow(enable: boolean): void {
    this.glow.setEnabled(enable);
  }

  toggleAmbientGlow(): boolean {
    return this.glow.toggle();
  }

  changeSpeed(delta: number): number {
    return this.speed.changeSpeed(delta);
  }

  captureFrame(): { success: boolean; message: string } {
    return this.capture.captureCurrentFrame();
  }

  exportStudyNote(): { success: boolean; message: string; markdown?: string; filename?: string } {
    return this.capture.exportStudyNote();
  }

  buildStudyNoteData(): { filename: string; markdown: string; curTime: number } {
    return this.capture.buildStudyNoteData();
  }

  private setupKeyboardShortcuts(): void {
    window.addEventListener('keydown', (e) => {
      const target = e.target as HTMLElement | null;
      if (!target || ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return;

      if (e.key === '[') {
        e.preventDefault();
        this.changeSpeed(-0.1);
      } else if (e.key === ']') {
        e.preventDefault();
        this.changeSpeed(0.1);
      }
    });
  }
}
