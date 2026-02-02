import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdminService } from '../services/admin.service';

interface Role {
  roleId: number;
  name: string;
  description: string;
  isActive: boolean;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];
  userSearch = '';

  showUserForm = false;
  submitted = false;

  user: any = this.resetUser();
  roles: Role[] = [];

  constructor(private adminService: AdminService) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  // ================= LOAD USERS =================
  loadUsers(): void {
    this.adminService.getAdminUsers().subscribe({
      next: (res: any[]) => {
        this.users = res.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          mobileno: u.mobileno || u.phoneNumber || '',
          // ✅ FIX: ALWAYS STORE ROLE AS STRING
          role: Array.isArray(u.roles) ? u.roles[0] || '' : u.role || '',
          isActive: u.isActive
        }));

        this.filteredUsers = [...this.users];
      },
      error: () => Swal.fire('Error', 'Failed to load users', 'error')
    });
  }

  // ================= LOAD ROLES =================
  loadRoles(): void {
    this.adminService.getRoles().subscribe({
      next: (res: Role[]) => this.roles = res,
      error: () => Swal.fire('Error', 'Failed to load roles', 'error')
    });
  }

  // ================= SEARCH =================
  filterUsers(): void {
    const search = this.userSearch.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      u.name.toLowerCase().includes(search) ||
      u.role.toLowerCase().includes(search) ||
      u.mobileno.includes(search)
    );
  }

  // ================= RESET =================
  resetUser() {
    return {
      id: null,
      name: '',
      email: '',
      mobileNumber: '',
      password: '',
      confirmPassword: '',
      role: '',
      isActive: true
    };
  }

  // ================= ADD =================
  addUser(): void {
    this.submitted = false;
    this.user = this.resetUser();
    this.showUserForm = true;
  }

  // ================= EDIT =================
  editUser(user: any): void {
    this.submitted = false;

    // ✅ FIX: ROLE MUST BE STRING FOR DROPDOWN BINDING
    this.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileno,
      role: user.role || '',
      isActive: user.isActive,
      password: '',
      confirmPassword: ''
    };

    this.showUserForm = true;
  }

  // ================= SAVE =================
  saveUser(): void {
    this.submitted = true;

    // ================= COMMON VALIDATION =================
    if (
      !this.user.name ||
      !this.isValidEmail(this.user.email) ||
      !this.isValidMobile(this.user.mobileNumber) ||
      !this.user.role
    ) {
      Swal.fire('Error', 'Please fix validation errors', 'error');
      return;
    }

    // ================= ADD USER =================
    if (!this.user.id) {

      if (!this.isValidPassword(this.user.password)) {
        Swal.fire('Error', 'Password must be at least 8 characters', 'error');
        return;
      }

      if (this.user.password !== this.user.confirmPassword) {
        Swal.fire('Error', 'Passwords do not match', 'error');
        return;
      }

      const payload = {
        name: this.user.name,
        email: this.user.email,
        mobileNumber: this.user.mobileNumber,
        password: this.user.password,
        confirmPassword: this.user.confirmPassword,
        role: this.user.role
      };

      this.adminService.addUser(payload).subscribe({
        next: () => {
          Swal.fire('Success', 'User added successfully', 'success');
          this.showUserForm = false;
          this.submitted = false;
          this.loadUsers();
        },
        error: () => Swal.fire('Error', 'Failed to add user', 'error')
      });

    }

    // ================= UPDATE USER =================
    else {
      const payload = {
        name: this.user.name,
        email: this.user.email,
        mobileNumber: this.user.mobileNumber,
        role: this.user.role,
        isActive: this.user.isActive
      };

      this.adminService.updateUser(this.user.id, payload).subscribe({
        next: () => {
          Swal.fire('Success', 'User updated successfully', 'success');
          this.showUserForm = false;
          this.submitted = false;
          this.loadUsers();
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'Failed to update user', 'error');
        }
      });
    }
  }

  // ================= CANCEL =================
  cancel(): void {
    this.submitted = false;
    this.showUserForm = false;
    this.user = this.resetUser();
  }

  // ================= DELETE =================
  deleteUser(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'User will be deactivated',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.deleteUser(id).subscribe({
          next: () => {
            Swal.fire('Deleted', 'User deactivated successfully', 'success');
            this.loadUsers();
          },
          error: () => Swal.fire('Error', 'Failed to delete user', 'error')
        });
      }
    });
  }

  // ================= VALIDATIONS =================
  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  isValidMobile(mobile: string): boolean {
    return /^[0-9]{10}$/.test(mobile);
  }

  isValidPassword(password: string): boolean {
    return !!password && password.length >= 8;
  }
  get isUserFormValid(): boolean {
  if (!this.user) return false;

  // Check required fields
  const hasName = !!this.user.name?.trim();
  const hasEmail = this.isValidEmail(this.user.email);
  const hasMobile = this.isValidMobile(this.user.mobileNumber);
  const hasRole = !!this.user.role?.trim();

  // If adding new user, check passwords
  let passwordsValid = true;
  if (!this.user.id) {
    passwordsValid =
      this.isValidPassword(this.user.password) &&
      this.user.password === this.user.confirmPassword;
  }

  return hasName && hasEmail && hasMobile && hasRole && passwordsValid;
}

}
