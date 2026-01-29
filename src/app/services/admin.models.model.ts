// ================= Admin User =================
export interface AdminUser {
  id?: string;           // Unique identifier
  name: string;          // User name (from token or backend)
  email?: string;        // Optional email
  roles: string[];       // Assigned roles
  isActive: boolean;     // Active/Inactive status
}

// ================= Admin Reports =================
export interface AdminReports {
  totalUsers: number;                // Total users
  usersWithMobile: number;           // Users with phone numbers
  usersByRole: Record<string, number>; // Users per role
  recentUsers: Array<{
    userName: string;
    email: string;
    phoneNumber?: string;
  }>;
}
export interface UpdateRoleRequest {
  role: string;
}

export interface CreateRoleRequest {
  name: string;
}