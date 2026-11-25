# Smart Campus Availability Checker: Shared Contract

This contract applies to both the code-based and the low-code solution.

Baseline: https://github.com/karimova-a/software_bolt, commit `5a0a067`

## User story
As a student, I want to choose a future start time and duration for a campus room so that I can see whether it is available and, if not, why.

## Acceptance criteria
- **AC1:** Start time must be in the future.
- **AC2:** Duration must be greater than zero and at most 120 minutes.
- **AC3:** Overlapping bookings are unavailable.
- **AC4:** Blocked room is unavailable.
- **AC5:** Display a clear decision without changing existing bookings.
- **AC6:** Invalid input receives understandable feedback.

## Inputs
| Name | Type / format | Example |
|---|---|---|
| room | one of the fictional rooms | Room A101 |
| start time | HH:MM today, converted to minutes after midnight | 15:00 = 900 |
| duration | whole number of minutes | 60 |
| blocked flag | boolean, stored per room | false |
| existing bookings | fictional list (room, start, end, owner) | a101, 540, 600, CS 101 Lecture |
| current time | minutes after midnight, fixed in tests | 08:00 = 480 |

## Outputs
| Name | Type | Meaning |
|---|---|---|
| available | boolean | true only when no rule is violated |
| reason code | text, `none` when available | first rule that rejected the request |
| message | text | readable decision shown to the user |

## Rules and reason codes
Rules are checked in this order, matching the baseline. The first failure is returned.

| Order | Code | Condition | Message |
|---|---|---|---|
| 1 | no_room | No existing room is selected | Please select a room. |
| 2 | invalid_interval | Start or duration is missing or not a whole number, duration is 0 or less, or the interval is outside 00:00 to 24:00 | Enter a start time and a duration above 0 minutes that ends by 24:00. |
| 3 | start_in_past | Start is earlier than or equal to the current time | The start time must be after the current time. |
| 4 | too_long | Duration is over 120 minutes | Bookings are limited to 120 minutes or less. |
| 5 | blocked | Room is blocked | [Room] is currently blocked and cannot be booked. |
| 6 | overlap | New start < booking end AND new end > booking start | This overlaps an existing booking ([owner]). |

When available, the message is "[Room] is available for your selected interval." Adjacent intervals do not overlap. If several bookings overlap, the first one in the list is named.

Where a room is fixed by the screen (one card per room), `no_room` cannot occur.

## Fixed test data
Test clock: **08:00** (simulated).

| Room | Blocked | Bookings |
|---|---|---|
| Room A101 | no | 09:00-10:00 CS 101 Lecture; 13:00-14:00 Study Group |
| Room B204 | no | 10:00-12:00 Fluid Mechanics |
| Room C112 | yes | none |
| Room D310 | no | 08:00-09:00 Orientation Talk; 14:30-16:30 Robotics Lab |

## Test inputs
| ID | Case | Room | Start | Duration | Expected result | Expected reason code |
|---|---|---|---|---|---|---|
| T1 | Valid free interval | A101 | 15:00 | 60 | Available | none |
| T2 | Overlap | A101 | 09:30 | 60 | Unavailable | overlap |
| T3 | Blocked room | C112 | 15:00 | 60 | Unavailable | blocked |
| T4 | Duration zero | A101 | 15:00 | 0 | Validation error | invalid_interval |
| T5 | Duration 121 | A101 | 15:00 | 121 | Validation error | too_long |
| T6 | Past start | A101 | 07:00 | 60 | Validation error | start_in_past |
| T7 | Adjacent interval | A101 | 10:00 | 60 | Available | none |
| T8 | Bookings unchanged | all | Compare bookings before and after T1-T7 | | Identical | not applicable |

## Out of scope
The baseline screen says bookings run until 10:00 PM, but no rule enforces it and no acceptance criterion requires it. Neither solution enforces it.
