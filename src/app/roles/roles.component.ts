import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface Role {
  roleId: number;
  name: string;
  description: string;
  isActive: boolean;
}

/* ===== Permission Models ===== */
interface Permission {
  activityId: number;
  activityDesc: string;
  activityName: string; 
  selected?: boolean;   // ✅ ADD THIS
}


interface PermissionGroup {
  groupName: string;
  expanded: boolean;
  permissions: Permission[];
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {

  /* ================= ROLES ================= */
  roles: Role[] = [];
  filteredRoles: Role[] = [];
  roleSearch = '';

  showRoleForm = false;
  roleFormData: Role = this.resetRole();
  editingRoleId: number | null = null;

  /* ================= PERMISSIONS ================= */
  permissionGroups: PermissionGroup[] = [];

  // ✅ permission codes (strings)
  assignedRights = new Set<string>();

  /* ================= API ================= */
  private apiUrl = 'https://localhost:7168/api/Roles';
  private permissiongroup = 'https://localhost:7168/api/admin/reports/groups';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissionGroups();
  }

  /* ================= LOAD ROLES ================= */
  loadRoles(): void {
    this.http.get<Role[]>(this.apiUrl).subscribe({
      next: res => {
        this.roles = res;
        this.filteredRoles = [...res];
      },
      error: () => Swal.fire('Error', 'Failed to load roles', 'error')
    });
  }

  /* ================= LOAD PERMISSION GROUPS ================= */
  loadPermissionGroups(): void {
  this.http.get<PermissionGroup[]>(this.permissiongroup).subscribe({
    next: res => {
      this.permissionGroups = res.map(g => ({
        ...g,
        expanded: false,
        permissions: g.permissions.map(p => ({
          ...p,
          selected: false   // ✅ important
        }))
      }));
    },
    error: () =>
      Swal.fire('Error', 'Failed to load permissions', 'error')
  });
}


  /* ================= SEARCH ================= */
  filterRoles(): void {
    const search = this.roleSearch.toLowerCase();
    this.filteredRoles = this.roles.filter(r =>
      r.name.toLowerCase().includes(search) ||
      (r.description && r.description.toLowerCase().includes(search))
    );
  }

  /* ================= ADD ROLE ================= */
  addRole(): void {
    this.editingRoleId = null;
    this.roleFormData = this.resetRole();
    this.assignedRights.clear();
    this.showRoleForm = true;
  }

  /* ================= EDIT ROLE ================= */
  editRole(role: Role): void {
    this.editingRoleId = role.roleId;
    this.roleFormData = { ...role };
    this.showRoleForm = true;
    this.loadRolePermissions(role.roleId);
  }

  /* ================= LOAD ROLE PERMISSIONS ================= */
  loadRolePermissions(roleId: number): void {
  this.http
    .get<string[]>(`${this.apiUrl}/${roleId}/permissions`)
    .subscribe({
      next: res => {
        this.permissionGroups.forEach(group => {
          group.permissions.forEach(perm => {
            perm.selected = res.includes(perm.activityDesc);
          });
        });
      },
      error: () =>
        Swal.fire('Error', 'Failed to load role permissions', 'error')
    });
}

  /* ================= PERMISSION CHANGE ================= */
  onPermissionChange(permissionCode: string, checked: boolean): void {
    if (checked) {
      this.assignedRights.add(permissionCode);
    } else {
      this.assignedRights.delete(permissionCode);
    }
  }

  /* ================= CHECK PERMISSION ================= */
  hasPermission(permissionCode: string): boolean {
    return this.assignedRights.has(permissionCode);
  }

  /* ================= CANCEL ================= */
  cancelEdit(): void {
    this.editingRoleId = null;
    this.roleFormData = this.resetRole();
    this.assignedRights.clear();
    this.showRoleForm = false;
  }

  /* ================= SAVE ROLE ================= */
  saveRole(): void {

  // ADD ROLE
  if (!this.editingRoleId) {
    if (!this.roleFormData.name) {
      Swal.fire('Error', 'Role Name is required', 'error');
      return;
    }

    this.http.post(this.apiUrl, this.roleFormData).subscribe({
      next: () => {
        Swal.fire('Success', 'Role added successfully', 'success');
        this.cancelEdit();
        this.loadRoles();
      },
      error: () => Swal.fire('Error', 'Failed to add role', 'error')
    });

    return;
  }

  // EDIT ROLE → SAVE PERMISSIONS
  const permissions: string[] = [];

  this.permissionGroups.forEach(g =>
    g.permissions.forEach(p => {
      if (p.selected) permissions.push(p.activityDesc);
    })
  );

  const payload = {
    roleId: this.roleFormData.roleId,
    permissions
  };

  this.http.post(`${this.apiUrl}/permissions`, payload).subscribe({
    next: () => {
      Swal.fire('Success', 'Permissions updated', 'success');
      this.cancelEdit();
      this.loadRoles();
    },
    error: () => Swal.fire('Error', 'Failed to update permissions', 'error')
  });
}

  /* ================= DELETE ROLE ================= */
  deleteRole(roleId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this role.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/${roleId}`).subscribe({
          next: () => {
            this.roles = this.roles.filter(r => r.roleId !== roleId);
            this.filteredRoles = [...this.roles];
            Swal.fire('Deleted', 'Role deleted successfully', 'success');
          },
          error: () =>
            Swal.fire('Error', 'Unable to delete role', 'error')
        });
      }
    });
  }

  /* ================= RESET ================= */
  resetRole(): Role {
    return {
      roleId: 0,
      name: '',
      description: '',
      isActive: true
    };
  }
}
