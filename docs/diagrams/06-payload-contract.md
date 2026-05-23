# Payload Contract

## Purpose

Document the payloads currently constructed by this Mini App. Required means the current UI keeps submit disabled until the value exists; it does not mean the Bot can trust the client.

## `vehicle_selection`

Source page: `car.html` with `car.js`.

| Field | Required | Source |
| --- | --- | --- |
| `type` | Required | Literal `"vehicle_selection"` in `car.js` |
| `brand` | Required | Selected brand from `data/cars.json` |
| `model` | Required | Selected model from `data/cars.json` for the selected brand |
| `year` | Required | Selected generated year option |

Example:

```json
{
  "type": "vehicle_selection",
  "brand": "Toyota",
  "model": "Corolla",
  "year": "2026"
}
```

## `area_selection`

Source page: `area.html` with `area.js`.

| Field | Required | Source |
| --- | --- | --- |
| `type` | Required | Literal `"area_selection"` in `area.js` |
| `city` | Required | Selected city from `data/areas.json` |
| `area` | Required | Selected area from `data/areas.json` for the selected city |

Example:

```json
{
  "type": "area_selection",
  "city": "Damascus",
  "area": "Mezzeh"
}
```

## `datetime_selection`

Source page: `date.html` with `date.js`.

| Field | Required | Source |
| --- | --- | --- |
| `type` | Required | Literal `"datetime_selection"` in `date.js` |
| `datetime` | Required | Derived as `YYYY-MM-DD HH:MM` |
| `date` | Required | Derived as `YYYY-MM-DD` |
| `time` | Required | Derived as `HH:MM` |

Example:

```json
{
  "type": "datetime_selection",
  "datetime": "2026-05-23 14:30",
  "date": "2026-05-23",
  "time": "14:30"
}
```

## Bot-Side Validation Note

The Bot repository must validate payload type, current FSM state, payload shape, backend allowlists, date/time eligibility, user eligibility, and any ride or profile rules that apply. This Mini App repository only documents the current client-side payload construction.

## Source Of Truth

- `car.js`
- `area.js`
- `date.js`
- `shared.js`
- `data/cars.json`
- `data/areas.json`
