import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";


@Injectable({providedIn: 'root'})
export class ThemeService {

    private isDarkMode = new BehaviorSubject<boolean>(false);
    isDarkMode$ = this.isDarkMode.asObservable();

    constructor() {
        const saved = localStorage.getItem("theme");
        this.setDarkMode(saved === 'dark');
    }

    setDarkMode(isDark: boolean): void {
        this.isDarkMode.next(isDark);
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem("theme", isDark ? 'dark' : 'light');
    }

    toggle(): void {
        this.setDarkMode(!this.isDarkMode.value);
    }

    get currentTheme(): boolean {
        return this.isDarkMode.value;
    }
}