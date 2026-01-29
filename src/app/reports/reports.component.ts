import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AdminService } from '../services/admin.service';
import { AdminReports } from '../services/admin.models.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  reports?: AdminReports;  // can be undefined initially

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.adminService.getAdminReports().subscribe({
      next: (res) => this.reports = res,
      error: () => Swal.fire('Error', 'Failed to load reports', 'error')
    });
  }

  // ✅ Safe method to get roles, returns empty array if undefined
  getRoles(): string[] {
    return this.reports?.usersByRole ? Object.keys(this.reports.usersByRole) : [];
  }
}
