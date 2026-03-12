import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';

import { SectorService, SectorOption } from '../../core/services/sector.service';
import { FinanceService } from '../../core/services/finance.service';
import { TransactionPayload } from './models/transaction.model';

export interface PerSectorFinance {
    sectorId: number | null;
    sectorName?: string;
    income: number;
    expense: number;
    net: number;
    note?: string;
}

export interface MonthlyFinanceReport {
    month: number;
    year: number;
    totalIncome: number;
    totalExpense: number;
    net: number;
    perSector: PerSectorFinance[];
}

@Component({
    selector: 'app-finance-transaction-form',
    standalone: true,
    providers: [provideNativeDateAdapter()],
    imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule],
    templateUrl: './finance-transaction-form.component.html',
    styleUrls: ['./finance-transaction-form.component.scss']
})
export class FinanceTransactionFormComponent implements OnInit {
    private sectorSvc = inject(SectorService);
    private financeSvc = inject(FinanceService);
    private dialogRef = inject(MatDialogRef<FinanceTransactionFormComponent>);

    sectors: SectorOption[] = [];
    loadingSectors = false;

    // Date picker value (Date object); converted to ISO string on save
    txnDateValue: Date = new Date();

    model: TransactionPayload = {
        txnType: 'Pemasukan',
        amount: 0,
        txnDate: new Date().toISOString().substring(0,10),
        sectorId: null,
        category: '',
        description: ''
    };

    saving = false;

    ngOnInit(): void {
        this.loadSectors();
    }

    loadSectors(): void {
        this.loadingSectors = true;
        this.sectorSvc.getAll().subscribe(list => { this.sectors = list; this.loadingSectors = false; });
    }

    cancel(): void { this.dialogRef.close(false); }

    save(): void {
        if (!this.model.amount || this.model.amount <= 0) return;
        this.saving = true;
        // Convert Date object back to YYYY-MM-DD string
        const d = this.txnDateValue;
        const pad = (n: number) => String(n).padStart(2, '0');
        this.model.txnDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        const sectorIdNum = this.model.sectorId == null ? undefined : (typeof this.model.sectorId === 'string' ? Number(this.model.sectorId) : this.model.sectorId);
        const payload: any = {
            txnType: this.model.txnType === 'Pemasukan' ? 'INCOME' : 'EXPENSE',
            amount: Number(this.model.amount),
            txnDate: this.model.txnDate,
            sectorId: sectorIdNum,
            category: this.model.category,
            description: this.model.description
        } as TransactionPayload;

        this.financeSvc.createTransaction(payload).subscribe(() => {
            this.saving = false;
            this.dialogRef.close(true);
        }, err => {
            console.error('create transaction error', err);
            this.saving = false;
        });
    }
}
