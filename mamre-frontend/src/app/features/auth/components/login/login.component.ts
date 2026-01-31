import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatSnackBarModule
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    isLoading = false;
    hidePassword = true;
    returnUrl = '/dashboard';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });

        // Get return URL from route parameters or default to dashboard
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

        // If already authenticated, redirect
        if (this.authService.isAuthenticated) {
            this.router.navigate([this.returnUrl]);
        }
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;

        const { username, password, rememberMe } = this.loginForm.value;

        this.authService.login({ username, password, rememberMe }).subscribe({
            next: () => {
                this.snackBar.open('Login berhasil!', 'OK', { duration: 2000 });
                this.router.navigate([this.returnUrl]);
            },
            error: (err) => {
                this.isLoading = false;
                this.snackBar.open(err.message || 'Login gagal', 'OK', {
                    duration: 4000,
                    panelClass: 'error-snackbar'
                });
            }
        });
    }

    get f() {
        return this.loginForm.controls;
    }
}
