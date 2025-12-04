import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import {Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { filter, Subscription } from 'rxjs';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatListItem, MatNavList} from "@angular/material/list";
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {NgIf} from "@angular/common";

/**
 * App layout component
 * - responsive sidenav (collapses on small screens)
 * - saves sidenav open/close state to localStorage
 * - provides profile menu handler
 * - marks route active via routerLinkActive in template
 */
@Component({
    selector: 'app-layout',
    templateUrl: './app-layout.component.html',
    imports: [
        MatButton,
        MatListItem,
        RouterLink,
        RouterLinkActive,
        MatIconButton,
        MatSidenavContent,
        MatToolbar,
        MatIcon,
        RouterOutlet,
        MatTooltip,
        MatNavList,
        MatSidenavContainer,
        MatSidenav,
        NgIf
    ],
    styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnInit, OnDestroy {
    isSidenavOpen = true;
    isMobile = false;
    currentUrl = '/';
    private routerSub?: Subscription;

    // localStorage key for saving sidebar state
    private readonly SIDENAV_KEY = 'mamre.sidenav.open';

    constructor(private router: Router) {}

    ngOnInit(): void {
        this.checkViewport();
        // load saved preference (if present)
        const saved = localStorage.getItem(this.SIDENAV_KEY);
        if (saved !== null) {
            this.isSidenavOpen = saved === 'true';
        } else {
            // default: close on mobile, open on desktop
            this.isSidenavOpen = !this.isMobile;
        }

        // update current route for any extra logic
        this.routerSub = this.router.events.pipe(filter(e => e instanceof NavigationEnd))
            .subscribe((ev: any) => {
                this.currentUrl = ev.urlAfterRedirects || ev.url;
                // on mobile navigate, auto close the sidenav for better UX
                if (this.isMobile) {
                    this.isSidenavOpen = false;
                }
            });
    }

    ngOnDestroy(): void {
        this.routerSub?.unsubscribe();
    }

    toggleSidebar(): void {
        this.isSidenavOpen = !this.isSidenavOpen;
        try {
            localStorage.setItem(this.SIDENAV_KEY, String(this.isSidenavOpen));
        } catch {
            // ignore storage errors (private mode)
        }
    }

    onProfileClick(): void {
        // put logic for profile open - we open a mat-menu via template, or navigate to profile
        this.router.navigate(['/profile']);
    }

    // auto-collapse when window is resized
    @HostListener('window:resize')
    onResize(): void {
        this.checkViewport();
    }

    private checkViewport(): void {
        const w = window.innerWidth;
        // breakpoint 992 similar to Bootstrap lg
        this.isMobile = w < 992;
        // keep sidenav closed on mobile by default (unless user saved preference)
        if (this.isMobile) {
            // if no saved pref, make sure it's closed
            const saved = localStorage.getItem(this.SIDENAV_KEY);
            if (saved === null) this.isSidenavOpen = false;
        }
    }
}
