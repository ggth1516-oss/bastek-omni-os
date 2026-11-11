/**
 * Bastek Omni-OS // Content UI - Profile Panel & MCP Account Sync
 * Synchronizacja 6 kont MCP z logowaniem AccountChooser (Option 1 + 2).
 * Wymusza wybrane konto jako domyślne dla nowych kart Google.
 * Maksymalny rozmiar pliku: < 200 linii.
 */

import { SVG_GOOGLE_G } from '../svg-icons';
import { GoogleAuthDetector } from '../../modules/identity-switch/google-auth-detector';
import { AccountSwitcher } from '../../modules/identity-switch/account-switcher';
import { MessageBus } from '../../core/bus';

export interface McpAccountItem {
  email: string;
  label: string;
  initial: string;
  color: string;
  isLoggedIn: boolean;
}

export const MCP_ALL_ACCOUNTS: McpAccountItem[] = [
  { email: 'rudy.ziaja@gmail.com', label: 'Konto prywatne / nadrzędne', initial: 'R', color: '#1a73e8', isLoggedIn: true },
  { email: 'ziaja.dev@gmail.com', label: 'Konto developerskie', initial: 'Z', color: '#d93025', isLoggedIn: true },
  { email: 'ggth1516@gmail.com', label: 'Konto podstawowe Google', initial: 'G', color: '#1e8e3e', isLoggedIn: false },
  { email: 'ziaja.next@gmail.com', label: 'Konto projektowe AI', initial: 'Z', color: '#9334e6', isLoggedIn: false },
  { email: 'sebus10.1998@gmail.com', label: 'Konto robocze / pomocnicze', initial: 'S', color: '#e37400', isLoggedIn: false },
  { email: 'sebastian.ziaja.98@gmail.com', label: 'Konto personalne', initial: 'S', color: '#12b5cb', isLoggedIn: false }
];

export class ProfilePanel {
  private container: HTMLElement;
  private accounts: McpAccountItem[] = [...MCP_ALL_ACCOUNTS];
  private activeEmail = 'rudy.ziaja@gmail.com';
  private preferredEmail = 'rudy.ziaja@gmail.com';
  private switcher = new AccountSwitcher();

  constructor(
    currentEmail: string,
    private onSplitView: (emailA: string, emailB: string) => void
  ) {
    this.container = document.createElement('div');
    if (currentEmail) this.activeEmail = currentEmail.toLowerCase();
    this.init();
  }

  getElement(): HTMLElement {
    return this.container;
  }

  private async init(): Promise<void> {
    const detected = await GoogleAuthDetector.getActiveEmail();
    if (detected) this.activeEmail = detected;

    this.preferredEmail = (await GoogleAuthDetector.getPreferredAccount()) || this.activeEmail || 'rudy.ziaja@gmail.com';

    const loggedInList = await GoogleAuthDetector.getLoggedInEmails();
    const loggedInSet = new Set<string>(loggedInList.map((e) => e.toLowerCase()));
    if (detected) loggedInSet.add(detected.toLowerCase());

    this.accounts = MCP_ALL_ACCOUNTS.map((acc) => ({
      ...acc,
      isLoggedIn: loggedInSet.size > 0
        ? loggedInSet.has(acc.email.toLowerCase()) || acc.isLoggedIn
        : acc.isLoggedIn
    }));

    this.render();
  }

