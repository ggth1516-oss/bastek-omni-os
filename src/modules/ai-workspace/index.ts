/**
 * Bastek Omni-OS // AI Workspace Coordinator
 * Koordynuje Gemini, AI Studio & Flow: rozciąganie, telemetrię, oś czasu, eksport ZIP/MD/Vault i Canvas.
 * Maksymalny rozmiar pliku: < 210 linii.
 */

import type { ExtensionModule, WizGlobalData } from '../../types';
import { WidthOverride } from './width-override';
import { ScrollLock } from './scroll-lock';
import { GeminiTelemetry, type LiveTokenStats } from './telemetry';
import { GeminiScraper } from './scraper';
import { BundleFormatter } from './bundle-formatter';
import { TurnTimeline } from './turn-timeline';
import { ZenMode } from './zen-mode';
import { PromptInjector } from './prompt-injector';
import { CanvasHarvester } from './canvas-harvester';
import { FlowHarvester } from './flow-harvester';
import { StreamingDetector } from './streaming-detector';
import { createZipBlob, downloadBlob, type ZipEntry } from './zip-exporter';

export class AiWorkspaceModule implements ExtensionModule {
  id = 'ai-workspace' as const;
  name = 'AI Workspace (Gemini Supercharged)';
  version = '1.2.0';

  private width = new WidthOverride();
  private scroll = new ScrollLock();
  private telemetry = new GeminiTelemetry();
  private scraper = new GeminiScraper();
  private bundleFormatter = new BundleFormatter();
  private timeline = new TurnTimeline();
  private zen = new ZenMode();
  private injector = new PromptInjector();
  private harvester = new CanvasHarvester();
  private flow = new FlowHarvester();
  private detector = new StreamingDetector();

  isAvailableOn(url: URL): boolean {
    return url.hostname.includes('gemini.google.com') || url.hostname.includes('aistudio.google.com') || url.hostname.includes('flow');
  }

  async mount(shadowRoot: ShadowRoot): Promise<void> {
    this.timeline.mount(shadowRoot);
    this.telemetry.extractWizData();
    this.detector.start();
  }

  async unmount(): Promise<void> {
    this.width.disable();
    this.scroll.setLock(false);
    this.timeline.unmount();
    this.zen.disable();
    this.detector.stop();
  }

  setFullWidth(enable: boolean): void {
    this.width.setEnabled(enable);
  }

  toggleFullWidth(): boolean {
    return this.width.toggle();
  }

  setScrollLock(enable: boolean): void {
    this.scroll.setLock(enable);
  }

  toggleScrollLock(): boolean {
    return this.scroll.toggle();
  }

  setZenMode(enable: boolean): void {
    this.zen.setEnabled(enable);
  }

  toggleZenMode(): boolean {
    return this.zen.toggle();
  }

  setTurnTimeline(enable: boolean): void {
    this.timeline.setEnabled(enable);
  }

  getTelemetry(): WizGlobalData {
    return this.telemetry.extractWizData();
  }

  getTokenStats(): LiveTokenStats {
    return this.telemetry.getLiveTokenStats();
  }

  injectPrompt(text: string, submit = false): boolean {
    return this.injector.injectText(text, submit);
  }

  rescanCodeBlocks(): { success: boolean; message: string } {
    const turns = this.scraper.scrapeAllTurns();
    let totalBlocks = 0;
    turns.forEach((t) => { totalBlocks += t.codeBlocks.length; });
    const stats = this.telemetry.getLiveTokenStats();
    return {
      success: true,
      message: `Wykryto ${turns.length} kroków, ${totalBlocks} bloków kodu (~${stats.estimatedTokens} tokenów)`
    };
  }

