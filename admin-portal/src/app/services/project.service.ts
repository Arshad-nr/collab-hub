import { Injectable } from '@angular/core';
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
  acceptedMembers: any[];
  interestedUsers: any[];
  status: 'open' | 'in-progress' | 'completed';
  milestones: any[];
  isPublished: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly API = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.API}/admin/projects`, { withCredentials: true });
  }

  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.API}/requests/${id}`, { withCredentials: true });
  }
}
