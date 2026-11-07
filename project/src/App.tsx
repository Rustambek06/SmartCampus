import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Info,
  AlertTriangle,
} from "lucide-react";
import { validateBooking, type ValidationResult } from "@/lib/canBook";
import { ROOMS, getRoomDayData } from "@/lib/rooms";
import { filterRooms, collectEquipment } from "@/lib/filterRooms";
import type { DayOffset } from "@/lib/types";
import { minutesToLabel, nowInMinutes } from "@/lib/time";
import { Timeline } from "@/components/Timeline";
import { TimeInput } from "@/components/TimeInput";
import { RoomFilterBar } from "@/components/RoomFilterBar";
import { RoomCatalog } from "@/components/RoomCatalog";

const ALL_EQUIPMENT = collectEquipment(ROOMS);

export default function App() {
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [roomId, setRoomId] = useState<string>(ROOMS[0].id);
  const [dayOffset, setDayOffset] = useState<DayOffset>(0);
  const [start, setStart] = useState<number>(600);
  const [end, setEnd] = useState<number>(660);
  const [nowTick, setNowTick] = useState<number>(() => nowInMinutes(new Date()));
  const [result, setResult] = useState<{ available: boolean; checked: boolean }>({
    available: false,
    checked: false,
  });

  const visibleRooms = useMemo(
    () => filterRooms(ROOMS, { minCapacity, equipment: selectedEquipment }),
    [minCapacity, selectedEquipment],
  );

  // F5: if the selected room is filtered out, fall back to the first visible
  // room (or null when empty). This keeps the availability checker bound to
  // a room that actually matches the active filters.
  const activeRoomId = useMemo(() => {
    const stillVisible = visibleRooms.find((r) => r.id === roomId);
    return stillVisible?.id ?? visibleRooms[0]?.id ?? null;
  }, [visibleRooms, roomId]);

  // Keep roomId synced to the active room so all downstream lookups are
  // consistent. When the fallback changes (e.g. filters narrowed), update
  // roomId and clear any stale result.
  useEffect(() => {
    if (activeRoomId && activeRoomId !== roomId) {
      setRoomId(activeRoomId);
      setResult({ available: false, checked: false });
    }
  }, [activeRoomId, roomId]);

  const dayData = useMemo(
    () => getRoomDayData(activeRoomId ?? "", dayOffset),
    [activeRoomId, dayOffset],
  );
  const existing = dayData.bookings;
  const activeRoom = useMemo(
    () => ROOMS.find((r) => r.id === activeRoomId) ?? null,
    [activeRoomId],
  );

  // Single source of truth for the validation banner (AC6) and the verdict.
  // No duplicate inline range/duration checks live in App.tsx.
  const validation: ValidationResult = useMemo(
    () =>
      validateBooking({
        start,
        end,
        now: nowTick,
        blocked: dayData.blocked,
        existing,
        dayOffset,
      }),
    [start, end, nowTick, dayData.blocked, existing, dayOffset],
  );

  // Derive TimeInput invalid flags from the validator result instead of
  // re-implementing range/order checks inline.
  const timeInvalid = !validation.ok && validation.code === "INVALID_RANGE";

  function handleCheck() {
    setResult({ available: validation.ok, checked: true });
  }

  function syncNow() {
    setNowTick(nowInMinutes(new Date()));
  }

  function toggleEquipment(item: string) {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item],
    );
    setResult({ available: false, checked: false });
  }

  function selectRoom(id: string) {
    setRoomId(id);
    setResult({ available: false, checked: false });
  }

  function clearFilters() {
    setMinCapacity(0);
    setSelectedEquipment([]);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-md px-4 py-6 sm:py-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-2 text-emerald-600">
            <CalendarDays className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Smart Campus
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900">
            Room Availability Checker
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Check whether a room is free. This does not create or confirm a booking.
          </p>
        </header>

        {/* Now indicator */}
        <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>
              Current time: <span className="font-semibold">{minutesToLabel(nowTick)}</span>
            </span>
          </div>
          <button
            onClick={syncNow}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Sync
          </button>
        </div>

        {/* Filter controls */}
        <RoomFilterBar
          minCapacity={minCapacity}
          equipmentOptions={ALL_EQUIPMENT}
          selectedEquipment={selectedEquipment}
          onCapacityChange={(v) => {
            setMinCapacity(v);
            setResult({ available: false, checked: false });
          }}
          onToggleEquipment={toggleEquipment}
          onClear={clearFilters}
        />

        {/* Room picker — uses filtered list, or empty state (F4) */}
        <RoomCatalog
          rooms={visibleRooms}
          activeRoomId={activeRoomId}
          dayOffset={dayOffset}
          onSelectRoom={selectRoom}
          onClearFilters={clearFilters}
        />

        {/* Day picker */}
        <section className="mb-4 grid grid-cols-2 gap-2">
          {([0, 1] as DayOffset[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDayOffset(d);
                setResult({ available: false, checked: false });
              }}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                dayOffset === d
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {d === 0 ? "Today" : "Tomorrow"}
            </button>
          ))}
        </section>

        {/* Time pickers */}
        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Proposed time</h3>
          <div className="grid grid-cols-2 gap-3">
            <TimeInput
              label="Start"
              value={start}
              onChange={(m) => {
                setStart(m);
                setResult({ available: false, checked: false });
              }}
              invalid={timeInvalid}
            />
            <TimeInput
              label="End"
              value={end}
              allowMidnightEnd
              onChange={(m) => {
                setEnd(m);
                setResult({ available: false, checked: false });
              }}
              invalid={timeInvalid}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Enter any time to the minute — e.g. 10:01 or 16:38. End may be 24:00.
          </p>

          {/* duration chip */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Duration: <span className="font-semibold text-slate-700">{end - start} min</span>
              {end - start > 120 && (
                <span className="ml-2 inline-flex items-center gap-1 text-rose-600">
                  <AlertTriangle className="h-3 w-3" /> exceeds 120 min
                </span>
              )}
            </span>
            <span className="text-slate-400">Max 120 min</span>
          </div>
        </section>

        {/* Validation feedback (AC6) */}
        <div
          className={`mb-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
            validation.ok
              ? "bg-sky-50 text-sky-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {validation.ok ? (
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>
            {validation.ok
              ? "Inputs look valid. Tap Check availability."
              : validation.reason}
          </span>
        </div>

        {/* Timeline */}
        <div className="mb-4">
          <Timeline
            bookings={existing}
            proposedStart={start}
            proposedEnd={end}
            blocked={dayData.blocked}
          />
        </div>

        {/* Existing bookings list */}
        <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Existing bookings ({existing.length})
          </h3>
          {existing.length === 0 ? (
            <p className="text-xs text-slate-400">No bookings for this room and day.</p>
          ) : (
            <ul className="space-y-1.5">
              {existing
                .slice()
                .sort((a, b) => a[0] - b[0])
                .map(([bs, be], i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs"
                  >
                    <span className="font-medium text-slate-700">
                      {minutesToLabel(bs)} – {minutesToLabel(be)}
                    </span>
                    <span className="text-slate-400">{be - bs} min</span>
                  </li>
                ))}
            </ul>
          )}
        </section>

        {/* Check button — disabled when no room is active */}
        <button
          onClick={handleCheck}
          disabled={!validation.ok || !activeRoom}
          className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
            validation.ok && activeRoom
              ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-[.99]"
              : "cursor-not-allowed bg-slate-200 text-slate-400"
          }`}
        >
          Check availability
        </button>

        {/* Result (AC5) */}
        {result.checked && activeRoom && (
          <div
            className={`mt-4 flex items-start gap-3 rounded-2xl px-4 py-4 shadow-sm ${
              result.available
                ? "bg-emerald-50 border border-emerald-200"
                : "bg-rose-50 border border-rose-200"
            }`}
          >
            {result.available ? (
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-rose-600" />
            )}
            <div>
              <div
                className={`text-base font-bold ${
                  result.available ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {result.available ? "Available" : "Unavailable"}
              </div>
              <div className="mt-0.5 text-sm text-slate-600">
                {result.available
                  ? `${activeRoom.name} is free on ${dayOffset === 0 ? "today" : "tomorrow"} from ${minutesToLabel(
                      start,
                    )} to ${minutesToLabel(end)}. No booking was created.`
                  : !validation.ok
                    ? validation.reason
                    : "The proposed time does not meet the rules. Review the warnings above."}
              </div>
            </div>
          </div>
        )}

        <footer className="mt-8 flex items-center justify-center gap-1 text-center text-xs text-slate-400">
          <Users className="h-3 w-3" />
          Prototype · availability check only · no booking is created
        </footer>
      </div>
    </div>
  );
}
