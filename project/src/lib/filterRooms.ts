import type { FilterCriteria, Room } from "./types";

export type { FilterCriteria };

// F3: a blocked room is never available, so it is filtered out regardless
// of other criteria.
function isBookable(room: Room): boolean {
  return !room.blocked;
}

// F1: room.capacity >= requested minCapacity.
function meetsCapacity(room: Room, minCapacity: number): boolean {
  return room.capacity >= minCapacity;
}

// F2: room must contain ALL selected equipment items (subset match).
function hasAllEquipment(room: Room, required: string[]): boolean {
  if (required.length === 0) return true;
  const set = new Set(room.equipment);
  return required.every((item) => set.has(item));
}

// Pure filter combining F1 (capacity), F2 (equipment subset), and F3 (blocked).
// Does not mutate the input array or any room object.
export function filterRooms(rooms: Room[], criteria: FilterCriteria): Room[] {
  const { minCapacity, equipment } = criteria;
  return rooms.filter(
    (r) =>
      isBookable(r) &&
      meetsCapacity(r, minCapacity) &&
      hasAllEquipment(r, equipment),
  );
}

// Derives the distinct sorted list of all equipment across a set of rooms,
// for building filter chip controls.
export function collectEquipment(rooms: Room[]): string[] {
  const set = new Set<string>();
  for (const r of rooms) {
    for (const e of r.equipment) set.add(e);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

// F5: if the active room is no longer in the filtered list, fall back to the
// first visible room (or null when the list is empty).
export function resolveActiveRoomId(
  filteredRooms: Room[],
  activeId: string,
): string | null {
  const stillVisible = filteredRooms.find((r) => r.id === activeId);
  return stillVisible?.id ?? filteredRooms[0]?.id ?? null;
}
