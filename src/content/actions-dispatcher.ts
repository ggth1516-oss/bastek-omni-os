/**
 * Bastek Omni-OS // Content UI - Actions & Save Dispatcher
 * Dyspozytor akcji kontekstowych i operacji eksportu (Zip, Markdown, Canvas, pełny zapis do theworks-vault).
 * Maksymalny rozmiar pliku: < 110 linii.
 */

import type { AiWorkspaceModule } from '../modules/ai-workspace';
import type { CinemaOsModule } from '../modules/cinema-os';
import type { LocalMeshModule } from '../modules/local-mesh';
import type { GoogleToast } from './toast';

export class ActionsDispatcher {
  constructor(
    private aiMod: AiWorkspaceModule,
    private cinemaMod: CinemaOsModule,
    private meshMod: LocalMeshModule,
    private toast: GoogleToast
  ) {}

  async dispatchSave(id: string): Promise<void> {
    if (id === 'export-zip') {
      this.toast.show('Pakowanie archiwum ZIP...');
      this.toast.show((await this.aiMod.exportZip()).message);
    } else if (id === 'export-md') {
      this.toast.show(this.aiMod.exportMarkdown().message);
    } else if (id === 'export-flow-json') {
      this.toast.show(this.aiMod.exportFlowJson().message);
    } else if (id === 'harvest-canvas') {
      this.toast.show('Ekstrakcja plików z Canvas...');
      this.toast.show((await this.aiMod.harvestCanvas()).message);
    } else if (id === 'capture-frame') {
      this.toast.show(this.cinemaMod.captureFrame().message);
    } else if (id === 'export-study-note') {
      this.toast.show(this.cinemaMod.exportStudyNote().message);
    } else if (id === 'save-vault') {
      if (window.location.hostname.includes('youtube.com')) {
        const noteData = this.cinemaMod.buildStudyNoteData();
        const res = await this.meshMod.saveToVault(noteData.filename, noteData.markdown);
        this.toast.show(res.message);
      } else {
        const bundle = this.aiMod.buildMarkdownBundle();
        const res = await this.meshMod.saveToVault(bundle.filename, bundle.markdown);
        this.toast.show(res.message);
      }
    }
  }

  async dispatchContext(id: string): Promise<void> {
    if (id === 'refresh-telemetry') {
      const tel = this.aiMod.getTelemetry();
      const stats = this.aiMod.getTokenStats();
      this.toast.show(`Model: ${tel.currentModel || 'Gemini 3 Pro'} | ~${stats.estimatedTokens} tok (${stats.percentage}%)`);
    } else if (id === 'rescan-code') {
      this.toast.show(this.aiMod.rescanCodeBlocks().message);
    } else if (id === 'scroll-latest') {
      const scroller = document.querySelector('infinite-scroller.chat-history, .chat-history-scroll-container');
      if (scroller) scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
      else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      this.toast.show('Przewinięto do najnowszej odpowiedzi');
    } else if (id === 'run-flow') {
      this.toast.show(this.aiMod.runFlow().message);
    } else if (id === 'sync-mcp') {
      const st = await this.meshMod.checkStatus();
      this.toast.show(st.message);
    } else if (id === 'toggle-theater') {
      const enabled = this.cinemaMod.toggleUltrawide();
      this.toast.show(enabled ? 'Włączono tryb 21:9 Ultrawide' : 'Przywrócono format 16:9');
    } else if (id === 'speed-1-5') {
      this.cinemaMod.setPlaybackSpeed(1.5);
      this.toast.show('Prędkość: 1.5x');
    }
  }
}
