
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { finalize } from 'rxjs/operators';
import {AttendanceService} from "../../../../core/services/attendance.service";
import {AttendanceDto} from "../../models/attendance.model";
import {AttendanceSummary} from "../../../../core/services/dashboard.service";

@Component({
    selector: 'app-attendance-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressSpinnerModule,
        MatDividerModule,
        MatListModule
    ],
    templateUrl: './attendance-form.component.html',
    styleUrls: ['./attendance-form.component.scss']
})
export class AttendanceFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private attendanceService = inject(AttendanceService);

    attendanceForm!: FormGroup;
    attendanceSummary: AttendanceSummary | null = null;
    recentAttendance: AttendanceDto[] = [];
    isSaving = false;

    ngOnInit(): void {
        this.attendanceForm = this.fb.group({
            // KOREKSI 1A: Menggunakan 'attendDate'
            attendDate: [new Date(), Validators.required],
            // MemberId tetap
            memberId: ['', Validators.required],
            // KOREKSI 1B: Menambahkan 'event'
            event: [''],
            // KOREKSI 1C: Menambahkan 'present' (default true per Attendance.java)
            present: [true],
            // KOREKSI 1D: Menggunakan 'note'
            note: ['']
        });

        // this.loadSummary();
        this.loadRecentAttendance();
    }

    // loadSummary(): void {
    //     // Asumsikan AttendanceService memiliki method getSummary() yang memanggil GET /api/dashboard/attendance/summary
    //     this.attendanceService.getSummary().subscribe(
    //         summary => this.attendanceSummary = summary,
    //         error => console.error('Gagal memuat ringkasan kehadiran', error)
    //     );
    // }

    loadRecentAttendance(): void {
        this.attendanceService.listAttendance(0, 5).subscribe(
            page => {
                this.recentAttendance = page.content; // Ambil 5 data terbaru
            },
            error => console.error('Gagal memuat data kehadiran terbaru', error)
        );
    }

    submitAttendance(): void {
        if (this.attendanceForm.invalid) return;

        this.isSaving = true;

        const rawData = this.attendanceForm.value;

        // KOREKSI 2: Struktur payload disesuaikan dengan service dan DTO Java
        const payload = {
            memberId: rawData.memberId,
            // Menggunakan attendDate
            attendDate: rawData.attendDate.toISOString().split('T')[0],
            // Menggunakan event
            event: rawData.event,
            // Menggunakan present
            present: rawData.present,
            // Menggunakan note
            note: rawData.note
        };

        // Memanggil POST /api/attendance
        this.attendanceService.createAttendance(payload).pipe(
            finalize(() => this.isSaving = false)
        ).subscribe({
            next: (response) => {
                console.log('Kehadiran berhasil disimpan', response);
                alert('Kehadiran berhasil dicatat!');

                this.attendanceForm.reset({
                    attendDate: new Date(),
                    memberId: '',
                    event: '',
                    note: '',
                    present: true
                });

                // this.loadSummary();
                this.loadRecentAttendance();
            },
            error: (err) => {
                console.error('Gagal menyimpan kehadiran', err);
                alert('Gagal menyimpan kehadiran. Periksa ID Member dan koneksi.');
            }
        });
    }
}