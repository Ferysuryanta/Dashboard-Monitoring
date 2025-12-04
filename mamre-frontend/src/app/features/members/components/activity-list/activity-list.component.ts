import { Component, OnInit } from '@angular/core';
import { Activity, ActivityStatus } from '../../models/activity.model';
import {Router, RouterLink} from '@angular/router';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import { debounceTime, switchMap, startWith } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import {ActivityService} from "../../../../core/services/activity.service";
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {MatPaginator, PageEvent} from "@angular/material/paginator"; // Import PageEvent
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatFormField, MatInput} from "@angular/material/input";
import {MatCard} from "@angular/material/card";
import {MatChip} from "@angular/material/chips";

@Component({
    selector: 'app-activity-list',
    templateUrl: './activity-list.component.html',
    imports: [
        MatPaginator,
        DatePipe,
        MatIconButton,
        MatIcon,
        MatFormField,
        MatInput,
        ReactiveFormsModule,
        MatButton,
        RouterLink,
        MatCard,
        NgIf,
        AsyncPipe,
        NgForOf,
        MatChip,
        NgClass
    ],
    styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {
    data$: Observable<any> = of({ content: [], totalElements: 0, number: 0, size: 20 });
    search = new FormControl('');
    pageSize = 20;
    pageIndex = 0;

    constructor(private svc: ActivityService, private router: Router) {}

    ngOnInit() {
        this.data$ = this.search.valueChanges.pipe(
            startWith(''),
            debounceTime(300),
            switchMap(q => this.loadActivities(this.pageIndex, this.pageSize, q))
        );
    }

    // Method baru untuk memuat aktivitas
    loadActivities(page: number, size: number, search: string | null): Observable<any> {
        return this.svc.list(page, size, search);
    }

    onPageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.data$ = this.loadActivities(this.pageIndex, this.pageSize, this.search.value);
    }

    view(a: Activity) { this.router.navigate(['/activities', a.id]); }

    edit(a: Activity) { this.router.navigate(['/activities', a.id, 'edit']); }

    statusClass(status: ActivityStatus): string {
        switch (status) {
            case 'Planned': return 'status-planned';
            case 'Ongoing': return 'status-ongoing';
            case 'Completed': return 'status-completed';
            case 'Cancelled': return 'status-cancelled';
            default: return 'status-default';
        }
    }
}