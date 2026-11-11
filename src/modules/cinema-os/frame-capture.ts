/**
 * Bastek Omni-OS // Cinema OS - 4K Video Frame & Study Note Grabber
 * Bezstratny zrzut klatki wideo (PNG) oraz notatka studyjna z poprawnym linkiem czasowym i osadzeniem obrazu.
 * Maksymalny rozmiar pliku: < 120 linii.
 */

export class VideoFrameCapture {
  captureCurrentFrame(): { success: boolean; message: string; filename?: string } {
    const video = document.querySelector('video') as HTMLVideoElement | null;
    if (!video || !video.videoWidth || !video.videoHeight) {
      return { success: false, message: 'Nie wykryto aktywnego strumienia wideo' };
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return { success: false, message: 'Błąd kontekstu Canvas 2D' };

      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      const title = document.querySelector('h1.ytd-video-primary-info-renderer, #title h1, title')?.textContent || 'video';
      const cleanTitle = title.replace(/[^\w\s.-]/gi, '_').trim().slice(0, 30);
      const curTime = Math.floor(video.currentTime);
      const filename = `yt-frame-${cleanTitle}-${curTime}s-${video.videoWidth}x${video.videoHeight}.png`;

      canvas.toBlob((blob) => {
        if (!blob) return;
        this.download(blob, filename);
      }, 'image/png');

      return {
        success: true,
        message: `Zapisano klatkę ${video.videoWidth}x${video.videoHeight} (${curTime}s)`,
        filename
      };
    } catch (err: any) {
      return { success: false, message: `Błąd zrzutu klatki: ${err.message}` };
    }
  }

  buildStudyNoteData(): { filename: string; markdown: string; curTime: number } {
    const video = document.querySelector('video') as HTMLVideoElement | null;
    const title = document.querySelector('h1.ytd-video-primary-info-renderer, #title h1, title')?.textContent?.trim() || 'Film YouTube';
    const channel = document.querySelector('#channel-name a, #channel-name, .ytd-channel-name')?.textContent?.trim() || 'YouTube';
    const curTime = Math.floor(video?.currentTime || 0);
    const width = video?.videoWidth || 1920;
    const height = video?.videoHeight || 1080;

    let timestampUrl = window.location.href;
    try {
      const parsed = new URL(window.location.href);
      parsed.searchParams.set('t', `${curTime}s`);
      timestampUrl = parsed.toString();
    } catch {}

    const cleanTitle = title.replace(/[^\w\s.-]/gi, '_').trim().slice(0, 30);
    const frameFilename = `yt-frame-${cleanTitle}-${curTime}s-${width}x${height}.png`;
    const filename = `notatka-yt-${cleanTitle}-${curTime}s.md`;

    const markdown = `# Notatka Studyjna: ${title}

> Źródło: **${channel}**
> Moment wideo: [Oglądaj od ${curTime}s (${Math.floor(curTime / 60)}m ${curTime % 60}s)](${timestampUrl})
> Data zapisu: ${new Date().toLocaleString('pl-PL')}
> Rozdzielczość klatki: ${width}x${height}

![Klatka ${curTime}s](${frameFilename})

---

## Kluczowe wnioski z tego fragmentu:
- 

## Powiązane koncepcje / Tagi:
#study #youtube #wideo #bastek-omni
`;

    return { filename, markdown, curTime };
  }

  exportStudyNote(): { success: boolean; message: string; markdown?: string; filename?: string } {
    const { filename, markdown, curTime } = this.buildStudyNoteData();
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    this.download(blob, filename);

    // Pobieramy również klatkę 4K jako powiązany asset
    this.captureCurrentFrame();

    return {
      success: true,
      message: `Wyeksportowano notatkę studyjną i klatkę (${curTime}s)`,
      markdown,
      filename
    };
  }

  private download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  }
}
