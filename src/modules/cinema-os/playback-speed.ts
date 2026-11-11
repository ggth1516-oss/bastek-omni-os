/**
 * Bastek Omni-OS // Cinema OS - Playback Speed Controller
 * Precyzyjna zmiana tempa odtwarzania wideo (krok co 0.1x) z zachowaniem wysokości tonu.
 * Maksymalny rozmiar pliku: < 90 linii.
 */

import { CinemaOsd } from './osd';

export class PlaybackSpeedController {
  constructor(private osd: CinemaOsd) {}

  changeSpeed(delta: number): number {
    const video = document.querySelector<HTMLVideoElement>('video.html5-main-video, video');
    if (!video) return 1.0;

    let newSpeed = Math.round((video.playbackRate + delta) * 10) / 10;
    newSpeed = Math.max(0.2, Math.min(4.0, newSpeed));
    video.playbackRate = newSpeed;

    this.osd.show(`TEMPO: ${newSpeed.toFixed(1)}x`);
    return newSpeed;
  }

  setSpeed(speed: number): void {
    const video = document.querySelector<HTMLVideoElement>('video.html5-main-video, video');
    if (!video) return;

    video.playbackRate = speed;
    this.osd.show(`TEMPO: ${speed.toFixed(2)}x`);
  }
}
