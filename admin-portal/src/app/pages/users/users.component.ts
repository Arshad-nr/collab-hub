import { Component, inject, signal, computed } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService, UserRecord } from '../../services/user.service';
import { DateAgoPipe } from '../../pipes/date-ago.pipe';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    NgStyle,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    DateAgoPipe,
  ],
  template: `
    <div class="page-content">
      <div style="margin-bottom: 40px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h1 class="royal-heading" style="font-size: 2.5rem; margin-bottom: 8px; font-weight: 500;">User Registry</h1>
          <p style="color:#8c7e8e; font-style: italic; margin-top:0; font-size: 1.1rem;">Manage registered students and administrators</p>
        </div>
        <div style="font-size: 32px; color: #d4af37;">⚜</div>
      </div>

      @if (usersResource.isLoading()) {
        <div style="text-align:center; padding:64px;">
          <mat-spinner diameter="40" style="margin:0 auto;"></mat-spinner>
        </div>
      } @else {
        <mat-card>
          <mat-card-content style="padding:0; overflow:auto;">
            <table mat-table [dataSource]="users()" style="width:100%;">

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let u">
                  <div style="display:flex; align-items:center; gap:16px; padding:12px 0;">
                    <div style="width:40px; height:40px; border-radius:50%; background:#fdfaf5; border: 1px solid #eaddcf; display:flex; align-items:center; justify-content:center; color:#d4af37; font-family:'Cinzel', serif; font-size:18px; flex-shrink:0; box-shadow: 0 4px 10px rgba(212,175,55,0.1);">
                      {{ u.name?.[0]?.toUpperCase() }}
                    </div>
                    <div>
                      <div style="font-family:'Playfair Display', serif; font-weight:600; font-size:16px; color:#2b1d31;">{{ u.name }}</div>
                      <div style="font-size:12px; font-style: italic; color:#8c7e8e;">{{ u.email }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="department">
                <th mat-header-cell *matHeaderCellDef>Department</th>
                <td mat-cell *matCellDef="let u">{{ u.department || '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="year">
                <th mat-header-cell *matHeaderCellDef>Year</th>
                <td mat-cell *matCellDef="let u">{{ u.year ? 'Year ' + u.year : '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Role</th>
                <td mat-cell *matCellDef="let u">
                  <span [style.background]="u.role === 'admin' ? '#4a235a' : '#8b2635'"
                        [style.color]="'#ffffff'"
                        style="display:inline-block; width:84px; text-align:center; padding:4px 0; border-radius:2px; font-size:11px; font-family:'Cinzel', serif; font-weight:600; text-transform:uppercase; letter-spacing:1px; white-space:nowrap;">
                    {{ u.role }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="skills">
                <th mat-header-cell *matHeaderCellDef>Skills</th>
                <td mat-cell *matCellDef="let u" class="mat-column-skills" style="padding: 12px 16px;">
                  <div class="chip-list">
                    @for (s of u.skills?.slice(0, 3); track s) {
                      <mat-chip class="skill-chip">{{ s }}</mat-chip>
                    }
                    @if (u.skills?.length > 3) {
                      <span style="font-size:11px; color:#d4af37; font-style:italic;">+{{ u.skills.length - 3 }}</span>
                    }
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="joined">
                <th mat-header-cell *matHeaderCellDef>Joined</th>
                <td mat-cell *matCellDef="let u" style="color:#8c7e8e; font-size:13px; font-style:italic;">{{ u.createdAt | dateAgo }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Action</th>
                <td mat-cell *matCellDef="let u">
                  <button
                    mat-stroked-button
                    (click)="toggleRole(u)"
                    [ngStyle]="{'color': u.role === 'student' ? '#d4af37' : '#8c7e8e', 'border-color': u.role === 'student' ? '#d4af37' : '#eaddcf'}"
                    style="font-family: 'Cinzel', serif; font-size:11px; letter-spacing:1px; height:32px; line-height:30px; border-radius:2px; padding:0 16px; white-space: nowrap; min-width: 130px;"
                  >
                    {{ u.role === 'student' ? 'Make Admin' : 'Revoke Admin' }}
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  style="transition: background-color 0.3s ease;"
                  (mouseenter)="row._hov=true" (mouseleave)="row._hov=false"
                  [style.background]="row._hov ? '#fdf8f4' : ''">
              </tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align:center; padding:60px; color:#8c7e8e;">
                   <div style="font-size:40px; color:#eaddcf; margin-bottom: 16px;">⚜</div>
                   <h3 style="font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #2b1d31; margin-bottom: 8px;">No Users Found</h3>
                </td>
              </tr>
            </table>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
})
export class UsersComponent {
  private userService = inject(UserService);
  private snack = inject(MatSnackBar);

  // rxResource for declarative async data — replaces OnInit + subscribe
  usersResource = rxResource({
    loader: () => this.userService.getAllUsers(),
  });

  users = computed(() => this.usersResource.value() ?? []);

  displayedColumns = ['name', 'department', 'year', 'role', 'skills', 'joined', 'actions'];

  toggleRole(user: UserRecord): void {
    const newRole = user.role === 'student' ? 'admin' : 'student';
    this.userService.updateUserRole(user._id, newRole).subscribe({
      next: (res) => {
        // Update the signal list immutably
        this.usersResource.update(prev =>
          prev?.map(u => u._id === user._id ? res.user : u)
        );
        this.snack.open(`${res.user.name} is now ${newRole}`, 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.snack.open(err?.error?.message || 'Role update failed.', 'Close', { duration: 3000 });
      }
    });
  }
}
