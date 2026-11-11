/**
 * Bastek Omni-OS // AI Workspace - Canvas Project Harvester
 * Automatyczne przeklikiwanie drzewa plików w Canvas i pobieranie całego wieloplikowego projektu.
 * Maksymalny rozmiar pliku: < 150 linii.
 */

export interface HarvestedFile {
  name: string;
  content: string;
}

export class CanvasHarvester {
  async harvestAllCanvasFiles(
    onProgress?: (current: number, total: number, filename: string) => void
  ): Promise<HarvestedFile[]> {
    const explorer = document.querySelector('.file-explorer, .canvas-explorer, .file-tree, .file-list');
    if (!explorer) {
      // Fallback: próba znalezienia przycisków plików bezpośrednio
      return this.fallbackHarvestDirect();
    }

    const fileButtons = Array.from(
      explorer.querySelectorAll<HTMLButtonElement>('button.file-item, button[role="treeitem"], .file-row button')
    );

    if (fileButtons.length === 0) {
      return this.fallbackHarvestDirect();
    }

    const results: HarvestedFile[] = [];

    for (let i = 0; i < fileButtons.length; i++) {
      const btn = fileButtons[i];
      const filename = btn.querySelector('.file-name')?.textContent?.trim() || btn.textContent?.trim() || `file-${i + 1}.txt`;

      if (onProgress) onProgress(i + 1, fileButtons.length, filename);

      btn.click();
      await this.sleep(180);

      const code = this.readCurrentEditorContent();
      results.push({ name: filename, content: code });
    }

    return results;
  }

  private fallbackHarvestDirect(): HarvestedFile[] {
    const results: HarvestedFile[] = [];
    const pres = Array.from(document.querySelectorAll('model-response pre, code-block pre'));

    pres.forEach((pre, idx) => {
      const code = pre.querySelector('code')?.textContent || pre.textContent || '';
      if (code.trim()) {
        const lang = pre.getAttribute('data-language') || 'txt';
        results.push({
          name: `extracted/code-${idx + 1}.${lang}`,
          content: code.trim()
        });
      }
    });

    return results;
  }

  private readCurrentEditorContent(): string {
    const editor = document.querySelector('.monaco-editor, .cm-editor, .code-editor-surface, pre.code-block');
    if (!editor) return '';

    const lines = editor.querySelectorAll('.view-line, .cm-line, .code-line');
    if (lines.length > 0) {
      return Array.from(lines).map((l) => l.textContent || '').join('\n');
    }

    return editor.textContent || '';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}
