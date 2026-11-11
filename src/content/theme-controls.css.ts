/**
 * Bastek Omni-OS // Google Material Design 3 - Control Styles
 * Elementy wewnątrz paneli: wiersze, przełączniki M3 Switch, siatka rogu, motywy i wyszukiwarka.
 * Maksymalny rozmiar pliku: < 190 linii.
 */

export const THEME_CONTROLS_CSS = `
  /* 1. Pozycje wierszy wewnątrz paneli */
  .m3-row-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.15s;
    margin-bottom: 4px;
  }
  .m3-row-item:hover {
    background: var(--omni-bg-surface, #282a2c);
  }
  .m3-row-item:hover .m3-row-title {
    color: var(--omni-accent-primary, #a8c7fa);
  }
  .m3-row-title {
    font-size: 13.5px;
    font-weight: 500;
    color: var(--omni-text-primary, #e3e3e3);
  }

  /* 2. Przełączniki Material 3 Switch */
  .m3-switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 8px;
    border-radius: 12px;
    transition: background 0.15s;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }
  .m3-switch-row:hover {
    background: var(--omni-bg-surface, #282a2c);
  }
  .m3-switch-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-right: 14px;
  }
  .m3-switch-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--omni-text-primary, #e3e3e3);
  }
  .m3-switch-sub {
    font-size: 11px;
    color: var(--omni-text-muted, #8e918f);
  }
  .m3-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 26px;
    flex-shrink: 0;
  }
  .m3-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .m3-slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: #36393e;
    border: 2px solid #8e918f;
    border-radius: 26px;
    transition: all 0.2s ease;
  }
  .m3-slider::before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 4px;
    bottom: 4px;
    background-color: #8e918f;
    border-radius: 50%;
    transition: all 0.2s ease;
  }
  .m3-switch input:checked + .m3-slider {
    background-color: var(--omni-accent-primary, #a8c7fa);
    border-color: var(--omni-accent-primary, #a8c7fa);
  }
  .m3-switch input:checked + .m3-slider::before {
    transform: translateX(18px);
    background-color: #041e49;
    width: 18px;
    height: 18px;
    bottom: 2px;
    left: 2px;
  }

  /* 3. Siatka wyboru rogu i trybów pozycjonowania */
  .corner-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 8px 0;
  }
  .corner-option-btn,
  .theme-preset-btn {
    background: var(--omni-bg-base, #1e1f20);
    border: 1px solid var(--omni-border-subtle, #444746);
    border-radius: 10px;
    padding: 8px 10px;
    color: #c4c7c5;
    font-size: 11.5px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.15s;
  }
  .corner-option-btn:hover,
  .theme-preset-btn:hover {
    border-color: var(--omni-border-active, #a8c7fa);
    background: var(--omni-bg-surface, #282a2c);
    color: #f1f3f4;
  }
  .corner-option-btn.is-active,
  .theme-preset-btn.is-active {
    border-color: var(--omni-border-active, #a8c7fa);
    background: var(--omni-bg-surface, #282a2c);
    color: var(--omni-accent-primary, #a8c7fa);
    box-shadow: 0 0 12px var(--omni-accent-glow, rgba(168, 199, 250, 0.25));
  }
  .corner-dot-box {
    width: 14px;
    height: 14px;
    border: 1px solid #5e6260;
    border-radius: 3px;
    position: relative;
    flex-shrink: 0;
  }
  .corner-dot-box::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #8e918f;
  }
  .corner-dot-tl::after { top: 2px; left: 2px; }
  .corner-dot-tr::after { top: 2px; right: 2px; }
  .corner-dot-bl::after { bottom: 2px; left: 2px; }
  .corner-dot-br::after { bottom: 2px; right: 2px; }
  .corner-option-btn.is-active .corner-dot-box {
    border-color: var(--omni-accent-primary, #a8c7fa);
  }
  .corner-option-btn.is-active .corner-dot-box::after {
    background: var(--omni-accent-primary, #a8c7fa);
    box-shadow: 0 0 4px var(--omni-accent-primary, #a8c7fa);
  }
  .pos-mode-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 10px;
  }
  .pos-mode-btn {
    background: var(--omni-bg-surface, #282a2c);
    border: 1px solid var(--omni-border-subtle, #444746);
    border-radius: 10px;
    padding: 8px 12px;
    color: var(--omni-accent-primary, #a8c7fa);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.15s;
  }
  .pos-mode-btn:hover {
    border-color: var(--omni-border-active, #a8c7fa);
    color: #fff;
  }
  .pos-mode-btn.is-active {
    background: rgba(168, 199, 250, 0.18);
    border-color: var(--omni-border-active, #a8c7fa);
    color: #fff;
  }

  /* 4. Pole wyszukiwania */
  .m3-search-pill {
    display: flex;
    align-items: center;
    background: #131314;
    border: 1px solid var(--omni-border-subtle, #444746);
    border-radius: 24px;
    padding: 8px 14px;
    margin-bottom: 12px;
    gap: 10px;
  }
  .m3-search-input {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--omni-text-primary, #e3e3e3);
    font-family: inherit;
    font-size: 13px;
    outline: none;
  }
  .m3-search-input::placeholder {
    color: var(--omni-text-muted, #8e918f);
  }
`;
