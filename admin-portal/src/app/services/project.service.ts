import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  _id: string;
  title: string;
  description: string;
  skillsNeeded: string[];
  deptPreferred: string;
  teamSize: number;
  deadline: string;
  postedBy: { _id: string; name: string; email: string; department: string };
  acceptedMembers: unknown[];
  interestedUsers: unknown[];
  status: 'open' | 'in-progress' | 'completed';
  milestones: unknown[];
  isPublished: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly API = '/api';
  private http = inject(HttpClient);

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.API}/admin/projects`, { withCredentials: true });
  }

  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.API}/requests/${id}`, { withCredentials: true });
  }
}
