# Bastek Omni-OS // Tactical Cockpit

> **Zunifikowane Rozszerzenie Przeglądarki (Manifest V3)**  
> Architektura: Micro-Kernel | Język: TypeScript | Izolacja: Shadow DOM | Stylistyka: Google Workspace Dark M3 & Live Style Themes

---

## Zasady Projektowe i Inwarianty Kodu (Dla Agentów i Deweloperów)

1. **Limit 250 linii na plik**: Każdy plik źródłowy (`src/**/*.ts`) musi mieć bezwzględnie **<= 250 linii**. Proaktywne wydzielanie logiki do podmodułów (dyspozytory, detektory, modale).
2. **Standard 100% SVG (Zero emotikonów)**: Absolutny zakaz emoji w kodzie, UI, dokumentacji i logach. Wszystkie ikony to wektory SVG w stylistyce Google Material Design 3.
3. **Zakaz usuwania funkcji (Zero regresji)**: Nigdy nie usuwaj, nie redukuj ani nie zastępuj atrapami istniejących funkcji ani kont w rejestrach. Niezalogowane stany wyszarzaj z przyciskiem akcji (`Połącz`).
4. **Pytaj przy niepewności (Stop & Verify)**: W razie wątpliwości architektonicznych lub dwuznaczności przedstaw opcje i zapytaj użytkownika przed wykonaniem inwazyjnych zmian.
5. **Weryfikacja działania**: Każda zmiana musi przejść `pnpm run lint` oraz `pnpm run build` bez błędów konsoli i bez zakłócania innych serwisów (ścisła separacja logiki YouTube vs Gemini).
6. **Pozycjonowanie, przypinanie DOM i pamięć per-domena**:
   - W stałych punktach (rogi, przypięcie) ruch swobodny jest **zablokowany** (`freeMode = false`, kursor `pointer`). Odblokowuje go wyłącznie przycisk `Dowolne`.
   - Każda domena pamięta swoje położenie w `chrome.storage.local`, a w trybie przypięcia (`pinnedSelector`) kulka dynamicznie śledzi pozycję elementu DOM przy przewijaniu i zmianie rozmiaru okna.
   - Przypinanie zawiera Krok 2 (wybór kierunku rozwijania Speed Dial i satelitów procesów).
7. **Autoryzacja Google (AccountChooser 2.0)**:
   - Wykorzystanie `https://accounts.google.com/AccountChooser?Email=<email>&continue=<url>`.
   - Inteligentna weryfikacja aktywnego konta na stronach Google bez pętli przekierowań.
8. **Prototypowanie Stylu i Motywy (Style Lab)**:
   - Podgląd i edycja zmiennych CSS (`--omni-*`) na żywo znajduje się w `demo/index.html`, a 6 predefiniowanych motywów jest dostępnych bezpośrednio w panelu Ustawień.

---

## Główne Moduły Systemu

1. **AI Workspace (Gemini & Flow Bridge)**:
   * Telemetria sesji i licznik tokenów na żywo (`1M context`), pełna szerokość layoutu, blokada skakania ekranu (`scroll-lock`), tryb Zen, boczna oś czasu dialogu z podglądem zapytań.
   * Natywny eksport czatów do Markdown, archiwum ZIP (CRC32), ekstrakcja projektów z Canvas oraz bezpośredni zapis do skarbca Obsidian.
2. **Cinema OS (YouTube & HTML5 Video)**:
   * Format 21:9 Ultrawide, zoptymalizowany 4-punktowy Ambient Glow, płynna zmiana tempa odtwarzania (`[` / `]`), zrzuty klatek 4K i eksport notatek studyjnych z linkiem czasowym.
3. **Identity Switcher & MCP Accounts**:
   * Pełna synchronizacja z 6 kontami z rejestru MCP.
   * Bezpieczne przełączanie przez `AccountChooser` oraz tryb Split-View dla dwóch profili obok siebie.
4. **Clipboard Store (Schowek D&D)**:
   * Przechwytywanie tekstu, kodu, linków, zdjęć i plików z ochroną przed XSS i kontrolą limitów pamięci.
   * Upuszczanie obiektów bezpośrednio na główną kulkę (FAB).
5. **Local Mesh Bridge**:
   * Połączenie z lokalnym daemonem VaultBridge na porcie 27123 (`/MAIN/dane/theworks-vault/prompty`) — zapis notatek oraz pobieranie i wstrzykiwanie szablonów promptów jednym kliknięciem.

---

## Budowanie i Instalacja

```bash
# Wewnątrz katalogu bastek-omni-os:
pnpm run lint
pnpm run build

# Opcjonalnie uruchomienie lokalnego daemona Obsidian Vault Bridge (port 27123):
pnpm run daemon
```

Wczytanie w Google Chrome / Brave:
1. Wejdź na `chrome://extensions/`.
2. Włącz **Tryb programisty (Developer mode)**.
3. Kliknij **Załaduj rozpakowane (Load unpacked)**.
4. Wybierz folder: `dist/`.
