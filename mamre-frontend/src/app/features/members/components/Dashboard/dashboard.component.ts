// dashboard.component.ts

import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { ViewChild, HostListener } from '@angular/core';
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
import { DashboardService, GenderDistribution, StatusDistribution, UpcomingBirthday, BibleReadingProgress, SectorBibleReadingReport } from 'src/app/core/services/dashboard.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { MatTooltipModule } from "@angular/material/tooltip";
import { normalizeListResponse } from "../../../../core/utils/response-normalizer";
import { Subscription } from 'rxjs';

// Import animasi Angular
import { trigger, style, animate, transition } from '@angular/animations';
import {Chart, ChartConfiguration, ChartOptions, ChartType} from "chart.js";
import {AttendanceSummaryDto} from "../../models/attendance.summary.model";
import {SectorApiResult} from "../../models/sector.response.model";
import { BaseChartDirective } from 'ng2-charts';
import { CountUpPipe } from 'src/app/shared/pipes/count-up.pipe';
import ProgramService from 'src/app/features/programs/program.service';
import { Program } from 'src/app/features/programs/program.model';
import { DashboardPreferencesService, DashboardWidgetPreference } from 'src/app/core/services/dashboard-preferences.service';

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
        MatTooltipModule,
        CountUpPipe
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
export class DashboardComponent implements OnInit, OnDestroy {
     private svc = inject(DashboardService);
     private themeService = inject(ThemeService);
     private programService = inject(ProgramService);
     private dashboardPreferences = inject(DashboardPreferencesService);
     protected router = inject(Router);
     private themeSubscription?: Subscription;
     isDarkMode = false;
     loading = true;
     today = new Date();
     summary = { totalMembers: 0, activeMembers: 0, sectors: 0, positions: 0 };
     recent: any[] = [];
     trendLabels: string[] = [];
     trendData: number[] = [];
     sectorLabels: string[] = [];
     sectorData: number[] = [];
     currentYear = new Date().getFullYear();
     readonly widgetDefinitions: DashboardWidgetPreference[] = [
        { id: 'bibleReadingChart', visible: true },
        { id: 'sectorDistributionChart', visible: true },
        { id: 'attendanceChart', visible: true },
        { id: 'genderChart', visible: true },
        { id: 'statusChart', visible: true },
        { id: 'birthdayWidget', visible: true },
        { id: 'calendarEventsWidget', visible: true },
        { id: 'recentMembersWidget', visible: true },
        { id: 'quickStatsWidget', visible: true }
    ];
    readonly widgetLabels: Record<string, string> = {
        bibleReadingChart: 'Baca Alkitab',
        sectorDistributionChart: 'Distribusi Sektor',
        attendanceChart: 'Kehadiran',
        genderChart: 'Gender',
        statusChart: 'Status',
        birthdayWidget: 'Ulang Tahun',
        calendarEventsWidget: 'Calendar Events',
        recentMembersWidget: 'Anggota Terbaru',
        quickStatsWidget: 'Statistik Ringkas'
    };
    widgetVisibility: Record<string, boolean> = {};
    upcomingPrograms: Program[] = [];

    // ViewChild references for charts (ng2-charts BaseChartDirective)
    @ViewChild('lineChart') public lineChart?: BaseChartDirective;
    @ViewChild('pieChart') public pieChart?: BaseChartDirective;
    @ViewChild('attendanceChart') public attendanceChart?: BaseChartDirective;
    @ViewChild('genderChart') public genderChart?: BaseChartDirective;
    @ViewChild('statusChart') public statusChart?: BaseChartDirective;

    // Mobile detection
    isMobile = window.innerWidth <= 600;

    // --- CHART CONFIGS ---

