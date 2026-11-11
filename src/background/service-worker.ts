/**
 * Bastek Omni-OS // Background Service Worker
 * Zarządza stanem myślących kart (z trwałością w chrome.storage.session),
 * powiadomieniami, oknami Split-View, ikoną paska akcji i skrótami.
 * Maksymalny rozmiar pliku: < 200 linii.
 */

import { MessageBus } from '../core/bus';
import type { IpcAction, IpcResponse, ThinkingTabInfo } from '../types';

console.log('[Bastek Omni-OS] Background Service Worker initialized.');

const SESSION_TABS_KEY = 'bastek_omni_thinking_tabs';
const activeThinkingTabs = new Map<number, ThinkingTabInfo>();

async function syncFromSessionStorage(): Promise<void> {
  try {
    if (chrome.storage?.session) {
      const data = await chrome.storage.session.get(SESSION_TABS_KEY);
      const list = data[SESSION_TABS_KEY] as ThinkingTabInfo[] | undefined;
      if (Array.isArray(list)) {
        activeThinkingTabs.clear();
        for (const item of list) {
          activeThinkingTabs.set(item.tabId, item);
        }
      }
    }
  } catch {}
}

async function persistThinkingTabs(): Promise<ThinkingTabInfo[]> {
  const tabsList = Array.from(activeThinkingTabs.values());
  try {
    if (chrome.storage?.session) {
      await chrome.storage.session.set({ [SESSION_TABS_KEY]: tabsList });
    }
  } catch {}
  return tabsList;
}

async function broadcastThinkingTabs(): Promise<void> {
  const tabsList = await persistThinkingTabs();
  const allTabs = await chrome.tabs.query({});
  for (const tab of allTabs) {
    if (tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'THINKING_TABS_CHANGED',
          payload: tabsList
        });
      } catch {}
    }
  }
}

async function notifyTabFinished(tabId: number, title: string): Promise<void> {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab || activeTab.id !== tabId) {
      if (chrome.notifications) {
        chrome.notifications.create(`omni-tab-${tabId}`, {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'Gemini: Odpowiedź jest gotowa!',
          message: `${title} - generowanie zakończone`,
          priority: 2
        });
      }
      if (activeTab?.id) {
        await chrome.tabs.sendMessage(activeTab.id, {
          type: 'PLAY_COMPLETION_PING',
          payload: { tabTitle: title }
        }).catch(() => {});
      }
    }
  } catch {}
}

syncFromSessionStorage();

chrome.tabs.onRemoved.addListener(async (tabId) => {
  await syncFromSessionStorage();
  if (activeThinkingTabs.has(tabId)) {
    activeThinkingTabs.delete(tabId);
    await broadcastThinkingTabs();
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    await syncFromSessionStorage();
    if (activeThinkingTabs.has(tabId)) {
      activeThinkingTabs.delete(tabId);
      await broadcastThinkingTabs();
    }
  }
});

if (chrome.notifications?.onClicked) {
  chrome.notifications.onClicked.addListener(async (notifId) => {
    if (notifId.startsWith('omni-tab-')) {
      const tabId = parseInt(notifId.replace('omni-tab-', ''), 10);
      if (tabId) {
        try {
          const tab = await chrome.tabs.get(tabId);
          await chrome.tabs.update(tabId, { active: true });
          if (tab.windowId) await chrome.windows.update(tab.windowId, { focused: true });
        } catch {}
      }
      chrome.notifications.clear(notifId);
    }
  });
}

if (chrome.commands?.onCommand) {
  chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'toggle-omni-bar') {
      await MessageBus.sendToActiveTab({ type: 'OMNI_TOGGLE' });
    }
  });
}

if (chrome.action?.onClicked) {
  chrome.action.onClicked.addListener(async () => {
    await MessageBus.sendToActiveTab({ type: 'OMNI_TOGGLE' });
  });
}

