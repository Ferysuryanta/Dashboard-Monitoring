import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips'; // Diperlukan untuk mat-chip-listbox
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {Observable, BehaviorSubject, combineLatest, of, filter} from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged, switchMap, catchError, shareReplay, tap } from 'rxjs/operators';
import { MemberService, PagedResult } from '../../../../core/services/member.service';
import { MemberDto } from '../../models/member.model';

@Component({
    selector: 'app-member-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule
    ],
    templateUrl: './member-list.component.html',
    styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent implements OnInit {
    search = new FormControl('');

    // Properti publik untuk status filter, digunakan di template
    statusFilter?: string;

    private page$ = new BehaviorSubject<number>(0);
    private size$ = new BehaviorSubject<number>(20);
    private sortField$ = new BehaviorSubject<string | undefined>(undefined);
    private sortDir$ = new BehaviorSubject<'asc' | 'desc' | undefined>(undefined);

    paged$!: Observable<PagedResult<MemberDto>>;
    error?: string;

    constructor(private service: MemberService) {}

    ngOnInit(): void {
        const search$ = this.search.valueChanges.pipe(
            startWith(this.search.value || ''),
            debounceTime(400),
            distinctUntilChanged(),
            filter((s: string) => (s || '').length >= 2 || (s || '') === ''),
            tap(() => this.page$.next(0))
        );

        this.paged$ = combineLatest([
            this.page$,
            this.size$,
            this.sortField$,
            this.sortDir$,
            search$
        ]).pipe(
            switchMap(([page, size, sortField, sortDir, searchTerm]) => {
                this.error = undefined;

                // Menggabungkan sortField dan sortDir ke dalam format string 'sort=fieldName,direction'
                const sort = sortField ? `${sortField},${sortDir ?? 'asc'}` : undefined;

                // Memanggil service dengan parameter sorting, search, dan status filter
                return this.service.getPaged(page, size, sort, searchTerm, this.statusFilter).pipe(
                    catchError(err => {
                        this.error = err?.message || 'Gagal memuat data';
                        return of({
                            content: [] as MemberDto[],
                            totalElements: 0,
                            totalPages: 0,
                            number: 0,
                            size,
                            first: true,
                            last: true,
                            empty: true
                        } as PagedResult<MemberDto>);
                    })
                );
            }),
            shareReplay({bufferSize: 1, refCount: false})
        );
    }

    onPageEvent(e: PageEvent) {
        this.page$.next(e.pageIndex);
        this.size$.next(e.pageSize);
    }

    /** Mengubah status pengurutan (field dan arah) */
    sortToggle(field: string) {
        const current = this.sortField$.value;
        const dir = this.sortDir$.value;

        if (current !== field) {
            this.sortField$.next(field);
            this.sortDir$.next('asc');
        } else {
            if (!dir) this.sortDir$.next('asc');
            else if (dir === 'asc') this.sortDir$.next('desc');
            else {
                this.sortField$.next(undefined);
                this.sortDir$.next(undefined);
            }
        }
        this.page$.next(0);
    }

    /** Mengatur filter status dan memicu pembaruan data */
    setStatusFilter(status?: string) {
        this.statusFilter = status;
        this.page$.next(0);
        // Memicu ulang alur data dengan nilai search saat ini (agar combineLatest jalan)
        this.search.setValue(this.search.value, { emitEvent: true });
    }

    // =======================================================
    // Getter
    // =======================================================
    get sortField() { return this.sortField$.value; }
    get sortDir() { return this.sortDir$.value; }

    // Fungsi helper visual lainnya
    initials(m: MemberDto): string {
        const f = (m.firstName || '').trim(), l = (m.lastName || '').trim();
        if (f && l) return (f.charAt(0) + l.charAt(0)).toUpperCase();
        if (f) return f.charAt(0).toUpperCase();
        if (l) return l.charAt(0).toUpperCase();
        return '?';
    }

    statusClass(status?: string): string {
        if (!status) return 'status-default';
        const s = status.toLowerCase();
        if (s.includes('active')) return 'status-active';
        if (s.includes('inactive') || s.includes('non') || s.includes('disabled')) return 'status-inactive';
        if (s.includes('pending')) return 'status-pending';
        return 'status-default';
    }
}