    // 1. Konfigurasi Bar Chart (Persentase Baca Alkitab per Sektor)
    public lineChartType: ChartType = 'bar';
    public lineChartOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Horizontal bar chart
        layout: {
            padding: {
                left: 32,
                right: 12,
                top: 6,
                bottom: 6
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                titleFont: { size: 12, weight: 'bold', family: 'Inter' },
                bodyFont: { size: 11, family: 'Inter' },
                padding: 10,
                cornerRadius: 6,
                displayColors: true,
                boxPadding: 4,
                callbacks: {
                    label: (context: any) => {
                        const dataIndex = context.dataIndex;
                        const sectorData = this.sectorBibleReadingData[dataIndex];
                        if (sectorData) {
                            return [
                                `Persentase: ${context.raw.toFixed(0)}%`,
                                `Yang Baca: ${sectorData.membersWhoRead} dari ${sectorData.totalMembers} anggota`,
                                `Kategori: ${sectorData.category}`
                            ];
                        }
                        return `${context.raw.toFixed(0)}%`;
                    }
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(0,0,0,0.06)' },
                ticks: {
                    color: '#666',
                    font: { family: 'Inter', size: 10 },
                    stepSize: 25,
                    callback: (value: any) => value + '%'
                }
            },
            y: {
                grid: { display: false },
                ticks: {
                    color: '#333',
                    font: { family: 'Inter', weight: 'bold', size: 11 },
                    padding: 8,
                    autoSkip: false,
                    mirror: false
                }
            }
        }
    };

