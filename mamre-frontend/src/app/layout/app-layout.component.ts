import { Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {MatListItem, MatNavList} from "@angular/material/list";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {NgIf} from "@angular/common";
import {MatToolbar} from "@angular/material/toolbar";
import {MatTooltip} from "@angular/material/tooltip";

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
