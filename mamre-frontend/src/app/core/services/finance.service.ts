import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MonthlyFinanceReport, PerSectorFinance } from '../../features/finance/models/finance.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
    private base = '/api/finance';

    constructor(private http: HttpClient) { }

    getMonthlyReport(month?: number, year?: number): Observable<MonthlyFinanceReport | null> {
        let params = new HttpParams();
        if (month) params = params.set('month', String(month));
        if (year) params = params.set('year', String(year));
        return this.http.get<any>(`${this.base}/reports/monthly`, { params }).pipe(
            map(report => this.normalizeMonthlyReport(report)),
            catchError(err => { console.error('finance.getMonthlyReport', err); return of(null); })
        );
    }

    private normalizeMonthlyReport(report: any): MonthlyFinanceReport | null {
        if (!report) {
            return null;
        }

        const perSector = Array.isArray(report.perSector)
            ? report.perSector.map((item: any) => this.normalizePerSectorItem(item))
            : this.normalizeLegacyPerSectorMap(report.perSector);

        return {
            month: Number(report.month ?? 0),
            year: Number(report.year ?? 0),
            totalIncome: Number(report.totalIncome ?? 0),
            totalExpense: Number(report.totalExpense ?? 0),
            net: Number(report.net ?? 0),
            perSector,
        };
    }

    private normalizePerSectorItem(item: any): PerSectorFinance {
        const sectorId = item?.sectorId == null ? null : Number(item.sectorId);
        const income = Number(item?.income ?? 0);
        const expense = Number(item?.expense ?? 0);
        const net = item?.net != null ? Number(item.net) : income - expense;
        return {
            sectorId,
            sectorName: item?.sectorName || (sectorId == null ? 'General' : `Sektor ${sectorId}`),
            income,
            expense,
            net,
            note: item?.note,
        };
    }

    private normalizeLegacyPerSectorMap(perSector: Record<string, any> | null | undefined): PerSectorFinance[] {
        if (!perSector || typeof perSector !== 'object') {
            return [];
        }

        return Object.entries(perSector).map(([rawSectorId, value]) => {
            const sectorId = rawSectorId === '0' ? null : Number(rawSectorId);
            const income = Number(value?.income ?? 0);
            const expense = Number(value?.expense ?? 0);
            return {
                sectorId,
                sectorName: sectorId == null ? 'General' : `Sektor ${rawSectorId}`,
                income,
                expense,
                net: Number(value?.net ?? income - expense),
            };
        });
    }

    createTransaction(payload: { txnType: string; amount: number; txnDate: string; sectorId?: number; category?: string; description?: string; reference?: string }): Observable<any> {
        return this.http.post(`${this.base}/transactions`, payload).pipe(
            catchError(err => { console.error('finance.createTransaction', err); return of(null); })
        );
    }
}
