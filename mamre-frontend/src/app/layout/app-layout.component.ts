import { Component, OnInit } from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {MatListItem, MatNavList} from "@angular/material/list";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {NgIf} from "@angular/common";
import {MatToolbar} from "@angular/material/toolbar";
import {MatTooltip} from "@angular/material/tooltip";
import {MatDivider} from "@angular/material/divider";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatBadge} from "@angular/material/badge";
import { AuthService } from '../core/services/auth.service';

interface CurrentUserDisplay {
    fullName: string;
    email: string;
    role: string;
    initials: string;
}

@Component({
    selector: 'app-layout',
    templateUrl: './app-layout.component.html',
    imports: [
        RouterOutlet,
        MatSidenavContainer,
        MatSidenav,
        MatNavList,
        MatIcon,
        MatListItem,
        RouterLinkActive,
        RouterLink,
        MatButton,
        NgIf,
        MatSidenavContent,
        MatToolbar,
        MatIconButton,
        MatTooltip,
        MatDivider,
        MatMenu,
        MatMenuItem,
        MatMenuTrigger,
        MatBadge
    ],
    styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnInit {
    isSidenavOpen = true;
    unreadNotifications = 2; // TODO: Get from notification service
    currentUser: CurrentUserDisplay | null = null;

    constructor(
        private router: Router,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.currentUser = {
                    fullName: user.fullName,
                    email: user.email,
                    role: this.formatRole(user.role),
                    initials: this.authService.getUserInitials(user)
                };
            } else {
                // Default user for demo
                this.currentUser = {
                    fullName: 'Admin User',
                    email: 'admin@mamre.church',
                    role: 'Super Admin',
                    initials: 'AU'
                };
            }
        });
    }

    private formatRole(role: string): string {
        return role.replace('_', ' ').toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    toggleSidebar() {
        this.isSidenavOpen = !this.isSidenavOpen;
    }

    onLogout() {
        this.authService.logout();
    }
}
