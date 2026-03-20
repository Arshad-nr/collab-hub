import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectService, Project } from '../../services/project.service';
import { DateAgoPipe } from '../../pipes/date-ago.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DateAgoPipe,
  ],
  template: `
    <div class="page-content">
      <div style="margin-bottom: 40px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h1 class="royal-heading" style="font-size: 2.5rem; margin-bottom: 8px; font-weight: 500;">Dashboard</h1>
          <p style="color:#8c7e8e; font-style: italic; margin-top:0; font-size: 1.1rem;">Overview of all collaboration projects</p>
        </div>
        <div style="font-size: 32px; color: #d4af37;">⚜</div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number" style="color:#d4af37;">{{ allProjects.length }}</div>
            <div class="stat-label">Total Projects</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number" style="color:#4a235a;">{{ countByStatus('open') }}</div>
            <div class="stat-label">Open</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number" style="color:#8c7e8e;">{{ countByStatus('in-progress') }}</div>
            <div class="stat-label">In Progress</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number" style="color:#2b1d31;">{{ countByStatus('completed') }}</div>
            <div class="stat-label">Completed</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" style="text-align:center; padding: 64px;">
        <mat-spinner diameter="40" style="margin:0 auto;"></mat-spinner>
      </div>

      <ng-container *ngIf="!loading">
        <!-- Search -->
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search projects...</mat-label>
          <mat-icon matPrefix style="color: #cbb493;">search</mat-icon>
          <input
            matInput
            id="dashboard-search"
            placeholder="Filter by title, department, or status..."
            [(ngModel)]="searchTerm"
          />
        </mat-form-field>

        <!-- Table -->
        <mat-card>
          <mat-card-content style="padding:0; overflow:auto;">
            <table mat-table [dataSource]="filteredProjects" style="width:100%;">

              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let p" style="max-width:260px;">
                  <div style="font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 500; color: #4a235a; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ p.title }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="department">
                <th mat-header-cell *matHeaderCellDef>Department</th>
                <td mat-cell *matCellDef="let p">{{ p.deptPreferred || '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let p">
                  <span [ngStyle]="getStatusStyle(p.status)"
                        style="padding:4px 14px; border-radius:2px; font-size:11px; font-family: 'Cinzel', serif; letter-spacing: 1px; font-weight:600; text-transform: uppercase;">
                    {{ p.status }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="postedBy">
                <th mat-header-cell *matHeaderCellDef>Posted By</th>
                <td mat-cell *matCellDef="let p" style="font-style: italic;">{{ p.postedBy?.name || '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Created</th>
                <td mat-cell *matCellDef="let p" style="color:#8c7e8e; font-size:13px;">
                  {{ p.createdAt | dateAgo }}
                </td>
              </ng-container>

              <ng-container matColumnDef="members">
                <th mat-header-cell *matHeaderCellDef>Members</th>
                <td mat-cell *matCellDef="let p">
                  <span style="background:#fdfaf5; color:#d4af37; border: 1px solid #eaddcf; padding:4px 12px; border-radius:2px; font-size:12px; font-weight:600;">
                    {{ p.acceptedMembers?.length || 0 }}
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  style="transition: background-color 0.3s ease; cursor:pointer;"
                  (mouseenter)="row._hov=true" (mouseleave)="row._hov=false"
                  [style.background]="row._hov ? '#fdf8f4' : ''">
              </tr>
            </table>

            <!-- Empty state -->
            <div *ngIf="filteredProjects.length === 0"
                 style="text-align:center; padding:60px 40px; color:#8c7e8e;">
              <div style="font-size:40px; color:#eaddcf; margin-bottom: 16px;">⚜</div>
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #2b1d31; margin-bottom: 8px;">
                {{ searchTerm ? 'No Matches Found' : 'No Projects Yet' }}
              </h3>
              <p style="margin:0; font-size:14px; font-style: italic;">
                {{ searchTerm ? 'Try adjusting your search terms.' : 'There are no active projects to display.' }}
              </p>
            </div>
          </mat-card-content>
        </mat-card>
      </ng-container>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  loading = true;
  allProjects: Project[] = [];
  searchTerm = '';
  displayedColumns = ['title', 'department', 'status', 'postedBy', 'createdAt', 'members'];

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.getAllProjects().subscribe({
      next: (projects) => {
        this.allProjects = projects;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get filteredProjects(): Project[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.allProjects;
    return this.allProjects.filter(p =>
      p.title.toLowerCase().includes(term) ||
      (p.deptPreferred || '').toLowerCase().includes(term) ||
      p.status.toLowerCase().includes(term) ||
      (p.postedBy?.name || '').toLowerCase().includes(term)
    );
  }

  countByStatus(status: string): number {
    return this.allProjects.filter(p => p.status === status).length;
  }

  getStatusStyle(status: string): object {
    const styles: Record<string, object> = {
      'open':        { background: '#fdfaf5', color: '#d4af37', border: '1px solid #eaddcf' }, // Gold
      'in-progress': { background: '#fdfcf9', color: '#8c7e8e', border: '1px solid #dcd3de' }, // Gray/Mauve
      'completed':   { background: '#f9f5fa', color: '#4a235a', border: '1px solid #d1badc' }, // Purple
    };
    return styles[status] || { background: '#f5f5f5', color: '#757575', border: '1px solid #e0e0e0' };
  }
}
