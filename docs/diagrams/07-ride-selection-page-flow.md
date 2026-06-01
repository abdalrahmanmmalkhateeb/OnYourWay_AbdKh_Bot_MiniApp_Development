# Ride Selection Page Flow

## Purpose

Show how `ride.html` and `ride.js` collect a complete route, ride date/time, and optional daily recurrence before constructing the `ride_selection` payload.

```mermaid
flowchart TD
  A["ride.html loads"] --> B["MiniApp.initTelegram"]
  A --> C["ride.js"]
  C --> D["Fetch data/areas.json"]
  D --> E{"Valid object of city arrays?"}
  E -->|No| F["Show load error and disable submit"]
  E -->|Yes| G["Render from-city and to-city options"]
  G --> H["User selects from city and area"]
  G --> I["User selects to city and area"]
  C --> J["Set minimum datetime to next minute"]
  J --> K["User selects datetime-local or quick time button fills it"]
  C --> L["Recurring checkbox defaults unchecked"]
  L --> M{"Recurring checked?"}
  M -->|No| N["repeat_count is null"]
  M -->|Yes| O["Show repeat-count input"]
  O --> P{"Repeat count 1 to 30?"}
  H --> Q{"All required fields valid?"}
  I --> Q
  K --> Q
  N --> Q
  P --> Q
  Q -->|No| R["Submit disabled"]
  Q -->|Yes| S{"From and to are different?"}
  S -->|No| T["Show route error and keep submit disabled"]
  S -->|Yes| U["Enable submit"]
  U --> V["Submit ride_selection payload"]
  V --> W["MiniApp.submitPayload"]
```

## Notes / Constraints

- `ride.js` uses the same `data/areas.json` UI allowlist as `area.js`.
- Quick time buttons fill the same `dateTimeInput` and do not submit automatically.
- The page blocks identical from/to selections in the UI, but the Bot must still validate that rule.
- `is_recurring` is a boolean. `repeat_count` is `null` when normal, or a string from `"1"` to `"30"` when recurring.
- Arabic-Indic and Persian repeat-count digits are normalized before validation and payload submission.
- Recurrence means daily recurrence at the same selected time; `repeat_count` includes the first ride.
- `updateRideOptionDensity()` toggles `long-options` for both ride city and area lists when full candidate values exceed `longRideOptionLength`.

## Source Of Truth

- `ride.html`
- `ride.js`
- `shared.js`
- `style.css`
- `data/areas.json`
