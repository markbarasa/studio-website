// components/EquipmentManager.tsx
"use client";

import { useState, useEffect, useMemo } from "react";

/* ---------------- TYPES ---------------- */
type EquipmentCategory = "camera" | "lens" | "drone" | "lighting" | "audio" | "stabilizer" | "accessory" | "storage";

type EquipmentStatus = "available" | "in-use" | "maintenance" | "retired";

type Equipment = {
  id: number;
  name: string;
  category: EquipmentCategory;
  brand: string;
  model: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  status: EquipmentStatus;
  assignedTo?: number; // bookingId
  assignedToName?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  condition: "excellent" | "good" | "fair" | "poor";
  notes?: string;
  accessories?: string[];
  image?: string;
};

type MaintenanceLog = {
  id: number;
  equipmentId: number;
  date: string;
  type: "repair" | "service" | "cleaning" | "calibration" | "other";
  description: string;
  cost: number;
  performedBy: string;
  nextService?: string;
};

type ViewMode = "grid" | "list";
type FilterCategory = EquipmentCategory | "all";
type FilterStatus = EquipmentStatus | "all";

/* ---------------- CATEGORY CONFIG ---------------- */
const CATEGORY_CONFIG: Record<EquipmentCategory, { icon: string; label: string; color: string }> = {
  camera: { icon: "📸", label: "Cameras", color: "#FF6B6B" },
  lens: { icon: "🔍", label: "Lenses", color: "#4ECDC4" },
  drone: { icon: "🛸", label: "Drones", color: "#45B7D1" },
  lighting: { icon: "💡", label: "Lighting", color: "#FFD93D" },
  audio: { icon: "🎤", label: "Audio", color: "#6C5CE7" },
  stabilizer: { icon: "🎥", label: "Stabilizers", color: "#A8E6CF" },
  accessory: { icon: "🔧", label: "Accessories", color: "#FF8B94" },
  storage: { icon: "💾", label: "Storage", color: "#B8A9C9" },
};

/* ---------------- SAMPLE DATA ---------------- */
const SAMPLE_EQUIPMENT: Equipment[] = [
  {
    id: 1,
    name: "Sony A7 IV",
    category: "camera",
    brand: "Sony",
    model: "A7 IV",
    serialNumber: "SN12345678",
    purchaseDate: "2023-01-15",
    purchasePrice: 250000,
    currentValue: 200000,
    status: "available",
    condition: "excellent",
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-07-10",
    accessories: ["Battery Grip", "Extra Battery", "Charger"],
    notes: "Primary wedding camera",
  },
  {
    id: 2,
    name: "Canon EOS R6",
    category: "camera",
    brand: "Canon",
    model: "EOS R6 Mark II",
    serialNumber: "SN87654321",
    purchaseDate: "2023-06-20",
    purchasePrice: 280000,
    currentValue: 240000,
    status: "in-use",
    assignedTo: 1001,
    assignedToName: "Sarah's Wedding",
    lastMaintenance: "2023-12-15",
    nextMaintenance: "2024-06-15",
    condition: "excellent",
    accessories: ["RF-EF Adapter", "Extra Battery"],
    notes: "Secondary camera for events",
  },
  {
    id: 3,
    name: "DJI Mavic 3",
    category: "drone",
    brand: "DJI",
    model: "Mavic 3 Pro",
    serialNumber: "DJI20230001",
    purchaseDate: "2023-03-10",
    purchasePrice: 180000,
    currentValue: 150000,
    status: "available",
    condition: "good",
    lastMaintenance: "2024-02-20",
    nextMaintenance: "2024-08-20",
    accessories: ["ND Filters", "Extra Propellers", "Carrying Case"],
    notes: "Requires firmware update",
  },
  {
    id: 4,
    name: "Sony 24-70mm f/2.8 GM II",
    category: "lens",
    brand: "Sony",
    model: "FE 24-70mm F2.8 GM II",
    serialNumber: "LENS2023001",
    purchaseDate: "2023-01-15",
    purchasePrice: 180000,
    currentValue: 160000,
    status: "available",
    condition: "excellent",
    lastMaintenance: "2024-01-10",
    accessories: ["UV Filter", "Lens Hood"],
    notes: "Main workhorse lens",
  },
  {
    id: 5,
    name: "Godox SL150W",
    category: "lighting",
    brand: "Godox",
    model: "SL150W II",
    serialNumber: "GDX2023001",
    purchaseDate: "2023-04-05",
    purchasePrice: 35000,
    currentValue: 28000,
    status: "available",
    condition: "good",
    accessories: ["Softbox", "Light Stand", "Remote"],
    notes: "Studio key light",
  },
  {
    id: 6,
    name: "Rode Wireless GO II",
    category: "audio",
    brand: "Rode",
    model: "Wireless GO II",
    serialNumber: "RODE2023001",
    purchaseDate: "2023-02-14",
    purchasePrice: 32000,
    currentValue: 25000,
    status: "maintenance",
    condition: "fair",
    lastMaintenance: "2024-03-01",
    nextMaintenance: "2024-04-15",
    accessories: ["Lavalier Mic", "Windshield", "Charging Case"],
    notes: "One transmitter needs repair",
  },
  {
    id: 7,
    name: "DJI RS 3 Pro",
    category: "stabilizer",
    brand: "DJI",
    model: "RS 3 Pro Combo",
    serialNumber: "RS32023001",
    purchaseDate: "2023-05-20",
    purchasePrice: 85000,
    currentValue: 70000,
    status: "available",
    condition: "excellent",
    accessories: ["Focus Motor", "RavenEye", "Carrying Case"],
    notes: "For gimbal shots",
  },
  {
    id: 8,
    name: "SanDisk 256GB Extreme Pro",
    category: "storage",
    brand: "SanDisk",
    model: "Extreme Pro SDXC UHS-II",
    serialNumber: "SD2023001",
    purchaseDate: "2023-01-10",
    purchasePrice: 8000,
    currentValue: 6000,
    status: "available",
    condition: "good",
    notes: "Primary storage cards",
  },
];

