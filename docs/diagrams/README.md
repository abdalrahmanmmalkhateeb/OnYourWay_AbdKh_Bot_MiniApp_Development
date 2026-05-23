# Mini App Diagrams

## Purpose

This directory documents the current Telegram Mini App page flows and payload construction paths as Mermaid flowcharts and compact contract notes.

The code remains the source of truth. Update these diagrams when a selector page, payload shape, data-loading rule, Telegram submit behavior, browser fallback, or Mini App/Bot responsibility boundary changes.

## Diagram Files

- [01-mini-app-entry-flow.md](01-mini-app-entry-flow.md): entry page links, selector page loading, and Telegram initialization.
- [02-shared-submit-payload-flow.md](02-shared-submit-payload-flow.md): shared `MiniApp.submitPayload()` transport and browser fallback behavior.
- [03-car-selection-page-flow.md](03-car-selection-page-flow.md): car data loading, brand/model/year selection, and `vehicle_selection` payload construction.
- [04-area-selection-page-flow.md](04-area-selection-page-flow.md): area data loading, city/area selection, and `area_selection` payload construction.
- [05-date-selection-page-flow.md](05-date-selection-page-flow.md): future date/time validation and `datetime_selection` payload construction.
- [06-payload-contract.md](06-payload-contract.md): current Mini App payload fields, required status, examples, and Bot-side validation boundary.

## Ownership Boundary

This Mini App repository owns page-level UI behavior and payload-construction documentation.

The Bot repository owns orchestration, FSM state handling, backend validation, publishing, persistence, background jobs, and trusted eligibility checks.

Do not use these diagrams as proof that the Bot accepts a payload. The Bot must validate WebApp data independently.
