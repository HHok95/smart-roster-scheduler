"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { EmployeeManager } from "./EmployeeManager";
import { ErrorBoundary } from "react-error-boundary";
import { RosterGrid } from "./RosterGrid";
import { useRosterData } from "@/hooks/useRosterData";
import { useDateNavigation } from "@/hooks/useDateNavigation";
import { Button } from "./ui/button";

// Proper dynamic import with loading state
const DateNavigation = dynamic(
  () => import("./DateNavigation").then((mod) => mod.DateNavigation),
  {
    ssr: false,
    loading: () => <LoadingDateNavigation />,
  }
);

function LoadingDateNavigation() {
  return (
    <div className="min-w-[280px] h-[40px] flex items-center justify-center bg-gray-50 animate-pulse">
      Loading...
    </div>
  );
}

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="p-4 bg-red-50 text-red-700">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <Button
        onClick={resetErrorBoundary}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </Button>
    </div>
  );
}

interface RosterManagerProps {
  initialDate: Date;
}

export function RosterManager({ initialDate }: RosterManagerProps) {
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
          <Suspense fallback={<LoadingDateNavigation />}>
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
