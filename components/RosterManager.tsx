"use client";
import { Suspense, useState } from "react";
import { EmployeeManager } from "./EmployeeManager";
import { ErrorBoundary } from "react-error-boundary";
import { RosterGrid } from "./RosterGrid";
import { useRosterData } from "@/hooks/useRosterData";
import { useDateNavigation } from "@/hooks/useDateNavigation";
import { DateNavigation } from "./DateNavigation";
import { ErrorFallback } from "./error";
import { Loading } from "./loading";

export function RosterManager() {
  const [initialDate, setInitialDate] = useState<Date>(new Date());
  const { currentDate, goToPreviousDay, goToNextDay } =
    useDateNavigation(initialDate);
  const {
    employees,
    shifts,
    handleAddEmployee,
    handleRemoveEmployee,
    setShifts,
  } = useRosterData(currentDate);

  return (
    <div className="h-screen flex flex-col p-0 bg-[#FAFAFA]">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-[#E0E0E0] bg-white">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-[#333333] font-semibold">
              Smart Roster Scheduler
            </h1>
          </div>

          {/* Date Navigation */}
          <Suspense fallback={<Loading />}>
            <DateNavigation
              currentDate={currentDate}
              onPreviousDay={goToPreviousDay}
              onNextDay={goToNextDay}
            />
          </Suspense>

          <div className="flex-1 flex justify-end">
            <EmployeeManager
              employees={employees}
              onAddEmployee={handleAddEmployee}
              onRemoveEmployee={handleRemoveEmployee}
            />
          </div>
        </header>

        {/* Roster Grid */}
        <main className="flex-1">
          <RosterGrid
            employees={employees}
            currentDate={currentDate}
            shifts={shifts}
            onShiftsChange={setShifts}
          />
        </main>
      </ErrorBoundary>
    </div>
  );
}
