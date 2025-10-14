import { useRef, useState } from "react";

interface UseDateNavigationReturn {
  currentDate: Date;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  setCurrentDate: (date: Date) => void;
}

export const useDateNavigation = (
  initialDate: Date
): UseDateNavigationReturn => {
  const dateRef = useRef(initialDate);
  const [currentDate, setCurrentDate] = useState(() => dateRef.current);

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  return {
    currentDate,
    goToPreviousDay,
    goToNextDay,
    setCurrentDate,
  };
};
