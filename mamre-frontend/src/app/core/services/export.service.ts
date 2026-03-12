import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private base = `${environment.apiUrl}/export`;

  constructor(private http: HttpClient) {}

  exportBibleReadingExcel(year?: number, month?: number): Observable<Blob> {
    let params = new HttpParams();
    if (year != null) params = params.set('year', String(year));
    if (month != null) params = params.set('month', String(month));

    return this.http.get(`${this.base}/bible-reading/excel`, {
      params,
      responseType: 'blob',
    });
  }

  exportBibleReadingPdf(year?: number, month?: number): Observable<Blob> {
    let params = new HttpParams();
    if (year != null) params = params.set('year', String(year));
    if (month != null) params = params.set('month', String(month));

    return this.http.get(`${this.base}/bible-reading/pdf`, {
      params,
      responseType: 'blob',
    });
  }

  exportAttendanceExcel(year?: number, month?: number): Observable<Blob> {
    let params = new HttpParams();
    if (year != null) params = params.set('year', String(year));
    if (month != null) params = params.set('month', String(month));

    return this.http.get(`${this.base}/attendance/excel`, {
      params,
      responseType: 'blob',
    });
  }

  exportAttendancePdf(year?: number, month?: number): Observable<Blob> {
    let params = new HttpParams();
    if (year != null) params = params.set('year', String(year));
    if (month != null) params = params.set('month', String(month));

    return this.http.get(`${this.base}/attendance/pdf`, {
      params,
      responseType: 'blob',
    });
  }

  exportFinanceExcel(year?: number, month?: number): Observable<Blob> {
    let params = new HttpParams();
    if (year != null) params = params.set('year', String(year));
    if (month != null) params = params.set('month', String(month));

    return this.http.get(`${this.base}/finance/excel`, {
      params,
      responseType: 'blob',
    });
  }

  exportFinancePdf(year?: number, month?: number): Observable<Blob> {
    let params = new HttpParams();
    if (year != null) params = params.set('year', String(year));
    if (month != null) params = params.set('month', String(month));

    return this.http.get(`${this.base}/finance/pdf`, {
      params,
      responseType: 'blob',
    });
  }

  exportMembersExcel(status?: string, sectorId?: number): Observable<Blob> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (sectorId != null) params = params.set('sectorId', String(sectorId));

    return this.http.get(`${this.base}/members/excel`, {
      params,
      responseType: 'blob',
    });
  }

  exportMembersPdf(status?: string, sectorId?: number): Observable<Blob> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (sectorId != null) params = params.set('sectorId', String(sectorId));

    return this.http.get(`${this.base}/members/pdf`, {
      params,
      responseType: 'blob',
    });
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
