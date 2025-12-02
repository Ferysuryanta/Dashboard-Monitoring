import { Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatToolbar} from "@angular/material/toolbar";
import {MatListItem, MatNavList} from "@angular/material/list";
import {NgIf} from "@angular/common";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
    selector: 'app-layout',
    templateUrl: './app-layout.component.html',
    imports: [
        RouterOutlet,
        MatIcon,
        MatSidenavContent,
        MatIconButton,
        MatToolbar,
        MatListItem,
        RouterLink,
        MatNavList,
        MatSidenavContainer,
        MatSidenav,
        RouterLinkActive,
        MatButton,
        NgIf,
        MatTooltip
    ],
    styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent {
    isSidenavOpen = true;

    constructor(private router: Router) {}

    toggleSidebar() {
        this.isSidenavOpen = !this.isSidenavOpen;
    }

    onProfileClick() {
        // contoh: navigasi ke profile atau buka menu
        this.router.navigateByUrl('/profile');
    }
}