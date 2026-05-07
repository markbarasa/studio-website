// components/EquipmentQuickAssign.tsx
"use client";

import { useState, useEffect, useMemo } from "react";

type Equipment = {
  id: number;
  name: string;
  category: string;
  brand: string;
  model: string;
  status: string;
  assignedTo?: number;
  assignedToName?: string;
};

type EquipmentQuickAssignProps = {
  bookingId: number;
  bookingDate: string;
  currentAssigned: number[];
  onAssign: (equipmentIds: number[]) => void;
};

export default function EquipmentQuickAssign({ 
  bookingId, 
  bookingDate, 
  currentAssigned, 
  onAssign 
}: EquipmentQuickAssignProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [assignedIds, setAssignedIds] = useState<number[]>(currentAssigned);
  const [showSelector, setShowSelector] = useState(false);

  const categoryIcons: Record<string, string> = {
    camera: "📸", lens: "🔍", drone: "🛸", lighting: "💡",
    audio: "🎤", stabilizer: "🎥", accessory: "🔧", storage: "💾",
  };

  useEffect(() => {
    const stored = localStorage.getItem("equipment");
    if (stored) {
      try {
        const allEquipment = JSON.parse(stored);
        
        // Check for conflicts with other bookings on same date
        const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
        const conflictingBookings = bookings.filter(
          (b: any) => b.date === bookingDate && b.id !== bookingId
        );
        const conflictingEquipmentIds = conflictingBookings.flatMap(
          (b: any) => b.assignedEquipment || []
        );

        const equipmentWithConflicts = allEquipment.map((eq: Equipment) => ({
          ...eq,
          isConflicting: conflictingEquipmentIds.includes(eq.id) && !currentAssigned.includes(eq.id),
        }));
        
        setEquipment(equipmentWithConflicts);
      } catch {
        console.error("Failed to load equipment");
      }
    }
    setAssignedIds(currentAssigned);
  }, [bookingId, bookingDate, currentAssigned]);

  const toggleEquipment = (equipmentId: number) => {
    const eq = equipment.find(e => e.id === equipmentId);
    if (!eq) return;

    if (eq.status === "maintenance" || eq.status === "retired") {
      alert(`${eq.name} is currently ${eq.status} and cannot be assigned`);
      return;
    }

    if ((eq as any).isConflicting) {
      alert(`${eq.name} is already assigned to another booking on this date`);
      return;
    }

    const newAssigned = assignedIds.includes(equipmentId)
      ? assignedIds.filter(id => id !== equipmentId)
      : [...assignedIds, equipmentId];

    setAssignedIds(newAssigned);
    onAssign(newAssigned);
  };

  const assignedEquipment = equipment.filter(e => assignedIds.includes(e.id));
  const availableEquipment = equipment.filter(e => 
    e.status === "available" && !assignedIds.includes(e.id)
  );

  return (
    <div className="space-y-3">
      {/* Currently Assigned */}
      {assignedEquipment.length > 0 && (
        <div>
          <p className="text-xs text-zinc-400 mb-2">Currently Assigned:</p>
          <div className="flex flex-wrap gap-2">
            {assignedEquipment.map(eq => (
              <button
                key={eq.id}
                onClick={() => toggleEquipment(eq.id)}
                className="bg-green-900/30 text-green-400 border border-green-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 hover:bg-red-900/30 hover:text-red-400 hover:border-red-700 transition"
                title="Click to remove"
              >
                {categoryIcons[eq.category] || "📦"} {eq.name}
                <span className="text-xs">✕</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Equipment Button */}
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="w-full bg-zinc-700 hover:bg-zinc-600 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
      >
        {showSelector ? "🔼 Hide Available Equipment" : "🔽 Add Equipment"}
      </button>

      {/* Equipment Selector */}
      {showSelector && (
        <div className="space-y-2 max-h-48 overflow-y-auto border border-zinc-700 rounded-lg p-2">
          {availableEquipment.length === 0 ? (
            <p className="text-center text-zinc-500 text-sm py-4">No available equipment</p>
          ) : (
            availableEquipment.map(eq => (
              <button
                key={eq.id}
                onClick={() => toggleEquipment(eq.id)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-700 transition text-left"
              >
                <span className="text-lg">{categoryIcons[eq.category] || "📦"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{eq.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{eq.brand} {eq.model}</p>
                </div>
                {(eq as any).isConflicting && (
                  <span className="text-xs text-red-400">⚠️ Conflict</span>
                )}
                <span className="text-green-400 text-lg">+</span>
              </button>
            ))
          )}
        </div>
      )}

      {assignedEquipment.length === 0 && (
        <p className="text-zinc-500 text-sm text-center py-2">
          No equipment assigned to this booking
        </p>
      )}
    </div>
  );
}