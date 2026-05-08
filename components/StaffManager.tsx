"use client";

import { useState, useEffect } from "react";

type Staff = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  specialty?: string;
  rate_per_day?: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
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
      const updated = staff.map(s => 
        s.id === editingStaff.id 
          ? { ...s, ...formData, updated_at: new Date().toISOString() }
          : s
      );
      saveStaff(updated);
    } else {
      const newStaff: Staff = {
        id: Date.now(),
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
        role: (formData.role as string) || "other",
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
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-zinc-400 text-sm mt-1">Manage your team members</p>
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
          className="bg-gold-400 text-black px-4 py-2 rounded-lg hover:bg-gold-500 transition"
        >
          ➕ Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member) => (
          <div key={member.id} className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-zinc-400">{member.role}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleToggleActive(member)} className="p-1 hover:bg-zinc-800 rounded">
                  {member.is_active ? "✅" : "❌"}
                </button>
                <button onClick={() => { setEditingStaff(member); setFormData(member); setShowModal(true); }} className="p-1 hover:bg-zinc-800 rounded text-blue-400">✏️</button>
                <button onClick={() => handleDelete(member.id!)} className="p-1 hover:bg-zinc-800 rounded text-red-400">🗑️</button>
              </div>
            </div>
            <div className="mt-2 text-sm text-zinc-500">
              {member.phone && <p>📞 {member.phone}</p>}
              {member.email && <p>📧 {member.email}</p>}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{editingStaff ? "Edit Staff" : "Add Staff"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-black border border-zinc-700 rounded-lg" required />
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 bg-black border border-zinc-700 rounded-lg" />
              <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 bg-black border border-zinc-700 rounded-lg" />
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full p-3 bg-black border border-zinc-700 rounded-lg">
                <option value="photographer">Photographer</option>
                <option value="videographer">Videographer</option>
                <option value="editor">Editor</option>
                <option value="assistant">Assistant</option>
                <option value="driver">Driver</option>
                <option value="other">Other</option>
              </select>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 py-2 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-gold-400 text-black py-2 rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}