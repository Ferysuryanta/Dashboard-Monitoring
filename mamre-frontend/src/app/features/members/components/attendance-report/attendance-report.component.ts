import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { DashboardService, SectorAttendanceReport, WeeklyAttendance } from '../../../../core/services/dashboard.service';
import { ExportService } from '../../../../core/services/export.service';

interface MonthOption {
    value: number;
    label: string;
}

@Component({
    selector: 'app-attendance-report',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatSelectModule,
        MatTableModule,
        MatProgressSpinnerModule,
        MatDividerModule,
        MatTooltipModule,
        MatSnackBarModule
    ],
    templateUrl: './attendance-report.component.html',
    styleUrls: ['./attendance-report.component.scss']
})
export class AttendanceReportComponent implements OnInit {
    
    reportData: SectorAttendanceReport[] = [];
    loading = false;
    exporting = false;

    // Filter
    selectedYear: number;
    selectedMonth: number;
    
    years: number[] = [];
    months: MonthOption[] = [
        { value: 1, label: 'Januari' },
        { value: 2, label: 'Februari' },
        { value: 3, label: 'Maret' },
        { value: 4, label: 'April' },
        { value: 5, label: 'Mei' },
        { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' },
        { value: 8, label: 'Agustus' },
        { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' },
        { value: 11, label: 'November' },
        { value: 12, label: 'Desember' }
    ];
    
    constructor(
        private dashboardService: DashboardService,
        private exportService: ExportService,
        private snackBar: MatSnackBar
    ) {
        const now = new Date();
        this.selectedYear = now.getFullYear();
        this.selectedMonth = now.getMonth() + 1;
        
        // Generate years (last 5 years)
        for (let i = 0; i < 5; i++) {
            this.years.push(now.getFullYear() - i);
        }
    }
    
    ngOnInit(): void {
        this.loadReport();
    }
    
    loadReport(): void {
        this.loading = true;
        this.dashboardService.getSectorAttendanceReport(this.selectedYear, this.selectedMonth)
            .subscribe({
                next: (data) => {
                    this.reportData = data;
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error loading report:', err);
                    this.loading = false;
                }
            });
    }
    
    onFilterChange(): void {
        this.loadReport();
    }
    
    getMonthLabel(): string {
        const month = this.months.find(m => m.value === this.selectedMonth);
        return month ? month.label : '';
    }
    
    getWeekData(sector: SectorAttendanceReport, weekNum: number): WeeklyAttendance | null {
        return sector.weeklyData?.find(w => w.weekNumber === weekNum) || null;
    }
    
    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    getPercentageClass(percentage: number): string {
        if (percentage >= 80) return 'percentage-excellent';
        if (percentage >= 60) return 'percentage-good';
        if (percentage >= 40) return 'percentage-fair';
        if (percentage >= 20) return 'percentage-poor';
        return 'percentage-very-poor';
    }
    
    // Calculate grand totals
    getGrandTotalMembers(): number {
        return this.reportData.reduce((sum, s) => sum + s.totalMembers, 0);
    }
    
    getGrandTotalAttended(): number {
        return this.reportData.reduce((sum, s) => sum + s.totalAttended, 0);
    }
    
    getGrandTotalKolpi(): number {
        return this.reportData.reduce((sum, s) => sum + (s.totalKolpiAmount || 0), 0);
    }
    
    getGrandAveragePercentage(): number {
        const validSectors = this.reportData.filter(s => s.averageAttendancePercentage > 0);
        if (validSectors.length === 0) return 0;
        const sum = validSectors.reduce((acc, s) => acc + s.averageAttendancePercentage, 0);
        return sum / validSectors.length;
    }

    exportExcel(): void {
        this.exporting = true;
        this.exportService.exportAttendanceExcel(this.selectedYear, this.selectedMonth)
            .pipe(finalize(() => this.exporting = false))
            .subscribe({
                next: (blob) => {
                    const filename = `Laporan_Kehadiran_${this.getMonthLabel()}_${this.selectedYear}.xlsx`;
                    this.exportService.downloadBlob(blob, filename);
                },
                error: (err) => {
                    console.error('exportExcel attendance', err);
                    this.snackBar.open('Gagal mengunduh Excel. Coba lagi.', 'Tutup', { duration: 3500 });
                }
            });
    }

    exportPdf(): void {
        this.exporting = true;
        this.exportService.exportAttendancePdf(this.selectedYear, this.selectedMonth)
            .pipe(finalize(() => this.exporting = false))
            .subscribe({
                next: (blob) => {
                    const filename = `Laporan_Kehadiran_${this.getMonthLabel()}_${this.selectedYear}.pdf`;
                    this.exportService.downloadBlob(blob, filename);
                },
                error: (err) => {
                    console.error('exportPdf attendance', err);
                    this.snackBar.open('Gagal mengunduh PDF. Coba lagi.', 'Tutup', { duration: 3500 });
                }
            });
    }

    printReport(): void {
        window.print();
    }
}
