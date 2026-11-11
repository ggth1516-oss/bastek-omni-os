import type { IpcAction, IpcResponse } from '../types';

export class MessageBus {
  /**
   * Wysyła wiadomość z Content Script do Service Workera
   */
  static async sendToBackground<T = unknown>(action: IpcAction): Promise<IpcResponse<T>> {
    try {
      return await chrome.runtime.sendMessage(action);
    } catch (err) {
      console.warn('[BastekBus] Background offline or unreachable:', err);
      return { success: false, error: (err as Error).message };
    }
  }

  /**
   * Wysyła wiadomość z Background do aktywnej karty
   */
  static async sendToActiveTab<T = unknown>(action: IpcAction): Promise<IpcResponse<T> | undefined> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        return await chrome.tabs.sendMessage(tab.id, action);
      }
    } catch (err) {
      console.warn('[BastekBus] Could not message active tab:', err);
    }
    return undefined;
  }

  /**
   * Rejestruje nasłuchiwacz zdarzeń IPC
   */
  static onMessage(handler: (action: IpcAction, sender: chrome.runtime.MessageSender) => Promise<IpcResponse | void> | void): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const result = handler(message as IpcAction, sender);
      if (result instanceof Promise) {
        result.then(sendResponse).catch((err) => sendResponse({ success: false, error: err.message }));
        return true; // Keep message channel open for async response
      } else if (result !== undefined) {
        sendResponse(result);
      }
      return false;
    });
  }
}
