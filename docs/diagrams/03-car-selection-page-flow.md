# Car Selection Page Flow

## Purpose

Show how `car.html` and `car.js` load car data, gate submission, and construct the current `vehicle_selection` payload.

```mermaid
flowchart TD
  A["car.html loads"] --> B["MiniApp.initTelegram"]
  A --> C["fillYearOptions"]
  A --> D["loadCars"]
  D --> E["fetch data/cars.json"]
  E --> F{"object of arrays"}
  F -->|No| G["show loadError"]
  G --> H["submit disabled"]
  F -->|Yes| I["render brands"]
  I --> J["filter brand search"]
  J --> K["select brand"]
  K --> L["clear model"]
  L --> M["enable model search"]
  M --> N["render models"]
  N --> O["filter model search"]
  O --> P["select model"]
  C --> Q["select year"]
  P --> R["update summary"]
  Q --> R
  R --> S{"brand model year set"}
  S -->|No| H
  S -->|Yes| T["submit enabled"]
  T --> U["type brand model year"]
  U --> V["MiniApp.submitPayload"]
```

## Notes / Constraints

- `data/cars.json` is fetched with `cache: "no-store"`.
- `validateCarData()` requires a top-level object whose values are arrays.
- Brand and model values are sorted with Arabic locale comparison.
- Year options are generated from the current local year down to `1980`.
- If a brand/model list contains `"Other"`, a non-empty search with no matches can expose `"Other"` as the fallback option.
- The submit button stays disabled until `brand`, `model`, and `year` are all set.
- The exact payload keys are `type`, `brand`, `model`, and `year`.
- The Mini App UI allowlist does not replace Bot-side validation.

## Source Of Truth

- `car.html`
- `car.js`
- `shared.js`
- `data/cars.json`
