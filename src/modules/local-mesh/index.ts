/**
 * Bastek Omni-OS // Local Mesh Coordinator
 * Koordynuje komunikację z lokalnym węzłem roboczym i skarbcem Obsidian (port 27123).
 * Maksymalny rozmiar pliku: < 65 linii.
 */

import type { ExtensionModule } from '../../types';
import { VaultBridge, type VaultPromptItem } from './vault-bridge';

export class LocalMeshModule implements ExtensionModule {
  id = 'local-mesh' as const;
  name = 'Local Mesh (Obsidian & MCP Bridge)';
  version = '1.2.0';

  private vault = new VaultBridge();

  isAvailableOn(): boolean {
    return true;
  }

  async mount(): Promise<void> {}

  async unmount(): Promise<void> {}

  async saveToVault(filename: string, content: string): Promise<{ success: boolean; message: string }> {
    return this.vault.saveNoteToVault(filename, content);
  }

  async fetchPrompts(): Promise<{ online: boolean; prompts: VaultPromptItem[] }> {
    return this.vault.fetchPrompts();
  }

  async checkStatus(): Promise<{ online: boolean; message: string }> {
    return this.vault.checkStatus();
  }
}
