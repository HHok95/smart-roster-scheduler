"use client";
import { Shift } from "@/components/RosterGrid";
import { formatDateKey } from "@/utils/formatDateKey";
import { useEffect, useState } from "react";

const STORAGE_KEYS = {
  EMPLOYEES: "roster-employees",
  SHIFTS_PREFIX: "roster-shifts-",
};

interface UseRosterDataReturn {
  employees: string[];
  shifts: Shift[];
  handleAddEmployee: (name: string) => void;
  handleRemoveEmployee: (name: string) => void;
  setShifts: (shifts: Shift[]) => void;
}

export const useRosterData = (currentDate: Date): UseRosterDataReturn => {
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
  }, [shifts]);

  const handleAddEmployee = (name: string) => {
    const updateEmployees = [...employees, name];
    setEmployees(updateEmployees);
    localStorage.setItem(
      STORAGE_KEYS.EMPLOYEES,
      JSON.stringify(updateEmployees)
    );
  };

  const handleRemoveEmployee = (name: string) => {
    const updatedEmployees = employees.filter((emp) => emp !== name);
    setEmployees(updatedEmployees);
    localStorage.setItem(
      STORAGE_KEYS.EMPLOYEES,
      JSON.stringify(updatedEmployees)
    );
    setShifts(shifts.filter((s) => s.employeeId !== name));
  };

  return {
    employees,
    shifts,
    handleAddEmployee,
    handleRemoveEmployee,
    setShifts,
  };
};
