# Area Selection Flow

## Purpose

The area selector lets a user choose a city and area, then returns an `area_selection` payload to the Telegram bot.

## Inputs

- `data/areas.json`, fetched by `area.js` with `cache: "no-store"`.
- User search text in `citySearch` and `areaSearch`.

`area.js` accepts `areas.json` only when it is a top-level object and every value is an array. It does not currently validate that every city/area entry is a non-empty string or that arrays are unique.

## Output Payload

```json
{"type":"area_selection","city":"...","area":"..."}
```

These keys are part of the bot-facing contract. Do not rename `type`, `city`, or `area` without changing the bot.

## Flow

1. `MiniApp.initTelegram()` runs on page load.
2. `loadAreas()` fetches and validates `data/areas.json`.
3. Cities are sorted with `Intl.Collator("ar", { numeric: true })`.
4. Selecting a city clears any previous area and enables area search.
5. Areas for the selected city are sorted with the same collator.
6. The submit button is enabled only when city and area are both selected.
7. On submit, `MiniApp.submitPayload()` sends or displays the payload.

## Option Layout

`area.html` marks the page and option lists with layout classes used by `style.css`:

- `area-page`
- `city-options`
- `area-options`

`area.js` calls `updateAreaOptionDensity()` when rendering area options. If any area in the selected city is longer than `longAreaOptionLength` (`18` characters), the area list gets the `long-options` class so the CSS can reduce the grid density.

Current CSS behavior:

- City options use a three-column grid by default.
- Area options use a three-column grid by default.
- Area lists with `long-options` use two columns.
- Narrow viewports reduce option grids to two columns, then one column at the smallest breakpoint.

## Search And Empty States

Search uses `MiniApp.filterValues()`, which trims, normalizes with `NFKD`, lowercases with Arabic locale, and checks substring matches.

Unlike car selection, area selection has no `"Other"` fallback. A query with no matches renders the configured empty-state message.

If loading fails or the JSON shape is invalid, the page shows `loadError` and leaves submit disabled.

## What Can Break

- Changing the object-of-arrays shape of `data/areas.json` breaks `validateAreaData()`.
- Removing expected DOM IDs in `area.html` breaks `areaElements`.
- Removing `area-page`, `city-options`, `area-options`, or `long-options` breaks the current option-grid layout behavior.
- Renaming payload keys breaks bot compatibility.
- Adding UI-only areas without matching bot-side validation can make the Mini App submit values the bot rejects. [Unknown / Needs human confirmation]
