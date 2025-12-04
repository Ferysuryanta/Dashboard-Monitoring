import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';

import { AttendanceService } from 'src/app/core/services/attendance.service';
import { AttendanceDto } from '../../models/attendance.model';
import { PageModel } from '../../models/page.model';
import {MatNativeDateModule} from "@angular/material/core";
import {Router} from "@angular/router";

interface FilterParams {
    page?: number;
    size?: number;
    member?: string | null;
    from?: Date | string | null;
    to?: Date | string | null;
}

@Component({
    selector: 'app-attendance-list',
    templateUrl: './attendance-list.component.html',
    styleUrls: ['./attendance-list.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTooltipModule,
        MatProgressSpinnerModule
    ]
})
export class AttendanceListComponent implements OnInit, AfterViewInit {
    private attendanceService = inject(AttendanceService);
    private fb = inject(FormBuilder);
    private router= inject(Router);

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    filterForm!: FormGroup;

    displayedColumns: string[] = ['id', 'attendDate', 'memberName', 'event', 'present', 'note', 'actions'];
    dataSource = new MatTableDataSource<AttendanceDto>([]);

    // paging & loading
    pageSize = 20;
    currentPage = 0;
    dataLength = 0;
    isLoading = false;

    constructor() {}

    ngOnInit(): void {
        this.filterForm = this.fb.group({
            member: [null],
            from: [null],
            to: [null]
        });

        this.loadAttendance({ page: this.currentPage, size: this.pageSize });
    }

    ngAfterViewInit(): void {
        // bind paginator & sort after view init
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    private toYMD(value: Date | string | null): string | null {
        if (!value) return null;
        if (value instanceof Date) return value.toISOString().split('T')[0];
        try {
            const d = new Date(value as string);
            return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
        } catch {
            return null;
        }
    }

    loadAttendance(params: Partial<FilterParams>): void {
        this.isLoading = true;

        const page = (params.page ?? this.currentPage) ?? 0;
        const size = (params.size ?? this.pageSize) ?? 20;
        const member = params.member ?? null;
        const from = this.toYMD(params.from ?? null);
        const to = this.toYMD(params.to ?? null);

        // ----- memanggil service sesuai signature: listAttendance(page, size, member?, from?, to?)
        this.attendanceService.listAttendance(page, size, member, from, to).pipe(
            finalize(() => (this.isLoading = false))
        ).subscribe({
            next: (res: PageModel<AttendanceDto>) => {
                // PageModel: content[], totalElements, number, size (sesuaikan jika beda)
                this.dataSource.data = res?.content ?? [];
                this.dataLength = res?.totalElements ?? (this.dataSource.data.length);
                this.currentPage = res?.number ?? page;
                this.pageSize = res?.size ?? size;
            },
            error: (err) => {
                console.error('Gagal memuat daftar kehadiran', err);
                this.dataSource.data = [];
                this.dataLength = 0;
            }
        });
    }

    applyFilter(): void {
        this.currentPage = 0;
        if (this.paginator) this.paginator.firstPage();

        const v = this.filterForm.value;
        this.loadAttendance({
            page: this.currentPage,
            size: this.pageSize,
            member: v.member,
            from: v.from,
            to: v.to
        });
    }

    resetFilter(): void {
        this.filterForm.reset({ member: null, from: null, to: null });
        this.applyFilter();
    }

    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;

        const v = this.filterForm.value;
        this.loadAttendance({
            page: this.currentPage,
            size: this.pageSize,
            member: v.member,
            from: v.from,
            to: v.to
        });
    }

    editAttendance(id: number): void {
        // navigasi / logic edit sesuai aplikasimu
        console.log('Edit attendance', id);
    }

    deleteAttendance(id: number): void {
        if (!confirm(`Yakin ingin menghapus kehadiran ID ${id}?`)) return;
        this.isLoading = true;

        // ----- memanggil deleteAttendance(id) sesuai service
        this.attendanceService.deleteAttendance(id).pipe(
            finalize(() => (this.isLoading = false))
        ).subscribe({
            next: () => {
                // reload current page
                this.loadAttendance({ page: this.currentPage, size: this.pageSize });
            },
            error: (err) => {
                console.error('Gagal menghapus data', err);
            }
        });
    }

    /**
     * Navigasi ke halaman form tambah kehadiran
     */
    goToAddAttendance(): void {
        this.router.navigate(['/attendance/new']);
    }
}
