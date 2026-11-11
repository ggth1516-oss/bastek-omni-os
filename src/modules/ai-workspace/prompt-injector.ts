/**
 * Bastek Omni-OS // AI Workspace - Prompt Injector
 * Bezpieczne wstrzykiwanie tekstu do pola wprowadzania Gemini (rich-textarea / Quill / ProseMirror).
 * Maksymalny rozmiar pliku: < 90 linii.
 */

export class PromptInjector {
  injectText(text: string, submitImmediately = false): boolean {
    const richInput = document.querySelector('rich-textarea p, rich-textarea .ql-editor, rich-textarea [contenteditable="true"]');
    const plainInput = document.querySelector('textarea.textarea, textarea');

    if (richInput) {
      (richInput as HTMLElement).focus();
      // Czyszczenie domyślnego pustego akapitu
      if (richInput.textContent?.trim() === '') {
        richInput.innerHTML = '';
      }
      document.execCommand('insertText', false, text);
      richInput.dispatchEvent(new Event('input', { bubbles: true }));

      if (submitImmediately) {
        this.clickSendButton();
      }
      return true;
    } else if (plainInput) {
      const inputEl = plainInput as HTMLTextAreaElement;
      inputEl.focus();
      inputEl.value = text;
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));

      if (submitImmediately) {
        this.clickSendButton();
      }
      return true;
    }
    return false;
  }

  private clickSendButton(): void {
    setTimeout(() => {
      const sendBtn = document.querySelector<HTMLButtonElement>(
        'button.send-button, [aria-label*="Wyślij"], [aria-label*="Send"], button[mat-icon-button].send-button'
      );
      if (sendBtn && !sendBtn.disabled) {
        sendBtn.click();
      }
    }, 100);
  }
}
