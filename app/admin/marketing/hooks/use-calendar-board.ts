"use client";

import { useState } from "react";
import {
  initialCalendarBoard,
  type CalendarBoard,
  type CalendarDay,
} from "@/lib/marketing/marketing-page-config";

export function useCalendarBoard() {
  const [calendarBoard, setCalendarBoard] =
    useState<CalendarBoard>(initialCalendarBoard);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedFromDay, setDraggedFromDay] = useState<CalendarDay | null>(null);

  function handleCalendarDragStart(day: CalendarDay, itemId: string) {
    setDraggedFromDay(day);
    setDraggedItemId(itemId);
  }

  function handleCalendarDrop(targetDay: CalendarDay) {
    if (!draggedFromDay || !draggedItemId) {
      return;
    }

    if (draggedFromDay === targetDay) {
      setDraggedFromDay(null);
      setDraggedItemId(null);
      return;
    }

    setCalendarBoard((prev) => {
      const sourceItems = prev[draggedFromDay];
      const movedItem = sourceItems.find((item) => item.id === draggedItemId);

      if (!movedItem) {
        return prev;
      }

      return {
        ...prev,
        [draggedFromDay]: sourceItems.filter(
          (item) => item.id !== draggedItemId
        ),
        [targetDay]: [...prev[targetDay], movedItem],
      };
    });

    setDraggedFromDay(null);
    setDraggedItemId(null);
  }

  return {
    calendarBoard,
    handleCalendarDragStart,
    handleCalendarDrop,
  };
}
