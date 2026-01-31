// dashboard.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgChartsModule } from 'ng2-charts';
// PENTING: Import Chart untuk Plugin
import { DashboardService, GenderDistribution, StatusDistribution, UpcomingBirthday, BibleReadingProgress } from 'src/app/core/services/dashboard.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { MatTooltipModule } from "@angular/material/tooltip";
import { normalizeListResponse } from "../../../../core/utils/response-normalizer";

// Import animasi Angular
import { trigger, style, animate, transition } from '@angular/animations';
import {Chart, ChartConfiguration, ChartOptions, ChartType} from "chart.js";
import {AttendanceSummaryDto} from "../../models/attendance.summary.model";
import {SectorApiResult} from "../../models/sector.response.model";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatGridListModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        MatListModule,
        MatProgressSpinnerModule,
        NgChartsModule,
        MatTooltipModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    // Definisi animasi
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
        ]),
    ]
})
export class DashboardComponent implements OnInit {
    private svc = inject(DashboardService);
    protected router = inject(Router);

    loading = true;
    summary = { totalMembers: 0, activeMembers: 0, sectors: 0, positions: 0 };
    recent: any[] = [];
    trendLabels: string[] = [];
    trendData: number[] = [];
    sectorLabels: string[] = [];
    sectorData: number[] = [];
    currentYear = new Date().getFullYear();

    // Properti Baru untuk Kehadiran
    attendanceSummary: AttendanceSummaryDto | null = null;

    // Properti Baru untuk fitur tambahan
    upcomingBirthdays: UpcomingBirthday[] = [];
    genderData: GenderDistribution[] = [];
    statusData: StatusDistribution[] = [];
    bibleReadingData: BibleReadingProgress[] = [];


    // --- CHART CONFIGS ---

