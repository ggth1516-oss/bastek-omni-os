/**
 * Bastek Omni-OS // AI Workspace - Google Flow & AI Studio Harvester
 * Ekstrakcja struktury węzłów, instrukcji systemowych i parametrów modelu oraz wyzwalanie promptu.
 * Maksymalny rozmiar pliku: < 130 linii.
 */

import { downloadBlob } from './zip-exporter';

export interface FlowExportData {
  service: string;
  timestamp: string;
  model: string;
  systemInstruction?: string;
  prompts: string[];
  parameters: Record<string, string | number>;
}

export class FlowHarvester {
  extractFlowStructure(): FlowExportData {
    // 1. Nazwa modelu
    const modelEl = document.querySelector(
      '.model-selector, [aria-label*="Model"], .ms-model-name, .selected-model'
    );
    const modelName = modelEl?.textContent?.trim() || 'Gemini 1.5 / 2.0 / Flash';

    // 2. Instrukcja systemowa
    const sysEl = document.querySelector(
      'textarea[aria-label*="System instructions"], .system-instructions textarea, [data-test-id="system-instruction"]'
    ) as HTMLTextAreaElement | null;
    const systemInstruction = sysEl?.value || sysEl?.textContent?.trim() || undefined;

    // 3. Wprowadzone prompty i węzły
    const prompts: string[] = [];
    const promptEls = document.querySelectorAll(
      'rich-textarea, .prompt-textarea, .chunk-text, textarea[aria-label*="Prompt"]'
    );
    promptEls.forEach((p) => {
      const text = (p as HTMLTextAreaElement).value || p.textContent?.trim() || '';
      if (text) prompts.push(text);
    });

    // 4. Parametry generowania (Temperature, Top-K itp.)
    const parameters: Record<string, string | number> = {};
    const sliders = document.querySelectorAll('input[type="range"], .slider-container');
    sliders.forEach((s) => {
      const input = s.tagName === 'INPUT' ? (s as HTMLInputElement) : s.querySelector('input');
      const label = s.parentElement?.querySelector('label, .slider-label')?.textContent?.trim() || input?.name || 'param';
      if (input) parameters[label] = Number(input.value) || input.value;
    });

    return {
      service: window.location.hostname.includes('aistudio') ? 'Google AI Studio' : 'Google Flow',
      timestamp: new Date().toISOString(),
      model: modelName,
      systemInstruction,
      prompts,
      parameters
    };
  }

  exportAsJson(): { success: boolean; message: string } {
    const data = this.extractFlowStructure();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const filename = `google-flow-${new Date().toISOString().slice(0, 10)}.json`;
    downloadBlob(blob, filename);

    return {
      success: true,
      message: `Wyeksportowano konfigurację ${data.service} do JSON`
    };
  }

  triggerRunExecution(): { success: boolean; message: string } {
    // 1. Szukamy przycisku Run
    const runBtn = document.querySelector(
      'button[aria-label*="Run"], button.run-button, button.mat-primary, button[data-test-id="run-button"]'
    ) as HTMLButtonElement | null;

    if (runBtn && !runBtn.disabled) {
      runBtn.click();
      return { success: true, message: 'Wysłano zapytanie do modelu (Run)' };
    }

    // 2. Fallback: wysłanie zdarzenia klawiatury Cmd+Enter
    const activeTextarea = document.querySelector(
      'rich-textarea, textarea:focus, textarea'
    ) as HTMLElement | null;

    if (activeTextarea) {
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        metaKey: true,
        ctrlKey: true,
        bubbles: true
      });
      activeTextarea.dispatchEvent(event);
      return { success: true, message: 'Wysłano zapytanie (Cmd+Enter)' };
    }

    return { success: false, message: 'Nie odnaleziono przycisku wykonania Run' };
  }
}
