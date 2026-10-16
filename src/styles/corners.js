// The single source of corner sizes, in pixels. Change this scale to resize
// the whole collection, or change an individual role below, then rebuild.
export const cornerScale = 1;
export const cornerSizes = Object.freeze({
  card: 12,
  control: 8,
  icon: 8,
  popup: 16,
  small: 4,
  indicator: 2,
  editor: 6,
  tab: 3,
  handle: 1,
});

export function createCornerProperties(sizes = cornerSizes, scale = cornerScale) {
  const properties = Object.fromEntries(Object.entries(sizes).map(([role, size]) => [
    `--lovely-default-radius-${role}`, `${size * scale}px`,
  ]));

  // The onboarding drawings use container units. Derive their scaled corners
  // from the same sizes as the real components, using their design widths.
  for (const role of ['card', 'control', 'popup', 'handle']) {
    const designWidth = role === 'handle' ? 210 : 280;
    const size = Math.round(sizes[role] * scale * 100 / designWidth * 100) / 100;
    properties[`--lovely-default-preview-radius-${role}`] = `${size}cqw`;
  }
  return properties;
}

export const cornerProperties = Object.freeze(createCornerProperties());

// Only Lovely-owned scopes receive these private fallback properties. Public
// --lovely-radius-* / --lovely-radius overrides are resolved at the component,
// so inherited theme values and local overrides keep their normal precedence.
export const cornerStyles = `:host, .lovely-corner-scope {\n${
  Object.entries(cornerProperties).map(([name, value]) => `  ${name}: ${value};`).join('\n')
}\n}\n`;

// For elements mounted directly under <body>, outside a card's shadow root.
export function applyCornerDefaults(element) {
  for (const [name, value] of Object.entries(cornerProperties)) {
    element.style?.setProperty?.(name, value);
  }
}
