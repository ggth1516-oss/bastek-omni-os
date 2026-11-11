/**
 * Inicjalizuje bezpieczny, odizolowany kontener Shadow DOM.
 * Chroni przed wyciekiem stylów strony głównej (all: initial) oraz uniemożliwia
 * stronie ingerencję w wewnętrzne elementy interfejsu Aether.
 */
export function createIsolatedShadowHost(hostId = 'bastek-omni-cockpit-root'): ShadowRoot {
  const existing = document.getElementById(hostId);
  if (existing && existing.shadowRoot) {
    return existing.shadowRoot;
  }

  const host = document.createElement('div');
  host.id = hostId;
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '0';
  host.style.width = '100vw';
  host.style.height = '0';
  host.style.zIndex = '2147483647'; // Najwyższa możliwa warstwa
  host.style.pointerEvents = 'none'; // Domyślnie przepuszcza kliki, aktywowane w overlayu

  const shadowRoot = host.attachShadow({ mode: 'open' });

  // Reset stylów wewnątrz Shadow DOM
  const resetStyle = document.createElement('style');
  resetStyle.textContent = `
    :host {
      all: initial;
      font-family: 'JetBrains Mono', -apple-system, BlinkMacSystemFont, monospace;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
  `;
  shadowRoot.appendChild(resetStyle);

  document.documentElement.appendChild(host);
  return shadowRoot;
}
