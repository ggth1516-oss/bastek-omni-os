/**
 * Bastek Omni-OS // Identity Switcher - Google Auth Detector
 * Automatyczna detekcja kont Google i bezpieczne wymuszanie wybranego profilu bez pętli przekierowań.
 * Maksymalny rozmiar pliku: < 140 linii.
 */

export class GoogleAuthDetector {
  private static readonly STORAGE_LOGGED_EMAILS = 'bastek_omni_logged_in_emails';
  private static readonly STORAGE_ACTIVE_EMAIL = 'bastek_omni_current_email';
  private static readonly STORAGE_PREFERRED_EMAIL = 'bastek_omni_preferred_email';
  private static readonly SESSION_REDIRECT_GUARD = 'bastek_omni_redirect_guard';

  static detectActiveEmailFromDom(): string | null {
    try {
      const selectors = [
        'a[aria-label*="@"]', 'button[aria-label*="@"]', 'img[alt*="@"]',
        'a[title*="@"]', '#avatar-btn', 'button.gb_A', '[data-email]'
      ];

      for (const sel of selectors) {
        const els = document.querySelectorAll(sel);
        for (const el of Array.from(els)) {
          const raw = `${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''} ${el.getAttribute('alt') || ''} ${el.getAttribute('data-email') || ''}`;
          const match = raw.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (match && match[1]) return match[1].toLowerCase();
        }
      }

      for (const s of Array.from(document.querySelectorAll('script'))) {
        const txt = s.textContent || '';
        if (txt.includes('WIZ_global_data') || txt.includes('_WIZ_GLOBAL_DATA')) {
          const match = txt.match(/"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})"/);
          if (match && match[1]) return match[1].toLowerCase();
        }
      }
    } catch {}
    return null;
  }

  static async registerActiveEmail(email: string): Promise<void> {
    try {
      const lower = email.toLowerCase();
      const data = await chrome.storage.local.get([this.STORAGE_LOGGED_EMAILS, this.STORAGE_ACTIVE_EMAIL]);
      const set = new Set<string>(data[this.STORAGE_LOGGED_EMAILS] || []);
      set.add(lower);
      await chrome.storage.local.set({
        [this.STORAGE_LOGGED_EMAILS]: Array.from(set),
        [this.STORAGE_ACTIVE_EMAIL]: lower
      });
    } catch {}
  }

  static async setPreferredAccount(email: string): Promise<void> {
    try {
      const lower = email.toLowerCase();
      await chrome.storage.local.set({ [this.STORAGE_PREFERRED_EMAIL]: lower });
      await this.registerActiveEmail(lower);
    } catch {}
  }

  static async getPreferredAccount(): Promise<string | null> {
    try {
      const data = await chrome.storage.local.get(this.STORAGE_PREFERRED_EMAIL);
      return data[this.STORAGE_PREFERRED_EMAIL] || null;
    } catch {
      return null;
    }
  }

  static async getLoggedInEmails(): Promise<string[]> {
    try {
      const data = await chrome.storage.local.get(this.STORAGE_LOGGED_EMAILS);
      return Array.isArray(data[this.STORAGE_LOGGED_EMAILS]) ? data[this.STORAGE_LOGGED_EMAILS] : [];
    } catch {
      return [];
    }
  }

  static async getActiveEmail(): Promise<string | null> {
    const domEmail = this.detectActiveEmailFromDom();
    if (domEmail) {
      await this.registerActiveEmail(domEmail);
      return domEmail;
    }
    try {
      const data = await chrome.storage.local.get(this.STORAGE_ACTIVE_EMAIL);
      return data[this.STORAGE_ACTIVE_EMAIL] || null;
    } catch {
      return null;
    }
  }

  static async checkAndEnforcePreferredAccount(): Promise<boolean> {
    try {
      const preferred = await this.getPreferredAccount();
      if (!preferred) return false;

      const host = window.location.hostname;
      const isGoogleApp = host.includes('gemini.google.com') ||
        host.includes('aistudio.google.com') ||
        host.includes('mail.google.com') ||
        host.includes('docs.google.com') ||
        host.includes('drive.google.com') ||
        host.includes('youtube.com');

      if (!isGoogleApp) return false;
      const href = window.location.href;
      if (href.includes('AccountChooser') || href.includes('signin') || href.includes('accounts.google.com')) return false;

      const current = this.detectActiveEmailFromDom();
      if (current && current.toLowerCase() !== preferred.toLowerCase()) {
        const lastAttempt = Number(sessionStorage.getItem(this.SESSION_REDIRECT_GUARD) || '0');
        if (Date.now() - lastAttempt < 30000) return false;
        sessionStorage.setItem(this.SESSION_REDIRECT_GUARD, String(Date.now()));

        const redirectUrl = `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(preferred)}&continue=${encodeURIComponent(href)}`;
        window.location.replace(redirectUrl);
        return true;
      }
    } catch {}
    return false;
  }
}
