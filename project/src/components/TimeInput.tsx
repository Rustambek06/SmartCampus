import { useEffect, useRef, useState } from "react";

interface TimeInputProps {
  value: number; // minutes after midnight
  onChange: (minutes: number) => void;
  allowMidnightEnd?: boolean; // when true, 24:00 (1440) is a valid end value
  invalid?: boolean;
  label?: string;
}

// Parses a pair of hour/minute strings into integer minutes.
// Returns null when the inputs are empty or not valid integers in range.
function parseToMinutes(
  hourStr: string,
  minuteStr: string,
  allowMidnightEnd: boolean,
): number | null {
  const h = hourStr === "" ? NaN : Number(hourStr);
  const m = minuteStr === "" ? NaN : Number(minuteStr);
  if (!Number.isInteger(h) || !Number.isInteger(m)) return null;

  if (allowMidnightEnd && h === 24 && m === 0) return 1440;

  if (!(h >= 0 && h <= 23)) return null;
  if (!(m >= 0 && m <= 59)) return null;
  return h * 60 + m;
}

function splitMinutes(minutes: number): { hour: string; minute: string } {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return {
    hour: h === 24 ? "24" : String(h),
    minute: String(m).padStart(2, "0"),
  };
}

export function TimeInput({
  value,
  onChange,
  allowMidnightEnd = false,
  invalid = false,
  label,
}: TimeInputProps) {
  const initial = splitMinutes(value);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const minuteRef = useRef<HTMLInputElement>(null);

  // Keep local text fields synced when the parent value changes
  // for external reasons (e.g. day/room reset).
  useEffect(() => {
    const parts = splitMinutes(value);
    setHour(parts.hour);
    setMinute(parts.minute);
  }, [value]);

  function commit(nextHour: string, nextMinute: string) {
    const minutes = parseToMinutes(nextHour, nextMinute, allowMidnightEnd);
    if (minutes !== null) {
      onChange(minutes);
    }
  }

  function handleHourChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d]/g, "").slice(0, 2);
    setHour(raw);
    const upper = allowMidnightEnd ? 24 : 23;
    if (raw.length === 2) {
      const n = Number(raw);
      if (n <= upper) {
        commit(raw, minute);
        minuteRef.current?.focus();
        minuteRef.current?.select();
      }
    }
  }

  function handleHourBlur() {
    // Normalize partial input (e.g. "9" -> "09")
    if (hour === "") return;
    const n = Number(hour);
    if (Number.isNaN(n)) {
      setHour("");
      return;
    }
    const upper = allowMidnightEnd ? 24 : 23;
    const clamped = Math.max(0, Math.min(upper, n));
    const normalized = allowMidnightEnd && clamped === 24 ? "24" : String(clamped).padStart(2, "0");
    setHour(normalized);
    commit(normalized, minute);
  }

  function handleMinuteChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d]/g, "").slice(0, 2);
    setMinute(raw);
    if (raw.length === 2) {
      const n = Number(raw);
      if (n <= 59) {
        commit(hour, raw);
      }
    }
  }

  function handleMinuteBlur() {
    if (minute === "") return;
    const n = Number(minute);
    if (Number.isNaN(n)) {
      setMinute("");
      return;
    }
    const clamped = Math.max(0, Math.min(59, n));
    const normalized = String(clamped).padStart(2, "0");
    setMinute(normalized);
    commit(hour, normalized);
  }

  const borderClass = invalid
    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
    : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500";

  return (
    <div>
      {label && (
        <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      )}
      <div
        className={`flex items-center rounded-lg border bg-white px-2 py-1.5 text-sm focus-within:ring-1 ${borderClass}`}
      >
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={hour}
          onChange={handleHourChange}
          onBlur={handleHourBlur}
          onFocus={(e) => e.target.select()}
          placeholder="hh"
          aria-label="hour"
          className="w-9 bg-transparent text-center tabular-nums outline-none placeholder:text-slate-300"
        />
        <span className="px-0.5 text-slate-400">:</span>
        <input
          ref={minuteRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={minute}
          onChange={handleMinuteChange}
          onBlur={handleMinuteBlur}
          onFocus={(e) => e.target.select()}
          placeholder="mm"
          aria-label="minute"
          className="w-10 bg-transparent text-center tabular-nums outline-none placeholder:text-slate-300"
        />
      </div>
    </div>
  );
}
