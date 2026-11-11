export type ModuleId = 'ai-workspace' | 'cinema-os' | 'identity-switch' | 'local-mesh';

export type OmniThemePreset = 'm3' | 'obsidian' | 'matrix' | 'neon' | 'titanium' | 'solar';

export interface WizGlobalData {
  accountEmail?: string;
  profileIndex?: string;
  routePath?: string;
  accountId?: string;
  buildVersion?: string;
  contextWindowTokens?: number;
  currentModel?: string;
}

export type OrbCorner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface OrbPositionConfig {
  corner: OrbCorner;
  customX?: number;
  customY?: number;
  freeMode?: boolean;
  pinnedSelector?: string;
  menuDirection?: 'up' | 'down' | 'left' | 'right';
  satellitesDirection?: 'up' | 'down' | 'left' | 'right';
}

export interface ThinkingTabInfo {
  tabId: number;
  service: 'gemini' | 'flow' | 'youtube' | 'other';
  title: string;
}

export type IpcAction =
  | { type: 'OMNI_TOGGLE' }
  | { type: 'TELEMETRY_DETECTED'; payload: WizGlobalData }
  | { type: 'SWITCH_GOOGLE_ACCOUNT'; payload: { email: string; targetUrl?: string } }
  | { type: 'SET_PREFERRED_GOOGLE_ACCOUNT'; payload: { email: string } }
  | { type: 'GET_PREFERRED_GOOGLE_ACCOUNT' }
  | { type: 'UPDATE_ACTIVE_EMAIL'; payload: { email: string } }
  | { type: 'OPEN_SPLIT_WINDOWS'; payload: { profileA?: number; profileB?: number; emailA?: string; emailB?: string; targetUrl?: string } }
  | { type: 'TAB_THINKING_UPDATE'; payload: { isThinking: boolean; service: 'gemini' | 'flow' | 'youtube' | 'other'; title: string } }
  | { type: 'GET_THINKING_TABS' }
  | { type: 'THINKING_TABS_CHANGED'; payload: ThinkingTabInfo[] }
  | { type: 'FOCUS_TAB_REQUEST'; payload: { tabId: number } }
  | { type: 'PLAY_COMPLETION_PING'; payload: { tabTitle: string } };

export interface IpcResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ExtensionModule {
  id: ModuleId;
  name: string;
  version: string;
  isAvailableOn(url: URL): boolean;
  mount(shadowRoot: ShadowRoot): Promise<void>;
  unmount(): Promise<void>;
}
