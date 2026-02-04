import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode'; // ✅ fixed import
import Swal from 'sweetalert2';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  model = { email: '', password: '' };

  otpDigits: string[] = ['', '', '', '', '', ''];
  showPassword = false;
  showOtp = false;
  loading = false;
  errorMessage = '';
  rememberMe = false;
  isLockedOut = false;

  otpTime = 900;
  timerInterval: any;
  displayOtpTime = '5:00';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  // ================= INIT =================
  ngOnInit() {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');

    if (savedEmail && savedPassword) {
      this.model.email = savedEmail;
      this.model.password = savedPassword;
      this.rememberMe = true;
    }
  }

  ngOnDestroy() {
    this.clearOtpTimer();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // ================= OTP =================
  get otp(): string {
    return this.otpDigits.join('');
  }

  resetOtp() {
    this.otpDigits = ['', '', '', '', '', ''];
    this.otpTime = 900;
    this.displayOtpTime = '5:00';
    this.clearOtpTimer();
    this.isLockedOut = false;
    this.errorMessage = '';
  }

  onOtpInput(event: any, index: number) {
    const value = event.target.value.replace(/\D/g, '');
    this.otpDigits[index] = value;

    if (value && index < 5) {
      event.target.nextElementSibling?.focus();
    }
  }

  // ================= LOGIN =================
  login(form: any) {
    if (form.invalid || this.isLockedOut) return;

    this.loading = true;
    this.errorMessage = '';

    this.auth.login(this.model).subscribe({
      next: () => {
        this.loading = false;
        this.showOtp = true;
        this.resetOtp();
        this.startOtpTimer();

        Swal.fire('OTP Sent', 'Check your email for OTP', 'success');

        if (this.rememberMe) {
          localStorage.setItem('rememberedEmail', this.model.email);
          localStorage.setItem('rememberedPassword', this.model.password);
        } else {
          localStorage.clear();
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Invalid credentials';

        if (this.errorMessage.toLowerCase().includes('locked')) {
          this.isLockedOut = true;
          Swal.fire('Account Locked', 'Try again later', 'error');
        }
      }
    });
  }

  // ================= VERIFY OTP =================
  verifyOtp(form: any) {
    if (form.invalid || this.otp.length !== 6) return;

    this.loading = true;

    this.auth.verifyLoginOtp({
      email: this.model.email,
      code: this.otp
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.clearOtpTimer();

        localStorage.setItem('token', res.token);
        localStorage.setItem('refreshToken', res.refreshToken);

        const decoded: any = jwtDecode(res.token); // ✅ decode JWT

        console.log('JWT Payload:', decoded); // 🔍 DEBUG

        // ================= FIX: Store permissions for Security Access =================
        const permissions = decoded['permissions'] || [];
        this.auth.permissions = permissions; // ← ensures menu works
        localStorage.setItem('permissions', JSON.stringify(permissions)); // optional

        // ================= FIX: Decode role =================
        const roleClaim =
          decoded['role'] ||
          decoded['roles'] ||
          decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

        let role = '';

        if (Array.isArray(roleClaim)) {
          role = roleClaim[0];
        } else if (typeof roleClaim === 'string') {
          role = roleClaim;
        }

        role = role.toLowerCase().trim();
        this.auth.role = role; // optional: store in AuthService

        console.log('Resolved Role:', role); // 🔍 DEBUG

        if (role === 'admin') {
         // After successful login
this.router.navigate(['/admin-dashboard'], { state: { showWelcome: true } });

        } else if (role === 'user') {
          this.router.navigate(['/dashboard']);
        } else {
          Swal.fire('Error', 'Role not recognized', 'error');
          this.router.navigate(['/login']);
        }

        Swal.fire('Success', 'Login successful', 'success');
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Invalid OTP';
        Swal.fire('Error', this.errorMessage, 'error');
      }
    });
  }

  resendLoginOtp() { 
    if (!this.model.email) { 
      Swal.fire('Error', 'Please enter your email first', 'error'); 
      return; 
    } 
    this.loading = true; 
    this.errorMessage = ''; 
    this.resetOtp(); 
    this.auth.resendLoginOtp(this.model.email).subscribe({ 
      next: () => { 
        this.loading = false; 
        this.startOtpTimer(); 
        Swal.fire('OTP Sent', 'A new OTP has been sent to your email.', 'success'); 
      }, 
      error: (err: any) => { 
        this.loading = false; 
        this.errorMessage = err?.error?.message || 'Failed to resend OTP'; 
        Swal.fire('Error', this.errorMessage, 'error'); 
      } 
    }); 
  }

  // ================= OTP TIMER =================
  startOtpTimer() {
    this.clearOtpTimer();
    this.updateDisplayOtpTime();

    this.timerInterval = setInterval(() => {
      if (this.otpTime > 0) {
        this.otpTime--;
        this.updateDisplayOtpTime();
      } else {
        this.resetOtp();
        Swal.fire('OTP Expired', 'Request a new OTP', 'error');
      }
    }, 1000);
  }

  clearOtpTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateDisplayOtpTime() {
    const m = Math.floor(this.otpTime / 60).toString().padStart(2, '0');
    const s = (this.otpTime % 60).toString().padStart(2, '0');
    this.displayOtpTime = `${m}:${s}`;
  }
}
