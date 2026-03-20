import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; background-color: #fdfcf9; position: relative; overflow: hidden;">
      
      <!-- Decorative background elements -->
      <div style="position: absolute; top: -10vw; left: -10vw; width: 40vw; height: 40vw; background: radial-gradient(circle, rgba(212,175,55,0.05) 0%, rgba(253,252,249,0) 70%); border-radius: 50%;"></div>
      <div style="position: absolute; bottom: -15vw; right: -15vw; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(74,35,90,0.03) 0%, rgba(253,252,249,0) 70%); border-radius: 50%;"></div>

      <mat-card style="width:440px; padding:32px 16px; border-radius:2px; box-shadow: 0 24px 60px rgba(43,29,49,0.06); border: 1px solid #eaddcf; position: relative; z-index: 10;">
        <mat-card-header style="justify-content:center; margin-bottom:24px; text-align: center; display: flex; flex-direction: column; align-items: center;">
          <div style="font-family: 'Cinzel', serif; font-size: 42px; color: #d4af37; line-height: 1; margin-bottom: 16px;">👑</div>
          <mat-card-title style="font-family: 'Cinzel', serif; font-size: 24px; font-weight: 600; color: #2b1d31; letter-spacing: 2px;">AVALON</mat-card-title>
          <mat-card-subtitle style="font-family: 'Lora', serif; font-size: 13px; font-style: italic; color: #8c7e8e; margin-top: 8px;">Collab Hub Admin Portal</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            
            <div style="margin-bottom: 24px; text-align: center;">
              <p style="font-family: 'Playfair Display', serif; font-size: 18px; color: #4a3e4d;">Welcome back. Please sign in.</p>
            </div>

            <mat-form-field appearance="outline" class="full-width" style="margin-bottom:8px;">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" placeholder="admin@college.edu" id="admin-email" />
              <mat-error *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</mat-error>
              <mat-error *ngIf="loginForm.get('email')?.errors?.['email']">Enter a valid email</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" placeholder="••••••••" id="admin-password" />
              <mat-error *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</mat-error>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="loginForm.invalid || loading"
              style="width:100%; margin-top:24px; height:50px; font-size:14px; letter-spacing: 2px; text-transform: uppercase;"
            >
              <mat-spinner *ngIf="loading" diameter="20" style="display:inline-block; margin-right:8px;"></mat-spinner>
              {{ loading ? 'Authenticating...' : 'Sign In' }}
            </button>
            
            <div style="text-align: center; margin-top: 24px;">
               <span style="font-size: 24px; color: #eaddcf;">⚜</span>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class LoginComponent {
  loading = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  async onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    try {
      const user = await this.auth.login(
        this.loginForm.value.email!,
        this.loginForm.value.password!
      );
      if (user.role !== 'admin') {
        this.snack.open('Access denied: Admin role required.', 'Close', { duration: 4000 });
        await this.auth.logout();
        return;
      }
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.snack.open(err?.error?.message || 'Login failed. Check credentials.', 'Close', {
        duration: 4000,
        panelClass: ['snack-error'],
      });
    } finally {
      this.loading = false;
    }
  }
}
