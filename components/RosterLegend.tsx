import React from "react";

interface LegendItem {
  type: string;
  color: string;
  label: string;
}

const ROLE_TYPE_COLORS = {
  reg: "#42A5F5", // blue
  floor: "#ffc356", // orange
  coolroom: "#80DEEA", // cyan
  online: "#4CAF50", // green
};

const LEGEND_ITEMS: LegendItem[] = [
  { type: "reg", color: ROLE_TYPE_COLORS.reg, label: "Register" },
  { type: "floor", color: ROLE_TYPE_COLORS.floor, label: "Floor" },
  { type: "coolroom", color: ROLE_TYPE_COLORS.coolroom, label: "Coolroom" },
  { type: "online", color: ROLE_TYPE_COLORS.online, label: "Online" },
  { type: "break", color: "#3b3b3b", label: "Break" },
];

export function RosterLegend() {
  return (
    <div className="flex flex-wrap gap-2 p-2">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.type} className="flex items-center gap-1">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-gray-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
