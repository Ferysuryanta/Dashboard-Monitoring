import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, delay, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
    avatarUrl?: string;
    phone?: string;
    memberId?: string;
    preferences?: UserPreferences;
}

export interface UserPreferences {
    language: string;
    theme: string;
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    attendanceReminder: boolean;
    bibleReadingReminder: boolean;
    reminderTime: string;
    timezone: string;
}

export interface LoginRequest {
    username: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: User;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    phone?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly TOKEN_KEY = 'mamre_token';
    private readonly REFRESH_TOKEN_KEY = 'mamre_refresh_token';
    private readonly USER_KEY = 'mamre_user';
    private readonly API_URL = environment.apiUrl || '/api';

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.loadStoredUser();
    }

    private loadStoredUser(): void {
        const token = localStorage.getItem(this.TOKEN_KEY);
        const userJson = localStorage.getItem(this.USER_KEY);

        if (token && userJson) {
            try {
                const user = JSON.parse(userJson) as User;
                this.currentUserSubject.next(user);
                this.isAuthenticatedSubject.next(true);
            } catch {
                this.clearStorage();
            }
        }
    }

    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    get isAuthenticated(): boolean {
        return this.isAuthenticatedSubject.value;
    }

    get token(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Login user - calls backend API
     */
    login(request: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, request).pipe(
            tap(response => this.handleLoginSuccess(response, request.rememberMe)),
            catchError(this.handleError)
        );
    }

    /**
     * Register new user - calls backend API
     */
    register(request: RegisterRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.API_URL}/auth/register`, request).pipe(
            tap(response => this.handleLoginSuccess(response, true)),
            catchError(this.handleError)
        );
    }

    private handleLoginSuccess(response: LoginResponse, rememberMe?: boolean): void {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));

        if (rememberMe && response.refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
        }

        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
    }

    /**
     * Logout user
     */
    logout(): void {
        // Call backend logout endpoint
        this.http.post(`${this.API_URL}/auth/logout`, {}).subscribe({
            complete: () => this.performLogout(),
            error: () => this.performLogout()
        });
    }

    private performLogout(): void {
        this.clearStorage();
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/login']);
    }

    private clearStorage(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    /**
     * Update user profile
     */
    updateProfile(updates: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.API_URL}/auth/profile`, updates).pipe(
            tap(user => {
                localStorage.setItem(this.USER_KEY, JSON.stringify(user));
                this.currentUserSubject.next(user);
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Change password
     */
    changePassword(request: ChangePasswordRequest): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.API_URL}/auth/change-password`, request).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Get current user from API
     */
    getCurrentUserFromApi(): Observable<User> {
        return this.http.get<User>(`${this.API_URL}/auth/me`).pipe(
            tap(user => {
                localStorage.setItem(this.USER_KEY, JSON.stringify(user));
                this.currentUserSubject.next(user);
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Update user preferences
     */
    updatePreferences(preferences: Partial<UserPreferences>): Observable<UserPreferences> {
        const currentUser = this.currentUser;
        if (!currentUser) {
            return throwError(() => new Error('User not authenticated'));
        }

        const updatedPreferences = { ...currentUser.preferences, ...preferences } as UserPreferences;

        // For now, save preferences locally (TODO: Add backend endpoint)
        return of(updatedPreferences).pipe(
            delay(300),
            tap(prefs => {
                const updatedUser = { ...currentUser, preferences: prefs };
                localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
                this.currentUserSubject.next(updatedUser);
            })
        );
    }

    /**
     * Get user initials for avatar
     */
    getUserInitials(user?: User | null): string {
        const u = user || this.currentUser;
        if (!u) return 'U';

        const names = u.fullName.split(' ');
        if (names.length >= 2) {
            return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
        }
        return u.fullName.substring(0, 2).toUpperCase();
    }

    /**
     * Check if user has specific role
     */
    hasRole(role: string): boolean {
        return this.currentUser?.role === role;
    }

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(roles: string[]): boolean {
        return roles.includes(this.currentUser?.role || '');
    }

    /**
     * Handle HTTP errors
     */
    private handleError = (error: HttpErrorResponse): Observable<never> => {
        let message = 'Terjadi kesalahan';

        if (error.error?.message) {
            message = error.error.message;
        } else if (error.status === 401) {
            message = 'Username atau password salah';
        } else if (error.status === 403) {
            message = 'Akses ditolak';
        } else if (error.status === 0) {
            message = 'Tidak dapat terhubung ke server';
        }

        return throwError(() => new Error(message));
    }
}
