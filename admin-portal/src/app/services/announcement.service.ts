import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Announcement {
  title: string;
  message: string;
  targetDept?: string;
}

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private readonly API = '/api';
  private http = inject(HttpClient);

  post(data: Announcement): Observable<{ message: string; announcement: Announcement }> {
    return this.http.post<{ message: string; announcement: Announcement }>(
      `${this.API}/admin/announcements`,
      data,
      { withCredentials: true }
    );
  }
}