    // Plugin untuk menampilkan nilai di dalam bar
    public barChartPlugins = [{
        id: 'barValueLabels',
        afterDatasetsDraw(chart: Chart) {
            const ctx = chart.ctx;
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const darkTextColor = '#e2e8f0';
            const lightTextColor = '#333';

            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar: any, index: number) => {
                    const value = dataset.data[index] as number;
                    if (value > 0) {
                        ctx.save();
                        // In dark mode, use light text; otherwise use logic based on bar value
                        ctx.fillStyle = isDark ? darkTextColor : (value > 50 ? '#fff' : lightTextColor);
                        ctx.font = 'bold 12px Poppins';
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'middle';
                        const x = bar.x - 35;
                        const y = bar.y;
                        ctx.fillText(`${value.toFixed(0)}%`, x > 20 ? x : bar.x + 5, y);
                        ctx.restore();
                    }
                });
            });
        }
    }];

    public lineChartData: ChartConfiguration<'bar'>['data'] = {
        datasets: [
            {
                data: [],
                label: '% Baca',
                backgroundColor: [],
                hoverBackgroundColor: [],
                borderRadius: 6,
                maxBarThickness: 28,
                barPercentage: 0.7,
                categoryPercentage: 0.8
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
                    font: { family: 'Poppins' },
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 10
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                titleFont: { size: 14, weight: 'bold', family: 'Montserrat' },
                bodyFont: { size: 13, family: 'Poppins' },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                boxPadding: 4,
                callbacks: {
                    label: (context: any) => this.getDoughnutTooltipLabel(context)
                }
            }
        },
    };
    public pieChartData: ChartConfiguration<'doughnut'>['data'] = {
        labels: [],
        datasets: [{
            data: [],
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 8
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
            borderWidth: 2,
            hoverOffset: 8
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

                // Check dark mode
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                const valueColor = isDark ? '#f8fafc' : '#333';
                const labelColor = isDark ? '#94a3b8' : '#666';

                // Total Kehadiran Unik + Anggota Belum Hadir = Total Anggota
                const totalValue = chart.data.datasets[0].data.reduce((sum: number, value: number) => sum + value, 0);
                const totalText = totalValue.toLocaleString(); // Format angka

                const centerX = width / 2;
                const centerY = height / 2;

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Teks Total Value (Angka Besar)
                ctx.font = '700 24px "Montserrat", sans-serif';
                ctx.fillStyle = valueColor;
                ctx.fillText(totalText, centerX, centerY - 10);

                // Teks Label "Total Anggota" (Label Kecil)
                ctx.font = '500 12px "Poppins", sans-serif';
                ctx.fillStyle = labelColor;
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
                labels: {
                    color: '#666',
                    font: { family: 'Poppins' },
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                titleFont: { size: 14, weight: 'bold', family: 'Montserrat' },
                bodyFont: { size: 13, family: 'Poppins' },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context: any) => this.getDoughnutTooltipLabel(context)
                }
            }
        }
    };
    public genderChartData: ChartConfiguration<'doughnut'>['data'] = {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: ['#3b82f6', '#ec4899', '#9ca3af'],
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 8
        }]
    };

    // 5. Konfigurasi Bar Chart (Status Distribution)
    public statusChartType: ChartType = 'bar';
    public statusChartOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        layout: {
            padding: {
                top: 4,
                right: 10,
                bottom: 4,
                left: 0
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                titleFont: { size: 14, weight: 'bold', family: 'Montserrat' },
                bodyFont: { size: 13, family: 'Poppins' },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context: any) => this.getHorizontalBarTooltipLabel(context)
                }
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
            maxBarThickness: 24,
            barPercentage: 0.6
        }]
    };

    // Properti Baru untuk Kehadiran
    attendanceSummary: AttendanceSummaryDto | null = null;

    // Properti Baru untuk fitur tambahan
    upcomingBirthdays: UpcomingBirthday[] = [];
    genderData: GenderDistribution[] = [];
    statusData: StatusDistribution[] = [];
    bibleReadingData: BibleReadingProgress[] = [];
    sectorBibleReadingData: SectorBibleReadingReport[] = [];

    // Method untuk greeting berdasarkan waktu
    getGreeting(): string {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'Selamat Pagi';
        if (hour >= 11 && hour < 15) return 'Selamat Siang';
        if (hour >= 15 && hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    }

    getWidgetLabel(widgetId: string): string {
        return this.widgetLabels[widgetId] || widgetId;
    }

    private getDoughnutTooltipLabel(context: any): string[] {
        const label = context.label || 'Data';
        const value = Number(context.raw ?? 0);
        const dataset = context.dataset?.data ?? [];
        const total = dataset.reduce((sum: number, item: number) => sum + Number(item || 0), 0);
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
        return [label, `${value.toLocaleString()} anggota (${percentage}%)`];
    }

    private getHorizontalBarTooltipLabel(context: any): string[] {
        const label = context.label || 'Data';
        const value = Number(context.raw ?? 0);
        return [label, `${value.toLocaleString()} anggota`];
    }

    @HostListener('window:resize') onResize() {
        this.isMobile = window.innerWidth <= 600;
        this.refreshCharts();
    }

    constructor() {
        this.widgetVisibility = this.dashboardPreferences.getVisibilityMap(this.widgetDefinitions);
         // PENTING: Inisialisasi nilai default untuk chart data dan labels
        this.lineChartData.labels = [];
        this.lineChartData.datasets[0].data = [];

        this.pieChartData.labels = [];
        this.pieChartData.datasets[0].data = [];

        this.attendanceChartData.labels = [];
        this.attendanceChartData.datasets[0].data = [];

        this.genderChartData.labels = [];
        this.genderChartData.datasets[0].data = [];

        this.statusChartData.labels = [];
        this.statusChartData.datasets[0].data = [];
    }

    ngOnInit(): void {
        // Subscribe to theme changes
        this.themeSubscription = this.themeService.isDarkMode$.subscribe(isDark => {
            this.isDarkMode = isDark;
            this.updateChartColors(isDark);
        });
        this.loadAll();
        this.loadUpcomingPrograms();
    }

    ngOnDestroy(): void {
        this.themeSubscription?.unsubscribe();
    }

    // Update chart colors based on theme
    private updateChartColors(isDark: boolean): void {
        const textColor = isDark ? '#e2e8f0' : '#666';
        const textColorDark = isDark ? '#f8fafc' : '#333';
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
        const tooltipBg = isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(0, 0, 0, 0.75)';

        // Update lineChartOptions (Bar Chart for Bible Reading)
        if (this.lineChartOptions.scales) {
            const xScale = this.lineChartOptions.scales['x'] as any;
            const yScale = this.lineChartOptions.scales['y'] as any;
            if (xScale) {
                xScale.grid = { color: gridColor };
                xScale.ticks = { ...xScale.ticks, color: textColor };
            }
            if (yScale) {
                yScale.ticks = { ...yScale.ticks, color: textColorDark };
            }
        }
        if (this.lineChartOptions.plugins?.tooltip) {
            (this.lineChartOptions.plugins.tooltip as any).backgroundColor = tooltipBg;
        }

        // Update pieChartOptions (Doughnut for Sector Distribution)
        if (this.pieChartOptions.plugins?.legend?.labels) {
            (this.pieChartOptions.plugins.legend.labels as any).color = textColor;
        }
        if (this.pieChartOptions.plugins?.tooltip) {
            (this.pieChartOptions.plugins.tooltip as any).backgroundColor = tooltipBg;
        }

        // Update genderChartOptions - IMPORTANT: Update legend label color
        if (this.genderChartOptions.plugins?.legend?.labels) {
            (this.genderChartOptions.plugins.legend.labels as any).color = textColor;
        }
        if (this.genderChartOptions.plugins?.tooltip) {
            (this.genderChartOptions.plugins.tooltip as any).backgroundColor = tooltipBg;
        }

        // Update statusChartOptions
        if (this.statusChartOptions.scales) {
            const xScale = this.statusChartOptions.scales['x'] as any;
            const yScale = this.statusChartOptions.scales['y'] as any;
            if (xScale) {
                xScale.grid = { color: gridColor };
                xScale.ticks = { ...xScale.ticks, color: textColor };
            }
            if (yScale) {
                yScale.ticks = { ...yScale.ticks, color: textColor };
            }
        }
        if (this.statusChartOptions.plugins?.tooltip) {
            (this.statusChartOptions.plugins.tooltip as any).backgroundColor = tooltipBg;
        }

        // Update attendanceChartOptions tooltip
        if (this.attendanceChartOptions.plugins?.tooltip) {
            (this.attendanceChartOptions.plugins.tooltip as any).backgroundColor = tooltipBg;
        }

        // Force chart refresh by creating new options objects
        this.lineChartOptions = { ...this.lineChartOptions };
        this.pieChartOptions = { ...this.pieChartOptions };
        this.genderChartOptions = { ...this.genderChartOptions };
        this.statusChartOptions = { ...this.statusChartOptions };
        this.attendanceChartOptions = { ...this.attendanceChartOptions };
        this.refreshCharts();
    }

    private refreshCharts(): void {
        this.lineChart?.update();
        this.pieChart?.update();
        this.attendanceChart?.update();
        this.genderChart?.update();
        this.statusChart?.update();
    }

    // Fungsi Helper untuk memperbarui data Attendance Chart
    updateAttendanceChartData() {
        if (this.attendanceSummary && this.summary.totalMembers > 0) {
            const totalMembers = this.summary.totalMembers;
            const uniqueMembers = this.attendanceSummary.uniqueMembers;
            const membersAbsent = totalMembers > uniqueMembers ? totalMembers - uniqueMembers : 0;

            this.attendanceChartData.labels = ['Hadir (Unik)', 'Anggota Belum Hadir'];
            this.attendanceChartData.datasets = [{
                data: [uniqueMembers, membersAbsent],
                backgroundColor: ['#20c997', '#e63946'],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 8
            }];

            if (this.attendanceChartOptions.plugins?.tooltip) {
                (this.attendanceChartOptions.plugins.tooltip as any).callbacks = {
                    label: (context: any) => this.getDoughnutTooltipLabel(context),
                    afterLabel: (context: any) => {
                        if (context.dataIndex === 0) {
                            return `Total kehadiran tercatat: ${this.attendanceSummary?.totalAttendances?.toLocaleString() ?? 0}`;
                        }
                        return `Belum tercatat hadir bulan ${this.attendanceSummary?.month ?? ''}`.trim();
                    }
                };
            }

            this.attendanceChartData = { ...this.attendanceChartData };
            this.attendanceChartOptions = { ...this.attendanceChartOptions };
            this.refreshCharts();
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

        // Load Bible Reading Progress per Sektor - Persentase Baca Alkitab Mamre
        this.svc.getSectorBibleReadingReport().subscribe(arr => {
            // Filter out the Total row for chart display
            this.sectorBibleReadingData = arr.filter(x => x.sectorId !== null);

            // Get color based on category
            const getColorByCategory = (category: string): string => {
                switch (category) {
                    case 'Sangat Baik': return 'rgba(27, 94, 32, 0.85)';  // Dark green
                    case 'Baik': return 'rgba(76, 175, 80, 0.85)';        // Green
                    case 'Cukup': return 'rgba(255, 152, 0, 0.85)';       // Orange
                    case 'Kurang': return 'rgba(244, 67, 54, 0.85)';      // Red
                    case 'Sangat Kurang': return 'rgba(183, 28, 28, 0.85)'; // Dark red
                    default: return 'rgba(158, 158, 158, 0.85)';          // Grey
                }
            };

            const getHoverColorByCategory = (category: string): string => {
                switch (category) {
                    case 'Sangat Baik': return 'rgba(27, 94, 32, 1)';
                    case 'Baik': return 'rgba(76, 175, 80, 1)';
                    case 'Cukup': return 'rgba(255, 152, 0, 1)';
                    case 'Kurang': return 'rgba(244, 67, 54, 1)';
                    case 'Sangat Kurang': return 'rgba(183, 28, 28, 1)';
                    default: return 'rgba(158, 158, 158, 1)';
                }
            };

            this.lineChartData.labels = this.sectorBibleReadingData.map(x => x.sectorName);
            this.lineChartData.datasets = [
                {
                    data: this.sectorBibleReadingData.map(x => x.averagePercentage),
                    label: '% Baca',
                    backgroundColor: this.sectorBibleReadingData.map(x => getColorByCategory(x.category)),
                    hoverBackgroundColor: this.sectorBibleReadingData.map(x => getHoverColorByCategory(x.category)),
                    borderRadius: 6,
                    maxBarThickness: 28,
                    barPercentage: 0.7,
                    categoryPercentage: 0.8
                }
            ];
        }, err => console.error('sector bible reading err', err));

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
                borderWidth: 2,
                hoverOffset: 8
            }];
        }, err => console.error('sector err', err));

        this.svc.getRecentActivities(6).subscribe(arr => {
            this.recent = normalizeListResponse(arr);
            this.loading = false;
        }, () => this.loading = false);

        // Load Gender Distribution
        this.svc.getGenderDistribution().subscribe(arr => {
            this.genderData = arr;

            // Normalize gender values (handle case inconsistency like MALE vs Male)
            const normalizeGender = (gender: string): string => {
                const upper = gender?.toUpperCase() || 'UNKNOWN';
                if (upper === 'MALE' || upper === 'M') return 'Male';
                if (upper === 'FEMALE' || upper === 'F') return 'Female';
                return 'Unknown';
            };

            // Aggregate data by normalized gender
            const aggregatedData = arr.reduce((acc, item) => {
                const normalizedGender = normalizeGender(item.gender);
                if (acc[normalizedGender]) {
                    acc[normalizedGender] += item.count;
                } else {
                    acc[normalizedGender] = item.count;
                }
                return acc;
            }, {} as { [key: string]: number });

            const genderColors: { [key: string]: string } = {
                'Male': '#3b82f6',
                'Female': '#ec4899',
                'Unknown': '#9ca3af'
            };

            const genderLabels = Object.keys(aggregatedData);
            const genderCounts = Object.values(aggregatedData);

            this.genderChartData.labels = genderLabels;
            this.genderChartData.datasets = [{
                data: genderCounts,
                backgroundColor: genderLabels.map(g => genderColors[g] || '#9ca3af'),
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 8
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
                maxBarThickness: 24,
                barPercentage: 0.6
            }];
        }, err => console.error('status err', err));

        // Load Upcoming Birthdays
        this.svc.getUpcomingBirthdays(30, 5).subscribe(arr => {
            this.upcomingBirthdays = arr;
        }, err => console.error('birthdays err', err));
    }

    private loadUpcomingPrograms(): void {
        this.programService.getAllNoPaging().subscribe(programs => {
            const now = new Date();
            this.upcomingPrograms = (programs || [])
                .filter(program => !!program.nextSchedule)
                .filter(program => {
                    const scheduledAt = new Date(program.nextSchedule as string);
                    return !Number.isNaN(scheduledAt.getTime()) && scheduledAt >= now;
                })
                .sort((a, b) => new Date(a.nextSchedule as string).getTime() - new Date(b.nextSchedule as string).getTime())
                .slice(0, 5);
        });
    }

    goSectors() { this.router.navigateByUrl('/app/sectors'); }
    goPositions() { this.router.navigateByUrl('/app/positions'); }
    goMembers() { this.router.navigateByUrl('/app/members'); }
    // Navigate to Programs/Kegiatan page
    goPrograms() { this.router.navigateByUrl('/app/programs'); }
    goAttendance() { this.router.navigateByUrl('/app/attendance'); }
    goBibleReadingReport() { this.router.navigateByUrl('/app/bible-reading-report'); }

    getInactiveMembers(): number {
        return Math.max((this.summary.totalMembers || 0) - (this.summary.activeMembers || 0), 0);
    }

    getActiveMemberRatio(): number {
        if (!this.summary.totalMembers) {
            return 0;
        }
        return Math.round((this.summary.activeMembers / this.summary.totalMembers) * 100);
    }

    getAttendanceRate(): number {
        if (!this.attendanceSummary || !this.summary.totalMembers) {
            return 0;
        }
        return Math.round((this.attendanceSummary.uniqueMembers / this.summary.totalMembers) * 100);
    }

    getAttendanceGap(): number {
        if (!this.attendanceSummary || !this.summary.totalMembers) {
            return 0;
        }
        return Math.max(this.summary.totalMembers - this.attendanceSummary.uniqueMembers, 0);
    }

    getAverageMembersPerSector(): number {
        if (!this.summary.sectors) {
            return 0;
        }
        return Math.round(this.summary.totalMembers / this.summary.sectors);
    }

    getWidgetCoverageRatio(): number {
        if (!this.widgetDefinitions.length) {
            return 0;
        }
        return Math.round((this.getVisibleWidgetCount() / this.widgetDefinitions.length) * 100);
    }

    formatMonthLabel(month?: string | null): string {
        if (!month) {
            return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());
        }

        const match = /^(\d{4})-(\d{2})$/.exec(month);
        if (!match) {
            return month;
        }

        const year = Number(match[1]);
        const monthIndex = Number(match[2]) - 1;
        const date = new Date(year, monthIndex, 1);
        if (Number.isNaN(date.getTime())) {
            return month;
        }

        return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
    }

    getAttendanceMonthLabel(): string {
        return this.formatMonthLabel(this.attendanceSummary?.month);
    }

    getNextProgramSummary(): string {
        if (!this.upcomingPrograms.length) {
            return 'Belum ada agenda pelayanan terjadwal. Tambahkan program baru agar kalender dashboard tetap hidup.';
        }

        const nextProgram = this.upcomingPrograms[0];
        return `Agenda terdekat: ${nextProgram.title} • ${this.formatProgramSchedule(nextProgram)}`;
    }

    getFocusMessage(): string {
        const attendanceRate = this.getAttendanceRate();
        const upcomingCount = this.upcomingPrograms.length;

        if (attendanceRate >= 80) {
            return `Partisipasi jemaat sedang kuat di ${this.getAttendanceMonthLabel()}. Jaga momentum dengan ${upcomingCount || 'beberapa'} agenda pelayanan yang sudah tersusun.`;
        }

        if (attendanceRate >= 60) {
            return `Kehadiran bulan ini cukup stabil, tetapi masih ada ${this.getAttendanceGap()} anggota yang belum tercatat hadir. Prioritaskan follow-up sektor dan agenda terdekat.`;
        }

        if (this.summary.totalMembers > 0) {
            return `Dashboard menunjukkan ruang tindak lanjut yang besar: ${this.getAttendanceGap()} anggota belum tercatat hadir. Gunakan agenda dan laporan untuk mendorong keterlibatan.`;
        }

        return 'Data dashboard akan menjadi pusat pemantauan setelah ringkasan anggota dan aktivitas mulai terisi.';
    }

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

    isWidgetVisible(widgetId: string): boolean {
        return this.widgetVisibility[widgetId] !== false;
    }

    toggleWidget(widgetId: string): void {
        this.widgetVisibility = {
            ...this.widgetVisibility,
            [widgetId]: !this.isWidgetVisible(widgetId)
        };
        this.dashboardPreferences.saveVisibilityMap(this.widgetVisibility);
        this.refreshCharts();
    }

    getVisibleWidgetCount(): number {
        return Object.values(this.widgetVisibility).filter(value => value !== false).length;
    }

    formatProgramSchedule(program: Program): string {
        if (!program.nextSchedule) {
            return program.jadwalText || 'Jadwal belum tersedia';
        }

        const scheduledAt = new Date(program.nextSchedule);
        if (Number.isNaN(scheduledAt.getTime())) {
            return program.jadwalText || 'Jadwal belum tersedia';
        }

        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(scheduledAt);
    }

    openProgram(program: Program): void {
        if (!program.id) {
            this.router.navigateByUrl('/app/programs');
            return;
        }
        this.router.navigateByUrl(`/app/programs/${program.id}`);
    }

    getLineChartLegendLabel(): string {
        const seriesLabel = this.lineChartData?.datasets?.[0]?.label || 'Series';
        const itemCount = this.lineChartData?.labels?.length || 0;
        return `${seriesLabel} (${itemCount} sektor)`;
    }

    getHorizontalChartHeight(itemCount: number, variant: 'wide' | 'compact' = 'wide'): number {
        const totalItems = Math.max(itemCount || 0, 1);
        const isStackedLayout = window.innerWidth <= 900;

        if (variant === 'compact') {
            const height = 72 + totalItems * 36;
            return Math.min(Math.max(height, isStackedLayout ? 200 : 180), isStackedLayout ? 280 : 240);
        }

        const height = 72 + totalItems * 40;
        return Math.min(Math.max(height, isStackedLayout ? 240 : 200), isStackedLayout ? 340 : 280);
    }

    getDoughnutChartHeight(variant: 'panel' | 'compact' = 'panel'): number {
        const isStackedLayout = window.innerWidth <= 900;

        if (variant === 'compact') {
            return isStackedLayout ? 260 : 232;
        }

        return isStackedLayout ? 320 : 288;
    }

    // ------------------ CHART UTIL HELPERS ------------------
    hasChartData(data: any): boolean {
        try {
            if (!data || !data.datasets) return false;
            return data.datasets.some((ds: any) => Array.isArray(ds.data) && ds.data.length > 0 && ds.data.some((v: any) => v !== null && v !== undefined));
        } catch (e) {
            return false;
        }
    }

    // Toggle dataset visibility using BaseChartDirective.hideDataset
    toggleDataset(index: number, chartDirective?: BaseChartDirective | undefined) {
        try {
            if (!chartDirective) return;
            const isHidden = chartDirective.isDatasetHidden(index) === true;
            chartDirective.hideDataset(index, !isHidden);
        } catch (e) {
            console.error('toggleDataset error', e);
        }
    }

    isDatasetHidden(index: number, chartDirective?: BaseChartDirective | undefined): boolean {
        try {
            return !!chartDirective?.isDatasetHidden(index);
        } catch (e) {
            return false;
        }
    }
}
