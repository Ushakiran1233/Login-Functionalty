import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

/* ===== ROLE MODEL ===== */
interface Role {
  roleId: number;
  name: string;
  description: string;
  isActive: boolean;
}

/* ===== PERMISSION MODELS ===== */
interface Permission {
  activityId: number;
  activityName: string;
  selected?: boolean;
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

  roles: Role[] = [];
  filteredRoles: Role[] = [];
  roleSearch = '';

  selectedPermissions: number[] = [];

  showRoleForm = false;
  roleFormData: Role = this.resetRole();
  editingRoleId: number | null = null;

  permissionGroups: PermissionGroup[] = [];

  private apiUrl = 'https://localhost:7168/api/Roles';
  private adminUrl = 'https://localhost:7168/api/admin/reports';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissionGroups();
  }

  // ================= LOAD ROLES =================
  loadRoles(): void {
    this.http.get<Role[]>(this.apiUrl).subscribe({
      next: res => {
        this.roles = res;
        this.filteredRoles = [...res];
      },
      error: () => Swal.fire('Error', 'Failed to load roles', 'error')
    });
  }

  // ================= LOAD PERMISSION GROUPS =================
  loadPermissionGroups(callback?: () => void): void {
    this.http.get<PermissionGroup[]>(`${this.adminUrl}/groups`).subscribe({
      next: res => {
        this.permissionGroups = res.map(g => ({
          ...g,
          expanded: false
        }));
        if (callback) callback();
      },
      error: () => Swal.fire('Error', 'Failed to load permissions', 'error')
    });
  }

  // ================= FILTER =================
  filterRoles(): void {
    const search = this.roleSearch.toLowerCase();
    this.filteredRoles = this.roles.filter(r =>
      r.name.toLowerCase().includes(search) ||
      (r.description && r.description.toLowerCase().includes(search))
    );
  }

  // ================= ADD ROLE =================
  addRole(): void {
    this.editingRoleId = null;
    this.roleFormData = this.resetRole();
    this.selectedPermissions = [];
    this.resetPermissions(); // ✅ IMPORTANT FIX
    this.showRoleForm = true;
  }

  // ================= EDIT ROLE =================
  editRole(role: Role): void {
    this.editingRoleId = role.roleId;
    this.roleFormData = { ...role };
    this.selectedPermissions = [];
    this.showRoleForm = true;

    this.loadPermissionGroups(() => {
      this.loadRolePermissions(role.roleId);
    });
  }

  // ================= LOAD ROLE PERMISSIONS =================
  loadRolePermissions(roleId: number): void {
    this.http.get<number[]>(`${this.apiUrl}/${roleId}/permissions`).subscribe({
      next: perms => {
        this.selectedPermissions = perms;

        // ✅ Sync checkbox UI
        this.permissionGroups.forEach(group => {
          group.permissions.forEach(perm => {
            perm.selected = this.selectedPermissions.includes(perm.activityId);
          });
        });
      },
      error: () =>
        Swal.fire('Error', 'Failed to load role permissions', 'error')
    });
  }

  cancelEdit(): void {
    this.editingRoleId = null;
    this.roleFormData = this.resetRole();
    this.selectedPermissions = [];
    this.resetPermissions();
    this.showRoleForm = false;
  }

  // ================= SAVE ROLE (ADD + UPDATE) =================
  saveRole(): void {
    if (!this.roleFormData.name) {
      Swal.fire('Error', 'Role Name is required', 'error');
      return;
    }

    // ✅ COLLECT permissions from checkbox state (FINAL FIX)
    const permissionIds: number[] = [];
    this.permissionGroups.forEach(group =>
      group.permissions.forEach(p => {
        if (p.selected) {
          permissionIds.push(p.activityId);
        }
      })
    );

    const payload = {
      name: this.roleFormData.name,
      description: this.roleFormData.description,
      isActive: this.roleFormData.isActive,
      permissions: permissionIds
    };

    // ===== ADD ROLE =====
    if (this.editingRoleId === null) {
      this.http.post(this.apiUrl, payload).subscribe({
        next: () => {
          Swal.fire('Success', 'Role created successfully', 'success');
          this.cancelEdit();
          this.loadRoles();
        },
        error: err => {
          console.error(err);
          Swal.fire('Error', 'Failed to create role', 'error');
        }
      });
      return;
    }

    // ===== UPDATE ROLE =====
    this.http.put(`${this.apiUrl}/${this.editingRoleId}`, payload).subscribe({
      next: () => {
        Swal.fire('Success', 'Role updated successfully', 'success');
        this.cancelEdit();
        this.loadRoles();
      },
      error: err => {
        console.error(err);
        Swal.fire('Error', 'Failed to update role', 'error');
      }
    });
  }

  // ================= DELETE ROLE =================
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

  // ================= HELPERS =================
  resetPermissions(): void {
    this.permissionGroups.forEach(group =>
      group.permissions.forEach(p => (p.selected = false))
    );
  }

  resetRole(): Role {
    return {
      roleId: 0,
      name: '',
      description: '',
      isActive: true
    };
  }
}
