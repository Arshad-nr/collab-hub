import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/users/users.component').then(m => m.UsersComponent),
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'announcements',
    loadComponent: () =>
      import('./pages/announcements/announcements.component').then(m => m.AnnouncementsComponent),
    canActivate: [AuthGuard, RoleGuard],
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