  buildMarkdownBundle(): { success: boolean; filename: string; markdown: string; turnCount: number } {
    const turns = this.scraper.scrapeAllTurns();
    const rawTitle = document.querySelector('title')?.textContent?.replace(' - Google Gemini', '').trim() || 'Gemini Conversation';
    const cleanTitle = rawTitle.replace(/[^\w\s.-]/gi, '_').trim().slice(0, 40) || 'gemini-chat';
    const filename = `${cleanTitle}-${new Date().toISOString().slice(0, 10)}.md`;

    if (turns.length === 0) {
      return {
        success: false,
        filename,
        markdown: `# ${rawTitle}\n\n> Zapisano z Bastek Omni-OS (${new Date().toLocaleString('pl-PL')})\n`,
        turnCount: 0
      };
    }

    const tel = this.telemetry.extractWizData();
    const markdown = this.bundleFormatter.formatAsAiBundle(turns, rawTitle, tel.currentModel || 'Gemini 3 Pro');
    return { success: true, filename, markdown, turnCount: turns.length };
  }

  exportMarkdown(): { success: boolean; message: string } {
    const bundle = this.buildMarkdownBundle();
    if (!bundle.success) {
      return { success: false, message: 'Brak wiadomości w czacie do wyeksportowania' };
    }

    const blob = new Blob([bundle.markdown], { type: 'text/markdown;charset=utf-8' });
    downloadBlob(blob, bundle.filename);

    return { success: true, message: `Wyeksportowano ${bundle.turnCount} kroków do Markdown` };
  }

  async exportZip(): Promise<{ success: boolean; message: string }> {
    const turns = this.scraper.scrapeAllTurns();
    if (turns.length === 0) {
      return { success: false, message: 'Brak wiadomości do wyeksportowania' };
    }

    const files: ZipEntry[] = [];
    let fileIdx = 1;

    turns.forEach((turn, tIdx) => {
      turn.codeBlocks.forEach((cb) => {
        const name = cb.suggestedFilename || `code/step-${tIdx + 1}-snippet-${fileIdx}.${cb.language || 'txt'}`;
        files.push({ name, content: cb.code });
        fileIdx++;
      });
    });

    const imagePromises: Promise<void>[] = [];
    turns.forEach((turn, tIdx) => {
      turn.images.forEach((img, imgIdx) => {
        const p = fetch(img.url)
          .then((r) => r.arrayBuffer())
          .then((ab) => {
            files.push({
              name: `images/step-${tIdx + 1}-img-${imgIdx + 1}.png`,
              content: new Uint8Array(ab)
            });
          })
          .catch(() => {});
        imagePromises.push(p);
      });
    });

    if (imagePromises.length > 0) {
      await Promise.all(imagePromises);
    }

    const title = document.querySelector('title')?.textContent || 'Gemini Session';
    const tel = this.telemetry.extractWizData();
    const summaryMd = this.bundleFormatter.formatAsAiBundle(turns, title, tel.currentModel || 'Gemini 3 Pro');

    files.unshift({ name: 'summary.md', content: summaryMd });

    const zipBlob = createZipBlob(files);
    const filename = `gemini-bundle-${new Date().toISOString().slice(0, 10)}.zip`;
    downloadBlob(zipBlob, filename);

    return { success: true, message: `Zapisano ZIP z ${files.length} plikami i mediami (CRC32)` };
  }

  async harvestCanvas(): Promise<{ success: boolean; message: string }> {
    const files = await this.harvester.harvestAllCanvasFiles();
    if (files.length === 0) {
      return { success: false, message: 'Nie znaleziono plików projektu w Canvas' };
    }

    const zipEntries: ZipEntry[] = files.map((f) => ({ name: f.name, content: f.content }));
    const zipBlob = createZipBlob(zipEntries);
    downloadBlob(zipBlob, `canvas-project-${new Date().toISOString().slice(0, 10)}.zip`);

    return { success: true, message: `Pomyślnie pobrano ${files.length} plików Canvas do ZIP` };
  }

  exportFlowJson(): { success: boolean; message: string } {
    return this.flow.exportAsJson();
  }

  runFlow(): { success: boolean; message: string } {
    return this.flow.triggerRunExecution();
  }
}
