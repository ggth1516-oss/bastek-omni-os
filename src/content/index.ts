/**
 * Bastek Omni-OS // Content Script Main Orchestrator
 * Integruje Nexus Orb FAB, satelity procesów, Split-View, Schowek D&D, Motywy Style Lab i Pinning.
 * Maksymalny rozmiar pliku: < 240 linii.
 */

import { createIsolatedShadowHost } from '../core/shadow-root';
import { MessageBus } from '../core/bus';
import { SettingsStore, type OmniSettings } from '../core/settings';
import { ClipboardStore } from '../modules/clipboard/clipboard-store';
import type { ThinkingTabInfo, OrbCorner, OrbPositionConfig, OmniThemePreset } from '../types';
import { AiWorkspaceModule } from '../modules/ai-workspace';
import { CinemaOsModule } from '../modules/cinema-os';
import { IdentitySwitchModule } from '../modules/identity-switch';
import { LocalMeshModule } from '../modules/local-mesh';
import { THEME_BASE_CSS } from './theme-base.css';
import { THEME_COMPONENTS_CSS } from './theme-components.css';
import { THEME_CONTROLS_CSS } from './theme-controls.css';
import { GoogleToast } from './toast';
import { AudioChime } from './audio-chime';
import { OrbLauncher } from './orb-launcher';
import { SatellitesStack } from './satellites';
import { SpeedDialStack } from './speed-dial';
import { DockedPanel } from './docked-panel';
import { ElementPicker } from './element-picker';
import { ActionsDispatcher } from './actions-dispatcher';
import { GoogleAuthDetector } from '../modules/identity-switch/google-auth-detector';
import { ProfilePanel } from './panels/profile-panel';
import { ClipboardPanel } from './panels/clipboard-panel';
import { SavePanel } from './panels/save-panel';
import { ActionsPanel } from './panels/actions-panel';
import { SettingsPanel } from './panels/settings-panel';
import { SVG_PROFILE, SVG_CLIPBOARD, SVG_SAVE, SVG_ACTIONS, SVG_SETTINGS } from './svg-icons';

class BastekOmniCockpit {
  private shadow = createIsolatedShadowHost('bastek-omni-cockpit-root');
  private toast = new GoogleToast(this.shadow);
  private orb: OrbLauncher;
  private satellites: SatellitesStack;
  private speedDial: SpeedDialStack;
  private dockedPanel: DockedPanel;
  private activeClipPanel: ClipboardPanel | null = null;
  private store = SettingsStore.getInstance();
  private clipStore = ClipboardStore.getInstance();
  private aiMod = new AiWorkspaceModule();
  private cinemaMod = new CinemaOsModule();
  private identityMod = new IdentitySwitchModule();
  private meshMod = new LocalMeshModule();
  private dispatcher: ActionsDispatcher;
  private activeContext: 'gemini' | 'flow' | 'youtube' = 'gemini';
  private currentEmail = 'rudy.ziaja@gmail.com';

  constructor() {
    const s = document.createElement('style');
    s.textContent = `${THEME_BASE_CSS}\n${THEME_COMPONENTS_CSS}\n${THEME_CONTROLS_CSS}`;
    this.shadow.appendChild(s);

    const h = window.location.hostname;
    this.activeContext = h.includes('youtube.com') ? 'youtube' : (h.includes('flow') || h.includes('aistudio')) ? 'flow' : 'gemini';
    this.dispatcher = new ActionsDispatcher(this.aiMod, this.cinemaMod, this.meshMod, this.toast);

    this.orb = new OrbLauncher(
      this.shadow, () => this.handleOrbClick(),
      (p) => this.handlePositionSave(p), (r, b) => this.handleOrientationChange(r, b),
      (f, t) => this.handleOrbDrop(f, t)
    );
    const dockEl = this.orb.getDockElement();
    this.satellites = new SatellitesStack(dockEl, (tId) => this.focusTab(tId));
    this.speedDial = new SpeedDialStack(dockEl, (id) => this.handleOpenPanel(id));
    this.dockedPanel = new DockedPanel(dockEl, () => { this.cleanupClipPanel(); this.speedDial.setActiveButton(null); });

    this.init();
    this.setupListeners();
  }

  private cleanupClipPanel(): void {
    this.activeClipPanel?.destroy();
    this.activeClipPanel = null;
  }

