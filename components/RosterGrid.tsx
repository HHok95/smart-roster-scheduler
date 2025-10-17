"use client";
import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  calculateBreaks,
  formatDuration,
  Break,
} from "../utils/breakCalculator";
import { RosterLegend } from "./RosterLegend";

export interface Shift {
  id: string;
  employeeId: string;
  startSlot: number;
  endSlot: number;
  breaks: Break[];
  roles: Role[];
}

const ROLE_TYPES = ["reg", "floor", "coolroom", "online"] as const;

const ROLE_TYPE_COLORS: Record<(typeof ROLE_TYPES)[number], string> = {
  reg: "#42A5F5", // blue
  floor: "#ffc356", // orange
  coolroom: "#cc99cc", // purple
  online: "#4CAF50", // green
};

interface Role {
  slotNumber: number;
  type: (typeof ROLE_TYPES)[number];
}

interface RosterGridProps {
  employees: string[];
  currentDate: Date;
  shifts: Shift[];
  onShiftsChange: (shifts: Shift[]) => void;
}

type DragMode = "create" | "resize-start" | "resize-end" | "move-break" | null;

export function RosterGrid({
  employees,
  currentDate,
  shifts,
  onShiftsChange,
}: RosterGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [dragStart, setDragStart] = useState<{
    employee: string;
    slot: number;
  } | null>(null);
  const [dragEnd, setDragEnd] = useState<{
    employee: string;
    slot: number;
  } | null>(null);
  const [resizingShift, setResizingShift] = useState<Shift | null>(null);
  const [movingBreak, setMovingBreak] = useState<{
    shift: Shift;
    breakIndex: number;
  } | null>(null);
  const [hoveredShift, setHoveredShift] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Time slots from 09:00 to 22:00 (15-minute intervals)
  const startHour = 8;
  const endHour = 22;
  const slotsPerHour = 4; // 15-minute intervals
  const totalSlots = (endHour - startHour) * slotsPerHour;
  const EDGE_THRESHOLD = 2; // Number of slots considered as "edge" for resizing
  const CELL_WIDTH = 36; // Reduced from 40px to fit screen better

  const getTimeLabel = (slotIndex: number) => {
    const totalMinutes = startHour * 60 + slotIndex * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Counter for generating unique IDs
  const idCounter = useRef(0);

  const generateShiftId = () => {
    idCounter.current += 1;
    return `shift-${Date.now()}-${idCounter.current
      .toString()
      .padStart(6, "0")}`;
  };

  const handleMouseDown = (
    employee: string,
    slot: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    // Only proceed if it's a left click (button 0)
    if (e.button !== 0) return;

    // Check if clicking on existing shift
    const existingShift = shifts.find(
      (s) =>
        s.employeeId === employee && slot >= s.startSlot && slot < s.endSlot
    );

    if (existingShift) {
      // Check if clicking on a break
      const breakIndex = existingShift.breaks.findIndex(
        (b) => slot >= b.start && slot < b.end
      );

      if (breakIndex !== -1) {
        // Start moving break
        setIsDragging(true);
        setDragMode("move-break");
        setMovingBreak({ shift: existingShift, breakIndex });
        setDragStart({ employee, slot });
        setDragEnd({ employee, slot });
        return;
      }

      // Check if clicking on edge for resizing
      const isNearStart = slot < existingShift.startSlot + EDGE_THRESHOLD;
      const isNearEnd = slot >= existingShift.endSlot - EDGE_THRESHOLD;

      if (isNearStart) {
        setIsDragging(true);
        setDragMode("resize-start");
        setResizingShift(existingShift);
        setDragStart({ employee, slot: existingShift.endSlot - 1 });
        setDragEnd({ employee, slot });
      } else if (isNearEnd) {
        setIsDragging(true);
        setDragMode("resize-end");
        setResizingShift(existingShift);
        setDragStart({ employee, slot: existingShift.startSlot });
        setDragEnd({ employee, slot });
      }
      return;
    }

    // Start creating new shift
    setIsDragging(true);
    setDragMode("create");
    setDragStart({ employee, slot });
    setDragEnd({ employee, slot });
  };

  const handleRightClick = (
    employee: string,
    slot: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault(); // Prevent default context menu
    e.stopPropagation();

    const shift = getShiftForSlot(employee, slot);
    if (!shift) return; // Only proceed if there's a shift

    // Find existing role for this specific slot
    const existingRoleIndex = shift.roles.findIndex(
      (role) => role.slotNumber === slot
    );
    const currentType =
      existingRoleIndex !== -1 ? shift.roles[existingRoleIndex].type : "reg";

    // Get next role type
    const currentIndex = ROLE_TYPES.indexOf(currentType);
    const nextType = ROLE_TYPES[(currentIndex + 1) % ROLE_TYPES.length];

    // Create updated roles array
    const updatedRoles = [...shift.roles];
    if (existingRoleIndex !== -1) {
      // Update existing role
      updatedRoles[existingRoleIndex] = {
        slotNumber: slot,
        type: nextType,
      };
    } else {
      // Add new role
      updatedRoles.push({
        slotNumber: slot,
        type: nextType,
      });
    }
    // Update shift with new roles
    const updatedShift = {
      ...shift,
      roles: updatedRoles,
    };

    // Update shifts array
    onShiftsChange(shifts.map((s) => (s.id === shift.id ? updatedShift : s)));
  };

  const handleMouseEnter = (employee: string, slot: number) => {
    if (isDragging && dragStart && dragStart.employee === employee) {
      setDragEnd({ employee, slot });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd && dragMode) {
      if (dragMode === "create") {
        const start = Math.min(dragStart.slot, dragEnd.slot);
        const end = Math.max(dragStart.slot, dragEnd.slot) + 1;

        // Only create shift if it's at least 2 hours (8 slots)
        if (end - start >= 8) {
          // Create an array of roles for each slot in the shift
          const roles = Array.from({ length: end - start }, (_, index) => ({
            slotNumber: start + index,
            type: "reg" as const,
          }));

          const newShift: Shift = {
            id: generateShiftId(),
            employeeId: dragStart.employee,
            startSlot: start,
            endSlot: end,
            breaks: calculateBreaks(start, end),
            roles: roles, // Assign the array of roles
          };

          onShiftsChange([...shifts, newShift]);
        }
      } else if (dragMode === "resize-start" && resizingShift) {
        const newStart = Math.min(dragStart.slot, dragEnd.slot);
        const end = Math.max(dragStart.slot, dragEnd.slot) + 1;

        // Ensure minimum 2 hours
        if (end - newStart >= 8) {
          const updatedShift = {
            ...resizingShift,
            startSlot: newStart,
            breaks: calculateBreaks(newStart, resizingShift.endSlot),
          };
          onShiftsChange(
            shifts.map((s) => (s.id === resizingShift.id ? updatedShift : s))
          );
        }
      } else if (dragMode === "resize-end" && resizingShift) {
        const start = Math.min(dragStart.slot, dragEnd.slot);
        const newEnd = Math.max(dragStart.slot, dragEnd.slot) + 1;

        // Ensure minimum 2 hours
        if (newEnd - start >= 8) {
          const updatedShift = {
            ...resizingShift,
            endSlot: newEnd,
            breaks: calculateBreaks(resizingShift.startSlot, newEnd),
          };
          onShiftsChange(
            shifts.map((s) => (s.id === resizingShift.id ? updatedShift : s))
          );
        }
      } else if (dragMode === "move-break" && movingBreak) {
        const { shift, breakIndex } = movingBreak;
        const movedBreak = shift.breaks[breakIndex];
        const breakDuration = movedBreak.end - movedBreak.start;
        const newBreakStart = dragEnd.slot;

        // Ensure break stays within shift bounds
        if (
          newBreakStart >= shift.startSlot &&
          newBreakStart + breakDuration <= shift.endSlot
        ) {
          const updatedBreaks = [...shift.breaks];
          updatedBreaks[breakIndex] = {
            ...movedBreak,
            start: newBreakStart,
            end: newBreakStart + breakDuration,
          };

          const updatedShift = {
            ...shift,
            breaks: updatedBreaks,
          };
          onShiftsChange(
            shifts.map((s) => (s.id === shift.id ? updatedShift : s))
          );
        }
      }
    }

    setIsDragging(false);
    setDragMode(null);
    setDragStart(null);
    setDragEnd(null);
    setResizingShift(null);
    setMovingBreak(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };
    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [
    isDragging,
    dragStart,
    dragEnd,
    shifts,
    dragMode,
    resizingShift,
    movingBreak,
  ]);

  const isSlotInDrag = (employee: string, slot: number) => {
    if (
      !isDragging ||
      !dragStart ||
      !dragEnd ||
      dragStart.employee !== employee
    ) {
      return false;
    }

    // For break moving, highlight the new position
    if (dragMode === "move-break" && movingBreak) {
      const breakDuration =
        movingBreak.shift.breaks[movingBreak.breakIndex].end -
        movingBreak.shift.breaks[movingBreak.breakIndex].start;
      return slot >= dragEnd.slot && slot < dragEnd.slot + breakDuration;
    }

    const start = Math.min(dragStart.slot, dragEnd.slot);
    const end = Math.max(dragStart.slot, dragEnd.slot);
    return slot >= start && slot <= end;
  };

  const getSlotType = (
    employee: string,
    slot: number
  ):
    | "break-15s"
    | "break-30s"
    | "empty"
    | "reg"
    | "floor"
    | "coolroom"
    | "online" => {
    const shift = shifts.find(
      (s) =>
        s.employeeId === employee && slot >= s.startSlot && slot < s.endSlot
    );
    if (shift) {
      const breakMatch = shift.breaks.find(
        (b) => slot >= b.start && slot < b.end
      );
      if (breakMatch) {
        return breakMatch.type === "break-15s" ? "break-15s" : "break-30s";
      }

      // Find the role for this specific slot
      const slotRole = shift.roles.find((role) => role.slotNumber === slot);
      if (slotRole) {
        return slotRole.type;
      }
      return "reg";
    }

    return "empty";
  };

  const getShiftForSlot = (employee: string, slot: number) => {
    return shifts.find(
      (s) =>
        s.employeeId === employee && slot >= s.startSlot && slot < s.endSlot
    );
  };

  const getBreakForSlot = (shift: Shift, slot: number) => {
    return shift.breaks.findIndex((b) => slot >= b.start && slot < b.end);
  };

  const handleDeleteShift = (shiftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHoveredShift(null);
    onShiftsChange(shifts.filter((s) => s.id !== shiftId));
  };

  const getCursorStyle = (employee: string, slot: number) => {
    const shift = getShiftForSlot(employee, slot);
    if (shift) {
      // Check if on a break
      const breakIndex = getBreakForSlot(shift, slot);
      if (breakIndex !== -1) {
        return "move";
      }

      const isNearStart = slot < shift.startSlot + EDGE_THRESHOLD;
      const isNearEnd = slot >= shift.endSlot - EDGE_THRESHOLD;
      if (isNearStart || isNearEnd) {
        return "col-resize";
      }
    }
    return "pointer";
  };

  return (
    <div
      className="flex-1 overflow-hidden flex flex-col"
      style={{ backgroundColor: "#FAFAFA" }}
    >
      <div className="flex-1 overflow-auto py-6 pr-1">
        <div className="inline-block min-w-full">
          <div className="flex">
            {/* Employee names column */}
            <div className="sticky left-0 z-10 bg-[#FAFAFA]">
              <div className="h-20 border-b" style={{ borderColor: "#E0E0E0" }}>
                <RosterLegend />
              </div>
              {employees.map((employee) => (
                <div
                  key={employee}
                  className="h-12 flex items-center px-4 border-b"
                  style={{
                    borderColor: "#E0E0E0",
                    color: "#333333",
                    minWidth: "140px",
                  }}
                >
                  <span className="text-sm">{employee}</span>
                </div>
              ))}
            </div>

            {/* Time grid */}
            <div className="flex-1" ref={gridRef}>
              {/* Time header */}
              <div
                className="flex h-20 border-b"
                style={{ borderColor: "#000000" }}
              >
                {Array.from({ length: totalSlots }).map((_, slotIndex) => {
                  // Show label every 4 slots (60 minutes)
                  const showLabel = slotIndex % 4 === 0;
                  return (
                    <div
                      key={slotIndex}
                      className={`flex-shrink-0 flex items-center justify-center ${
                        showLabel ? "border-l-2" : null
                      }`}
                      style={{
                        width: `${CELL_WIDTH}px`,
                        borderColor: "#000000",
                        color: "#333333",
                      }}
                    >
                      {showLabel && (
                        <span
                          className="inline-block ml-4 text-2xl"
                          style={{
                            width: `${CELL_WIDTH}px`,
                          }}
                        >
                          {getTimeLabel(slotIndex)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Employee rows */}
              {employees.map((employee) => (
                <div
                  key={employee}
                  className="flex h-12 border-b"
                  style={{ borderColor: "#000000" }}
                >
                  {Array.from({ length: totalSlots }).map((_, slotIndex) => {
                    const slotType = getSlotType(employee, slotIndex);
                    const shift = getShiftForSlot(employee, slotIndex);
                    const isFirstSlot = shift && slotIndex === shift.startSlot;
                    const isDragHighlight = isSlotInDrag(employee, slotIndex);

                    let backgroundColor = "#FAFAFA";
                    if (isDragHighlight) {
                      if (dragMode === "move-break" && movingBreak) {
                        backgroundColor =
                          movingBreak.shift.breaks[movingBreak.breakIndex]
                            .type === "break-15s"
                            ? "#636363"
                            : "#636363";
                      } else {
                        backgroundColor = "#e2ffe4";
                      }
                    } else if (
                      slotType === "break-15s" ||
                      slotType === "break-30s"
                    ) {
                      backgroundColor = "#3b3b3b";
                    } else {
                      const shift = getShiftForSlot(employee, slotIndex);
                      if (shift) {
                        const slotRole = shift.roles.find(
                          (role) => role.slotNumber === slotIndex
                        );
                        if (slotRole) {
                          backgroundColor = ROLE_TYPE_COLORS[slotRole.type];
                        } else {
                          backgroundColor = ROLE_TYPE_COLORS.reg; // Default color for shift
                        }
                      }
                    }

                    const cellContent = (
                      <div
                        key={slotIndex}
                        className="flex-shrink-0 border-r border-l relative select-none"
                        style={{
                          width: `${CELL_WIDTH}px`,
                          borderColor: "#000000",
                          backgroundColor,
                          cursor: getCursorStyle(employee, slotIndex),
                        }}
                        onMouseDown={(e) =>
                          handleMouseDown(employee, slotIndex, e)
                        }
                        onMouseEnter={() =>
                          handleMouseEnter(employee, slotIndex)
                        }
                        onContextMenu={(e) =>
                          handleRightClick(employee, slotIndex, e)
                        }
                      >
                        {isFirstSlot && shift && (
                          <div
                            className="absolute inset-y-0 left-0 flex items-center justify-center text-white text-xs px-2 rounded pointer-events-none"
                            style={{
                              width: `${
                                (shift.endSlot - shift.startSlot) * CELL_WIDTH
                              }px`,
                              backgroundColor: "transparent",
                              zIndex: 1,
                            }}
                            onMouseEnter={() => setHoveredShift(shift.id)}
                            onMouseLeave={() => setHoveredShift(null)}
                          >
                            <span className="pt-4 whitespace-nowrap text-red-500 drop-shadow-md">
                              {getTimeLabel(shift.startSlot)}–
                              {getTimeLabel(shift.endSlot)}
                            </span>
                          </div>
                        )}
                        {/* Delete button - only on first slot and when hovered */}
                        {isFirstSlot && shift && hoveredShift === shift.id && (
                          <button
                            onClick={(e) => handleDeleteShift(shift.id, e)}
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded flex items-center justify-center transition-colors hover:bg-red-500 z-10 pointer-events-auto"
                            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        )}
                      </div>
                    );

                    // Only show tooltip for shift blocks (not on individual cells to avoid glitching)
                    if (shift && isFirstSlot) {
                      return (
                        <TooltipProvider key={slotIndex} delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                style={{
                                  backgroundColor: "#d9ead3",
                                  borderRight: "1px solid ",
                                }}
                                onMouseEnter={() => setHoveredShift(shift.id)}
                                onMouseLeave={() => setHoveredShift(null)}
                              >
                                {cellContent}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs space-y-1">
                                <div>
                                  <strong>Duration:</strong>{" "}
                                  {formatDuration(
                                    shift.startSlot,
                                    shift.endSlot
                                  )}
                                </div>
                                <div>
                                  <strong>Shift:</strong>{" "}
                                  {getTimeLabel(shift.startSlot)}-
                                  {getTimeLabel(shift.endSlot)}
                                </div>
                                {shift.breaks.length > 0 && (
                                  <div className="pt-1 border-t border-gray-200">
                                    <strong>Breaks:</strong>
                                    {shift.breaks.map((brk, idx) => (
                                      <div key={idx} className="ml-2">
                                        • {getTimeLabel(brk.start)}-
                                        {getTimeLabel(brk.end)}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }

                    return cellContent;
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
