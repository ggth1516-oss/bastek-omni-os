/**
 * Bastek Omni-OS // Identity Switcher Coordinator
 * Koordynuje szybkie przełączanie profili Google w ramach całego ekosystemu.
 * Maksymalny rozmiar pliku: < 60 linii.
 */

import type { ExtensionModule } from '../../types';
import { AccountSwitcher } from './account-switcher';

export class IdentitySwitchModule implements ExtensionModule {
  id = 'identity-switch' as const;
  name = 'Identity Switcher (Google Multi-Account)';
  version = '1.1.0';

  private switcher = new AccountSwitcher();

  isAvailableOn(url: URL): boolean {
    return url.hostname.includes('google.com');
  }

  async mount(): Promise<void> {}

  async unmount(): Promise<void> {}

  getCurrentProfile(): number {
    return this.switcher.getCurrentProfileIndex();
  }

  switchToProfile(index: number): void {
    this.switcher.switchToProfile(index);
  }
}
