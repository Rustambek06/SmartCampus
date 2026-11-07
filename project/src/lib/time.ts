export function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const period = h < 12 ? "AM" : "PM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function nowInMinutes(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

// Snap to nearest 15 minutes for the time picker.
export function snapTo15(min: number): number {
  return Math.round(min / 15) * 15;
}

export const MINUTE_OPTIONS: number[] = (() => {
  const out: number[] = [];
  for (let m = 0; m <= 1440; m += 15) out.push(m);
  return out;
})();
