import { describe, expect, it } from "vitest";
import { filterRooms, collectEquipment, type FilterCriteria } from "./filterRooms";
import type { Room } from "./rooms";

const rooms: Room[] = [
  { id: "A", name: "A", building: "B", capacity: 10, equipment: ["Projector", "Whiteboard"], blocked: false },
  { id: "B", name: "B", building: "B", capacity: 30, equipment: ["Projector", "Computers"], blocked: false },
  { id: "C", name: "C", building: "B", capacity: 8, equipment: ["Whiteboard"], blocked: false },
  { id: "D", name: "D", building: "B", capacity: 50, equipment: ["Projector", "Whiteboard", "Computers"], blocked: true },
];

const noEquip: FilterCriteria = { minCapacity: 0, equipment: [] };

describe("filterRooms - F1 (capacity)", () => {
  it("filters rooms below the requested capacity", () => {
    const r = filterRooms(rooms, { minCapacity: 20, equipment: [] });
    expect(r.map((x) => x.id)).toEqual(["B"]);
  });

  it("includes rooms at exactly the requested capacity", () => {
    const r = filterRooms(rooms, { minCapacity: 10, equipment: [] });
    expect(r.map((x) => x.id)).toEqual(["A", "B"]);
  });
});

describe("filterRooms - F2 (equipment subset)", () => {
  it("returns all rooms when no equipment is selected", () => {
    const r = filterRooms(rooms, noEquip);
    expect(r.map((x) => x.id)).toEqual(["A", "B", "C"]);
  });

  it("requires ALL selected equipment items", () => {
    const r = filterRooms(rooms, { minCapacity: 0, equipment: ["Projector", "Whiteboard"] });
    expect(r.map((x) => x.id)).toEqual(["A"]);
  });

  it("matches a single equipment item across rooms", () => {
    const r = filterRooms(rooms, { minCapacity: 0, equipment: ["Projector"] });
    expect(r.map((x) => x.id)).toEqual(["A", "B"]);
  });

  it("returns empty when equipment does not match any room", () => {
    const r = filterRooms(rooms, { minCapacity: 0, equipment: ["Microphone"] });
    expect(r).toEqual([]);
  });
});

describe("filterRooms - F3 (blocked excluded)", () => {
  it("never includes blocked rooms even if they match capacity and equipment", () => {
    const r = filterRooms(rooms, { minCapacity: 0, equipment: ["Projector", "Whiteboard", "Computers"] });
    expect(r).toEqual([]);
  });

  it("excludes blocked rooms with no other criteria", () => {
    const r = filterRooms(rooms, noEquip);
    expect(r.map((x) => x.id)).not.toContain("D");
  });
});

describe("filterRooms - purity", () => {
  it("does not mutate the input array", () => {
    const snapshot = [...rooms];
    filterRooms(rooms, { minCapacity: 5, equipment: ["Projector"] });
    expect(rooms).toEqual(snapshot);
  });
});

describe("collectEquipment", () => {
  it("returns a sorted distinct list of all equipment", () => {
    expect(collectEquipment(rooms)).toEqual(["Computers", "Projector", "Whiteboard"]);
  });

  it("returns empty for no rooms", () => {
    expect(collectEquipment([])).toEqual([]);
  });
});
