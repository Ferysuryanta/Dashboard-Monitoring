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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { FinanceService } from '../../core/services/finance.service';
import { ExportService } from '../../core/services/export.service';
import { MonthlyFinanceReport } from './models/finance.model';
import { FinanceTransactionFormComponent } from './finance-transaction-form.component';

@Component({
    selector: 'app-finance-report',
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
        MatDialogModule,
        MatSnackBarModule
    ],
    templateUrl: './finance-report.component.html',
    styleUrls: ['./finance-report.component.scss']
})
export class FinanceReportComponent implements OnInit {
    report: MonthlyFinanceReport | null = null;
    loading = false;
    exporting = false;

    selectedMonth: number;
    selectedYear: number;

    months = [
        { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' }, { value: 3, label: 'Maret' }, { value: 4, label: 'April' }, { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' }, { value: 9, label: 'September' }, { value: 10, label: 'Oktober' }, { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
    ];

    years: number[] = [];

    displayedColumns = ['sector', 'income', 'expense', 'net'];

    constructor(
        private financeService: FinanceService,
        private dialog: MatDialog,
        private exportService: ExportService,
        private snackBar: MatSnackBar
    ) {
        const now = new Date();
        this.selectedYear = now.getFullYear();
        this.selectedMonth = now.getMonth() + 1;
        for (let i = 0; i < 5; i++) this.years.push(now.getFullYear() - i);
    }

    ngOnInit(): void {
        this.loadReport();
    }

    loadReport(): void {
        this.loading = true;
        this.financeService.getMonthlyReport(this.selectedMonth, this.selectedYear).subscribe(r => {
            this.report = r;
            this.loading = false;
        });
    }

    onFilterChange(): void { this.loadReport(); }

    getMonthLabel(): string {
        const m = this.months.find(x => x.value === this.selectedMonth);
        return m ? m.label : '';
    }

    openAddTransaction(): void {
        // Open dialog with a custom panelClass so component-scoped styles can target
        // the dialog overlay. Avoid forcing a small width here — the component
        // itself will define its preferred width and responsive max-width.
        const ref = this.dialog.open(FinanceTransactionFormComponent, {
            // let the component decide width via its .txn-modal rule
            width: 'auto',
            maxHeight: '90vh',
            panelClass: 'txn-dialog-panel'
        });
        ref.afterClosed().subscribe(result => {
            if (result) this.loadReport();
        });
    }

    exportExcel(): void {
        this.exporting = true;
        this.exportService.exportFinanceExcel(this.selectedYear, this.selectedMonth)
            .pipe(finalize(() => this.exporting = false))
            .subscribe({
                next: (blob: Blob) => {
                    const filename = `Laporan_Keuangan_${this.getMonthLabel()}_${this.selectedYear}.xlsx`;
                    this.exportService.downloadBlob(blob, filename);
                },
                error: (err: unknown) => {
                    console.error('exportExcel finance', err);
                    this.snackBar.open('Gagal mengunduh Excel. Coba lagi.', 'Tutup', { duration: 3500 });
                }
            });
    }

    exportPdf(): void {
        this.exporting = true;
        this.exportService.exportFinancePdf(this.selectedYear, this.selectedMonth)
            .pipe(finalize(() => this.exporting = false))
            .subscribe({
                next: (blob: Blob) => {
                    const filename = `Laporan_Keuangan_${this.getMonthLabel()}_${this.selectedYear}.pdf`;
                    this.exportService.downloadBlob(blob, filename);
                },
                error: (err: unknown) => {
                    console.error('exportPdf finance', err);
                    this.snackBar.open('Gagal mengunduh PDF. Coba lagi.', 'Tutup', { duration: 3500 });
                }
            });
    }
}
