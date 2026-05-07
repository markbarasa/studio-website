"use client";

import { useState, useEffect } from "react";

type StaffRole = 'photographer' | 'videographer' | 'editor' | 'assistant' | 'driver' | 'other';

type Staff = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  specialty?: string;
  rate_per_day?: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
};

const roleLabels: Record<StaffRole, string> = {
  photographer: "Photographer",
  videographer: "Videographer",
  editor: "Editor",
  assistant: "Assistant",
  driver: "Driver",
  other: "Other",
};

const roleColors: Record<StaffRole, string> = {
  photographer: "bg-purple-500/20 text-purple-400",
  videographer: "bg-blue-500/20 text-blue-400",
  editor: "bg-green-500/20 text-green-400",
  assistant: "bg-yellow-500/20 text-yellow-400",
  driver: "bg-orange-500/20 text-orange-400",
  other: "bg-gray-500/20 text-gray-400",
};

const roleIcons: Record<StaffRole, string> = {
  photographer: "📷",
  videographer: "🎥",
  editor: "✂️",
  assistant: "🤝",
  driver: "🚗",
  other: "👥",
};

// Storage key
const STAFF_STORAGE_KEY = 'alakara_staff';

const getStaff = (): Staff[] => {
  const data = localStorage.getItem(STAFF_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveStaff = (staff: Staff[]) => {
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
};

type StaffManagerProps = {
  onStaffChange?: () => void;
};

export default function StaffManager({ onStaffChange }: StaffManagerProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<Partial<Staff>>({
    name: "",
    email: "",
    phone: "",
    role: "photographer",
    specialty: "",
    rate_per_day: 0,
    is_active: true,
    notes: "",
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = () => {
    setIsLoading(true);
    const data = getStaff();
    setStaff(data);
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStaff) {
      // Update existing
      const updated = staff.map(s => 
        s.id === editingStaff.id 
          ? { ...s, ...formData, updated_at: new Date().toISOString() }
          : s
      );
      saveStaff(updated);
    } else {
      // Create new
      const newStaff: Staff = {
        id: Date.now(),
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
        role: (formData.role as StaffRole) || "other",
        specialty: formData.specialty,
        rate_per_day: formData.rate_per_day,
        is_active: formData.is_active ?? true,
        notes: formData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveStaff([...staff, newStaff]);
    }
    
    loadStaff();
    setShowModal(false);
    setEditingStaff(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "photographer",
      specialty: "",
      rate_per_day: 0,
      is_active: true,
      notes: "",
    });
    onStaffChange?.();
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      const filtered = staff.filter(s => s.id !== id);
      saveStaff(filtered);
      loadStaff();
      onStaffChange?.();
    }
  };

  const handleToggleActive = (staffMember: Staff) => {
    const updated = staff.map(s =>
      s.id === staffMember.id
        ? { ...s, is_active: !s.is_active, updated_at: new Date().toISOString() }
        : s
    );
    saveStaff(updated);
    loadStaff();
    onStaffChange?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-zinc-400 text-sm mt-1">Manage your team members and assign them to bookings</p>
        </div>
        <button
          onClick={() => {
            setEditingStaff(null);
            setFormData({
              name: "",
              email: "",
              phone: "",
              role: "photographer",
              specialty: "",
              rate_per_day: 0,
              is_active: true,
              notes: "",
            });
            setShowModal(true);
          }}
          className="bg-gold-400 text-black px-4 py-2 rounded-lg hover:bg-gold-500 transition flex items-center gap-2"
        >
          ➕ Add Staff Member
        </button>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member) => (
          <div
            key={member.id}
            className={`bg-zinc-900 border rounded-xl p-5 transition-all duration-300 ${
              member.is_active ? "border-zinc-700 hover:border-gold-400/50" : "border-red-500/30 opacity-60"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={`text-2xl ${roleColors[member.role]?.replace('bg', 'text').replace('/20', '')}`}>
                  {roleIcons[member.role]}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${roleColors[member.role]}`}>
                    {roleLabels[member.role]}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleToggleActive(member)}
                  className="p-1 hover:bg-zinc-800 rounded transition"
                  title={member.is_active ? "Deactivate" : "Activate"}
                >
                  {member.is_active ? "✅" : "❌"}
                </button>
                <button
                  onClick={() => {
                    setEditingStaff(member);
                    setFormData(member);
                    setShowModal(true);
                  }}
                  className="p-1 hover:bg-zinc-800 rounded transition text-blue-400"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(member.id!)}
                  className="p-1 hover:bg-zinc-800 rounded transition text-red-400"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {member.email && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <span>📧</span>
                  <span className="truncate">{member.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-zinc-400">
                <span>📞</span>
                <span>{member.phone || "No phone"}</span>
              </div>
              {member.specialty && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <span>⭐</span>
                  <span className="text-xs">{member.specialty}</span>
                </div>
              )}
              {member.rate_per_day && member.rate_per_day > 0 && (
                <div className="flex items-center gap-2 text-green-400">
                  <span>💰</span>
                  <span>KSh {member.rate_per_day.toLocaleString()}/day</span>
                </div>
              )}
            </div>

            {member.notes && (
              <div className="mt-3 pt-3 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 italic">{member.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <div className="text-5xl mb-3">👥</div>
          <p>No staff members yet</p>
          <p className="text-sm">Click "Add Staff Member" to get started</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingStaff ? "Edit Staff Member" : "Add Staff Member"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-gold-400 transition outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-gold-400 transition outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-gold-400 transition outline-none"
                  placeholder="0712345678"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                  className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-gold-400 transition outline-none"
                >
                  <option value="photographer">📷 Photographer</option>
                  <option value="videographer">🎥 Videographer</option>
                  <option value="editor">✂️ Editor</option>
                  <option value="assistant">🤝 Assistant</option>
                  <option value="driver">🚗 Driver</option>
                  <option value="other">👥 Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Specialty (Optional)</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-gold-400 transition outline-none"
                  placeholder="Wedding specialist, Drone operator, etc."
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Rate per day (KSh)</label>
                <input
                  type="number"
                  value={formData.rate_per_day}
                  onChange={(e) => setFormData({ ...formData, rate_per_day: parseInt(e.target.value) })}
                  className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-gold-400 transition outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:border-gold-400 transition outline-none resize-none"
                  placeholder="Any additional information..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-zinc-400">Active (available for assignments)</label>
              </div>

              <button
                type="submit"
                className="w-full bg-gold-400 text-black py-3 rounded-lg font-semibold hover:bg-gold-500 transition"
              >
                {editingStaff ? "Update Staff Member" : "Add Staff Member"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}