/**
 * Bastek Omni-OS // Local Mesh - Obsidian Vault Bridge
 * Bezpośredni zapis notatek i kodu do /Users/rudy/Documents/bastek/MAIN/dane/theworks-vault/
 * Maksymalny rozmiar pliku: < 100 linii.
 */

export class VaultBridge {
  private localDaemonUrl = 'http://127.0.0.1:27123';

  async checkStatus(): Promise<{ online: boolean; message: string }> {
    try {
      const res = await fetch(`${this.localDaemonUrl}/health`);
      if (res.ok) {
        const data = await res.json();
        return { online: true, message: `VaultBridge aktywny (${data.prompts || 'port 27123'})` };
      }
    } catch {}
    return { online: false, message: 'Daemon VaultBridge (27123) offline - użyto bufora lokalnego' };
  }

  async fetchPrompts(): Promise<{ online: boolean; prompts: Array<{ id: string; title: string; desc: string; promptText: string }> }> {
    try {
      const res = await fetch(`${this.localDaemonUrl}/prompts`);
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.prompts) && data.prompts.length > 0) {
          return { online: true, prompts: data.prompts };
        }
      }
    } catch {}
    return {
      online: false,
      prompts: [
        {
          id: 'architektura-modulowa',
          title: 'Architektura modułowa (<250 linii)',
          desc: 'Przestrzegaj ścisłej zasady modułowości: każdy plik TS/JS < 250 linii...',
          promptText: 'Przestrzegaj ścisłej zasady modułowości: każdy plik TypeScript/JavaScript musi mieć poniżej 250 linii kodu. Dziel logikę na małe, dedykowane komponenty bez powtórzeń.'
        },
        {
          id: 'anti-slop-filter',
          title: 'Anti-Slop Filter (Zero Emoji)',
          desc: 'Utrzymuj absolutną dyscyplinę inżynieryjną: zero emotikon, czysty kod...',
          promptText: 'Utrzymuj absolutną dyscyplinę inżynieryjną: zero emotikon, czysty kod, czytelne komentarze techniczne i bezpośrednie rozwiązania.'
        },
        {
          id: 'analiza-kodu',
          title: 'Analiza Kodu i Refaktoryzacja',
          desc: 'Dokonaj dogłębnej analizy struktury: sprawdź szczelność typów TS...',
          promptText: 'Dokonaj dogłębnej analizy struktury: sprawdź szczelność typów TypeScript, brak wycieków pamięci i optymalizację renderowania DOM.'
        }
      ]
    };
  }

  async saveNoteToVault(
    filename: string,
    content: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanName = filename.endsWith('.md') ? filename : `${filename}.md`;
    try {
      const response = await fetch(`${this.localDaemonUrl}/vault/${encodeURIComponent(cleanName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
        body: content
      });

      if (response.ok) {
        return {
          success: true,
          message: `Zapisano bezpośrednio w theworks-vault: ${cleanName}`
        };
      }
    } catch {
      // Fallback: pobranie pliku do ręcznego przeniesienia
    }

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return {
      success: true,
      message: `Daemon offline - pobrano plik Markdown: ${cleanName}`
    };
  }
}

export interface VaultPromptItem {
  id: string;
  title: string;
  desc: string;
  promptText: string;
}
