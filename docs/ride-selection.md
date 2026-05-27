# Ride Selection

The ride selector lets a user choose a full route, ride date/time, and whether the ride is normal or recurring, then returns a `ride_selection` payload to the Telegram bot.

## Source Files

- `ride.html`
- `ride.js`
- `shared.js`
- `style.css`
- `data/areas.json`

## Payload

```json
{
  "type": "ride_selection",
  "from_city": "...",
  "from_area": "...",
  "to_city": "...",
  "to_area": "...",
  "datetime": "YYYY-MM-DD HH:MM",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "is_recurring": false,
  "repeat_count": null
}
```

For recurring rides, `is_recurring` is `true` and `repeat_count` is a string from `"1"` to `"30"`.

## Client Behavior

1. `ride.js` loads `data/areas.json` with `cache: "no-store"`.
2. The user selects from-city/from-area and to-city/to-area from the same allowlist.
3. The page blocks submit when the two endpoints are identical.
4. The user selects a future `datetime-local` value.
5. The recurring checkbox defaults to unchecked.
6. When recurring is checked, the repeat-count field is shown and must be a client-side integer from 1 to 30.
7. On submit, `MiniApp.submitPayload()` sends or displays the payload.

## Bot Boundary

The Mini App cannot be trusted as the authority for route, date/time, or recurrence. The bot must validate the payload type, current FSM state, user eligibility, backend area allowlists, route inequality, datetime eligibility, `is_recurring`, and `repeat_count` before mutating state.

## Known Product Meaning

The UI labels recurring rides as daily recurrence. `repeat_count` means total publish count, including the first selected ride time.
