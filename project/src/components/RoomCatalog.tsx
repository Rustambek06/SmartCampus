import { DoorClosed, SearchX } from "lucide-react";
import type { Room, DayOffset } from "@/lib/types";
import { getRoomDayData } from "@/lib/rooms";

interface RoomCatalogProps {
  rooms: Room[];
  activeRoomId: string | null;
  dayOffset: DayOffset;
  onSelectRoom: (id: string) => void;
  onClearFilters: () => void;
}

export function RoomCatalog({
  rooms,
  activeRoomId,
  dayOffset,
  onSelectRoom,
  onClearFilters,
}: RoomCatalogProps) {
  return (
    <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <DoorClosed className="h-4 w-4 text-slate-400" />
        Select a room
        {rooms.length > 0 && (
          <span className="text-xs font-normal text-slate-400">
            ({rooms.length} available)
          </span>
        )}
      </label>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 px-4 py-8 text-center">
          <SearchX className="h-7 w-7 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">
            No rooms match your filters
          </p>
          <p className="text-xs text-slate-400">
            Try lowering the seat count or removing equipment requirements.
          </p>
          <button
            onClick={onClearFilters}
            className="mt-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {rooms.map((r) => {
            const selected = activeRoomId === r.id;
            const blockedToday = getRoomDayData(r.id, dayOffset).blocked;
            return (
              <button
                key={r.id}
                onClick={() => onSelectRoom(r.id)}
                className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                  selected
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-800">{r.name}</div>
                  <div className="text-xs text-slate-500">
                    {r.building} · seats {r.capacity}
                  </div>
                  {r.equipment.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.equipment.map((e) => (
                        <span
                          key={e}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {blockedToday ? (
                  <span className="ml-2 shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                    Blocked
                  </span>
                ) : (
                  <span className="ml-2 shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                    Open
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
