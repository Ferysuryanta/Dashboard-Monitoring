import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {Observable, BehaviorSubject, combineLatest, of, filter} from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged, switchMap, catchError, shareReplay, tap } from 'rxjs/operators';
import { MemberService, PagedResult } from '../../../../core/services/member.service';
import { MemberDto } from '../../models/member.model';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';

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
        MatSelectModule,
        MatPaginatorModule,
        MatDialogModule,
        MatSnackBarModule
    ],
    templateUrl: './member-list.component.html',
    styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent implements OnInit {
    search = new FormControl('');
    // status filter (if you want to add dropdown filter later)
    statusFilter?: string;

    private page$ = new BehaviorSubject<number>(0);
    private size$ = new BehaviorSubject<number>(20);
    private sortField$ = new BehaviorSubject<string | undefined>(undefined);
    private sortDir$ = new BehaviorSubject<'asc' | 'desc' | undefined>(undefined);

    // paged stream
    paged$!: Observable<PagedResult<MemberDto>>;

    error?: string;
    private refreshTrigger$ = new BehaviorSubject<void>(undefined);

    constructor(
        private service: MemberService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        const search$ = this.search.valueChanges.pipe(
            startWith(this.search.value || ''),
            debounceTime(400),
            distinctUntilChanged(),
            filter((s: string) => (s || '').length >= 2 || (s || '') === ''), // only search when >=2 chars or empty (to load all)
            tap(() => this.page$.next(0))
        );

        this.paged$ = combineLatest([
            this.page$,
            this.size$,
            this.sortField$,
            this.sortDir$,
            search$,
            this.refreshTrigger$
        ]).pipe(
            switchMap(([page, size, sortField, sortDir, searchTerm]) => {
                this.error = undefined;
                const sort = sortField ? `${sortField},${sortDir ?? 'asc'}` : undefined;
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
            // prevent duplicate HTTP calls when multiple async pipes subscribe
            shareReplay({bufferSize: 1, refCount: false})
        );
    }

    // paginator event
    onPageEvent(e: PageEvent) {
        this.page$.next(e.pageIndex);
        this.size$.next(e.pageSize);
    }

    // toggle sort: cycles asc -> desc -> off
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
        // reset page
        this.page$.next(0);
    }

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

    // helper to programmatically change status filter (if UI added)
    setStatusFilter(status?: string) {
        this.statusFilter = status;
        this.page$.next(0);
        // retrigger by writing current search value (or setValue)
        this.search.setValue(this.search.value);
    }

    // expose current sort state for template
    get sortField() { return this.sortField$.value; }
    get sortDir() { return this.sortDir$.value; }

    // Delete member with confirmation
    deleteMember(member: MemberDto) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Hapus Anggota',
                message: `Apakah Anda yakin ingin menghapus ${member.firstName} ${member.lastName || ''}?`,
                confirmText: 'Hapus',
                cancelText: 'Batal'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && member.id) {
                this.service.delete(member.id).subscribe({
                    next: () => {
                        this.snackBar.open('Anggota berhasil dihapus', 'OK', { duration: 3000 });
                        this.refreshTrigger$.next();
                    },
                    error: (err) => {
                        this.snackBar.open('Gagal menghapus anggota: ' + (err?.message || 'Unknown error'), 'OK', { duration: 5000 });
                    }
                });
            }
        });
    }
}
