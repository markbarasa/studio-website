// components/EquipmentAssignment.tsx
"use client";

import { useState, useEffect, useMemo } from "react";

type Equipment = {
  id: number;
  name: string;
  category: string;
  brand: string;
  model: string;
  status: "available" | "in-use" | "maintenance" | "retired";
  assignedTo?: number;
  assignedToName?: string;
  condition: string;
  currentValue?: number;
};

type EquipmentAssignmentProps = {
  bookingId: number;
  bookingDate: string;
  bookingService: string;
  onAssign: (assignedIds: number[]) => void;
};

export default function EquipmentAssignment({ 
  bookingId, 
  bookingDate, 
  bookingService,
  onAssign 
}: EquipmentAssignmentProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [assignedIds, setAssignedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Load equipment from localStorage
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

        // Mark equipment that's already assigned to other bookings on this date
        const equipmentWithStatus = allEquipment.map((eq: Equipment) => ({
          ...eq,
          isConflicting: conflictingEquipmentIds.includes(eq.id),
        }));
        
        setEquipment(equipmentWithStatus);

        // Pre-load existing assignments for this booking
        const currentBooking = bookings.find((b: any) => b.id === bookingId);
        if (currentBooking?.assignedEquipment) {
          setAssignedIds(currentBooking.assignedEquipment);
        }
      } catch {
        console.error("Failed to load equipment");
      }
    }
  }, [bookingId, bookingDate]);

  // Auto-recommend equipment based on service type
  const recommendedEquipment = useMemo(() => {
    const recommendations: Record<string, string[]> = {
      wedding: ["camera", "lens", "lighting", "drone", "audio", "stabilizer"],
      corporate: ["camera", "lens", "audio", "lighting"],
      podcast: ["audio", "camera", "lighting"],
      documentary: ["camera", "lens", "audio", "drone", "stabilizer"],
      funeral: ["camera", "lens"],
      traditional: ["camera", "lens", "drone", "audio"],
    };

    const serviceKey = bookingService.toLowerCase();
    let recommendedCategories: string[] = [];

    for (const [key, categories] of Object.entries(recommendations)) {
      if (serviceKey.includes(key)) {
        recommendedCategories = categories;
        break;
      }
    }

    return recommendedCategories.length > 0 
      ? recommendedCategories 
      : ["camera", "lens", "audio"]; // Default
  }, [bookingService]);

  const toggleEquipment = (equipmentId: number) => {
    const equipment_item = equipment.find(e => e.id === equipmentId);
    if (!equipment_item) return;

    // Don't allow assigning equipment that's in maintenance or retired
    if (equipment_item.status === "maintenance" || equipment_item.status === "retired") {
      alert("This equipment is not available for assignment");
      return;
    }

    // Don't allow assigning equipment that's already assigned to another booking on same date
    if ((equipment_item as any).isConflicting) {
      alert("This equipment is already assigned to another booking on this date");
      return;
    }

    const newAssignedIds = assignedIds.includes(equipmentId)
      ? assignedIds.filter(id => id !== equipmentId)
      : [...assignedIds, equipmentId];

    setAssignedIds(newAssignedIds);
    onAssign(newAssignedIds);
  };

  const filteredEquipment = useMemo(() => {
    let filtered = equipment;

    if (categoryFilter !== "all") {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(term) ||
        e.brand.toLowerCase().includes(term) ||
        e.model.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [equipment, categoryFilter, searchTerm]);

  const categories = [...new Set(equipment.map(e => e.category))];

  const categoryIcons: Record<string, string> = {
    camera: "📸",
    lens: "🔍",
    drone: "🛸",
    lighting: "💡",
    audio: "🎤",
    stabilizer: "🎥",
    accessory: "🔧",
    storage: "💾",
  };

  return (
    <div className="space-y-4">
      {/* Recommended Categories */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3">
        <p className="text-sm font-medium text-blue-400 mb-2">
          💡 Recommended for {bookingService}:
        </p>
        <div className="flex flex-wrap gap-2">
          {recommendedEquipment.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs transition ${
                categoryFilter === cat
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {categoryIcons[cat] || "📦"} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
          {categoryFilter !== "all" && (
            <button
              onClick={() => setCategoryFilter("all")}
              className="px-3 py-1 rounded-full text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            >
              ✕ Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Search equipment..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:border-zinc-500 transition"
      />

      {/* Equipment Grid */}
      <div className="grid gap-2 max-h-64 overflow-y-auto">
        {filteredEquipment.length === 0 ? (
          <p className="text-center text-zinc-500 py-4">No equipment found</p>
        ) : (
          filteredEquipment.map((item) => {
            const isAssigned = assignedIds.includes(item.id);
            const isConflicting = (item as any).isConflicting;
            const isUnavailable = item.status === "maintenance" || item.status === "retired";

            return (
              <button
                key={item.id}
                onClick={() => toggleEquipment(item.id)}
                disabled={isUnavailable || isConflicting}
                className={`flex items-center gap-3 p-3 rounded-lg text-left transition ${
                  isAssigned
                    ? "bg-green-900/30 border border-green-700"
                    : isConflicting
                    ? "bg-red-900/20 border border-red-800 opacity-60 cursor-not-allowed"
                    : isUnavailable
                    ? "bg-zinc-800/50 border border-zinc-800 opacity-50 cursor-not-allowed"
                    : "bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                  isAssigned
                    ? "bg-green-500 border-green-500 text-white"
                    : isConflicting
                    ? "border-red-500 bg-red-500/20"
                    : "border-zinc-600"
                }`}>
                  {isAssigned ? "✓" : isConflicting ? "✕" : ""}
                </div>

                {/* Icon */}
                <span className="text-lg">
                  {categoryIcons[item.category] || "📦"}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-zinc-400 truncate">
                    {item.brand} {item.model}
                    {isConflicting && " • Already assigned"}
                    {isUnavailable && ` • ${item.status}`}
                  </p>
                </div>

                {/* Status Badge */}
                {item.assignedToName && !isConflicting && (
                  <span className="text-xs bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded">
                    {item.assignedToName}
                  </span>
                )}

                {isAssigned && (
                  <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded">
                    Selected
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Summary */}
      <div className="bg-zinc-800 rounded-lg p-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400">
            Assigned: <span className="text-white font-medium">{assignedIds.length} items</span>
          </span>
          {assignedIds.length > 0 && (
            <button
              onClick={() => {
                setAssignedIds([]);
                onAssign([]);
              }}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Clear All
            </button>
          )}
        </div>
        {assignedIds.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {assignedIds.map(id => {
              const eq = equipment.find(e => e.id === id);
              return eq ? (
                <span key={id} className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                  {categoryIcons[eq.category]} {eq.name}
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}