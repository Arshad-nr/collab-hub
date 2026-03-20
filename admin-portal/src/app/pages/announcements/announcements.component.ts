import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AnnouncementService } from '../../services/announcement.service';

const DEPARTMENTS = ['All Departments', 'CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'MBA', 'MCA', 'IT'];

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  template: `
    <div class="page-content" style="max-width:800px;">
      <div style="margin-bottom: 40px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h1 class="royal-heading" style="font-size: 2.5rem; margin-bottom: 8px; font-weight: 500;">Royal Decrees</h1>
          <p style="color:#8c7e8e; font-style: italic; margin-top:0; font-size: 1.1rem;">Broadcast announcements across the kingdom</p>
        </div>
        <div style="font-size: 32px; color: #d4af37;">⚜</div>
      </div>

      <mat-card style="border-top: 3px solid #d4af37;">
        <mat-card-header style="padding: 32px 32px 8px; border-bottom: 1px solid #fdfcf9;">
          <div mat-card-avatar style="font-size:40px; width:40px; height:40px; color:#cbb493; display:flex; align-items:center; justify-content:center;">
             <mat-icon style="font-size: 36px; height: 36px; width: 36px;">campaign</mat-icon>
          </div>
          <mat-card-title style="font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #2b1d31; font-weight: 500;">New Announcement</mat-card-title>
          <mat-card-subtitle style="font-family: 'Lora', serif; font-style: italic; color: #8c7e8e;">Will be logged to console (extendable to email/notifications)</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content style="padding: 24px 32px 32px;">
          <form [formGroup]="announcementForm" (ngSubmit)="onSubmit()">

            <!-- Title -->
            <mat-form-field appearance="outline" class="full-width" style="margin-bottom:8px;">
              <mat-label style="font-family: 'Cinzel', serif; letter-spacing: 1px; font-size: 13px;">Title of Decree</mat-label>
              <input matInput formControlName="title" placeholder="e.g. Annual Design Symposium Registration Open" id="ann-title" style="font-family: 'Lora', serif;"/>
              @if (announcementForm.get('title')?.errors?.['required']) {
                <mat-error>A title is required</mat-error>
              }
              @if (announcementForm.get('title')?.errors?.['minlength']) {
                <mat-error>Title must be at least 5 characters ({{ announcementForm.get('title')?.value?.length || 0 }}/5)</mat-error>
              }
            </mat-form-field>

            <!-- Message -->
            <mat-form-field appearance="outline" class="full-width" style="margin-bottom:8px;">
              <mat-label style="font-family: 'Cinzel', serif; letter-spacing: 1px; font-size: 13px;">Message Content</mat-label>
              <textarea matInput formControlName="message" rows="5" placeholder="Write your announcement details here in a formal manner..." id="ann-message" style="font-family: 'Lora', serif; line-height: 1.6;"></textarea>
              <mat-hint align="end" style="font-family: 'Lora', serif; font-style: italic;">{{ announcementForm.get('message')?.value?.length || 0 }}/20 min</mat-hint>
              @if (announcementForm.get('message')?.errors?.['required']) {
                <mat-error>Message content is required</mat-error>
              }
              @if (announcementForm.get('message')?.errors?.['minlength']) {
                <mat-error>Message must be at least 20 characters</mat-error>
              }
            </mat-form-field>

            <!-- Target Department -->
            <mat-form-field appearance="outline" class="full-width" style="margin-bottom:24px;">
              <mat-label style="font-family: 'Cinzel', serif; letter-spacing: 1px; font-size: 13px;">Target Department (Optional)</mat-label>
              <mat-select formControlName="targetDept" id="ann-dept" style="font-family: 'Lora', serif;">
                @for (dept of departments; track dept) {
                  <mat-option [value]="dept === 'All Departments' ? '' : dept" style="font-family: 'Lora', serif;">
                    {{ dept }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="announcementForm.invalid || loading()"
              style="height:54px; padding: 0 40px; font-size:14px; letter-spacing: 2px; text-transform: uppercase;"
            >
              <mat-icon style="margin-right:12px; vertical-align:middle; font-size: 20px;">send</mat-icon>
              {{ loading() ? 'Publishing...' : 'Publish Decree' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Success history -->
      @if (posted().length > 0) {
        <div style="margin-top:40px;">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
            <div style="height: 1px; flex: 1; background: #eaddcf;"></div>
            <h2 style="font-family: 'Cinzel', serif; font-size:1.1rem; letter-spacing: 2px; font-weight:600; color:#4a235a; margin: 0;">Recently Published</h2>
            <div style="height: 1px; flex: 1; background: #eaddcf;"></div>
          </div>
          
          @for (a of posted(); track a.title) {
            <mat-card style="margin-bottom:16px; border-left:4px solid #d4af37;">
              <mat-card-content style="padding: 24px;">
                <div style="font-family: 'Playfair Display', serif; font-weight:600; font-size:18px; color:#2b1d31;">{{ a.title }}</div>
                <div style="color:#6a5d6e; font-size:14px; margin-top:8px; line-height: 1.6;">{{ a.message }}</div>
                @if (a.targetDept) {
                  <div style="margin-top:12px;">
                    <span style="background:#fdfaf5; border: 1px solid #eaddcf; color:#cbb493; font-family: 'Cinzel', serif; letter-spacing: 1px; font-size:10px; padding:4px 12px; border-radius:2px;">
                      {{ a.targetDept }}
                    </span>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
})
export class AnnouncementsComponent {
  private fb = inject(FormBuilder);
  private announcementService = inject(AnnouncementService);
  private snack = inject(MatSnackBar);

  departments = DEPARTMENTS;
  loading = signal(false);
  posted = signal<{ title: string; message: string; targetDept?: string }[]>([]);

  // nonNullable removes the need for ! on form values
  announcementForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    message: ['', [Validators.required, Validators.minLength(20)]],
    targetDept: [''],
  });

  onSubmit(): void {
    if (this.announcementForm.invalid) return;
    this.loading.set(true);

    const val = this.announcementForm.getRawValue();
    this.announcementService.post({
      title: val.title,
      message: val.message,
      targetDept: val.targetDept || undefined,
    }).subscribe({
      next: (res) => {
        this.posted.update(prev => [res.announcement, ...prev]);
        this.snack.open('Decree published successfully!', 'Close', { duration: 3000 });
        this.announcementForm.reset();
        this.loading.set(false);
      },
      error: (err) => {
        this.snack.open(err?.error?.message || 'Failed to publish.', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }
}
