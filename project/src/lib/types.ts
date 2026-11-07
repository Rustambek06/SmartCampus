// Shared domain types for the Smart Campus room availability checker.
// Keeping these in one place avoids cross-imports between data modules
// (rooms.ts), rule modules (canBook.ts), and filter modules (filterRooms.ts).

export type Booking = [start: number, end: number];

export type DayOffset = 0 | 1;

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
}

export interface RoomDayData {
  blocked: boolean;
  bookings: Booking[];
}

export interface FilterCriteria {
  minCapacity: number;
  equipment: string[];
}
