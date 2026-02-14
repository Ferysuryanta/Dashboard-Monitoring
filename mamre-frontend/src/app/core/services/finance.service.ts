import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MonthlyFinanceReport } from '../../features/finance/models/finance.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
    private base = '/api/finance';

    constructor(private http: HttpClient) { }

    getMonthlyReport(month?: number, year?: number): Observable<MonthlyFinanceReport | null> {
        let params = new HttpParams();
        if (month) params = params.set('month', String(month));
        if (year) params = params.set('year', String(year));
        return this.http.get<MonthlyFinanceReport>(`${this.base}/reports/monthly`, { params }).pipe(
            catchError(err => { console.error('finance.getMonthlyReport', err); return of(null); })
        );
    }

    createTransaction(payload: { txnType: string; amount: number; txnDate: string; sectorId?: number; category?: string; description?: string; reference?: string }): Observable<any> {
        return this.http.post(`${this.base}/transactions`, payload).pipe(
            catchError(err => { console.error('finance.createTransaction', err); return of(null); })
        );
    }
}
