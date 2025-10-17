import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface DateNavigationProps {
  currentDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
}

export function DateNavigation({
  currentDate,
  onPreviousDay,
  onNextDay,
}: DateNavigationProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={onPreviousDay}
        className="h-10 w-10 rounded-lg"
        style={{ borderColor: "#E0E0E0" }}
      >
        <ChevronLeft className="h-5 w-5" style={{ color: "#333333" }} />
      </Button>

      <div className="min-w-[280px] text-center" style={{ color: "#333333" }}>
        {formatDate(currentDate)}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onNextDay}
        className="h-10 w-10 rounded-lg"
        style={{ borderColor: "#E0E0E0" }}
      >
        <ChevronRight className="h-5 w-5" style={{ color: "#333333" }} />
      </Button>
    </div>
  );
}
