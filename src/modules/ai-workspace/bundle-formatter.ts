/**
 * Bastek Omni-OS // AI Workspace - Bundle Formatter
 * Generowanie strukturalnego pakietu Markdown z drzewem ASCII plików i obrazami. ZERO emotikon.
 * Maksymalny rozmiar pliku: < 100 linii.
 */

import type { ConversationTurn } from './scraper';

export class BundleFormatter {
  formatAsAiBundle(turns: ConversationTurn[], title: string, modelName: string): string {
    const allFiles: { name: string; lang: string; code: string }[] = [];
    let fileCounter = 1;

    turns.forEach((turn) => {
      turn.codeBlocks.forEach((cb) => {
        const name = cb.suggestedFilename || `code/snippet-${fileCounter}.${cb.language || 'txt'}`;
        allFiles.push({ name, lang: cb.language, code: cb.code });
        fileCounter++;
      });
    });

    let output = `# ${title}\n\n`;
    output += `> Wygenerowano przez: **Bastek Omni-OS // AI Workspace**\n`;
    output += `> Model: ${modelName} | Liczba kroków: ${turns.length} | Wyodrębnione pliki: ${allFiles.length}\n\n`;

    if (allFiles.length > 0) {
      output += `## Indeks Wyekstrahowanych Plików\n\`\`\`text\n`;
      allFiles.forEach((f) => {
        output += `├── ${f.name}\n`;
      });
      output += `\`\`\`\n\n---\n\n`;
    }

    output += `## Przebieg Konwersacji\n\n`;
    turns.forEach((t, i) => {
      if (t.userText) output += `### Prompt #${i + 1}\n\n${t.userText}\n\n`;
      if (t.modelText) output += `### Odpowiedź #${i + 1}\n\n${t.modelText}\n\n`;

      if (t.images && t.images.length > 0) {
        output += `#### Załączone obrazy (${t.images.length}):\n\n`;
        t.images.forEach((img, imgIdx) => {
          output += `![${img.alt}](images/step-${i + 1}-img-${imgIdx + 1}.png)\n\n`;
        });
      }
      output += `---\n\n`;
    });

    if (allFiles.length > 0) {
      output += `## Zawartość Plików Kodu\n\n`;
      allFiles.forEach((f) => {
        output += `### Plik: \`${f.name}\`\n\`\`\`${f.lang}\n${f.code}\n\`\`\`\n\n`;
      });
    }

    return output;
  }
}
