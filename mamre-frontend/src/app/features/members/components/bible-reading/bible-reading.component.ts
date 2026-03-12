import { Component, OnInit, inject } from '@angular/core';
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
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { BibleReadingService, BibleReading, BIBLE_BOOKS } from '../../../../core/services/bible-reading.service';
import { MemberService } from '../../../../core/services/member.service';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';

interface Member {
    id: string;
    firstName: string;
    lastName: string;
}

@Component({
    selector: 'app-bible-reading',
    standalone: true,
    providers: [provideNativeDateAdapter()],
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
        MatChipsModule
    ],
    templateUrl: './bible-reading.component.html',
    styleUrls: ['./bible-reading.component.scss']
})
export class BibleReadingComponent implements OnInit {
    private svc = inject(BibleReadingService);
    private memberSvc = inject(MemberService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    private fb = inject(FormBuilder);

    readings: BibleReading[] = [];
    members: Member[] = [];
    bibleBooks = BIBLE_BOOKS;

    loading = false;
    showForm = false;
    editingId: number | null = null;

    // Pagination
    totalElements = 0;
    pageSize = 10;
    pageIndex = 0;

    // Form
    form: FormGroup = this.fb.group({
        memberId: ['', Validators.required],
        readingDate: [new Date(), Validators.required],
        bookName: ['', Validators.required],
        chapter: [null],
        verseStart: [null],
        verseEnd: [null],
        completed: [true],
        notes: ['']
    });

    // Stats
    todayCount = 0;
    weekCount = 0;
    monthCount = 0;

    ngOnInit(): void {
        this.loadMembers();
        this.loadReadings();
        this.loadStats();
    }

    loadMembers(): void {
        this.memberSvc.getPaged(0, 1000).subscribe((res: any) => {
            const content = res.content || res;
            this.members = content.map((m: any) => ({
                id: m.id,
                firstName: m.firstName || '',
                lastName: m.lastName || ''
            }));
        });
    }

    loadReadings(): void {
        this.loading = true;
        this.svc.getAll(this.pageIndex, this.pageSize).subscribe(res => {
            this.readings = res.content;
            this.totalElements = res.totalElements;
            this.loading = false;
        });
    }

    loadStats(): void {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);

        // Today
        this.svc.getByDateRange(
            this.formatDate(today),
            this.formatDate(today)
        ).subscribe(res => this.todayCount = res.totalElements);

        // This week
        this.svc.getByDateRange(
            this.formatDate(weekAgo),
            this.formatDate(today)
        ).subscribe(res => this.weekCount = res.totalElements);

        // This month
        this.svc.getByDateRange(
            this.formatDate(monthAgo),
            this.formatDate(today)
        ).subscribe(res => this.monthCount = res.totalElements);
    }

    formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    onPageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadReadings();
    }

    openAddForm(): void {
        this.editingId = null;
        this.form.reset({
            memberId: '',
            readingDate: new Date(),
            bookName: '',
            chapter: null,
            verseStart: null,
            verseEnd: null,
            completed: true,
            notes: ''
        });
        this.showForm = true;
    }

    openEditForm(reading: BibleReading): void {
        this.editingId = reading.id || null;
        this.form.patchValue({
            memberId: reading.memberId,
            readingDate: new Date(reading.readingDate),
            bookName: reading.bookName,
            chapter: reading.chapter,
            verseStart: reading.verseStart,
            verseEnd: reading.verseEnd,
            completed: reading.completed,
            notes: reading.notes
        });
        this.showForm = true;
    }

    cancelForm(): void {
        this.showForm = false;
        this.editingId = null;
        this.form.reset();
    }

    saveReading(): void {
        if (this.form.invalid) return;

        const formValue = this.form.value;
        const reading: BibleReading = {
            memberId: formValue.memberId,
            readingDate: this.formatDate(formValue.readingDate),
            bookName: formValue.bookName,
            chapter: formValue.chapter,
            verseStart: formValue.verseStart,
            verseEnd: formValue.verseEnd,
            completed: formValue.completed,
            notes: formValue.notes
        };

        if (this.editingId) {
            this.svc.update(this.editingId, reading).subscribe({
                next: () => {
                    this.snackBar.open('Data berhasil diupdate!', 'OK', { duration: 3000 });
                    this.cancelForm();
                    this.loadReadings();
                    this.loadStats();
                },
                error: () => this.snackBar.open('Gagal mengupdate data', 'OK', { duration: 3000 })
            });
        } else {
            this.svc.create(reading).subscribe({
                next: () => {
                    this.snackBar.open('Data berhasil ditambahkan!', 'OK', { duration: 3000 });
                    this.cancelForm();
                    this.loadReadings();
                    this.loadStats();
                },
                error: () => this.snackBar.open('Gagal menambahkan data', 'OK', { duration: 3000 })
            });
        }
    }

    deleteReading(reading: BibleReading): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Hapus Data',
                message: `Apakah Anda yakin ingin menghapus data bacaan ${reading.bookName}?`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && reading.id) {
                this.svc.delete(reading.id).subscribe({
                    next: () => {
                        this.snackBar.open('Data berhasil dihapus!', 'OK', { duration: 3000 });
                        this.loadReadings();
                        this.loadStats();
                    },
                    error: () => this.snackBar.open('Gagal menghapus data', 'OK', { duration: 3000 })
                });
            }
        });
    }

    getMemberName(memberId: string): string {
        const member = this.members.find(m => m.id === memberId);
        return member ? `${member.firstName} ${member.lastName}`.trim() : '-';
    }
}
