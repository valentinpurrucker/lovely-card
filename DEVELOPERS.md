# Developing Lovely Card

Lovely Card starts from Bubble Card v3.4.2 (`91a5c77`). `upstream` points to `Clooos/Bubble-Card`; `origin` is `valentinpurrucker/lovely-card`. Keep upstream history and the MIT license when extending or updating the fork.

## Build and test

```bash
npm ci
npm test -- --runInBand --forceExit
npm run dist
```

`dist/` contains the production `lovely-card.js` and its language dictionaries. `www/` holds a development build, or set `HA_PATH` in `.env` to a dedicated local HA resource directory. Do not point it at the original Bubble Card installation. Both resources can be registered together because their custom element names differ.

The upstream test suite leaves some asynchronous handles open even on its unchanged release. `--forceExit` exits after reporting all assertions; failing assertions still fail the command.

## Component gallery

```bash
npm run preview
```

Open `http://localhost:8124/docs/preview/`. It uses the real production bundle with simulated entities and minimal Home Assistant frontend elements. It includes all card types, nested controls, and an interactive standalone pop-up. It supports dark/light, narrow layouts, and original/new comparisons. It is a development fixture, not a connection to your home.

Browser integration checks are in `scripts/check-browser.mjs`. Install Playwright locally without saving it to the package manifest, then run:

```bash
npm install --no-save --package-lock=false playwright
npx playwright install chromium
npm run preview
node scripts/check-browser.mjs
```

For an existing Playwright/browser runtime, set `PLAYWRIGHT_MODULE` to its module file and `CHROMIUM_PATH` to its executable. The script checks both resource loading orders, renders every gallery variant, verifies component radii, exercises controls and pop-ups, and saves preview screenshots. These simulated checks supplement testing on a real Home Assistant installation, which is still needed before a production rollout.

## Add a card type

1. Add `src/cards/<your-type>/` with `index.js`, `create.js`, `changes.js`, `styles.css`, and `editor.js`. Use an existing card as the starting point.
2. Build on `createBaseStructure` from `src/components/base-card/index.js`. It provides the common card layout, icon container, actions, and shared sub-buttons.
3. Use `var(--lovely-radius-card, var(--lovely-radius, 12px))` for outer surfaces and `var(--lovely-radius-control, var(--lovely-radius, 8px))` for inset controls. Use the other documented tokens for icons, pop-ups, and small elements. Keep clipping radii aligned with the surface they clip.
4. Import and register its handler in `handlers` in `src/index.js`.
5. Add its picker option and editor rendering branch in `src/editor/lovely-card-editor.js`. Update translation dictionaries if you add labels. Add entity suggestions in `src/tools/entity-suggestion.js` where useful.
6. Add the new type and relevant states to `docs/preview/gallery.js`, then run tests, the browser checks, and a real Home Assistant smoke test.
7. Rebuild and commit `dist/` alongside source changes so manual installs receive the change.

For style-only additions, the inherited module system is usually enough. Its public YAML uses the same options and `.bubble-*` CSS selectors as upstream. The editor translates object selector schemas to its private `lc_object` implementation internally; module authors still use the documented standard object selector.

## Coexistence and updates

The fork owns `lovely-card`, `lovely-card-editor`, `ha-selector-lc_*`, and `ha-form-lc_*` registrations. Its browser events, storage keys, scroll-lock elements, and runtime markers use separate Lovely identifiers. Interaction markers use `.lovely-action` and `.lovely-action-enabled` so the original's global pointer listeners cannot dispatch actions from Lovely controls. Keep the other `.bubble-*` layout classes and `--bubble-*` style hooks for configuration and module compatibility. Bubble Card Tools endpoints and the upstream community Module Store intentionally remain available; both collections share the same backend module files if configured to use that integration.

When merging upstream, audit any new card/control styles, registrations, browser globals, resource URLs, and storage keys. Run both browser loading-order checks; testing only Lovely Card cannot catch duplicate custom element registration failures. Preserve historical Bubble Card version references and author attribution.
