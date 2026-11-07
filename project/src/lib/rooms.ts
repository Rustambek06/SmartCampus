import type { DayOffset, Room, RoomDayData } from "./types";

export type { Room, RoomDayData };

// Prototype-only sample data. The page supplies bookings for the
// selected room and day; the can_book function does not fetch them.
export const ROOMS: Room[] = [
  {
    id: "A101",
    name: "Room A101",
    building: "Engineering Block",
    capacity: 24,
    equipment: ["Projector", "Whiteboard", "Power outlets"],
    blocked: false,
  },
  {
    id: "B204",
    name: "Room B204",
    building: "Science Wing",
    capacity: 40,
    equipment: ["Projector", "Microphone", "Lecture capture"],
    blocked: false,
  },
  {
    id: "C310",
    name: "Lab C310",
    building: "IT Centre",
    capacity: 16,
    equipment: ["Computers", "Air conditioning"],
    blocked: false,
  },
  {
    id: "D005",
    name: "Seminar D005",
    building: "Library",
    capacity: 8,
    equipment: ["Whiteboard", "Video call screen"],
    blocked: false,
  },
  {
    id: "E112",
    name: "Study Room E112",
    building: "Business Hub",
    capacity: 12,
    equipment: ["Whiteboard", "Video call screen", "Power outlets"],
    blocked: true,
  },
];

// Per-room, per-dayOffset bookings (0 = today, 1 = tomorrow).
// Times are integer minutes after midnight. A room-level blocked flag
// (Room.blocked) blocks all days; an entry here may additionally block
// a specific day.
export const SAMPLE_DATA: Record<string, Record<DayOffset, RoomDayData>> = {
  A101: {
    0: { blocked: false, bookings: [[540, 600], [780, 840]] },
    1: { blocked: false, bookings: [[600, 660], [780, 840]] },
  },
  B204: {
    0: { blocked: true, bookings: [] },
    1: { blocked: false, bookings: [[480, 540], [900, 960]] },
  },
  C310: {
    0: { blocked: false, bookings: [[720, 780]] },
    1: { blocked: false, bookings: [[600, 720]] },
  },
  D005: {
    0: { blocked: false, bookings: [[600, 660], [660, 720], [1020, 1080]] },
    1: { blocked: false, bookings: [] },
  },
  E112: {
    0: { blocked: false, bookings: [[840, 900]] },
    1: { blocked: false, bookings: [[540, 600]] },
  },
};

export function getRoomDayData(roomId: string, dayOffset: DayOffset): RoomDayData {
  const room = ROOMS.find((r) => r.id === roomId);
  const entry = SAMPLE_DATA[roomId]?.[dayOffset] ?? { blocked: false, bookings: [] };
  // A room-level blocked flag blocks every day; a per-day flag blocks that day.
  const blocked = (room?.blocked ?? false) || entry.blocked;
  return { blocked, bookings: entry.bookings };
}
