// Pure booking-rule validation for the Smart Campus room availability checker.
// Decision-only: this module never creates or mutates a booking (AC5).

import type { Booking, DayOffset } from "./types";

export type { Booking };

export interface CanBookInput {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  existing: Booking[];
  dayOffset: DayOffset;
}

export type ValidationCode =
  | "INVALID_RANGE"
  | "IN_PAST"
  | "TOO_LONG"
  | "ROOM_BLOCKED"
  | "OVERLAP";

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string; code: ValidationCode };

// Single source of truth for every booking rule (AC1-AC4). Both the live
// validation banner and the check-button verdict in App.tsx consume this.
export function validateBooking(input: CanBookInput): ValidationResult {
  const { start, end, now, blocked, existing, dayOffset } = input;

  // Input sanity — non-integer times, out-of-range "now", or an invalid day
  // offset. These are structural problems with the request itself.
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    !Number.isInteger(now) ||
    !Number.isInteger(dayOffset) ||
    !(now >= 0 && now < 1440) ||
    (dayOffset !== 0 && dayOffset !== 1)
  ) {
    return {
      ok: false,
      reason: "Times must be integer minutes.",
      code: "INVALID_RANGE",
    };
  }

  // AC1 (range half): start < end, both within 00:00-24:00.
  if (!(0 <= start && start < end && end <= 1440)) {
    return {
      ok: false,
      reason: "Start must be before end, and both within 00:00–24:00.",
      code: "INVALID_RANGE",
    };
  }

  // AC1 (past half): start must be strictly after now, comparing same-day
  // minutes correctly across today/tomorrow.
  if (dayOffset * 1440 + start <= now) {
    return {
      ok: false,
      reason:
        dayOffset === 0
          ? "Start time must be later than the current time."
          : "Start time must be later than the current time (tomorrow).",
      code: "IN_PAST",
    };
  }

  // AC2: max booking duration is 120 minutes.
  const duration = end - start;
  if (duration > 120) {
    return {
      ok: false,
      reason: `Duration is ${duration} min. Maximum allowed is 120 min.`,
      code: "TOO_LONG",
    };
  }

  // AC3: a blocked room cannot be booked.
  if (blocked) {
    return {
      ok: false,
      reason: "This room is blocked for the selected day.",
      code: "ROOM_BLOCKED",
    };
  }

  // AC4: reject true overlaps. Touching endpoints (start === be or bs === end)
  // are allowed because the test is strict on both sides.
  const overlaps = existing.some(([bs, be]) => start < be && bs < end);
  if (overlaps) {
    return {
      ok: false,
      reason:
        "The proposed time overlaps an existing booking (touching endpoints are allowed).",
      code: "OVERLAP",
    };
  }

  return { ok: true };
}

// Boolean wrapper kept for backward compatibility; implemented via the typed
// validator so the rules live in exactly one place.
export function canBook(input: CanBookInput): boolean {
  return validateBooking(input).ok;
}
