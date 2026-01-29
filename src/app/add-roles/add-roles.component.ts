import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface CreateRoleDto {
  roleName: string;
  description: string;
  status: boolean;
}

@Component({
  selector: 'app-add-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-roles.component.html',
  styleUrl: './add-roles.component.css'
})
export class AddRolesComponent {
  role: CreateRoleDto = { roleName: '', description: '', status: true };

  constructor(private router: Router, private http: HttpClient) {}

  saveRole() {
    // Validate input
    if (!this.role.roleName || !this.role.description) {
      Swal.fire('Error', 'Role Name and Description are required', 'error');
      return;
    }

    // Call backend API to create role
    this.http.post('https://localhost:7168/api/roles', this.role).subscribe({
      next: () => {
        Swal.fire('Success', 'Role added successfully', 'success');
        this.router.navigate(['/roles']);
      },
      error: (err) => {
        Swal.fire('Error', err.error || 'Failed to add role', 'error');
      }
    });
  }
}
