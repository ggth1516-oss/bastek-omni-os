/**
 * Bastek Omni-OS // Identity Switcher - Account Switcher
 * Błyskawiczna zmiana profilu Google (/u/0/ <-> /u/1/ <-> /u/2/) z zachowaniem aktywnej ścieżki i czatu.
 * Maksymalny rozmiar pliku: < 90 linii.
 */

export class AccountSwitcher {
  getCurrentProfileIndex(): number {
    const url = window.location.href;
    const match = url.match(/\/u\/(\d+)\//);
    if (match) return parseInt(match[1], 10);

    const param = new URL(url).searchParams.get('authuser');
    if (param) return parseInt(param, 10);

    return 0;
  }

  switchToEmail(email: string, targetUrl?: string): void {
    const destination = targetUrl || window.location.href;
    const chooserUrl = `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(email)}&continue=${encodeURIComponent(destination)}`;
    window.location.href = chooserUrl;
  }

  switchToProfile(targetIndex: number): void {
    const currentUrl = new URL(window.location.href);

    // 1. Jeśli URL zawiera wzorzec /u/X/
    if (/\/u\/\d+\//.test(currentUrl.pathname)) {
      currentUrl.pathname = currentUrl.pathname.replace(/\/u\/\d+\//, `/u/${targetIndex}/`);
      window.location.href = currentUrl.toString();
      return;
    }

    // 2. Jeśli usługa wspiera authuser w query params
    if (currentUrl.searchParams.has('authuser')) {
      currentUrl.searchParams.set('authuser', targetIndex.toString());
      window.location.href = currentUrl.toString();
      return;
    }

    // 3. Fallback dla domen Google (np. gemini.google.com -> gemini.google.com/u/1/)
    if (currentUrl.hostname.includes('google.com')) {
      currentUrl.pathname = `/u/${targetIndex}${currentUrl.pathname}`;
      window.location.href = currentUrl.toString();
    }
  }
}