  private render(): void {
    const loggedInCount = this.accounts.filter((a) => a.isLoggedIn).length;

    this.container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <span style="font-size:12px;color:var(--omni-text-muted, #8e918f);">
          Rejestr MCP (${this.accounts.length} kont, ${loggedInCount} zalogowane):
        </span>
        <span style="font-size:11px;color:var(--omni-accent-primary, #a8c7fa);background:var(--omni-bg-base, #1e1f20);border:1px solid var(--omni-border-subtle, #444746);padding:2px 8px;border-radius:12px;">
          Auto-Account 2.0
        </span>
      </div>

      <div style="font-size:11px;color:var(--omni-accent-primary, #a8c7fa);margin-bottom:10px;background:rgba(168,199,250,0.08);padding:5px 10px;border-radius:8px;border:1px solid rgba(168,199,250,0.2);display:flex;align-items:center;justify-content:space-between;">
        <span>Domyślne dla nowych stron Google:</span>
        <b>${this.preferredEmail}</b>
      </div>

      <div class="profile-accounts-list" style="display:flex;flex-direction:column;gap:6px;">
        ${this.accounts.map((acc, idx) => {
          const isCurrentActive = acc.email.toLowerCase() === this.activeEmail.toLowerCase();
          const isPreferred = acc.email.toLowerCase() === this.preferredEmail.toLowerCase();
          const dimmedStyle = !acc.isLoggedIn ? 'opacity:0.42;filter:grayscale(0.6);' : '';

          return `
            <div class="m3-row-item account-row" data-idx="${idx}" data-email="${acc.email}" style="padding:10px 12px;align-items:center;cursor:${acc.isLoggedIn ? 'pointer' : 'default'};${dimmedStyle}">
              <div style="display:flex;align-items:center;gap:12px;flex:1;overflow:hidden;">
                <div style="position:relative;width:34px;height:34px;flex-shrink:0;">
                  <div style="width:34px;height:34px;border-radius:50%;background:${acc.color};color:#ffffff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:600;font-family:'Google Sans',Roboto,sans-serif;box-shadow:0 1px 4px rgba(0,0,0,0.4);border:2px solid ${isCurrentActive ? 'var(--omni-accent-primary, #a8c7fa)' : 'transparent'};">
                    ${acc.initial}
                  </div>
                  <div style="position:absolute;bottom:-2px;right:-2px;width:15px;height:15px;border-radius:50%;background:#ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.5);border:1px solid #1e1f20;">
                    ${SVG_GOOGLE_G}
                  </div>
                </div>

                <div style="display:flex;flex-direction:column;gap:2px;overflow:hidden;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span class="m3-row-title" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${acc.email}</span>
                    ${isPreferred ? `<span style="color:var(--omni-accent-primary, #a8c7fa);font-size:9.5px;font-weight:600;background:rgba(168,199,250,0.18);padding:1px 5px;border-radius:4px;border:1px solid rgba(168,199,250,0.4);">Domyślne</span>` : ''}
                  </div>
                  <span style="font-size:11.5px;color:var(--omni-text-muted, #8e918f);">
                    ${acc.isLoggedIn ? acc.label : 'Niezalogowane w tej przeglądarce'}
                  </span>
                </div>
              </div>

              ${isCurrentActive ? `
                <span style="color:#10b981;font-size:11.5px;font-weight:600;background:rgba(168,199,250,0.12);padding:3px 8px;border-radius:10px;border:1px solid rgba(16,185,129,0.3);">
                  Aktywne
                </span>
              ` : acc.isLoggedIn ? `
                <button class="m3-mini-btn switch-account-btn" data-email="${acc.email}" style="background:var(--omni-bg-surface, #282a2c);border:1px solid var(--omni-border-subtle, #444746);color:var(--omni-accent-primary, #a8c7fa);font-size:11px;padding:3px 8px;border-radius:6px;cursor:pointer;">
                  Wybierz
                </button>
              ` : `
                <button class="m3-mini-btn connect-account-btn" data-email="${acc.email}" style="background:var(--omni-bg-surface, #282a2c);border:1px solid var(--omni-accent-primary, #a8c7fa);color:var(--omni-accent-primary, #a8c7fa);font-size:11px;padding:3px 9px;border-radius:6px;cursor:pointer;" title="Zaloguj to konto przez AccountChooser">
                  Połącz
                </button>
              `}
            </div>
          `;
        }).join('')}
      </div>

      <div style="border-top:1px solid var(--omni-border-subtle, #2d2f31);margin:12px 0 8px 0;padding-top:8px;"></div>
      <div class="m3-row-item split-view-row" style="background:var(--omni-bg-surface, #282a2c);cursor:pointer;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="color:var(--omni-accent-primary, #a8c7fa);display:flex;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/>
            </svg>
          </div>
          <div style="display:flex;flex-direction:column;gap:2px;">
            <span class="m3-row-title" style="color:var(--omni-accent-primary, #a8c7fa);">Dwa profile obok siebie (Split View)</span>
            <span style="font-size:11.5px;color:var(--omni-text-muted, #8e918f);">
              ${this.accounts[0]?.email} oraz ${this.accounts[1]?.email}
            </span>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    const handleAccountSelection = async (email: string) => {
      await GoogleAuthDetector.setPreferredAccount(email);
      await MessageBus.sendToBackground({ type: 'SET_PREFERRED_GOOGLE_ACCOUNT', payload: { email } });
      this.switcher.switchToEmail(email, window.location.href);
    };

    this.container.querySelectorAll('.connect-account-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const email = btn.getAttribute('data-email');
        if (email) handleAccountSelection(email);
      });
    });

    this.container.querySelectorAll('.switch-account-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const email = btn.getAttribute('data-email');
        if (email) handleAccountSelection(email);
      });
    });

    this.container.querySelectorAll('.account-row').forEach((row) => {
      row.addEventListener('click', () => {
        const email = row.getAttribute('data-email');
        const acc = this.accounts.find((a) => a.email === email);
        if (acc && acc.isLoggedIn) handleAccountSelection(acc.email);
      });
    });

    const splitBtn = this.container.querySelector('.split-view-row');
    splitBtn?.addEventListener('click', () => {
      const emailA = this.accounts[0]?.email || 'rudy.ziaja@gmail.com';
      const emailB = this.accounts[1]?.email || 'ziaja.dev@gmail.com';
      this.onSplitView(emailA, emailB);
    });
  }
}