    // 1. Konfigurasi Bar Chart (Bible Reading Progress - Membaca Alkitab Mamre)
    public lineChartType: ChartType = 'bar';
    public lineChartOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: 'top' },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                titleFont: { size: 14, weight: 'bold', family: 'Montserrat' },
                bodyFont: { size: 13, family: 'Poppins' },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                boxPadding: 4,
                callbacks: {
                    label: (context: any) => {
                        const dataIndex = context.dataIndex;
                        const datasetIndex = context.datasetIndex;
                        if (datasetIndex === 0) {
                            return `Hari Terbaca: ${context.raw} hari`;
                        } else {
                            return `Target: ${context.raw} hari`;
                        }
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 31,
                grid: { color: 'rgba(0,0,0,0.08)' },
                ticks: {
                    color: '#666',
                    font: { family: 'Poppins' },
                    stepSize: 5
                },
                title: {
                    display: true,
                    text: 'Jumlah Hari',
                    color: '#666',
                    font: { family: 'Poppins', weight: 'bold' }
                }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#666', font: { family: 'Poppins' } }
            }
        }
    };
    public lineChartData: ChartConfiguration<'bar'>['data'] = {
        datasets: [
            {
                data: [],
                label: 'Hari Terbaca',
                backgroundColor: 'rgba(106, 90, 249, 0.9)',
                hoverBackgroundColor: 'rgba(106, 90, 249, 1)',
                borderRadius: 6,
                barPercentage: 0.8,
                categoryPercentage: 0.9
            },
            {
                data: [],
                label: 'Target Hari',
                backgroundColor: 'rgba(200, 200, 200, 0.4)',
                hoverBackgroundColor: 'rgba(200, 200, 200, 0.6)',
                borderRadius: 6,
                barPercentage: 0.8,
                categoryPercentage: 0.9
            }
        ],
        labels: []
    };

    // 2. Konfigurasi Donut Chart (By Sector)
    public pieChartType: ChartType = 'doughnut';
    public pieChartOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    color: '#666',
                    font: { family: 'Poppins' }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                titleFont: { size: 14, weight: 'bold', family: 'Montserrat' },
                bodyFont: { size: 13, family: 'Poppins' },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                boxPadding: 4
            }
        },
    };
    public pieChartData: ChartConfiguration<'doughnut'>['data'] = {
        labels: [],
        datasets: [{
            data: [],
            borderColor: '#ffffff',
            borderWidth: 4,
            hoverOffset: 15
        }]
    };

    // 3. Konfigurasi Donut Chart (Attendance Summary)
    public attendanceChartType: ChartType = 'doughnut';
    public attendanceChartOptions: ChartOptions = {
        ...this.pieChartOptions, // Salin properti dasar donut
        plugins: {
            ...this.pieChartOptions.plugins,
            legend: {
                display: false // Sembunyikan legenda agar teks di tengah lebih menonjol
            }
        }
    };
    public attendanceChartData: ChartConfiguration<'doughnut'>['data'] = {
        labels: [],
        datasets: [{
            data: [],
            borderColor: '#ffffff',
            borderWidth: 4,
            hoverOffset: 15
        }]
    };

    // PENTING: Plugin untuk menampilkan teks di tengah Donut Chart
    public attendanceChartPlugins = [{
        id: 'centerText',
        beforeDraw(chart: Chart) {
            // Cek apakah chart ini adalah chart kehadiran dan memiliki data
            if (chart.canvas.id === 'attendanceChartCanvas' && chart.data.datasets[0].data.length > 0) {
                const { ctx, width, height } = chart;
                ctx.restore();

                // Total Kehadiran Unik + Anggota Belum Hadir = Total Anggota
                const totalValue = chart.data.datasets[0].data.reduce((sum: number, value: number) => sum + value, 0);
                const totalText = totalValue.toLocaleString(); // Format angka

                const centerX = width / 2;
                const centerY = height / 2;

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Teks Total Value (Angka Besar)
                ctx.font = '700 24px "Montserrat", sans-serif';
                ctx.fillStyle = '#333';
                ctx.fillText(totalText, centerX, centerY - 10);

                // Teks Label "Total Anggota" (Label Kecil)
                ctx.font = '500 12px "Poppins", sans-serif';
                ctx.fillStyle = '#666';
                ctx.fillText('Total Anggota', centerX, centerY + 15);

                ctx.save();
            }
        }
    }];

    // 4. Konfigurasi Donut Chart (Gender Distribution)
    public genderChartType: ChartType = 'doughnut';
    public genderChartOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: { color: '#666', font: { family: 'Poppins' }, padding: 15 }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                titleFont: { size: 14, weight: 'bold', family: 'Montserrat' },
                bodyFont: { size: 13, family: 'Poppins' },
                padding: 12,
                cornerRadius: 8
            }
        }
    };
    public genderChartData: ChartConfiguration<'doughnut'>['data'] = {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: ['#3b82f6', '#ec4899', '#9ca3af'],
            borderColor: '#ffffff',
            borderWidth: 4,
            hoverOffset: 15
        }]
    };

    // 5. Konfigurasi Bar Chart (Status Distribution)
    public statusChartType: ChartType = 'bar';
    public statusChartOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                titleFont: { size: 14, weight: 'bold', family: 'Montserrat' },
                bodyFont: { size: 13, family: 'Poppins' },
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.08)' },
                ticks: { color: '#666', font: { family: 'Poppins' } }
            },
            y: {
                grid: { display: false },
                ticks: { color: '#666', font: { family: 'Poppins', weight: 'bold' } }
            }
        }
    };
    public statusChartData: ChartConfiguration<'bar'>['data'] = {
        labels: [],
        datasets: [{
            data: [],
            label: 'Members',
            backgroundColor: ['#20c997', '#e63946', '#ffb703', '#9ca3af'],
            borderRadius: 6,
            barPercentage: 0.6
        }]
    };


    ngOnInit(): void {
        this.loadAll();
    }

    // Fungsi Helper untuk memperbarui data Attendance Chart
    updateAttendanceChartData() {
        if (this.attendanceSummary && this.summary.totalMembers > 0) {
            const totalMembers = this.summary.totalMembers;
            const uniqueMembers = this.attendanceSummary.uniqueMembers;
            // Anggota yang belum pernah tercatat hadir bulan ini
            const membersAbsent = totalMembers > uniqueMembers ? totalMembers - uniqueMembers : 0;

            this.attendanceChartData.labels = ['Hadir (Unik)', 'Anggota Belum Hadir'];
            this.attendanceChartData.datasets = [{
                data: [uniqueMembers, membersAbsent],
                backgroundColor: ['#20c997', '#e63946'], // Hijau (Hadir), Merah (Absen)
                borderColor: '#ffffff',
                borderWidth: 4,
                hoverOffset: 15
            }];

            // PENTING: Trigger update chart agar plugin menggambar teks
            // Biasanya, hanya mengubah data dan labels sudah cukup, tetapi untuk memastikan
            // ng2-charts merefresh, kita bisa membuat objek data baru.
            this.attendanceChartData = { ...this.attendanceChartData };
        }
    }

    loadAll() {
        this.loading = true;

        // Panggil getSummary dan update chart setelahnya
        this.svc.getSummary().subscribe(sum => {
            this.summary = sum || this.summary;
            this.updateAttendanceChartData(); // Panggil setelah summary load
        }, err => {
            console.error('summary err', err);
        });

        // Panggil getAttendanceSummary dan update chart setelahnya
        this.svc.getAttendanceSummary().subscribe((summary: AttendanceSummaryDto | null) => {
            if (summary) {
                this.attendanceSummary = summary;
                this.updateAttendanceChartData(); // Panggil setelah attendance load
            }
        }, err => {
            console.error('attendance summary err', err);
        });

        // ... (Logika loadMembersTrend dan loadCountBySector yang lain) ...

        // Load Bible Reading Progress - Membaca Alkitab Mamre
        this.svc.getBibleReadingProgress().subscribe(arr => {
            this.bibleReadingData = arr;

            this.lineChartData.labels = arr.map(x => x.month);
            this.lineChartData.datasets = [
                {
                    data: arr.map(x => x.completedDays),
                    label: 'Hari Terbaca',
                    backgroundColor: 'rgba(106, 90, 249, 0.9)',
                    hoverBackgroundColor: 'rgba(106, 90, 249, 1)',
                    borderRadius: 6,
                    barPercentage: 0.8,
                    categoryPercentage: 0.9
                },
                {
                    data: arr.map(x => x.targetDays),
                    label: 'Target Hari',
                    backgroundColor: 'rgba(200, 200, 200, 0.3)',
                    hoverBackgroundColor: 'rgba(200, 200, 200, 0.5)',
                    borderRadius: 6,
                    barPercentage: 0.8,
                    categoryPercentage: 0.9
                }
            ];
        }, err => console.error('bible reading err', err));

        this.svc.getCountBySector().pipe(
            map((res: any) => Array.isArray(res) ? res : (res.content ?? []))
        ).subscribe((arr: SectorApiResult[]) => {
            this.sectorLabels = arr.map(x => x.sector ?? x.sectorName ?? x.name);
            this.sectorData = arr.map(x => x.count ?? x.memberCount ?? 0);

            const colorPalette = ['#6a5af9', '#20c997', '#ffb703', '#e63946', '#3b82f6', '#f97316', '#a78bfa', '#14b8a6', '#f472b6', '#4ade80'];

            this.pieChartData.labels = this.sectorLabels;
            this.pieChartData.datasets = [{
                data: this.sectorData,
                backgroundColor: this.sectorData.map((_, i) => colorPalette[i % colorPalette.length]),
                borderColor: '#ffffff',
                borderWidth: 4,
                hoverOffset: 15
            }];
        }, err => console.error('sector err', err));

        this.svc.getRecentActivities(6).subscribe(arr => {
            this.recent = normalizeListResponse(arr);
            this.loading = false;
        }, () => this.loading = false);

        // Load Gender Distribution
        this.svc.getGenderDistribution().subscribe(arr => {
            this.genderData = arr;
            const genderColors: { [key: string]: string } = {
                'Male': '#3b82f6',
                'Female': '#ec4899',
                'Unknown': '#9ca3af'
            };
            this.genderChartData.labels = arr.map(x => x.gender);
            this.genderChartData.datasets = [{
                data: arr.map(x => x.count),
                backgroundColor: arr.map(x => genderColors[x.gender] || '#9ca3af'),
                borderColor: '#ffffff',
                borderWidth: 4,
                hoverOffset: 15
            }];
        }, err => console.error('gender err', err));

        // Load Status Distribution
        this.svc.getStatusDistribution().subscribe(arr => {
            this.statusData = arr;
            const statusColors: { [key: string]: string } = {
                'ACTIVE': '#20c997',
                'INACTIVE': '#e63946',
                'PROSPECT': '#ffb703',
                'SUSPENDED': '#6c757d',
                'Unknown': '#9ca3af'
            };
            this.statusChartData.labels = arr.map(x => x.status);
            this.statusChartData.datasets = [{
                data: arr.map(x => x.count),
                label: 'Members',
                backgroundColor: arr.map(x => statusColors[x.status] || '#9ca3af'),
                borderRadius: 6,
                barPercentage: 0.6
            }];
        }, err => console.error('status err', err));

        // Load Upcoming Birthdays
        this.svc.getUpcomingBirthdays(30, 5).subscribe(arr => {
            this.upcomingBirthdays = arr;
        }, err => console.error('birthdays err', err));
    }

    goSectors() { this.router.navigateByUrl('/sectors'); }
    goPositions() { this.router.navigateByUrl('/positions'); }
    goMembers() { this.router.navigateByUrl('/members'); }

    // Helper untuk menentukan label hari ulang tahun
    getBirthdayLabel(daysUntil: number): string {
        if (daysUntil === 0) return 'Hari ini! 🎂';
        if (daysUntil === 1) return 'Besok';
        return `${daysUntil} hari lagi`;
    }

    // Helper untuk warna badge birthday
    getBirthdayClass(daysUntil: number): string {
        if (daysUntil === 0) return 'birthday-today';
        if (daysUntil <= 3) return 'birthday-soon';
        if (daysUntil <= 7) return 'birthday-week';
        return 'birthday-later';
    }
}