import { useState } from "react";

/**
 * Handles translucent row/column highlighting (like a crosshair) for roster grids.
 *
 * Example:
 * const {
 *   hovered,
 *   isRowHovered,
 *   isColHovered,
 *   overlayColor,
 *   handleHover,
 *   clearHover,
 *   ROW_HL,
 *   COL_HL,
 *   INT_HL,
 * } = useCrosshairHighlight();
 */
export function useCrosshairHighlight() {
  const [hovered, setHovered] = useState<{
    employee: string | null;
    slot: number | null;
  }>({
    employee: null,
    slot: null,
  });

  // translucent highlight colors
  const ROW_HL = "rgba(66,165,245,0.10)"; // blue-ish tint
  const COL_HL = "rgba(66,165,245,0.10)";
  const INT_HL = "rgba(66,165,245,0.18)";

  const handleHover = (employee: string, slot: number) => {
    setHovered({ employee, slot });
  };

  const clearHover = () => {
    setHovered({ employee: null, slot: null });
  };

  const isRowHovered = (employee: string) => hovered.employee === employee;
  const isColHovered = (slot: number) => hovered.slot === slot;

  const getOverlayColor = (employee: string, slot: number) => {
    const isRow = isRowHovered(employee);
    const isCol = isColHovered(slot);
    if (isRow && isCol) return INT_HL;
    if (isRow) return ROW_HL;
    if (isCol) return COL_HL;
    return "transparent";
  };

  return {
    hovered,
    isRowHovered,
    isColHovered,
    getOverlayColor,
    handleHover,
    clearHover,
    ROW_HL,
    COL_HL,
    INT_HL,
  };
}
