import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
interface Role {
  roleId: number;
  name: string;
  description: string;
  isActive: boolean;
}
@Component({
  selector: 'app-adduser',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './adduser.component.html',
  styleUrl: './adduser.component.css'
})
export class AdduserComponent implements OnInit {

  roles: any[] = [];

  user = {
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    role: '',
    isActive: true
  };

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles() {
    this.http.get<any[]>('https://localhost:7168/api/roles')
      .subscribe({
        next: res => this.roles = res.filter(r => r.status === true),
        error: () => Swal.fire('Error', 'Unable to load roles', 'error')
      });
  }

  saveUser() {
    if (this.user.password !== this.user.confirmPassword) {
      Swal.fire('Error', 'Passwords do not match', 'error');
      return;
    }

    this.http.post('https://localhost:7168/api/users', this.user)
      .subscribe({
        next: () => {
          Swal.fire('Success', 'User added successfully!', 'success');
          this.router.navigate(['/users']);
        },
        error: () => Swal.fire('Error', 'Failed to add user', 'error')
      });
  }
}