/* ---------------- MAIN COMPONENT ---------------- */
export default function EquipmentManager() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    const stored = localStorage.getItem("equipment");
    if (stored) {
      try {
        setEquipment(JSON.parse(stored));
      } catch {
        setEquipment(SAMPLE_EQUIPMENT);
      }
    } else {
      setEquipment(SAMPLE_EQUIPMENT);
    }
    setIsLoading(false);
  }, []);

  /* ---------------- PERSIST ---------------- */
  const persistEquipment = (updated: Equipment[]) => {
    localStorage.setItem("equipment", JSON.stringify(updated));
    setEquipment(updated);
  };

  /* ---------------- FILTER + SEARCH ---------------- */
  const filteredEquipment = useMemo(() => {
    let filtered = equipment;

    if (categoryFilter !== "all") {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(term) ||
        e.brand.toLowerCase().includes(term) ||
        e.model.toLowerCase().includes(term) ||
        (e.serialNumber && e.serialNumber.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [equipment, categoryFilter, statusFilter, searchTerm]);

  /* ---------------- STATS ---------------- */
  const stats = useMemo(() => {
    const total = equipment.length;
    const available = equipment.filter(e => e.status === "available").length;
    const inUse = equipment.filter(e => e.status === "in-use").length;
    const maintenance = equipment.filter(e => e.status === "maintenance").length;
    const totalValue = equipment.reduce((sum, e) => sum + (e.currentValue || 0), 0);
    const totalInvestment = equipment.reduce((sum, e) => sum + (e.purchasePrice || 0), 0);

    return { total, available, inUse, maintenance, totalValue, totalInvestment };
  }, [equipment]);

  /* ---------------- ACTIONS ---------------- */
  const updateStatus = (id: number, status: EquipmentStatus) => {
    const updated = equipment.map(e =>
      e.id === id ? { ...e, status, assignedTo: status !== "in-use" ? undefined : e.assignedTo } : e
    );
    persistEquipment(updated);
  };

  const deleteEquipment = (id: number) => {
    if (confirm("Are you sure you want to remove this equipment?")) {
      persistEquipment(equipment.filter(e => e.id !== id));
    }
  };

  const addEquipment = (newEquipment: Equipment) => {
    const equipmentWithId = {
      ...newEquipment,
      id: Date.now(),
    };
    persistEquipment([...equipment, equipmentWithId]);
    setShowAddModal(false);
  };

  const updateEquipment = (updatedEquipment: Equipment) => {
    persistEquipment(equipment.map(e => e.id === updatedEquipment.id ? updatedEquipment : e));
    setEditingEquipment(null);
  };

  const addMaintenanceLog = (log: MaintenanceLog) => {
    const newLog = { ...log, id: Date.now() };
    setMaintenanceLogs(prev => [...prev, newLog]);
    
    // Update equipment maintenance date
    const updated = equipment.map(e => {
      if (e.id === log.equipmentId) {
        return {
          ...e,
          lastMaintenance: log.date,
          nextMaintenance: log.nextService,
          status: log.type === "repair" ? "maintenance" : e.status,
        };
      }
      return e;
    });
    persistEquipment(updated);
    setShowMaintenanceModal(false);
  };

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-zinc-400">Loading equipment...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">🎬 Equipment Manager</h2>
          <p className="text-zinc-400 text-sm mt-1">Manage your studio gear</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 transition font-medium"
        >
          ➕ Add Equipment
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <p className="text-zinc-400 text-xs">Total Items</p>
          <p className="text-lg font-bold">{stats.total}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <p className="text-zinc-400 text-xs">Available</p>
          <p className="text-lg font-bold text-green-400">{stats.available}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <p className="text-zinc-400 text-xs">In Use</p>
          <p className="text-lg font-bold text-blue-400">{stats.inUse}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <p className="text-zinc-400 text-xs">Maintenance</p>
          <p className="text-lg font-bold text-yellow-400">{stats.maintenance}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <p className="text-zinc-400 text-xs">Current Value</p>
          <p className="text-lg font-bold text-green-400">KSh {(stats.totalValue / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <p className="text-zinc-400 text-xs">Total Invested</p>
          <p className="text-lg font-bold">KSh {(stats.totalInvestment / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="🔍 Search equipment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-zinc-600"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as FilterCategory)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, { icon, label }]) => (
            <option key={key} value={key}>{icon} {label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="available">✅ Available</option>
          <option value="in-use">🔴 In Use</option>
          <option value="maintenance">🔧 Maintenance</option>
          <option value="retired">⚫ Retired</option>
        </select>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 rounded-lg text-sm ${viewMode === "grid" ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800"}`}
          >
            ▦
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 rounded-lg text-sm ${viewMode === "list" ? "bg-white text-black" : "bg-zinc-900 border border-zinc-800"}`}
          >
            ☰
          </button>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map((item) => {
            const category = CATEGORY_CONFIG[item.category];
            return (
              <div
                key={item.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition cursor-pointer"
                onClick={() => { setSelectedEquipment(item); setShowDetailModal(true); }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: category.color + "20" }}
                    >
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-xs text-zinc-400">{item.brand} {item.model}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.status === "available" ? "bg-green-900/50 text-green-400" :
                    item.status === "in-use" ? "bg-blue-900/50 text-blue-400" :
                    item.status === "maintenance" ? "bg-yellow-900/50 text-yellow-400" :
                    "bg-zinc-800 text-zinc-400"
                  }`}>
                    {item.status.replace("-", " ").toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-zinc-400">
                  {item.serialNumber && (
                    <p>SN: {item.serialNumber}</p>
                  )}
                  {item.assignedToName && (
                    <p>📅 {item.assignedToName}</p>
                  )}
                  <div className="flex justify-between mt-2">
                    <span>Value: KSh {(item.currentValue || 0).toLocaleString()}</span>
                    <span className={`px-2 py-0.5 rounded ${
                      item.condition === "excellent" ? "bg-green-900/30 text-green-400" :
                      item.condition === "good" ? "bg-blue-900/30 text-blue-400" :
                      item.condition === "fair" ? "bg-yellow-900/30 text-yellow-400" :
                      "bg-red-900/30 text-red-400"
                    }`}>
                      {item.condition}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/60">
              <tr>
                <th className="p-3 text-left">Equipment</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Condition</th>
                <th className="p-3 text-right">Value</th>
                <th className="p-3 text-left">Assigned To</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.map((item) => {
                const category = CATEGORY_CONFIG[item.category];
                return (
                  <tr key={item.id} className="border-t border-zinc-800 hover:bg-zinc-900/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-zinc-400">{item.brand} {item.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-zinc-400">{category.label}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === "available" ? "bg-green-900/50 text-green-400" :
                        item.status === "in-use" ? "bg-blue-900/50 text-blue-400" :
                        item.status === "maintenance" ? "bg-yellow-900/50 text-yellow-400" :
                        "bg-zinc-800 text-zinc-400"
                      }`}>
                        {item.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.condition === "excellent" ? "bg-green-900/30 text-green-400" :
                        item.condition === "good" ? "bg-blue-900/30 text-blue-400" :
                        item.condition === "fair" ? "bg-yellow-900/30 text-yellow-400" :
                        "bg-red-900/30 text-red-400"
                      }`}>
                        {item.condition}
                      </span>
                    </td>
                    <td className="p-3 text-right">KSh {(item.currentValue || 0).toLocaleString()}</td>
                    <td className="p-3 text-zinc-400 text-sm">
                      {item.assignedToName || "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedEquipment(item); setShowDetailModal(true); }}
                          className="bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded text-xs"
                          title="View Details"
                        >
                          👁
                        </button>
                        <select
                          value={item.status}
                          onChange={(e) => updateStatus(item.id, e.target.value as EquipmentStatus)}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-zinc-800 border border-zinc-700 rounded px-1 py-1 text-xs"
                        >
                          <option value="available">Available</option>
                          <option value="in-use">In Use</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="retired">Retired</option>
                        </select>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteEquipment(item.id); }}
                          className="bg-red-600/20 hover:bg-red-600 text-red-400 px-2 py-1 rounded text-xs"
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* EMPTY STATE */}
      {filteredEquipment.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-4xl mb-4">🎬</p>
          <p className="text-lg">No equipment found</p>
          <p className="text-sm mt-2">Try adjusting your filters or add new equipment</p>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedEquipment && (
        <EquipmentDetailModal
          equipment={selectedEquipment}
          maintenanceLogs={maintenanceLogs.filter(log => log.equipmentId === selectedEquipment.id)}
          onClose={() => setShowDetailModal(false)}
          onEdit={(equipment) => {
            setEditingEquipment(equipment);
            setShowDetailModal(false);
          }}
          onMaintenance={() => {
            setShowMaintenanceModal(true);
            setShowDetailModal(false);
          }}
          onStatusChange={(status) => updateStatus(selectedEquipment.id, status)}
        />
      )}

      {/* ADD/EDIT MODAL */}
      {(showAddModal || editingEquipment) && (
        <EquipmentFormModal
          equipment={editingEquipment}
          onSave={(equipment) => {
            if (editingEquipment) {
              updateEquipment(equipment);
            } else {
              addEquipment(equipment);
            }
          }}
          onClose={() => {
            setShowAddModal(false);
            setEditingEquipment(null);
          }}
        />
      )}

      {/* MAINTENANCE MODAL */}
      {showMaintenanceModal && selectedEquipment && (
        <MaintenanceModal
          equipmentId={selectedEquipment.id}
          onSave={addMaintenanceLog}
          onClose={() => setShowMaintenanceModal(false)}
        />
      )}
    </div>
  );
}

/* ---------------- EQUIPMENT DETAIL MODAL ---------------- */
function EquipmentDetailModal({ 
  equipment, 
  maintenanceLogs, 
  onClose, 
  onEdit, 
  onMaintenance, 
  onStatusChange 
}: { 
  equipment: Equipment;
  maintenanceLogs: MaintenanceLog[];
  onClose: () => void;
  onEdit: (equipment: Equipment) => void;
  onMaintenance: () => void;
  onStatusChange: (status: EquipmentStatus) => void;
}) {
  const category = CATEGORY_CONFIG[equipment.category];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: category.color + "20" }}>
                {category.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold">{equipment.name}</h2>
                <p className="text-zinc-400">{equipment.brand} {equipment.model}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-zinc-400 text-xs">Status</p>
              <select
                value={equipment.status}
                onChange={(e) => onStatusChange(e.target.value as EquipmentStatus)}
                className="bg-zinc-800 border border-zinc-700 rounded p-1 text-sm mt-1"
              >
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            <div>
              <p className="text-zinc-400 text-xs">Condition</p>
              <p className="font-medium">{equipment.condition.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs">Category</p>
              <p className="font-medium">{category.label}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs">Serial Number</p>
              <p className="font-medium">{equipment.serialNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs">Purchase Date</p>
              <p className="font-medium">{equipment.purchaseDate || "N/A"}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs">Purchase Price</p>
              <p className="font-medium">KSh {(equipment.purchasePrice || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs">Current Value</p>
              <p className="font-medium text-green-400">KSh {(equipment.currentValue || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs">Assigned To</p>
              <p className="font-medium">{equipment.assignedToName || "Not assigned"}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs">Last Maintenance</p>
              <p className="font-medium">{equipment.lastMaintenance || "N/A"}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs">Next Maintenance</p>
              <p className="font-medium text-yellow-400">{equipment.nextMaintenance || "N/A"}</p>
            </div>
          </div>

          {equipment.accessories && equipment.accessories.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">🔧 Accessories</h3>
              <div className="flex flex-wrap gap-2">
                {equipment.accessories.map((acc, i) => (
                  <span key={i} className="bg-zinc-800 px-3 py-1 rounded-full text-sm">{acc}</span>
                ))}
              </div>
            </div>
          )}

          {equipment.notes && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">📝 Notes</h3>
              <p className="text-zinc-400 text-sm">{equipment.notes}</p>
            </div>
          )}

          {maintenanceLogs.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">🔧 Maintenance History</h3>
              <div className="space-y-2">
                {maintenanceLogs.map(log => (
                  <div key={log.id} className="bg-zinc-800 rounded-lg p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{log.type.toUpperCase()}</span>
                      <span className="text-zinc-400">{log.date}</span>
                    </div>
                    <p className="text-zinc-400 mt-1">{log.description}</p>
                    <div className="flex justify-between mt-1 text-xs">
                      <span>By: {log.performedBy}</span>
                      <span>Cost: KSh {log.cost.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => onEdit(equipment)} className="flex-1 bg-white text-black py-2 rounded-lg font-medium hover:bg-zinc-200 transition">
              ✏️ Edit
            </button>
            <button onClick={onMaintenance} className="flex-1 bg-yellow-600 hover:bg-yellow-700 py-2 rounded-lg transition">
              🔧 Log Maintenance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- EQUIPMENT FORM MODAL ---------------- */
function EquipmentFormModal({ 
  equipment, 
  onSave, 
  onClose 
}: { 
  equipment: Equipment | null;
  onSave: (equipment: Equipment) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Equipment>(
    equipment || {
      id: 0,
      name: "",
      category: "camera",
      brand: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      purchasePrice: 0,
      currentValue: 0,
      status: "available",
      condition: "excellent",
      accessories: [],
      notes: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-bold mb-6">
            {equipment ? "Edit Equipment" : "Add New Equipment"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm"
                placeholder="e.g., Sony A7 IV"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as EquipmentCategory })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm"
              >
                {Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Brand *</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Model *</label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Serial Number</label>
              <input
                type="text"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Purchase Date</label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Purchase Price (KSh)</label>
              <input
                type="number"
                value={form.purchasePrice}
                onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Current Value (KSh)</label>
              <input
                type="number"
                value={form.currentValue}
                onChange={(e) => setForm({ ...form, currentValue: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Condition</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value as Equipment["condition"] })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as EquipmentStatus })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm"
              >
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">Accessories (comma-separated)</label>
              <input
                type="text"
                value={form.accessories?.join(", ")}
                onChange={(e) => setForm({ ...form, accessories: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm"
                placeholder="e.g., Battery Grip, UV Filter"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" className="flex-1 bg-white text-black py-2 rounded-lg font-medium hover:bg-zinc-200 transition">
              {equipment ? "💾 Save Changes" : "➕ Add Equipment"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-2 rounded-lg transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------- MAINTENANCE MODAL ---------------- */
function MaintenanceModal({ 
  equipmentId, 
  onSave, 
  onClose 
}: { 
  equipmentId: number;
  onSave: (log: MaintenanceLog) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<MaintenanceLog>({
    id: 0,
    equipmentId,
    date: new Date().toISOString().split("T")[0],
    type: "service",
    description: "",
    cost: 0,
    performedBy: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-bold mb-4">🔧 Log Maintenance</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as MaintenanceLog["type"] })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm"
              >
                <option value="service">Service</option>
                <option value="repair">Repair</option>
                <option value="cleaning">Cleaning</option>
                <option value="calibration">Calibration</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Cost (KSh)</label>
              <input
                type="number"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Performed By</label>
              <input
                type="text"
                value={form.performedBy}
                onChange={(e) => setForm({ ...form, performedBy: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Next Service Date</label>
              <input
                type="date"
                value={form.nextService || ""}
                onChange={(e) => setForm({ ...form, nextService: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" className="flex-1 bg-yellow-600 hover:bg-yellow-700 py-2 rounded-lg font-medium transition">
              💾 Save Log
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-2 rounded-lg transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}