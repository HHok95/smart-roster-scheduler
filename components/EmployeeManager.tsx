"use client";
import { useState } from "react";
import { X, Plus, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface EmployeeManagerProps {
  employees: string[];
  onAddEmployee: (name: string) => void;
  onRemoveEmployee: (name: string) => void;
}

export function EmployeeManager({
  employees,
  onAddEmployee,
  onRemoveEmployee,
}: EmployeeManagerProps) {
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleAddEmployee = () => {
    if (newEmployeeName.trim()) {
      onAddEmployee(newEmployeeName.trim());
      setNewEmployeeName("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddEmployee();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
          style={{ borderColor: "#E0E0E0" }}
        >
          <Users className="h-4 w-4" style={{ color: "#333333" }} />
          <span style={{ color: "#333333" }}>Manage Employees</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Employees</DialogTitle>
          <DialogDescription>
            Add or remove employees from the roster.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Add Employee */}
          <div className="flex gap-2">
            <Input
              placeholder="Employee name"
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleAddEmployee} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Employee List */}
          <div className="space-y-2">
            {employees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No employees added yet
              </p>
            ) : (
              employees.map((employee) => (
                <div
                  key={employee}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{ borderColor: "#E0E0E0" }}
                >
                  <span style={{ color: "#333333" }}>{employee}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveEmployee(employee)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" style={{ color: "#333333" }} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
