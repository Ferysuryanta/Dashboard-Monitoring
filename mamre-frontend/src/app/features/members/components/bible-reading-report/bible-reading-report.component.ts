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
import { DashboardService, SectorBibleReadingReport } from '../../../../core/services/dashboard.service';

interface MonthOption {
    value: number;
    label: string;
}

@Component({
    selector: 'app-bible-reading-report',
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
        MatDividerModule
    ],
    templateUrl: './bible-reading-report.component.html',
    styleUrls: ['./bible-reading-report.component.scss']
})
export class BibleReadingReportComponent implements OnInit {

    reportData: SectorBibleReadingReport[] = [];
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

    displayedColumns: string[] = ['sectorName', 'totalMembers', 'membersWhoRead', 'averagePercentage', 'category', 'description'];

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
        this.dashboardService.getSectorBibleReadingReport(this.selectedYear, this.selectedMonth)
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

    getCategoryClass(category: string): string {
        switch (category) {
            case 'Sangat Baik': return 'category-excellent';
            case 'Baik': return 'category-good';
            case 'Cukup': return 'category-fair';
            case 'Kurang': return 'category-poor';
            case 'Sangat Kurang': return 'category-very-poor';
            default: return '';
        }
    }

    isTotal(row: SectorBibleReadingReport): boolean {
        return row.sectorId === null || row.sectorName === 'Total';
    }

    exportToExcel(): void {
        // Simple CSV export
        const headers = ['Nama Sektor', 'Jumlah Anggota', 'Rata-rata % Baca', 'Kategori', 'Keterangan'];
        const rows = this.reportData.map(r => [
            r.sectorName,
            r.totalMembers,
            r.averagePercentage.toFixed(0) + '%',
            r.category,
            r.description
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Laporan_Baca_Alkitab_${this.getMonthLabel()}_${this.selectedYear}.csv`;
        link.click();
    }

    printReport(): void {
        window.print();
    }
}
