import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
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
import {SectorOption, SectorService} from "../../../../core/services/sector.service";

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
    loading = false;
    displayedMembers: MemberDto[] = [];

    private page$ = new BehaviorSubject<number>(0);
    private size$ = new BehaviorSubject<number>(10);
    private sortField$ = new BehaviorSubject<string | undefined>(undefined);
    private sortDir$ = new BehaviorSubject<'asc' | 'desc' | undefined>(undefined);
    // reactive sector filter so paged stream updates when sector changes
    private sectorId$ = new BehaviorSubject<number | undefined>(undefined);

    // paged stream
    paged$!: Observable<PagedResult<MemberDto>>;
    sectorId?: number;
    sectorName?: string;
    selectedSectorId?: string; // keep string for select binding
    sectors: SectorOption[] = [];

    // pagination state
    pageSize = 10;
    pageIndex = 0;
    totalElements = 0;

    error?: string;
    private refreshTrigger$ = new BehaviorSubject<void>(undefined);
    // prevent outdated preview responses from overriding newer ones
    private latestPreviewRequestId = 0;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private service: MemberService,
        private sectorSvc: SectorService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.sectorSvc.getAll().subscribe(list => this.sectors = list || []);

        // Initialize selected sector from query params so highlight matches URL (avoid 'undefined' literal)
        this.route.queryParamMap.subscribe(params => {
            const s = params.get('sectorId');
            const rawName = params.get('sectorName');
            // sanitize possible literal strings 'undefined' or 'null'
            this.sectorName = (rawName && rawName !== 'undefined' && rawName !== 'null') ? rawName : undefined;
            this.sectorId = s ? Number(s) : undefined;
            if (this.sectorId != null && Number.isNaN(this.sectorId)) this.sectorId = undefined;
            // set select value as string for binding
            this.selectedSectorId = this.sectorId != null ? String(this.sectorId) : undefined;
            // propagate to reactive sector filter
            this.sectorId$.next(this.sectorId);
         });

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
            this.sectorId$,
            this.refreshTrigger$
        ]).pipe(
            switchMap(([page, size, sortField, sortDir, searchTerm, sectorId]) => {
                this.error = undefined;
                const sort = sortField ? `${sortField},${sortDir ?? 'asc'}` : undefined;
                return this.service.getPaged(page, size, sort, searchTerm, this.statusFilter, sectorId).pipe(
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

    onSectorChange(sectorIdStr?: string) {
         // treat empty string or undefined/null as clear filter
         if (sectorIdStr === '' || sectorIdStr == null) {
             // clear filter
             this.selectedSectorId = undefined;
             this.sectorId = undefined;
             this.sectorName = undefined;
             // update reactive state and main paged stream (do not modify URL)
             this.sectorId$.next(undefined);
             this.page$.next(0);
             return;
         }
         this.selectedSectorId = sectorIdStr;
         const sid = Number(sectorIdStr);
         this.sectorId = Number.isNaN(sid) ? undefined : sid;
         // lookup sector name for nicer URL and title
         const opt = this.sectors.find(x => String(x.id) === sectorIdStr);
         this.sectorName = opt ? opt.name : undefined;
         // update reactive state so paged$ updates and reset page (do not modify URL)
         this.sectorId$.next(this.sectorId);
         this.page$.next(0);
     }

    loadPreview() {
        // read current reactive state so preview follows the same pagination / sort as the main list
        const page = this.page$.value;
        const size = this.size$.value;
        const sortField = this.sortField$.value;
        const sortDir = this.sortDir$.value ?? 'asc';
        const sortParam = sortField ? `${sortField},${sortDir}` : undefined;
        const sectorId = this.sectorId;

        // reflect reactive state into UI-bound fields immediately
        this.pageIndex = page;
        this.pageSize = size;

        this.loading = true;
        this.error = undefined;

        // increment request id so older responses are ignored
        const reqId = ++this.latestPreviewRequestId;

        // use MemberService to fetch members (supports search/status/sector filters)
        this.service.getPaged(page, size, sortParam, undefined, this.statusFilter, sectorId).subscribe({
            next: res => {
                // ignore outdated responses
                if (reqId !== this.latestPreviewRequestId) return;
                // trust backend computed flags; normalize to booleans for template
                this.displayedMembers = (res.content || []).map((m: MemberDto) => ({
                    ...m,
                    mamre: !!m.mamre,
                    saitun: !!m.saitun
                } as MemberDto));
                this.totalElements = res.totalElements || (res.content ? res.content.length : 0);
                this.loading = false;
            },
            error: err => {
                if (reqId !== this.latestPreviewRequestId) return;
                this.error = err?.message || 'Gagal memuat roster';
                this.loading = false;
            }
        });
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
        // reflect reactive sort to UI-facing fields used in template
        this.sortField = this.sortField$.value;
        this.sortDir = this.sortDir$.value ?? 'asc';
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
        if (s.includes('suspended')) return 'status-suspended';
        return 'status-default';
    }

    // Format gender to be more readable (capitalize first letter)
    formatGender(gender?: string): string {
        if (!gender) return '-';
        return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
    }

    // helper to programmatically change status filter (if UI added)
    setStatusFilter(status?: string) {
        this.statusFilter = status;
        this.page$.next(0);
        // retrigger by writing current search value (or setValue)
        this.search.setValue(this.search.value);
    }

    // sorting
    sortField?: string;
    sortDir: 'asc' | 'desc' = 'asc';

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
