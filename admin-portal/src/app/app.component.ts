import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <ng-container *ngIf="currentUser(); else noSidebar">
      <mat-sidenav-container style="height: 100vh; background-color: #fdfcf9;">
        <!-- Sidenav -->
        <mat-sidenav mode="side" opened style="width: 260px; background-color: #ffffff; border-right: 1px solid #eaddcf;">
          <!-- Brand -->
          <div style="padding: 32px 24px; text-align: center; border-bottom: 1px solid #eaddcf; position: relative;">
            <div style="margin-bottom: 12px;">
              <div style="font-family: 'Cinzel', serif; font-size: 28px; color: #d4af37; line-height: 1;">👑</div>
            </div>
            <div style="font-family: 'Cinzel', serif; font-weight: 700; font-size: 18px; color: #2b1d31; letter-spacing: 2px;">AVALON</div>
            <div style="font-family: 'Lora', serif; font-size: 11px; color: #8c7e8e; letter-spacing: 1px; text-transform: uppercase; margin-top: 4px;">Collab Hub Admin</div>
            <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); font-size: 10px; color: #eaddcf;">⚜</div>
          </div>

          <!-- Nav Links -->
          <mat-nav-list style="padding-top: 24px;">
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link" class="nav-item">
              <mat-icon matListItemIcon style="color: #cbb493;">grid_view</mat-icon>
              <span matListItemTitle style="font-family: 'Cinzel', serif; letter-spacing: 1px; font-size: 13px;">Dashboard</span>
            </a>
            <a mat-list-item routerLink="/users" routerLinkActive="active-link" class="nav-item">
              <mat-icon matListItemIcon style="color: #cbb493;">people_outline</mat-icon>
              <span matListItemTitle style="font-family: 'Cinzel', serif; letter-spacing: 1px; font-size: 13px;">Users</span>
            </a>
            <a mat-list-item routerLink="/announcements" routerLinkActive="active-link" class="nav-item">
              <mat-icon matListItemIcon style="color: #cbb493;">campaign</mat-icon>
              <span matListItemTitle style="font-family: 'Cinzel', serif; letter-spacing: 1px; font-size: 13px;">Announcements</span>
            </a>
          </mat-nav-list>

          <!-- User block -->
          <div style="position:absolute; bottom:24px; left:24px; right:24px;">
            <div style="display:flex; align-items:center; gap:12px; padding:16px; border: 1px solid #eaddcf; background:#fffbf7; font-size:13px;">
              <div style="width:36px; height:36px; background:#4a235a; display:flex; align-items:center; justify-content:center; color:#d4af37; font-family:'Cinzel', serif; font-size:16px; flex-shrink:0;">
                {{ currentUser()?.name?.[0]?.toUpperCase() }}
              </div>
              <div style="flex:1; min-width:0;">
                <div style="font-family:'Playfair Display', serif; font-size:14px; color:#2b1d31; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ currentUser()?.name }}</div>
                <div style="font-family:'Lora', serif; font-style: italic; color:#8c7e8e; font-size:11px;">{{ currentUser()?.role }}</div>
              </div>
            </div>
          </div>
        </mat-sidenav>

        <!-- Main content -->
        <mat-sidenav-content style="background-color: #fdfcf9;">
          <!-- Top toolbar -->
          <mat-toolbar style="position:sticky; top:0; z-index:100; height: 80px; padding: 0 40px; display: flex; justify-content: space-between;">
            <span style="font-family: 'Playfair Display', serif; font-size: 20px; font-style: italic; color: #8c7e8e;">
              "Empowering the legacy of collaboration"
            </span>
            <button mat-button style="color:#4a235a; font-family: 'Cinzel', serif; letter-spacing: 1px;" (click)="handleLogout()">
              LOGOUT
            </button>
          </mat-toolbar>

          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </ng-container>

    <!-- No sidebar (login page) -->
    <ng-template #noSidebar>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .nav-item {
      margin: 0 16px 8px;
      border-radius: 2px !important;
      color: #6a5d6e !important;
    }
    .active-link {
      background-color: #fdfaf5 !important;
      color: #4a235a !important;
      border: 1px solid #eaddcf;
    }
    .active-link mat-icon { color: #d4af37 !important; }
    .active-link span { font-weight: 600; color: #4a235a !important; }
  `]
})
export class AppComponent {
  currentUser = this.auth.currentUser;

  constructor(private auth: AuthService, private router: Router) {}

  async handleLogout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
