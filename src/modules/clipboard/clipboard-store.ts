/**
 * Bastek Omni-OS // Core - Native Clipboard & File Drop Store
 * Przechowuje historię Ctrl+C (tekst, kod, linki) oraz obiektów upuszczonych na kulkę (D&D).
 * Zabezpiecza przed przepełnieniem chrome.storage.local oraz uszkodzeniem plików binarnych.
 * Maksymalny rozmiar pliku: < 160 linii.
 */

export interface ClipboardItem {
  id: string;
  type: 'text' | 'code' | 'link' | 'image' | 'file';
  title: string;
  content: string; // Tekst lub base64/DataURL
  timestamp: number;
  fileName?: string;
  fileSize?: string;
}

const STORAGE_KEY = 'bastek_omni_clipboard_history';
const MAX_ENTRIES = 30;
const MAX_FILE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB bezpieczny limit na pojedynczy plik w storage.local

const TEXT_EXTENSIONS = /\.(txt|md|json|ts|tsx|js|jsx|mjs|cjs|css|scss|html|xml|svg|yml|yaml|toml|ini|sh|py|rb|go|rs|java|c|cpp|h|sql|csv|log)$/i;

export class ClipboardStore {
  private static instance: ClipboardStore;
  private entries: ClipboardItem[] = [];
  private listeners: ((items: ClipboardItem[]) => void)[] = [];

  static getInstance(): ClipboardStore {
    if (!ClipboardStore.instance) {
      ClipboardStore.instance = new ClipboardStore();
    }
    return ClipboardStore.instance;
  }

  async load(): Promise<ClipboardItem[]> {
    try {
      const data = await chrome.storage.local.get(STORAGE_KEY);
      if (data && Array.isArray(data[STORAGE_KEY])) {
        this.entries = data[STORAGE_KEY];
      }
    } catch {
      // Pamięć lokalna jako fallback
    }
    return this.entries;
  }

  getEntries(): ClipboardItem[] {
    return this.entries;
  }

  async addText(text: string, title?: string): Promise<void> {
    const clean = text.trim();
    if (!clean) return;

    if (this.entries.length > 0 && this.entries[0].content === clean) {
      return;
    }

    const isUrl = /^https?:\/\/[^\s]+$/.test(clean);
    const isCode = clean.includes('\n') && (
      clean.includes('{') || clean.includes('function') || clean.includes('import ') ||
      clean.includes('const ') || clean.includes('def ') || clean.includes('export ')
    );

    let type: ClipboardItem['type'] = 'text';
    if (isUrl) type = 'link';
    else if (isCode) type = 'code';

    const item: ClipboardItem = {
      id: 'clip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type,
      title: title || (isUrl ? clean.slice(0, 40) : clean.slice(0, 36) + (clean.length > 36 ? '...' : '')),
      content: clean,
      timestamp: Date.now()
    };

    this.entries.unshift(item);
    if (this.entries.length > MAX_ENTRIES) this.entries.pop();
    await this.persist();
  }

  async addFile(file: File): Promise<{ saved: boolean; reason?: string }> {
    if (file.size > MAX_FILE_BYTES) {
      return { saved: false, reason: `Plik ${file.name} przekracza limit 1.5 MB dla schowka` };
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      const isImg = file.type.startsWith('image/');
      const isTextFile = file.type.startsWith('text/') || TEXT_EXTENSIONS.test(file.name);

      reader.onload = async () => {
        const content = String(reader.result || '');
        const sizeFormatted = file.size > 1024 * 1024
          ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
          : Math.max(1, Math.round(file.size / 1024)) + ' KB';

        const item: ClipboardItem = {
          id: 'clip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          type: isImg ? 'image' : (isTextFile && content.includes('\n') ? 'code' : 'file'),
          title: file.name,
          content,
          timestamp: Date.now(),
          fileName: file.name,
          fileSize: sizeFormatted
        };

        this.entries.unshift(item);
        if (this.entries.length > MAX_ENTRIES) this.entries.pop();
        await this.persist();
        resolve({ saved: true });
      };

      reader.onerror = () => resolve({ saved: false, reason: 'Błąd odczytu pliku' });

      if (isImg || !isTextFile) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  }

  async removeEntry(id: string): Promise<void> {
    this.entries = this.entries.filter((e) => e.id !== id);
    await this.persist();
  }

  async clearAll(): Promise<void> {
    this.entries = [];
    await this.persist();
  }

  subscribe(listener: (items: ClipboardItem[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.entries);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private async persist(): Promise<void> {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: this.entries });
    } catch {
      // W razie przekroczenia limitu przycinamy najstarsze wpisy
      if (this.entries.length > 5) {
        this.entries = this.entries.slice(0, 5);
        await chrome.storage.local.set({ [STORAGE_KEY]: this.entries }).catch(() => {});
      }
    }
    this.listeners.forEach((l) => l(this.entries));
  }
}
