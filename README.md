<p align="center"><img src="assets/icon.svg" width="64" height="64" alt=""></p>

# Lovely Card

Bubble Card's controls and features, with softly rounded rectangles in place of pills and circles. An independent Home Assistant card collection forked from [Clooos/Bubble-Card v3.4.2](https://github.com/Clooos/Bubble-Card/releases/tag/v3.4.2), ready to grow with your own card types.

**Keep Bubble Card installed.** Lovely Card uses `custom:lovely-card`, its own editor, resource file, browser events, and local caches. Existing `custom:bubble-card` cards continue using the original. Use distinct pop-up hashes when using both collections on one dashboard.

![Lovely Card component preview](docs/preview/components.png)

## Install

1. Download [`lovely-card.js`](https://raw.githubusercontent.com/valentinpurrucker/lovely-card/main/dist/lovely-card.js) from `dist/` and put it in `/config/www/lovely-card/`.
2. For a translated editor, copy the desired `lovely-card-<language>.json` files from `dist/` into that same directory. English is bundled.
3. In Home Assistant's dashboard resources, add `/local/lovely-card/lovely-card.js?v=0.1.0` as a **JavaScript module**. Reload the browser.
4. Add a **Lovely Card** from the card picker, or use YAML:

```yaml
type: custom:lovely-card
card_type: button
button_type: slider
entity: light.living_room
name: Living room
icon: mdi:lightbulb-outline
```

To copy an existing Bubble Card, change `type: custom:bubble-card` to `type: custom:lovely-card`. Keep the other options. Change nested card types too if you want Lovely styling inside pop-ups; other Home Assistant cards retain their own appearance.

The fork includes [`hacs.json`](hacs.json) for HACS packaging. Manual installation above works directly from this branch, without waiting for a release.

## The corner system

All corner sizes are defined in **[`src/styles/corners.js`](src/styles/corners.js)**. Change `cornerScale` to resize the whole collection proportionally, or edit one entry in `cornerSizes` to change a role such as cards or controls. Run `npm run dist` afterward. Components have no numeric corner fallbacks of their own; editor panels, detached pop-ups, hold indicators, and onboarding illustrations use the same configuration.

Every bundled card type is retained: **button** (switch, slider, state, name), **sub-buttons**, **separator**, **cover**, **climate** (including water heaters and humidifiers), **select**, **media player**, **calendar**, **horizontal buttons stack**, **pop-up**, and **empty column**. Empty columns remain invisible layout helpers.

The design also covers nested and bottom sub-buttons, grouped controls, sliders and color cursors, dropdown menus, alarm keypads, entity pictures, media/volume controls, pop-up navigation and close buttons, foreground clipping, all responsive pop-up modes and styles, onboarding illustrations, the configuration editor, and Module Store UI.

| Theme variable | Default | Use |
| --- | --- | --- |
| `lovely-radius-card` | `12px` | Cards, calendar events, editor panels |
| `lovely-radius-control` | `8px` | Buttons, menus, sliders, chips |
| `lovely-radius-icon` | `8px` | Main icon and entity-picture containers |
| `lovely-radius-popup` | `16px` | Dialogs and bottom sheets |
| `lovely-radius-small` | `4px` | Small images and compact badges |
| `lovely-radius-indicator` | `2px` | Color cursors, keypad indicators, separator lines |
| `lovely-radius-editor` | `6px` | Small editor panels and examples |
| `lovely-radius-tab` | `3px` | Module tab accents |
| `lovely-radius-handle` | `1px` | Thin pop-up handles and decorative strokes |

Set these keys in a Home Assistant theme (Home Assistant adds the CSS `--` prefix):

```yaml
My theme:
  lovely-radius-card: 12px
  lovely-radius-control: 8px
  lovely-radius-icon: 8px
  lovely-radius-popup: 16px
```

`lovely-radius` optionally sets a single fallback for the entire collection. Individual Lovely tokens take precedence over it. Existing `--bubble-…-border-radius` variables and custom styles are still supported and take precedence over Lovely defaults. If a copied card or theme explicitly sets a pill/circle radius, remove that override to see the new defaults. Lovely Card does not set radius variables on the document or alter the original Bubble Card's styling.

Colors, spacing, layouts, entity handling, actions, templates, translations, and the module system remain based on upstream. Community modules can supply their own styling; use the Lovely tokens in new modules to follow this design.

## Develop and add your own cards

See [the developer guide](DEVELOPERS.md) for builds, the local component gallery, browser checks, and the steps to add a card type. The [upstream configuration reference](UPSTREAM.md) still applies; substitute `custom:lovely-card` and the Lovely resource filename in its examples. [Module development](src/modules/module-documentation.md) is also available.

```bash
npm ci
npm test -- --runInBand --forceExit
npm run dist
npm run preview
```

## Credits and license

Lovely Card is an independent fork, not an official Bubble Card release. Bubble Card was created by **Clooos** and its contributors. The original [MIT license](LICENSE), source history, and [upstream README](UPSTREAM.md) are preserved. Please report fork-specific issues [here](https://github.com/valentinpurrucker/lovely-card/issues).
