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
import { DashboardService, SectorAttendanceReport, WeeklyAttendance } from '../../../../core/services/dashboard.service';

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
        MatTooltipModule
    ],
    templateUrl: './attendance-report.component.html',
    styleUrls: ['./attendance-report.component.scss']
})
export class AttendanceReportComponent implements OnInit {
    
    reportData: SectorAttendanceReport[] = [];
    loading = false;
    
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
    
    constructor(private dashboardService: DashboardService) {
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

    exportToExcel(): void {
        // Build CSV content with proper structure
        const headers = [
            'Sektor',
            'Jml Anggota',
            'M1 Hadir', 'M1 Kolekte', 'M1 %',
            'M2 Hadir', 'M2 Kolekte', 'M2 %',
            'M3 Hadir', 'M3 Kolekte', 'M3 %',
            'M4 Hadir', 'M4 Kolekte', 'M4 %',
            'Total Hadir', 'Total Kolekte', 'Rata-rata %'
        ];
        
        const rows = this.reportData.map(s => {
            const w1 = this.getWeekData(s, 1);
            const w2 = this.getWeekData(s, 2);
            const w3 = this.getWeekData(s, 3);
            const w4 = this.getWeekData(s, 4);
            
            return [
                s.sectorName,
                s.totalMembers,
                w1?.attendedCount || 0, w1?.kolpiAmount || 0, (w1?.attendancePercentage || 0).toFixed(0) + '%',
                w2?.attendedCount || 0, w2?.kolpiAmount || 0, (w2?.attendancePercentage || 0).toFixed(0) + '%',
                w3?.attendedCount || 0, w3?.kolpiAmount || 0, (w3?.attendancePercentage || 0).toFixed(0) + '%',
                w4?.attendedCount || 0, w4?.kolpiAmount || 0, (w4?.attendancePercentage || 0).toFixed(0) + '%',
                s.totalAttended, s.totalKolpiAmount || 0, s.averageAttendancePercentage.toFixed(0) + '%'
            ];
        });
        
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Laporan_Kehadiran_${this.getMonthLabel()}_${this.selectedYear}.csv`;
        link.click();
    }
    
    printReport(): void {
        window.print();
    }
}
