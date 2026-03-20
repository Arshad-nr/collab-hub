import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  year: number;
  skills: string[];
  avatar: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:5000/api';
  private http = inject(HttpClient);

  currentUser = signal<AdminUser | null>(null);
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // Guards await this before deciding to allow / redirect
  private _ready!: Promise<void>;
  get ready(): Promise<void> { return this._ready; }

  constructor() {
    this._ready = this.getMe();
  }

  async getMe(): Promise<void> {
    try {
      const user = await firstValueFrom(
        this.http.get<AdminUser>(`${this.API}/auth/me`, { withCredentials: true })
      );
      this.currentUser.set(user);
    } catch {
      this.currentUser.set(null);
    }
  }

  async login(email: string, password: string): Promise<AdminUser> {
    const res = await firstValueFrom(
      this.http.post<{ user: AdminUser }>(
        `${this.API}/auth/login`,
        { email, password },
        { withCredentials: true }
      )
    );
    this.currentUser.set(res.user);
    return res.user;
  }

  async logout(): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.API}/auth/logout`, {}, { withCredentials: true })
    );
    this.currentUser.set(null);
  }
}
