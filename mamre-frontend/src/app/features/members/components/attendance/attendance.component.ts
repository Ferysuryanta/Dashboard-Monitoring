import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { AttendanceService, Attendance, CHURCH_EVENTS } from '../../../../core/services/attendance.service';
import { MemberService } from '../../../../core/services/member.service';
import { SectorService, SectorOption } from '../../../../core/services/sector.service';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { AttendanceCreateDialogComponent } from './attendance-create-dialog.component';
import {MemberDto} from "../../models/member.model";

@Component({
    selector: 'app-attendance',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule,
        MatPaginatorModule,
        MatDialogModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatDividerModule,
        MatChipsModule,
        MatTabsModule
    ],
    templateUrl: './attendance.component.html',
    styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit, OnDestroy {
    private svc = inject(AttendanceService);
    private memberSvc = inject(MemberService);
    private sectorSvc = inject(SectorService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    private fb = inject(FormBuilder);

    attendances: Attendance[] = [];
    members: MemberDto[] = [];
    churchEvents = CHURCH_EVENTS;
    sectors: SectorOption[] = [];
    selectedSectorId?: string;
    // debounce for sector filter
    private sectorChange$ = new Subject<string | undefined>();
    private sectorSub?: Subscription;
    filterLoading = false;

    loading = false;
    showForm = false;
    showBatchForm = false;
    editingId: number | null = null;

    // Pagination
    totalElements = 0;
    pageSize = 10;
    pageIndex = 0;

    // Filter
    filterMember = '';
    filterFrom = '';
    filterTo = '';

    // Form untuk input individual
    form: FormGroup = this.fb.group({
        memberName: ['', Validators.required],
        attendDate: [new Date(), Validators.required],
        event: ['Ibadah Minggu', Validators.required],
        present: [true],
        kolpiAmount: [0],
        note: ['']
    });

    // Form untuk batch input
    batchForm: FormGroup = this.fb.group({
        attendDate: [new Date(), Validators.required],
        event: ['Ibadah Minggu', Validators.required]
    });
    selectedMembers: Set<string> = new Set();

    // Stats
    todayCount = 0;
    weekCount = 0;
    monthCount = 0;

    ngOnInit(): void {
        this.loadMembers();
        this.loadSectors();
        // subscribe sector changes with debounce
        this.sectorSub = this.sectorChange$.pipe(debounceTime(250)).subscribe(() => {
            this.filterLoading = true;
            this.pageIndex = 0;
            this.loadAttendances();
            this.loadStats();
            // small timeout to hide spinner after load completes (loadAttendances sets loading=false)
            setTimeout(() => this.filterLoading = false, 350);
        });

        this.loadAttendances();
        this.loadStats();
    }

    loadMembers(): void {
        this.memberSvc.getPaged(0, 1000).subscribe((res: any) => {
            const content = res.content || res;
            this.members = content.map((m: any) => ({
                id: m.id,
                firstName: m.firstName || '',
                lastName: m.lastName || '',
                email: m.email || ''
            }));
        });
    }

    loadSectors(): void {
        this.sectorSvc.getAll().subscribe(list => this.sectors = list || []);
    }

    loadAttendances(): void {
        this.loading = true;
        const sectorIdNum = this.selectedSectorId ? Number(this.selectedSectorId) : undefined;
        const sectorName = this.selectedSectorId ? (this.sectors.find(s => String(s.id) === this.selectedSectorId)?.name) : undefined;
        this.svc.getAll(this.pageIndex, this.pageSize, this.filterMember || undefined, this.filterFrom || undefined, this.filterTo || undefined, sectorIdNum, sectorName)
            .subscribe(res => {
                this.attendances = res.content;
                this.totalElements = res.totalElements;
                this.loading = false;
            });
    }

    loadStats(): void {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const todayStr = this.formatDate(today);
        const weekAgoStr = this.formatDate(weekAgo);
        const monthStartStr = this.formatDate(monthStart);

        const sectorIdNum = this.selectedSectorId ? Number(this.selectedSectorId) : undefined;
        const sectorName = this.selectedSectorId ? (this.sectors.find(s => String(s.id) === this.selectedSectorId)?.name) : undefined;
        this.svc.getAll(0, 1, undefined, todayStr, todayStr, sectorIdNum, sectorName).subscribe(res => this.todayCount = res.totalElements);

        // This week
        this.svc.getAll(0, 1, undefined, weekAgoStr, todayStr, sectorIdNum, sectorName).subscribe(res => this.weekCount = res.totalElements);

        // This month
        this.svc.getAll(0, 1, undefined, monthStartStr, todayStr, sectorIdNum, sectorName).subscribe(res => this.monthCount = res.totalElements);
    }

    formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    onPageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadAttendances();
    }

    applyFilter(): void {
        this.pageIndex = 0;
        this.loadAttendances();
    }

    clearFilter(): void {
        this.filterMember = '';
        this.filterFrom = '';
        this.filterTo = '';
        this.pageIndex = 0;
        this.selectedSectorId = undefined;
        this.loadAttendances();
    }

    onSectorChange(value?: string) {
        // treat empty string or undefined as clear
        this.selectedSectorId = value && value !== '' ? value : undefined;
        // emit change for debounced handling
        this.sectorChange$.next(this.selectedSectorId);
    }

    ngOnDestroy(): void {
        this.sectorSub?.unsubscribe();
    }

    // === INDIVIDUAL FORM ===
    openAddForm(): void {
        const dialogRef = this.dialog.open(AttendanceCreateDialogComponent, {
            width: '1000px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadAttendances();
                this.loadStats();
            }
        });
    }

    openEditForm(attendance: Attendance): void {
        this.editingId = attendance.id || null;
        this.form.patchValue({
            memberName: attendance.memberName,
            attendDate: new Date(attendance.attendDate),
            event: attendance.event || 'Ibadah Minggu',
            present: attendance.present,
            kolpiAmount: attendance.kolpiAmount || 0,
            note: attendance.note
        });
        this.showForm = true;
        this.showBatchForm = false;
    }

    cancelForm(): void {
        this.showForm = false;
        this.showBatchForm = false;
        this.editingId = null;
        this.form.reset();
        this.selectedMembers.clear();
    }

    saveAttendance(): void {
        if (this.form.invalid) return;

        const formValue = this.form.value;
        const attendance: Attendance = {
            memberName: formValue.memberName,
            attendDate: this.formatDate(formValue.attendDate),
            event: formValue.event,
            present: formValue.present ?? true,
            kolpiAmount: formValue.kolpiAmount ?? 0,
            note: formValue.note
        };

        if (this.editingId) {
            this.svc.update(this.editingId, attendance).subscribe({
                next: () => {
                    this.snackBar.open('Kehadiran berhasil diupdate', 'OK', { duration: 3000 });
                    this.cancelForm();
                    this.loadAttendances();
                    this.loadStats();
                },
                error: () => this.snackBar.open('Gagal mengupdate kehadiran', 'OK', { duration: 3000 })
            });
        } else {
            this.svc.create(attendance).subscribe({
                next: () => {
                    this.snackBar.open('Kehadiran berhasil ditambahkan', 'OK', { duration: 3000 });
                    this.cancelForm();
                    this.loadAttendances();
                    this.loadStats();
                },
                error: () => this.snackBar.open('Gagal menambahkan kehadiran', 'OK', { duration: 3000 })
            });
        }
    }

    deleteAttendance(attendance: Attendance): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Hapus Kehadiran',
                message: `Hapus data kehadiran ${attendance.memberName} pada ${attendance.attendDate}?`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && attendance.id) {
                this.svc.delete(attendance.id).subscribe({
                    next: () => {
                        this.snackBar.open('Kehadiran berhasil dihapus', 'OK', { duration: 3000 });
                        this.loadAttendances();
                        this.loadStats();
                    },
                    error: () => this.snackBar.open('Gagal menghapus kehadiran', 'OK', { duration: 3000 })
                });
            }
        });
    }

    // === BATCH FORM ===
    openBatchForm(): void {
        this.showBatchForm = true;
        this.showForm = false;
        this.selectedMembers.clear();
        this.batchForm.reset({
            attendDate: new Date(),
            event: 'Ibadah Minggu'
        });
    }

    toggleMemberSelection(memberId: string): void {
        if (this.selectedMembers.has(memberId)) {
            this.selectedMembers.delete(memberId);
        } else {
            this.selectedMembers.add(memberId);
        }
    }

    isMemberSelected(memberId: string): boolean {
        return this.selectedMembers.has(memberId);
    }

    selectAllMembers(): void {
        this.members.forEach(m => this.selectedMembers.add(m.id));
    }

    deselectAllMembers(): void {
        this.selectedMembers.clear();
    }

    saveBatchAttendance(): void {
        if (this.batchForm.invalid || this.selectedMembers.size === 0) {
            this.snackBar.open('Pilih minimal 1 anggota', 'OK', { duration: 3000 });
            return;
        }

        const formValue = this.batchForm.value;
        const attendances: Attendance[] = [];

        this.selectedMembers.forEach(memberId => {
            const member = this.members.find(m => m.id === memberId);
            if (member) {
                attendances.push({
                    memberName: member.email || `${member.firstName} ${member.lastName}`.trim(),
                    attendDate: this.formatDate(formValue.attendDate),
                    event: formValue.event,
                    present: true,
                    note: ''
                });
            }
        });

        // Simpan satu per satu (karena backend belum ada batch endpoint)
        let completed = 0;
        let errors = 0;

        attendances.forEach(att => {
            this.svc.create(att).subscribe({
                next: () => {
                    completed++;
                    if (completed + errors === attendances.length) {
                        this.snackBar.open(`${completed} kehadiran berhasil ditambahkan`, 'OK', { duration: 3000 });
                        this.cancelForm();
                        this.loadAttendances();
                        this.loadStats();
                    }
                },
                error: () => {
                    errors++;
                    if (completed + errors === attendances.length) {
                        this.snackBar.open(`${completed} berhasil, ${errors} gagal`, 'OK', { duration: 3000 });
                        this.cancelForm();
                        this.loadAttendances();
                        this.loadStats();
                    }
                }
            });
        });
    }

    getMemberDisplayName(member: MemberDto): string {
        if (member.email) return `${member.firstName} ${member.lastName} (${member.email})`;
        return `${member.firstName} ${member.lastName}`.trim();
    }
}
