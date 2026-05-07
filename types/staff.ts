export type StaffRole = 'photographer' | 'videographer' | 'editor' | 'assistant' | 'driver' | 'other';

export type Staff = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  specialty?: string; // e.g., "Wedding specialist", "Drone operator"
  rate_per_day?: number;
  is_active: boolean;
  profile_image?: string;
  hired_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type StaffAssignment = {
  id: number;
  booking_id: number;
  staff_id: number;
  role_at_event: string;
  notes?: string;
  assigned_at: string;
};

export const roleLabels: Record<StaffRole, string> = {
  photographer: "Photographer",
  videographer: "Videographer",
  editor: "Editor",
  assistant: "Assistant",
  driver: "Driver",
  other: "Other",
};

export const roleColors: Record<StaffRole, string> = {
  photographer: "bg-purple-500/20 text-purple-400",
  videographer: "bg-blue-500/20 text-blue-400",
  editor: "bg-green-500/20 text-green-400",
  assistant: "bg-yellow-500/20 text-yellow-400",
  driver: "bg-orange-500/20 text-orange-400",
  other: "bg-gray-500/20 text-gray-400",
};

export const roleIcons: Record<StaffRole, string> = {
  photographer: "📷",
  videographer: "🎥",
  editor: "✂️",
  assistant: "🤝",
  driver: "🚗",
  other: "👥",
};