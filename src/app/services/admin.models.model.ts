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
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalRoles: number;

  users: {
    userName: string;
    email: string;
    phoneNumber?: string;
    isActive: boolean;
  }[];

  usersByRole?: {
    [roleName: string]: number;
  };
}

export interface UpdateRoleRequest {
  role: string;
}

export interface CreateRoleRequest {
  name: string;
}