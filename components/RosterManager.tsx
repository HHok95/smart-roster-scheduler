"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { EmployeeManager } from "./EmployeeManager";
import { RosterGrid, Shift } from "./RosterGrid";
import { DateNavigation } from "./DateNavigation";

const STORAGE_KEYS = {
  EMPLOYEES: "roster-employees",
  SHIFTS_PREFIX: "roster-shifts-",
};

interface RosterManagerProps {
  initialDate: Date;
}

export function RosterManager({ initialDate }: RosterManagerProps) {
  // Use a ref to ensure we only use the initialDate on first render
  const dateRef = useRef(initialDate);
  const [currentDate, setCurrentDate] = useState(() => dateRef.current);
  const [employees, setEmployees] = useState<string[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  // Load employees from localStorage on mount
  useEffect(() => {
    const storedEmployees = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    } else {
      // Default employees
      const defaultEmployees = ["Dan"];
      setEmployees(defaultEmployees);
      localStorage.setItem(
        STORAGE_KEYS.EMPLOYEES,
        JSON.stringify(defaultEmployees)
      );
    }
  }, []);

  // Load shifts for current date
  useEffect(() => {
    const dateKey = formatDateKey(currentDate);
    const storedShifts = localStorage.getItem(
      STORAGE_KEYS.SHIFTS_PREFIX + dateKey
    );
    if (storedShifts) {
      setShifts(JSON.parse(storedShifts));
    } else {
      setShifts([]);
    }
  }, [currentDate]);

  // Save shifts whenever they change
  useEffect(() => {
    const dateKey = formatDateKey(currentDate);
    localStorage.setItem(
      STORAGE_KEYS.SHIFTS_PREFIX + dateKey,
      JSON.stringify(shifts)
    );
  }, [shifts, currentDate]);

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

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

  const handleAddEmployee = (name: string) => {
    const updatedEmployees = [...employees, name];
    setEmployees(updatedEmployees);
    localStorage.setItem(
      STORAGE_KEYS.EMPLOYEES,
      JSON.stringify(updatedEmployees)
    );
  };

  const handleRemoveEmployee = (name: string) => {
    const updatedEmployees = employees.filter((e) => e !== name);
    setEmployees(updatedEmployees);
    localStorage.setItem(
      STORAGE_KEYS.EMPLOYEES,
      JSON.stringify(updatedEmployees)
    );

    // Remove all shifts for this employee from current view
    setShifts(shifts.filter((s) => s.employeeId !== name));
  };

  return (
    <div
      className="h-screen flex flex-col p-0"
      style={{ backgroundColor: "#FAFAFA" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{
          borderColor: "#E0E0E0",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div className="flex items-center gap-4 flex-1">
          <h1 style={{ color: "#333333" }}>Smart Roster Scheduler</h1>
        </div>

        {/* Date Navigation */}
        <Suspense
          fallback={
            <div className="min-w-[280px] flex items-center justify-center">
              Loading...
            </div>
          }
        >
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
      </div>

      {/* Roster Grid */}
      <RosterGrid
        employees={employees}
        currentDate={currentDate}
        shifts={shifts}
        onShiftsChange={setShifts}
      />
    </div>
  );
}
