/**
 * Bastek Omni-OS // Google Material Design 3 & Style Lab Themes - Base & Orb Styles
 * Definiuje zmienne CSS (--omni-*), 6 predefiniowanych motywów ze Style Lab oraz style Nexus Orb.
 * Maksymalny rozmiar pliku: < 180 linii.
 */

export const THEME_BASE_CSS = `
  :host {
    all: initial;
    font-family: 'Google Sans', 'Google Sans Text', Roboto, -apple-system, BlinkMacSystemFont, sans-serif;
    color-scheme: dark;

    /* Domyślny motyw Google M3 Dark */
    --omni-bg-base: #1e1f20;
    --omni-bg-surface: #282a2c;
    --omni-accent-primary: #a8c7fa;
    --omni-accent-glow: rgba(168, 199, 250, 0.38);
    --omni-text-primary: #e3e3e3;
    --omni-text-muted: #8e918f;
    --omni-border-subtle: #444746;
    --omni-border-active: #a8c7fa;
    --omni-orb-size: 60px;
    --omni-radius-panel: 20px;
    --omni-blur-panel: 16px;
  }

  :host([data-theme="obsidian"]) {
    --omni-bg-base: #121214;
    --omni-bg-surface: #1c1b22;
    --omni-accent-primary: #c58af9;
    --omni-accent-glow: rgba(197, 138, 249, 0.4);
    --omni-border-subtle: #3c3846;
    --omni-border-active: #c58af9;
    --omni-radius-panel: 14px;
  }

  :host([data-theme="matrix"]) {
    --omni-bg-base: #0a1410;
    --omni-bg-surface: #11221b;
    --omni-accent-primary: #34d399;
    --omni-accent-glow: rgba(52, 211, 153, 0.4);
    --omni-border-subtle: #1b3b2f;
    --omni-border-active: #34d399;
    --omni-radius-panel: 10px;
  }

  :host([data-theme="neon"]) {
    --omni-bg-base: #0b132b;
    --omni-bg-surface: #1c2541;
    --omni-accent-primary: #38bdf8;
    --omni-accent-glow: rgba(56, 189, 248, 0.4);
    --omni-border-subtle: #3a506b;
    --omni-border-active: #38bdf8;
    --omni-radius-panel: 20px;
  }

  :host([data-theme="titanium"]) {
    --omni-bg-base: #18191c;
    --omni-bg-surface: #232529;
    --omni-accent-primary: #e2e8f0;
    --omni-accent-glow: rgba(226, 232, 240, 0.35);
    --omni-border-subtle: #393c43;
    --omni-border-active: #e2e8f0;
    --omni-radius-panel: 14px;
  }

  :host([data-theme="solar"]) {
    --omni-bg-base: #201c18;
    --omni-bg-surface: #2d2720;
    --omni-accent-primary: #fbc02d;
    --omni-accent-glow: rgba(251, 192, 45, 0.4);
    --omni-border-subtle: #4d4236;
    --omni-border-active: #fbc02d;
    --omni-radius-panel: 18px;
  }

  /* Dynamiczny kontener orba */
  .orb-dock {
    position: fixed;
    z-index: 2147483640;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    transition: transform 0.15s ease-out;
    user-select: none;
  }

  /* 1. Główna Kulka (Nexus Orb) */
  .main-orb-wrapper {
    position: relative;
    width: var(--omni-orb-size, 60px);
    height: var(--omni-orb-size, 60px);
    flex-shrink: 0;
  }

  .main-orb {
    width: var(--omni-orb-size, 60px);
    height: var(--omni-orb-size, 60px);
    border-radius: 50%;
    background: var(--omni-bg-base);
    border: 1px solid var(--omni-border-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--omni-accent-primary);
    cursor: grab;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6);
    position: relative;
    z-index: 2;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s, border-color 0.2s, box-shadow 0.2s;
  }
  .main-orb:active {
    cursor: grabbing;
  }
  .main-orb:hover {
    transform: scale(1.08);
    background: var(--omni-bg-surface);
    border-color: var(--omni-border-active);
    box-shadow: 0 8px 30px var(--omni-accent-glow);
  }
  .main-orb.is-open {
    transform: rotate(45deg);
    border-color: var(--omni-border-active);
    background: var(--omni-bg-surface);
  }
  .main-orb.is-drag-target {
    transform: scale(1.22) !important;
    border-color: #10b981 !important;
    background: #1a382b !important;
    box-shadow: 0 0 24px rgba(16, 185, 129, 0.7) !important;
  }

  /* Kręcący się tęczowy pierścień aktywnego myślenia */
  .main-orb-spinner {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, #4285f4, #9b72cb, #d96570, #f2a600, #4285f4);
    z-index: 1;
    animation: spinHalo 1.5s linear infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
    filter: blur(1.5px);
  }
  .main-orb-spinner.is-active {
    opacity: 1;
  }
  @keyframes spinHalo {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Badge liczby aktywnych procesów */
  .process-counter-badge {
    position: absolute;
    top: -3px;
    right: -3px;
    background: #1a73e8;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    display: none;
    align-items: center;
    justify-content: center;
    border: 2px solid #131314;
    z-index: 3;
    box-shadow: 0 2px 8px rgba(0,0,0,0.6);
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .process-counter-badge.is-visible {
    display: flex;
  }

  /* Snackbar / Toast */
  .google-toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    background: var(--omni-bg-surface, #323232);
    border: 1px solid var(--omni-border-subtle, #444746);
    color: var(--omni-text-primary, #f1f3f4);
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 13px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    opacity: 0;
    transition: all 0.2s cubic-bezier(0.2,0,0,1);
    pointer-events: none;
    z-index: 2147483647;
  }
  .google-toast.is-show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
`;