MessageBus.onMessage(async (action: IpcAction, sender): Promise<IpcResponse> => {
  await syncFromSessionStorage();

  switch (action.type) {
    case 'TAB_THINKING_UPDATE': {
      const tabId = sender.tab?.id;
      if (!tabId) return { success: false };

      const wasThinking = activeThinkingTabs.has(tabId);
      const isNowThinking = action.payload.isThinking;
      const tabTitle = action.payload.title || sender.tab?.title || 'Gemini Czat';

      if (isNowThinking) {
        activeThinkingTabs.set(tabId, {
          tabId,
          service: action.payload.service,
          title: tabTitle
        });
      } else {
        activeThinkingTabs.delete(tabId);
        if (wasThinking && !isNowThinking) {
          await notifyTabFinished(tabId, tabTitle);
        }
      }
      await broadcastThinkingTabs();
      return { success: true };
    }

    case 'OPEN_SPLIT_WINDOWS': {
      const curWin = await chrome.windows.getCurrent();
      const totalWidth = curWin.width || 1920;
      const totalHeight = curWin.height || 1080;
      const halfWidth = Math.floor(totalWidth / 2);

      const targetUrl = action.payload.targetUrl || 'https://gemini.google.com/app';
      const urlA = action.payload.emailA
        ? `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(action.payload.emailA)}&continue=${encodeURIComponent(targetUrl)}`
        : (targetUrl.includes('/u/') ? targetUrl.replace(/\/u\/\d+\//, `/u/${action.payload.profileA ?? 0}/`) : targetUrl);
      const urlB = action.payload.emailB
        ? `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(action.payload.emailB)}&continue=${encodeURIComponent(targetUrl)}`
        : (targetUrl.includes('/u/') ? targetUrl.replace(/\/u\/\d+\//, `/u/${action.payload.profileB ?? 1}/`) : targetUrl);

      await chrome.windows.create({ url: urlA, left: 0, top: 0, width: halfWidth, height: totalHeight, focused: true });
      await chrome.windows.create({ url: urlB, left: halfWidth, top: 0, width: halfWidth, height: totalHeight, focused: false });
      return { success: true };
    }

    case 'SWITCH_GOOGLE_ACCOUNT': {
      const { email, targetUrl } = action.payload;
      const dest = targetUrl || 'https://gemini.google.com/app';
      const chooserUrl = `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(email)}&continue=${encodeURIComponent(dest)}`;
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) await chrome.tabs.update(tab.id, { url: chooserUrl });
      return { success: true };
    }

    case 'UPDATE_ACTIVE_EMAIL': {
      const email = action.payload.email.toLowerCase();
      const data = await chrome.storage.local.get('bastek_omni_logged_in_emails');
      const set = new Set<string>(data.bastek_omni_logged_in_emails || []);
      set.add(email);
      await chrome.storage.local.set({ bastek_omni_logged_in_emails: Array.from(set), bastek_omni_current_email: email });
      return { success: true };
    }

    case 'GET_THINKING_TABS': {
      return { success: true, data: Array.from(activeThinkingTabs.values()) };
    }

    case 'FOCUS_TAB_REQUEST': {
      const tabId = action.payload.tabId;
      try {
        const tab = await chrome.tabs.get(tabId);
        await chrome.tabs.update(tabId, { active: true });
        if (tab.windowId) await chrome.windows.update(tab.windowId, { focused: true });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    case 'SET_PREFERRED_GOOGLE_ACCOUNT': {
      const email = action.payload.email.toLowerCase();
      await chrome.storage.local.set({ bastek_omni_preferred_email: email });
      return { success: true };
    }

    case 'GET_PREFERRED_GOOGLE_ACCOUNT': {
      const data = await chrome.storage.local.get('bastek_omni_preferred_email');
      return { success: true, data: data.bastek_omni_preferred_email || null };
    }

    case 'TELEMETRY_DETECTED': {
      await chrome.storage.local.set({ lastTelemetry: action.payload });
      return { success: true };
    }

    default:
      return { success: true };
  }
});
