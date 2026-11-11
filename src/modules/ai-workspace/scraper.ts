/**
 * Bastek Omni-OS // AI Workspace - Conversation & Multimodal Scraper
 * Ekstrakcja zapytań użytkownika, odpowiedzi modelu, bloków kodu i wygenerowanych obrazów.
 * Maksymalny rozmiar pliku: < 120 linii.
 */

export interface ScrapedCodeBlock {
  language: string;
  code: string;
  suggestedFilename?: string;
}

export interface ScrapedImage {
  url: string;
  alt: string;
}

export interface ConversationTurn {
  userText: string;
  modelText: string;
  codeBlocks: ScrapedCodeBlock[];
  images: ScrapedImage[];
}

export class GeminiScraper {
  scrapeAllTurns(): ConversationTurn[] {
    const userNodes = Array.from(document.querySelectorAll(
      'user-query, .user-query, .user-query-container, [data-turn-role="user"], .query-text'
    ));

    const modelNodes = Array.from(document.querySelectorAll(
      'model-response, response-element, .model-response, .model-response-text, message-content'
    ));

    const total = Math.max(userNodes.length, modelNodes.length);
    const turns: ConversationTurn[] = [];

    for (let i = 0; i < total; i++) {
      const uEl = userNodes[i];
      const mEl = modelNodes[i];

      const userText = uEl?.textContent?.trim() || '';
      const modelText = mEl?.textContent?.trim() || '';

      const codeBlocks: ScrapedCodeBlock[] = [];
      const images: ScrapedImage[] = [];

      if (mEl) {
        // Ekstrakcja kodu
        const pres = mEl.querySelectorAll('pre, code-block, .code-container');
        pres.forEach((pre) => {
          const lang = pre.getAttribute('data-language') || 'txt';
          const code = pre.querySelector('code')?.textContent || pre.textContent || '';
          if (code.trim()) {
            const detectedName = this.extractFilenameFromCode(code);
            codeBlocks.push({
              language: lang,
              code: code.trim(),
              suggestedFilename: detectedName
            });
          }
        });

        // Ekstrakcja wygenerowanych obrazów
        const imgEls = mEl.querySelectorAll('img');
        imgEls.forEach((img) => {
          const src = img.src || img.getAttribute('src');
          if (src && !src.includes('avatar') && !src.includes('sparkle') && !src.includes('data:image/svg')) {
            images.push({
              url: src,
              alt: img.alt || 'generated-image'
            });
          }
        });
      }

      if (userText || modelText || images.length > 0) {
        turns.push({ userText, modelText, codeBlocks, images });
      }
    }

    return turns;
  }

  private extractFilenameFromCode(code: string): string | undefined {
    const firstLine = code.split('\n')[0].trim();
    const match = firstLine.match(/^(?:\/\/|#|\/\*|<!--)\s*(?:file:?\s*)?([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)/i);
    return match ? match[1] : undefined;
  }
}
