/**
 * Bastek Omni-OS // Google Material Design 3 - Speed Dial & Panels
 * Satelity kart, kaskadowe przyciski rozszerzające się w pigułki, okienko dokowane (z obsługą zmiennych --omni-*).
 * Maksymalny rozmiar pliku: < 170 linii.
 */

export const THEME_COMPONENTS_CSS = `
  /* 1. Satelity myślących kart (rosnące pionowo na górze kulki) */
  .orb-satellites-top {
    position: absolute;
    bottom: 72px;
    display: flex;
    flex-direction: column-reverse;
    gap: 10px;
    align-items: center;
    pointer-events: auto;
    z-index: 2;
  }
  .satellite-bubble {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: var(--omni-bg-base, #1e1f20);
    border: 1px solid var(--omni-border-subtle, #444746);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--omni-accent-primary, #a8c7fa);
    cursor: pointer;
    position: relative;
    box-shadow: 0 4px 16px rgba(0,0,0,0.6);
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .satellite-bubble:hover {
    transform: scale(1.15);
    border-color: var(--omni-border-active, #a8c7fa);
    background: var(--omni-bg-surface, #282a2c);
  }
  .satellite-dot-pulse {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #10b981;
    border: 2px solid var(--omni-bg-base, #1e1f20);
    box-shadow: 0 0 10px #10b981;
    animation: pulseSatellite 1.5s infinite ease-in-out;
  }
  @keyframes pulseSatellite {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.35); opacity: 0.65; }
  }

  /* 2. Pozioma kaskada podkulek (wysuwająca się w bok) */
  .cascade-stack-left {
    position: absolute;
    right: 72px;
    display: flex;
    flex-direction: row-reverse;
    gap: 12px;
    align-items: center;
    pointer-events: none;
    opacity: 0;
    transform: translateX(18px);
    transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 2147483641;
  }
  .cascade-stack-left.is-open {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
  }

  /* Kulka menu podręcznego - stała średnica 44px, zero skakania menu */
  .dial-sub-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--omni-bg-base, #1e1f20);
    border: 1px solid var(--omni-border-subtle, #444746);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #c4c7c5;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
    position: relative;
    padding: 0;
    flex-shrink: 0;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.18s, border-color 0.18s, color 0.18s, box-shadow 0.18s;
  }
  .dial-icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: inherit;
    transition: color 0.18s;
  }
  .dial-sub-btn:hover {
    transform: scale(1.12);
    background: var(--omni-bg-surface, #282a2c);
    border-color: var(--omni-border-active, #a8c7fa);
    color: var(--omni-accent-primary, #a8c7fa);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
  }
  .dial-sub-btn.is-active {
    background: var(--omni-bg-surface, #282a2c);
    border-color: var(--omni-border-active, #a8c7fa);
    box-shadow: 0 0 16px var(--omni-accent-glow, rgba(168, 199, 250, 0.4));
    color: var(--omni-accent-primary, #a8c7fa);
  }

  /* Pływająca etykieta informacyjna (tooltip) po najechaniu */
  .dial-tooltip {
    position: absolute;
    bottom: 54px;
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    background: var(--omni-bg-surface, #282a2c);
    border: 1px solid var(--omni-border-subtle, #444746);
    color: var(--omni-text-primary, #f1f3f4);
    font-size: 12px;
    font-weight: 500;
    padding: 5px 12px;
    border-radius: 8px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
    transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.2, 0, 0, 1);
    z-index: 10;
  }
  .dial-sub-btn:hover .dial-tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  .dial-sub-btn.is-active .dial-tooltip,
  .dial-sub-btn:active .dial-tooltip,
  .cascade-stack-left.has-active .dial-tooltip {
    opacity: 0 !important;
    display: none !important;
    pointer-events: none !important;
  }
  .cascade-stack-left.tooltip-flip-bottom .dial-tooltip {
    bottom: auto;
    top: 54px;
    transform: translateX(-50%) translateY(-4px);
  }
  .cascade-stack-left.tooltip-flip-bottom .dial-sub-btn:hover .dial-tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  /* 3. Okienko dokowane (Zadokowane bezpiecznie obok kulek) */
  .docked-panel {
    position: absolute;
    bottom: 84px;
    right: 0;
    width: 410px;
    max-width: calc(100vw - 32px);
    max-height: min(540px, calc(100vh - 120px));
    background: var(--omni-bg-base, #1e1f20);
    border: 1px solid var(--omni-border-subtle, #444746);
    border-radius: var(--omni-radius-panel, 20px);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(var(--omni-blur-panel, 16px));
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 2147483642;
    opacity: 0;
    pointer-events: none;
    transform: translateY(16px) scale(0.96);
    transition: all 0.26s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .docked-panel.is-open {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0) scale(1);
  }
  .panel-header {
    padding: 14px 20px;
    border-bottom: 1px solid var(--omni-border-subtle, #2d2f31);
    background: var(--omni-bg-surface, #282a2c);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .panel-header-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--omni-text-primary, #f1f3f4);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .panel-close-btn {
    background: transparent;
    border: none;
    color: var(--omni-text-muted, #c4c7c5);
    width: 32px;
    height: 32px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.15s;
  }
  .panel-close-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }
  .panel-body {
    padding: 16px 18px;
    overflow-y: auto;
    flex: 1;
  }
`;
