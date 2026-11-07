import { minutesToLabel } from "@/lib/time";
import type { Booking } from "@/lib/canBook";

interface TimelineProps {
  bookings: Booking[];
  proposedStart: number | null;
  proposedEnd: number | null;
  blocked: boolean;
}

const START_MIN = 7 * 60; // 7:00 AM
const END_MIN = 22 * 60; // 10:00 PM

function toPercent(min: number): number {
  const span = END_MIN - START_MIN;
  const clamped = Math.max(START_MIN, Math.min(END_MIN, min));
  return ((clamped - START_MIN) / span) * 100;
}

const HOURS = (() => {
  const out: number[] = [];
  for (let h = 7; h <= 22; h++) out.push(h * 60);
  return out;
})();

export function Timeline({ bookings, proposedStart, proposedEnd, blocked }: TimelineProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Today's schedule</h3>
        <span className="text-xs text-slate-400">7:00 AM – 10:00 PM</span>
      </div>

      {blocked ? (
        <div className="flex h-24 items-center justify-center rounded-xl bg-rose-50 text-sm font-medium text-rose-600">
          Room is blocked for this day
        </div>
      ) : (
        <div className="relative h-24 select-none">
          {/* hour gridlines */}
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute top-0 bottom-0 border-l border-slate-100"
              style={{ left: `${toPercent(h)}%` }}
            >
              <span className="absolute -top-0.5 -translate-x-1/2 text-[10px] text-slate-400">
                {minutesToLabel(h).replace(":00", "")}
              </span>
            </div>
          ))}

          {/* existing bookings */}
          {bookings.map(([bs, be], i) => {
            const left = toPercent(bs);
            const right = toPercent(be);
            return (
              <div
                key={i}
                className="absolute top-6 bottom-2 rounded-md bg-slate-300/80 px-1 flex items-center justify-center text-[10px] font-medium text-slate-700 overflow-hidden"
                style={{ left: `${left}%`, width: `${Math.max(right - left, 1.5)}%` }}
                title={`${minutesToLabel(bs)} – ${minutesToLabel(be)}`}
              >
                {right - left > 6 ? "Booked" : ""}
              </div>
            );
          })}

          {/* proposed interval */}
          {proposedStart !== null && proposedEnd !== null && (
            <div
              className="absolute top-6 bottom-2 rounded-md border-2 border-emerald-500 bg-emerald-400/30 flex items-center justify-center text-[10px] font-semibold text-emerald-700 overflow-hidden"
              style={{
                left: `${toPercent(proposedStart)}%`,
                width: `${Math.max(toPercent(proposedEnd) - toPercent(proposedStart), 1.5)}%`,
              }}
              title={`Proposed ${minutesToLabel(proposedStart)} – ${minutesToLabel(proposedEnd)}`}
            >
              {toPercent(proposedEnd) - toPercent(proposedStart) > 6 ? "You" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
