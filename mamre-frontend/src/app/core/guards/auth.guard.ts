import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        if (this.authService.isAuthenticated) {
            // Check for required roles if specified
            const requiredRoles = route.data['roles'] as string[] | undefined;

            if (requiredRoles && requiredRoles.length > 0) {
                if (!this.authService.hasAnyRole(requiredRoles)) {
                    // User doesn't have required role, redirect to dashboard
                    return this.router.createUrlTree(['/dashboard']);
                }
            }

            return true;
        }

        // Not authenticated, redirect to login with return URL
        return this.router.createUrlTree(['/login'], {
            queryParams: { returnUrl: state.url }
        });
    }
}

@Injectable({
    providedIn: 'root'
})
export class GuestGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    canActivate(): boolean | UrlTree {
        if (this.authService.isAuthenticated) {
            // Already authenticated, redirect to dashboard
            return this.router.createUrlTree(['/dashboard']);
        }
        return true;
    }
}
