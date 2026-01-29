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

  showRoleForm = false;
  roleFormData: Role = this.resetRole();

  editingRoleId: number | null = null;

  private apiUrl = 'https://localhost:7168/api/Roles';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  // ================= LOAD ROLES =================
  loadRoles(): void {
    this.http.get<Role[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.roles = res;
        this.filteredRoles = [...res];
      },
      error: () => Swal.fire('Error', 'Failed to load roles', 'error')
    });
  }

  // ================= SEARCH =================
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
    this.showRoleForm = true;
  }

  // ================= EDIT ROLE =================
  editRole(role: Role): void {
    this.editingRoleId = role.roleId;
    this.roleFormData = { ...role };
    this.showRoleForm = true;
  }

  // ================= CANCEL =================
  cancelEdit(): void {
    this.editingRoleId = null;
    this.roleFormData = this.resetRole();
    this.showRoleForm = false;
  }

  // ================= SAVE ROLE =================
  saveRole(): void {
    if (!this.roleFormData.name) {
      Swal.fire('Error', 'Role Name is required', 'error');
      return;
    }

    if (this.editingRoleId !== null) {
      // UPDATE
      this.http.put(
        `${this.apiUrl}/${this.editingRoleId}`,
        this.roleFormData
      ).subscribe({
        next: () => {
          Swal.fire('Success', 'Role updated successfully', 'success');
          this.cancelEdit();
          this.loadRoles();
        },
        error: () => Swal.fire('Error', 'Failed to update role', 'error')
      });
    } else {
      // INSERT
      this.http.post(this.apiUrl, this.roleFormData).subscribe({
        next: () => {
          Swal.fire('Success', 'Role added successfully', 'success');
          this.cancelEdit();
          this.loadRoles();
        },
        error: () => Swal.fire('Error', 'Failed to add role', 'error')
      });
    }
  }

  // ================= DELETE ROLE =================
  deleteRole(roleId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This role will be deleted',
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
          error: () => Swal.fire('Error', 'Unable to delete role', 'error')
        });
      }
    });
  }

  // ================= RESET =================
  resetRole(): Role {
    return {
      roleId: 0,
      name: '',
      description: '',
      isActive: true
    };
  }
}
