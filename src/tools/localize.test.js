import { afterEach, describe, expect, jest, test } from '@jest/globals';

const originalGlobals = Object.fromEntries(
  ['window', 'document', 'localStorage', 'fetch'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)])
);

afterEach(() => {
  for (const [key, descriptor] of Object.entries(originalGlobals)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
});

describe('editor translations in installed Lovely Card', () => {
  test.each([
    ['HACS', '/hacsfiles/lovely-card/'],
    ['manual', '/local/lovely-card/'],
  ])('loads translations for a %s install without a script element', async (_, base) => {
    jest.resetModules();
    globalThis.window = { dispatchEvent: jest.fn() };
    globalThis.document = { currentScript: null, querySelector: () => null };
    globalThis.localStorage = { length: 0, getItem: () => null, setItem: jest.fn() };
    const dict = { editor: { common: { name: 'Name from installed dictionary' } } };
    globalThis.fetch = jest.fn(async url => ({
      ok: url.startsWith(base),
      json: async () => dict,
    }));

    const { default: setupTranslation, ensureEditorTranslations } = await import('./localize.js');
    const hass = { locale: { language: 'de' } };

    expect(await ensureEditorTranslations(hass)).toBe(true);
    expect(setupTranslation(hass)('editor.common.name')).toBe('Name from installed dictionary');
    expect(fetch).toHaveBeenLastCalledWith(
      expect.stringMatching(`^${base}lovely-card-de\\.json\\?v=`),
      expect.any(Object)
    );
    expect(fetch.mock.calls.every(([url]) => !url.includes('Bubble-Card'))).toBe(true);
  });
});
