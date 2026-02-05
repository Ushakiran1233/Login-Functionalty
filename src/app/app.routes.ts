import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { RouterModule } from '@angular/router';
// Admin child components
import { UsersComponent } from './users/users.component';
import { RolesComponent } from './roles/roles.component';
import { ReportsComponent } from './reports/reports.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [

  // 🔓 PUBLIC ROUTES
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotpasswordComponent },
  { path: 'reset-password', component: ResetpasswordComponent },

  // 🔐 PROTECTED ROUTES
  {
    path: '',
    canActivateChild: [AuthGuard],
    children: [

      // 👤 USER DASHBOARD (normal users)
      { path: 'dashboard', component: DashboardComponent, data: { role: 'User' } },

      // 🛡️ ADMIN DASHBOARD
      {
         path: 'admin-dashboard',
  component: AdminDashboardComponent,
  data: { role: 'Admin' },
  children: [
    // ✅ dashboard landing
    { path: 'users', component: UsersComponent },
    { path: 'roles', component: RolesComponent },
    { path: 'reports', component: ReportsComponent },
    { path: 'settings', component: SettingsComponent }
  ]
      },

      // 🔑 CHANGE PASSWORD
      { path: 'change-password', component: ChangepasswordComponent }
    ]
  },

  // ❗ WILDCARD
  { path: '**', redirectTo: 'login' }
];