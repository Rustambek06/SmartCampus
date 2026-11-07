import { describe, expect, it } from "vitest";
import {
  canBook,
  validateBooking,
  type CanBookInput,
} from "./canBook";

const base: CanBookInput = {
  start: 600,
  end: 660,
  now: 500,
  blocked: false,
  existing: [],
  dayOffset: 0,
};

function ok(over: Partial<CanBookInput>): CanBookInput {
  return { ...base, ...over };
}

describe("validateBooking - AC1 (range + past)", () => {
  it("rejects start >= end", () => {
    expect(validateBooking(ok({ start: 600, end: 600 }))).toEqual({
      ok: false,
      reason: "Start must be before end, and both within 00:00–24:00.",
      code: "INVALID_RANGE",
    });
    expect(validateBooking(ok({ start: 660, end: 600 }))).toMatchObject({
      ok: false,
      code: "INVALID_RANGE",
    });
  });

  it("rejects out-of-range times", () => {
    expect(validateBooking(ok({ start: -10, end: 60 }))).toMatchObject({
      ok: false,
      code: "INVALID_RANGE",
    });
    expect(validateBooking(ok({ start: 1380, end: 1500 }))).toMatchObject({
      ok: false,
      code: "INVALID_RANGE",
    });
  });

  it("rejects a same-day start at or before now", () => {
    expect(validateBooking(ok({ start: 500, end: 560, now: 500 }))).toMatchObject({
      ok: false,
      code: "IN_PAST",
    });
    expect(validateBooking(ok({ start: 499, end: 560, now: 500 }))).toMatchObject({
      ok: false,
      code: "IN_PAST",
    });
  });

  it("accepts a same-day start strictly after now", () => {
    expect(validateBooking(ok({ start: 501, end: 560, now: 500 }))).toEqual({ ok: true });
  });

  it("treats tomorrow start as dayOffset*1440+start vs now", () => {
    // 22:00 today (now=1320); tomorrow 09:00 (start=540) => 1440+540=1980 > 1320
    expect(validateBooking(ok({ start: 540, end: 600, now: 1320, dayOffset: 1 }))).toEqual({
      ok: true,
    });
    // any tomorrow start is after any same-day now (1440+start > 1440 > now),
    // so tomorrow can never be IN_PAST when now is a same-day minute.
    expect(validateBooking(ok({ start: 0, end: 60, now: 1439, dayOffset: 1 }))).toEqual({
      ok: true,
    });
  });
});

describe("validateBooking - AC2 (max 120 min)", () => {
  it("accepts exactly 120 min", () => {
    expect(validateBooking(ok({ start: 600, end: 720 }))).toEqual({ ok: true });
  });

  it("rejects 121 min", () => {
    expect(validateBooking(ok({ start: 600, end: 721 }))).toMatchObject({
      ok: false,
      code: "TOO_LONG",
    });
  });
});

describe("validateBooking - AC3 (blocked room)", () => {
  it("rejects a blocked room even with otherwise-valid input", () => {
    expect(validateBooking(ok({ blocked: true }))).toMatchObject({
      ok: false,
      code: "ROOM_BLOCKED",
    });
  });

  it("accepts an unblocked room with no conflicts", () => {
    expect(validateBooking(ok({ blocked: false }))).toEqual({ ok: true });
  });
});

describe("validateBooking - AC4 (overlap / touching)", () => {
  it("rejects a true overlap", () => {
    expect(
      validateBooking(ok({ start: 570, end: 610, existing: [[600, 660]] })),
    ).toMatchObject({ ok: false, code: "OVERLAP" });
  });

  it("allows start touching an existing booking's end (start === be)", () => {
    expect(validateBooking(ok({ start: 660, end: 720, existing: [[600, 660]] }))).toEqual({
      ok: true,
    });
  });

  it("allows end touching an existing booking's start (end === bs)", () => {
    expect(validateBooking(ok({ start: 540, end: 600, existing: [[600, 660]] }))).toEqual({
      ok: true,
    });
  });

  it("rejects when fully contained in an existing booking", () => {
    expect(
      validateBooking(ok({ start: 610, end: 620, existing: [[600, 660]] })),
    ).toMatchObject({ ok: false, code: "OVERLAP" });
  });
});

describe("validateBooking - AC5 (no mutation)", () => {
  it("does not mutate the existing bookings array or its entries", () => {
    const existing = [[600, 660], [780, 840]] as [number, number][];
    const snapshot = existing.map((b) => [...b] as [number, number]);
    validateBooking(ok({ start: 700, end: 760, existing }));
    expect(existing).toEqual(snapshot);
    expect(existing).toHaveLength(2);
  });
});

describe("validateBooking - AC6 (structured feedback)", () => {
  it("returns a human-readable reason for every failure code", () => {
    const cases: Partial<CanBookInput>[] = [
      { start: 600, end: 600 }, // INVALID_RANGE
      { start: 400, end: 460, now: 500 }, // IN_PAST
      { start: 600, end: 721 }, // TOO_LONG
      { blocked: true }, // ROOM_BLOCKED
      { start: 610, end: 650, existing: [[600, 660]] }, // OVERLAP
    ];
    for (const c of cases) {
      const r = validateBooking(ok(c));
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.reason.length).toBeGreaterThan(0);
        expect(r.code).toBeTruthy();
      }
    }
  });
});

describe("canBook (boolean wrapper)", () => {
  it("returns true iff validateBooking is ok", () => {
    expect(canBook(ok({}))).toBe(true);
    expect(canBook(ok({ blocked: true }))).toBe(false);
    expect(canBook(ok({ start: 600, end: 600 }))).toBe(false);
  });
});