  private async init(): Promise<void> {
    if (await GoogleAuthDetector.checkAndEnforcePreferredAccount()) return;
    const url = new URL(window.location.href);
    if (this.aiMod.isAvailableOn(url)) await this.aiMod.mount(this.shadow);
    if (this.cinemaMod.isAvailableOn(url)) await this.cinemaMod.mount(this.shadow);
    if (this.identityMod.isAvailableOn(url)) await this.identityMod.mount(this.shadow);
    if (this.meshMod.isAvailableOn()) await this.meshMod.mount();

    const s = await this.store.load();
    this.applySettings(s);
    const dPos = this.store.getPositionForDomain(window.location.hostname);
    this.orb.applyPosition(dPos);
    if (dPos.menuDirection) this.speedDial.setDirection(dPos.menuDirection);
    if (dPos.satellitesDirection) this.satellites.setDirection(dPos.satellitesDirection);
    this.requestInitialThinkingTabs();
  }

  private setupListeners(): void {
    window.addEventListener('copy', () => setTimeout(async () => {
      const sel = window.getSelection()?.toString();
      if (sel?.trim()) await this.clipStore.addText(sel);
    }, 50));

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { this.cleanupClipPanel(); this.dockedPanel.close(); this.speedDial.close(); this.orb.setOpen(false); }
    });

    MessageBus.onMessage(async (msg) => {
      if (msg.type === 'OMNI_TOGGLE') this.handleOrbClick();
      else if (msg.type === 'THINKING_TABS_CHANGED') {
        const tabs = (msg.payload as ThinkingTabInfo[]) || [];
        this.satellites.updateTabs(tabs);
        this.orb.setThinking(tabs.length > 0, tabs.length);
      } else if (msg.type === 'PLAY_COMPLETION_PING') {
        AudioChime.playCompletion();
        this.toast.show(`Odpowiedź gotowa: ${msg.payload.tabTitle}`);
      }
      return { success: true };
    });
  }

  private async handleOrbDrop(files: File[], text: string): Promise<void> {
    if (files.length > 0) {
      let savedCount = 0;
      for (const f of files) {
        const res = await this.clipStore.addFile(f);
        if (res.saved) savedCount++;
        else if (res.reason) this.toast.show(res.reason);
      }
      if (savedCount > 0) this.toast.show(`Zapisano ${savedCount} plik(ów) w schowku`);
    } else if (text) {
      await this.clipStore.addText(text);
      this.toast.show('Zapisano obiekt w schowku');
    }
  }

  private async requestInitialThinkingTabs(): Promise<void> {
    try {
      const r = await MessageBus.sendToBackground({ type: 'GET_THINKING_TABS' });
      if (r.success && Array.isArray(r.data)) {
        this.satellites.updateTabs(r.data);
        this.orb.setThinking(r.data.length > 0, r.data.length);
      }
    } catch {}
  }

  private handleOrbClick(): void {
    const isOpen = this.speedDial.toggle();
    this.orb.setOpen(isOpen);
    if (!isOpen) { this.cleanupClipPanel(); this.dockedPanel.close(); }
  }

  private handleOrientationChange(isR: boolean, isB: boolean): void {
    this.satellites.setOrientation(isB);
    this.speedDial.setOrientation(isR, isB);
    this.dockedPanel.setOrientation(isR, isB);
  }

  private async handlePositionSave(pos: OrbPositionConfig): Promise<void> {
    await this.store.setPositionForDomain(window.location.hostname, pos);
    this.toast.show('Zapisano nowe położenie');
  }

  private handleOpenPanel(panelId: string): void {
    this.cleanupClipPanel();
    if (panelId === 'profile') {
      const p = new ProfilePanel(this.currentEmail, (a, b) => this.handleSplitView(a, b));
      this.dockedPanel.open('Konta Google', SVG_PROFILE, p.getElement());
    } else if (panelId === 'clipboard') {
      this.activeClipPanel = new ClipboardPanel((t) => { this.aiMod.injectPrompt(t); this.dockedPanel.close(); }, (m) => this.toast.show(m));
      this.dockedPanel.open('Schowek (Ctrl+C & D&D)', SVG_CLIPBOARD, this.activeClipPanel.getElement());
    } else if (panelId === 'save') {
      this.dockedPanel.open('Zapisz & Eksportuj', SVG_SAVE, new SavePanel(this.activeContext, async (a) => {
        this.dockedPanel.close();
        await this.dispatcher.dispatchSave(a);
      }).getElement());
    } else if (panelId === 'actions') {
      const p = new ActionsPanel(
        this.activeContext, (a) => { this.dockedPanel.close(); this.dispatcher.dispatchContext(a); },
        () => this.meshMod.fetchPrompts(),
        (promptText, title) => {
          const ok = this.aiMod.injectPrompt(promptText);
          this.dockedPanel.close();
          if (!ok) navigator.clipboard.writeText(promptText);
          this.toast.show(ok ? `Wstrzyknięto prompt: ${title}` : 'Skopiowano prompt do schowka');
        }
      );
      this.dockedPanel.open('Akcje & Prompty', SVG_ACTIONS, p.getElement());
    } else if (panelId === 'settings') {
      const dPos = this.store.getPositionForDomain(window.location.hostname);
      const p = new SettingsPanel(
        this.activeContext, { ...this.store.get(), orbPosition: dPos },
        (c) => this.handleCornerChange(c), () => this.handleFreeMode(), () => this.handlePinElement(),
        (k, v) => this.applySetting(k, v), (theme) => this.handleThemeChange(theme)
      );
      this.dockedPanel.open('Ustawienia & Motyw', SVG_SETTINGS, p.getElement());
    }
  }

  private async handleCornerChange(corner: OrbCorner): Promise<void> {
    this.orb.setFreeMode(false);
    const newPos: OrbPositionConfig = { corner, freeMode: false };
    this.orb.applyPosition(newPos);
    await this.store.setPositionForDomain(window.location.hostname, newPos);
    this.toast.show(`Przeniesiono: ${corner} (ruch zablokowany)`);
  }

  private async handleFreeMode(): Promise<void> {
    this.orb.setFreeMode(true);
    const cur = this.store.getPositionForDomain(window.location.hostname);
    await this.store.setPositionForDomain(window.location.hostname, { ...cur, freeMode: true, pinnedSelector: undefined });
    this.toast.show('Tryb swobodny aktywny: przeciągnij kulkę');
  }

  private handlePinElement(): void {
    this.dockedPanel.close();
    new ElementPicker(this.shadow).start(async (r) => {
      this.orb.pinToCoordinates(r.x, r.y, r.selector);
      this.speedDial.setDirection(r.menuDirection);
      this.satellites.setDirection(r.satellitesDirection);
      await this.store.setPositionForDomain(window.location.hostname, {
        corner: 'bottom-right', customX: r.x, customY: r.y, freeMode: false,
        pinnedSelector: r.selector, menuDirection: r.menuDirection, satellitesDirection: r.satellitesDirection
      });
      this.toast.show(`Przypięto do ${r.selector} (${r.menuDirection}/${r.satellitesDirection})`);
    });
  }

  private async handleThemeChange(theme: OmniThemePreset): Promise<void> {
    await this.store.set('themePreset', theme);
    this.shadow.host.setAttribute('data-theme', theme);
    this.toast.show(`Zastosowano motyw: ${theme.toUpperCase()}`);
  }

  private async applySetting(key: keyof OmniSettings, val: boolean): Promise<void> {
    await this.store.set(key, val);
    this.applySettings(this.store.get());
    this.toast.show('Zapisano ustawienie');
  }

  private applySettings(s: OmniSettings): void {
    this.shadow.host.setAttribute('data-theme', s.themePreset || 'm3');
    if (this.activeContext !== 'youtube') {
      this.aiMod.setFullWidth(!!s.fullWidth);
      this.aiMod.setScrollLock(!!s.scrollLock);
      this.aiMod.setZenMode(!!s.zenMode);
      this.aiMod.setTurnTimeline(s.turnTimeline !== false);
    } else {
      this.cinemaMod.setUltrawide(!!s.ultrawideCinema, false);
      this.cinemaMod.setAmbientGlow(!!s.ambientGlow);
    }
  }

  private async focusTab(tabId: number): Promise<void> {
    await MessageBus.sendToBackground({ type: 'FOCUS_TAB_REQUEST', payload: { tabId } });
  }

  private async handleSplitView(emailA: string, emailB: string): Promise<void> {
    this.dockedPanel.close();
    this.toast.show('Otwieram okna obok siebie (Split View)...');
    await MessageBus.sendToBackground({ type: 'OPEN_SPLIT_WINDOWS', payload: { emailA, emailB, targetUrl: window.location.href } });
  }
}

if (window.top === window.self) new BastekOmniCockpit();
