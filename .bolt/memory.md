# Project memory

## Product intent & audience

- Single-page Smart Campus Room Availability Checker; utility for quickly checking if a campus room is free for a requested time interval.
- Prototype/demo scope: fictional sample data, in-memory only, no persistence.

## Brand personality & voice

- Clear and practical; validation feedback is explicit about why a request was rejected.

## Visual design & UX direction

- Responsive two-column layout on desktop that stacks vertically on mobile.
- Card-per-room UI with start/end time inputs and a Check button.
- Prominent Available/Unavailable verdict banner after checking.
- Header shows the supplied current time for context.
- Tailwind CSS for styling; lucide-react for any icons (per project conventions).

## Decisions, constraints & rationale

- No backend, authentication, analytics, or unrelated features per explicit constraint.
- Time modeled as integer minutes within a day (0–1440); start must be ≥ current time and < end.
- Max booking duration: 120 minutes.
- Blocked rooms are always rejected.
- Overlap check: intervals that only touch at endpoints are allowed; true overlap is rejected.
- Checks are read-only — never mutate existing booking data.
- Files created:
  - `src/App.tsx` — page UI, room cards, inputs, verdict banner.
  - `src/lib/rooms.ts` — fictional sample rooms and bookings plus time helpers.
  - `src/lib/validation.ts` — all availability rules centralized.

## Open questions & assumptions

- Current time is supplied to the checker rather than read from a live clock.
- Only "today" bookings are modeled; multi-day scheduling is out of scope.
- Time entry uses minute-based values; a friendlier HH:MM input could be added if requested.