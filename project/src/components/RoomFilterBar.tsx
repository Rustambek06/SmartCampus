import { Filter, Users2 } from "lucide-react";

interface RoomFilterBarProps {
  minCapacity: number;
  equipmentOptions: string[];
  selectedEquipment: string[];
  onCapacityChange: (value: number) => void;
  onToggleEquipment: (item: string) => void;
  onClear: () => void;
}

export function RoomFilterBar({
  minCapacity,
  equipmentOptions,
  selectedEquipment,
  onCapacityChange,
  onToggleEquipment,
  onClear,
}: RoomFilterBarProps) {
  return (
    <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Filter className="h-4 w-4 text-slate-400" />
        Filter rooms
      </div>

      {/* Capacity */}
      <div className="mb-3">
        <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Users2 className="h-3.5 w-3.5" />
          Minimum seats
        </label>
        <input
          type="number"
          min={0}
          value={minCapacity}
          onChange={(e) => {
            const v = Number(e.target.value);
            onCapacityChange(Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
          }}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          placeholder="0"
        />
      </div>

      {/* Equipment chips */}
      <div>
        <span className="mb-1.5 block text-xs font-medium text-slate-500">Equipment</span>
        <div className="flex flex-wrap gap-1.5">
          {equipmentOptions.map((item) => {
            const active = selectedEquipment.includes(item);
            return (
              <button
                key={item}
                onClick={() => onToggleEquipment(item)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
        {(minCapacity > 0 || selectedEquipment.length > 0) && (
          <button
            onClick={onClear}
            className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}
