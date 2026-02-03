import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MemberDto } from '../../models/member.model';
import { RouterModule } from '@angular/router';
import {MatTooltip} from "@angular/material/tooltip";

@Component({
    selector: 'app-member-card',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule, MatButtonModule, RouterModule, MatTooltip],
    templateUrl: './member-card.component.html',
    styleUrls: ['./member-card.component.scss']
})
export class MemberCardComponent {
    @Input() member!: MemberDto;

    // helper untuk menampilkan inisial
    get initial(): string {
        const n = `${this.member?.firstName || ''}`.trim();
        return (n.charAt(0) || '?').toUpperCase();
    }

    // full name
    get fullName(): string {
        return `${this.member?.firstName || ''} ${this.member?.lastName || ''}`.trim();
    }
}
