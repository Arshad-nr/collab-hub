import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserRecord {
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
export class UserService {
  private readonly API = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserRecord[]> {
    return this.http.get<UserRecord[]>(`${this.API}/admin/users`, { withCredentials: true });
  }

  updateUserRole(id: string, role: string): Observable<{ user: UserRecord }> {
    return this.http.put<{ user: UserRecord }>(
      `${this.API}/admin/users/${id}/role`,
      { role },
      { withCredentials: true }
    );
  }
}
