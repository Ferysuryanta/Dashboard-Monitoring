import {Injectable, inject, OnDestroy, PLATFORM_ID} from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import {BehaviorSubject} from "rxjs";
import {OverlayContainer} from '@angular/cdk/overlay';


@Injectable({providedIn: 'root'})
export class ThemeService implements OnDestroy {

    private overlay = inject(OverlayContainer);
    private platformId = inject(PLATFORM_ID);
    private isBrowser = isPlatformBrowser(this.platformId);
    private isDarkMode = new BehaviorSubject<boolean>(false);
    isDarkMode$ = this.isDarkMode.asObservable();
    private overlayObserver: MutationObserver | null = null;

    constructor() {
        if (this.isBrowser) {
            const saved = localStorage.getItem("theme");
            this.setDarkMode(saved === 'dark');
        } else {
            // default on server: light
            this.isDarkMode.next(false);
        }
    }

    setDarkMode(isDark: boolean): void {
        this.isDarkMode.next(isDark);
        const theme = isDark ? 'dark' : 'light';

        if (this.isBrowser) {
            // set on html (documentElement) and body so both selector variants match
            try {
                document.documentElement.setAttribute('data-theme', theme);
            } catch (e) {}
            try {
                document.body.setAttribute('data-theme', theme);
            } catch (e) {}

            try {
                localStorage.setItem("theme", theme);
            } catch (e) {}

            // sync theme attribute to CDK overlay container so panels inherit theme styles
            try {
                const container = this.overlay.getContainerElement();
                if (container) {
                    container.setAttribute('data-theme', theme);
                }
            } catch (e) {
                // no-op, we'll fallback to querySelector below
            }

            // fallback: if overlay container exists somewhere else or is created later,
            // try to set it directly or observe DOM to set it when added
            const existing = document.querySelector('.cdk-overlay-container');
            if (existing) {
                (existing as HTMLElement).setAttribute('data-theme', theme);
            } else {
                // watch for overlay container creation (some libs create it lazily)
                if (!this.overlayObserver) {
                    this.overlayObserver = new MutationObserver((mutations) => {
                        for (const m of mutations) {
                            for (const node of Array.from(m.addedNodes)) {
                                if (node instanceof HTMLElement && node.classList.contains('cdk-overlay-container')) {
                                    node.setAttribute('data-theme', theme);
                                    // once we found it, disconnect observer
                                    this.overlayObserver?.disconnect();
                                    this.overlayObserver = null;
                                    return;
                                }
                            }
                        }
                    });
                    this.overlayObserver.observe(document.documentElement || document.body, { childList: true, subtree: true });
                }
            }
        }
    }

    toggle(): void {
        this.setDarkMode(!this.isDarkMode.value);
    }

    get currentTheme(): boolean {
        return this.isDarkMode.value;
    }

    ngOnDestroy(): void {
        if (this.overlayObserver) {
            this.overlayObserver.disconnect();
            this.overlayObserver = null;
        }
    }
}