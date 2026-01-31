import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, User, ChangePasswordRequest } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatDividerModule,
        MatSnackBarModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    user: User | null = null;
    profileForm!: FormGroup;
    passwordForm!: FormGroup;
    preferencesForm!: FormGroup;

    isSavingProfile = false;
    isSavingPassword = false;
    isSavingPreferences = false;

    hideCurrentPassword = true;
    hideNewPassword = true;
    hideConfirmPassword = true;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            this.user = user;
            this.initForms();
        });
    }

    private initForms(): void {
        // Profile Form
        this.profileForm = this.fb.group({
            fullName: [this.user?.fullName || '', [Validators.required, Validators.minLength(3)]],
            email: [this.user?.email || '', [Validators.required, Validators.email]],
            phone: [this.user?.phone || '', [Validators.pattern(/^[0-9+\-\s]+$/)]],
            username: [{ value: this.user?.username || '', disabled: true }]
        });

        // Password Form
        this.passwordForm = this.fb.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });

        // Preferences Form
        this.preferencesForm = this.fb.group({
            language: [this.user?.preferences?.language || 'id'],
            theme: [this.user?.preferences?.theme || 'light'],
            notificationsEnabled: [this.user?.preferences?.notificationsEnabled ?? true],
            emailNotifications: [this.user?.preferences?.emailNotifications ?? true],
            attendanceReminder: [this.user?.preferences?.attendanceReminder ?? true],
            bibleReadingReminder: [this.user?.preferences?.bibleReadingReminder ?? true],
            reminderTime: [this.user?.preferences?.reminderTime || '07:00']
        });
    }

    private passwordMatchValidator(form: FormGroup) {
        const newPassword = form.get('newPassword')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;

        if (newPassword !== confirmPassword) {
            form.get('confirmPassword')?.setErrors({ mismatch: true });
            return { mismatch: true };
        }
        return null;
    }

    // Form control getters for template
    get profileControls() {
        return this.profileForm.controls;
    }

    get passwordControls() {
        return this.passwordForm.controls;
    }

    getUserInitials(): string {
        return this.authService.getUserInitials(this.user);
    }

    getRoleBadgeClass(): string {
        switch (this.user?.role) {
            case 'SUPER_ADMIN': return 'role-super-admin';
            case 'ADMIN': return 'role-admin';
            case 'PENGURUS': return 'role-pengurus';
            default: return 'role-user';
        }
    }

    formatRole(role?: string): string {
        if (!role) return 'User';
        return role.replace('_', ' ').toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Save Profile
    onSaveProfile(): void {
        if (this.profileForm.invalid) {
            this.profileForm.markAllAsTouched();
            return;
        }

        this.isSavingProfile = true;
        const updates = this.profileForm.getRawValue();

        this.authService.updateProfile(updates).subscribe({
            next: () => {
                this.isSavingProfile = false;
                this.snackBar.open('Profile berhasil diperbarui', 'OK', { duration: 3000 });
            },
            error: (err) => {
                this.isSavingProfile = false;
                this.snackBar.open(err.message || 'Gagal menyimpan profile', 'OK', { duration: 4000 });
            }
        });
    }

    // Change Password
    onChangePassword(): void {
        if (this.passwordForm.invalid) {
            this.passwordForm.markAllAsTouched();
            return;
        }

        this.isSavingPassword = true;
        const request: ChangePasswordRequest = this.passwordForm.value;

        this.authService.changePassword(request).subscribe({
            next: (res) => {
                this.isSavingPassword = false;
                this.passwordForm.reset();
                this.snackBar.open(res.message, 'OK', { duration: 3000 });
            },
            error: (err) => {
                this.isSavingPassword = false;
                this.snackBar.open(err.message || 'Gagal mengubah password', 'OK', { duration: 4000 });
            }
        });
    }

    // Save Preferences
    onSavePreferences(): void {
        this.isSavingPreferences = true;
        const preferences = this.preferencesForm.value;

        this.authService.updatePreferences(preferences).subscribe({
            next: () => {
                this.isSavingPreferences = false;
                this.snackBar.open('Pengaturan berhasil disimpan', 'OK', { duration: 3000 });
            },
            error: (err) => {
                this.isSavingPreferences = false;
                this.snackBar.open(err.message || 'Gagal menyimpan pengaturan', 'OK', { duration: 4000 });
            }
        });
    }
}
