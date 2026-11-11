#!/usr/bin/env node
/**
 * Bastek Omni-OS // Local Mesh - Obsidian Vault Bridge Daemon
 * Serwer HTTP w czystym Node.js zapisujący notatki i udostępniający prompty z theworks-vault.
 * Port: 27123
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 27123;
const VAULT_DIR = '/Users/rudy/Documents/bastek/MAIN/dane/theworks-vault';
const PROMPTS_DIR = path.join(VAULT_DIR, 'prompty');

if (!fs.existsSync(VAULT_DIR)) fs.mkdirSync(VAULT_DIR, { recursive: true });
if (!fs.existsSync(PROMPTS_DIR)) fs.mkdirSync(PROMPTS_DIR, { recursive: true });

// Wstępne szablony promptów jeśli folder jest pusty
const SEED_PROMPTS = [
  {
    name: 'architektura-modulowa.md',
    content: `# Architektura modułowa (<250 linii)
Przestrzegaj ścisłej zasady modułowości: każdy plik TypeScript/JavaScript musi mieć poniżej 250 linii kodu. Dziel logikę na małe, dedykowane komponenty bez powtórzeń.`
  },
  {
    name: 'anti-slop-filter.md',
    content: `# Anti-Slop Filter
Utrzymuj absolutną dyscyplinę inżynieryjną: zero emotikon, czysty kod, czytelne komentarze techniczne i bezpośrednie rozwiązania.`
  },
  {
    name: 'analiza-kodu.md',
    content: `# Analiza Kodu i Refaktoryzacja
Dokonaj dogłębnej analizy struktury: sprawdź szczelność typów TypeScript, brak wycieków pamięci i optymalizację renderowania DOM.`
  }
];

for (const seed of SEED_PROMPTS) {
  const p = path.join(PROMPTS_DIR, seed.name);
  if (!fs.existsSync(p)) fs.writeFileSync(p, seed.content, 'utf-8');
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);

  // Status & Health
  if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/status')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', vault: VAULT_DIR, prompts: PROMPTS_DIR }));
    return;
  }

  // Lista promptów z Obsidian
  if (req.method === 'GET' && url.pathname === '/prompts') {
    try {
      const files = fs.readdirSync(PROMPTS_DIR).filter((f) => f.endsWith('.md'));
      const promptList = files.map((f) => {
        const fullPath = path.join(PROMPTS_DIR, f);
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const lines = raw.split('\n');
        const title = lines[0]?.replace(/^#*\s*/, '').trim() || f.replace('.md', '');
        const promptText = lines.slice(1).join('\n').trim() || title;
        return {
          id: f.replace('.md', ''),
          title,
          desc: promptText.slice(0, 65) + (promptText.length > 65 ? '...' : ''),
          promptText
        };
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, prompts: promptList }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // Zapis notatki do vaulta
  if ((req.method === 'PUT' || req.method === 'POST') && url.pathname.startsWith('/vault/')) {
    const rawFilename = decodeURIComponent(url.pathname.replace('/vault/', ''));
    const safeFilename = path.basename(rawFilename).replace(/[^\w\s.-]/gi, '_');
    const targetPath = path.join(VAULT_DIR, safeFilename.endsWith('.md') ? safeFilename : `${safeFilename}.md`);

    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const content = Buffer.concat(chunks).toString('utf-8');
      try {
        fs.writeFileSync(targetPath, content, 'utf-8');
        console.log(`[VaultBridge] Zapisano notatkę: ${targetPath}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, file: targetPath }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[VaultBridge Daemon] Aktywny na http://127.0.0.1:${PORT}`);
  console.log(`[VaultBridge Daemon] Prompty Obsidian: ${PROMPTS_DIR}`);
});
