# Area Selection Page Flow

## Purpose

Show how `area.html` and `area.js` load area data, gate submission, and construct the current `area_selection` payload.

```mermaid
flowchart TD
  A["area.html loads"] --> B["MiniApp.initTelegram"]
  A --> C["loadAreas"]
  C --> D["fetch data/areas.json"]
  D --> E{"object of arrays"}
  E -->|No| F["show loadError"]
  F --> G["submit disabled"]
  E -->|Yes| H["render cities"]
  H --> I["filter city search"]
  I --> J["select city"]
  J --> K["clear area"]
  K --> L["enable area search"]
  L --> M["render areas"]
  M --> N["filter area search"]
  N --> O["select area"]
  O --> P["update summary"]
  P --> Q{"city and area set"}
  Q -->|No| G
  Q -->|Yes| R["submit enabled"]
  R --> S["type city area"]
  S --> T["MiniApp.submitPayload"]
```

## Notes / Constraints

- `data/areas.json` is fetched with `cache: "no-store"`.
- `validateAreaData()` requires a top-level object whose values are arrays.
- Cities and areas are sorted with `Intl.Collator("ar", { numeric: true })`.
- Selecting a city clears the previous area and enables area search.
- Area selection does not have the car page's `"Other"` fallback.
- The submit button stays disabled until both `city` and `area` are set.
- The exact payload keys are `type`, `city`, and `area`.
- The Mini App UI allowlist does not replace Bot-side validation.

## Source Of Truth

- `area.html`
- `area.js`
- `shared.js`
- `data/areas.json`
