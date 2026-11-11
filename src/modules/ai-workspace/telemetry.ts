/**
 * Bastek Omni-OS // AI Workspace - Telemetry & Token Estimator
 * Ekstrakcja danych z WIZ_global_data oraz estymacja zużycia tokenów w oknie kontekstu.
 * Maksymalny rozmiar pliku: < 130 linii.
 */

import type { WizGlobalData } from '../../types';

export interface LiveTokenStats {
  estimatedTokens: number;
  maxTokens: number;
  percentage: number;
}

export class GeminiTelemetry {
  private cachedData: WizGlobalData = {};

  extractWizData(): WizGlobalData {
    try {
      const scriptTag = document.querySelector('script[data-id="_gd"]');
      if (!scriptTag?.textContent) return this.cachedData;

      const content = scriptTag.textContent.trim();
      const jsonStr = content.replace(/^window\.WIZ_global_data\s*=\s*/, '').replace(/;\s*$/, '');
      const rawData = JSON.parse(jsonStr);

      const email = rawData.oPEP7c || undefined;
      const profile = rawData.QrtxK || '0';
      const build = rawData.cfb2h || undefined;

      let modelName = 'Gemini 3 Pro';
      let tokens = 1048576; // 1M domyślnie

      if (rawData.TSDtV) {
        try {
          const flagsData = JSON.parse(rawData.TSDtV);
          const flags = flagsData.flags || {};
          if (flags['45738845']) modelName = flags['45738845'];
          else if (flags['45747324']) modelName = flags['45747324'];

          if (typeof flags['45676044'] === 'number') tokens = flags['45676044'];
          else if (typeof flags['45631039'] === 'number') tokens = flags['45631039'];
        } catch {
          // cichy fallback
        }
      }

      this.cachedData = {
        accountEmail: email,
        profileIndex: profile,
        buildVersion: build,
        contextWindowTokens: tokens,
        currentModel: modelName
      };
      return this.cachedData;
    } catch {
      return this.cachedData;
    }
  }

  getLiveTokenStats(): LiveTokenStats {
    const turns = Array.from(document.querySelectorAll('user-query, model-response'));
    let charCount = 0;
    for (const t of turns) {
      charCount += t.textContent?.length || 0;
    }

    const inputArea = document.querySelector('rich-textarea, textarea');
    if (inputArea) {
      charCount += inputArea.textContent?.length || 0;
    }

    // Średnia dla języków mieszanych (kod, PL, EN) to ~3.8 znaku na token
    const estimated = Math.round(charCount / 3.8);
    const max = this.cachedData.contextWindowTokens || 1048576;
    const pct = Math.min(100, Math.max(1, (estimated / max) * 100));

    return {
      estimatedTokens: estimated,
      maxTokens: max,
      percentage: Number(pct.toFixed(1))
    };
  }
}
