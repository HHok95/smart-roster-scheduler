/**
 * Break calculation rules:
 * - <4h: no break
 * - 4-5h: 1×15 min (paid)
 * - 5-<7h: 1×15 min (paid) + 1×30 min (unpaid)
 * - ≥7h-<10h: 2×15 min (paid) + 1×30 min (unpaid)
 */

export interface Break {
  start: number;
  end: number;
  type: "paid" | "unpaid";
}

export function calculateBreaks(startSlot: number, endSlot: number): Break[] {
  const durationInSlots = endSlot - startSlot;
  const durationInHours = durationInSlots / 4; // 4 slots = 1 hour

  const breaks: Break[] = [];

  if (durationInHours < 4) {
    // No break
    return breaks;
  } else if (durationInHours >= 4 && durationInHours <= 5) {
    // 1×15 min (paid)
    const breakStart = startSlot + Math.floor(durationInSlots / 2);
    breaks.push({ start: breakStart, end: breakStart + 1, type: "paid" }); // 1 slot = 15 min
  } else if (durationInHours > 5 && durationInHours < 7) {
    // 1×15 min (paid) + 1×30 min (unpaid)
    const thirdPoint = Math.floor(durationInSlots / 3);

    // First paid break at 1/3
    breaks.push({
      start: startSlot + thirdPoint,
      end: startSlot + thirdPoint + 1,
      type: "paid",
    });

    // Unpaid break at 2/3
    const unpaidStart = startSlot + thirdPoint * 2;
    breaks.push({ start: unpaidStart, end: unpaidStart + 2, type: "unpaid" }); // 2 slots = 30 min
  } else if (durationInHours >= 7 && durationInHours < 10) {
    // 2×15 min (paid) + 1×30 min (unpaid)
    const quarterPoint = Math.floor(durationInSlots / 4);

    // First paid break at 1/4
    breaks.push({
      start: startSlot + quarterPoint,
      end: startSlot + quarterPoint + 1,
      type: "paid",
    });

    // Unpaid break at 2/4 (middle)
    const unpaidStart = startSlot + quarterPoint * 2;
    breaks.push({ start: unpaidStart, end: unpaidStart + 2, type: "unpaid" });

    // Second paid break at 3/4
    const secondPaidStart = startSlot + quarterPoint * 3;
    breaks.push({
      start: secondPaidStart,
      end: secondPaidStart + 1,
      type: "paid",
    });
  } else {
    // For shifts >= 10 hours, use same as 7-10h (can be extended later if needed)
    const quarterPoint = Math.floor(durationInSlots / 4);

    breaks.push({
      start: startSlot + quarterPoint,
      end: startSlot + quarterPoint + 1,
      type: "paid",
    });

    const unpaidStart = startSlot + quarterPoint * 2;
    breaks.push({ start: unpaidStart, end: unpaidStart + 2, type: "unpaid" });

    const secondPaidStart = startSlot + quarterPoint * 3;
    breaks.push({
      start: secondPaidStart,
      end: secondPaidStart + 1,
      type: "paid",
    });
  }

  return breaks;
}

export function formatDuration(startSlot: number, endSlot: number): string {
  const durationInSlots = endSlot - startSlot;
  const hours = Math.floor(durationInSlots / 4);
  const minutes = (durationInSlots % 4) * 15;

  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}
