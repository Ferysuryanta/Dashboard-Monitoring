import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Program } from './program.model';

@Injectable({ providedIn: 'root' })
export class ProgramService {
  private base = '/api/programs';
  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20, status?: string): Observable<Program[] | { content: Program[] }> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));
    if (status) params = params.set('status', status);
    return this.http.get<Program[] | { content: Program[] }>(this.base, { params }).pipe(
      catchError(err => { console.error('program.getAll', err); return of([] as Program[]); })
    );
  }

  // Paged search with filters. Returns observable of HttpResponse containing body and headers.
  getPaged(page = 0, size = 10, q?: string, status?: string, type?: string, category?: string): Observable<HttpResponse<Program[]>> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (q) params = params.set('q', q);
    if (status) params = params.set('status', status);
    if (type) params = params.set('type', type);
    if (category) params = params.set('category', category);
    return this.http.get<Program[]>(this.base, { params, observe: 'response' }).pipe(catchError(err => { console.error('program.getPaged', err); throw err; }));
  }

  getById(id: number): Observable<Program | null> {
    return this.http.get<Program>(`${this.base}/${id}`).pipe(catchError(err => { console.error('program.getById', err); return of(null); }));
  }

  create(p: Program): Observable<Program> {
    return this.http.post<Program>(this.base, p).pipe(catchError(err => { console.error('program.create', err); throw err; }));
  }

  update(id: number, p: Program): Observable<Program> {
    return this.http.put<Program>(`${this.base}/${id}`, p).pipe(catchError(err => { console.error('program.update', err); throw err; }));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(catchError(err => { console.error('program.delete', err); throw err; }));
  }

  // Documents
  uploadDocument(programId: number, file: File) {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post(`${this.base}/${programId}/documents`, fd).pipe(catchError(err => { console.error('uploadDocument', err); throw err; }));
  }

  listDocuments(programId: number) {
    return this.http.get<any[]>(`${this.base}/${programId}/documents`).pipe(catchError(err => { console.error('listDocuments', err); return of([] as any[]); }));
  }

  downloadDocument(docId: number) {
    return `${this.base}/documents/download/${docId}`; // URL to download
  }

  // categories for filter dropdown
  getCategories() {
    return this.http.get<string[]>(`${this.base}/categories`).pipe(catchError(err => { console.error('getCategories', err); return of([] as string[]); }));
  }

  // Grouping logic moved from component: returns grouped array and pageBudgetTotal
  groupPrograms(data: any[], categories: string[], page: number, size: number) {
    const groups: any[] = [];
    let cumulativeIndex = 0;
    let pageBudgetTotal = 0;

    for (const cat of categories) {
      const items = data.filter(x => (x.category || '').toLowerCase() === (cat.replace(/^\w+ - /, '') || cat).toLowerCase() || (x.category === cat));
      if (items.length === 0) continue;
      const totals = items.reduce((acc: any, it: any) => {
        const local = Number(it.budgetLocal) || 0;
        const subsidy = Number(it.budgetSubsidy) || 0;
        const total = Number(it.budgetTotal) || (local + subsidy);
        acc.local += local; acc.subsidy += subsidy; acc.total += total; return acc;
      }, { local: 0, subsidy: 0, total: 0 });

      groups.push({ category: cat.replace(/^\w+ - /, (m: string)=>m), items, totals, startIndex: cumulativeIndex });
      cumulativeIndex += items.length;
      pageBudgetTotal += totals.total;
    }

    const uncategorized = data.filter(x => !x.category);
    if (uncategorized.length) {
      const totals = uncategorized.reduce((acc: any, it: any) => {
        const local = Number(it.budgetLocal) || 0;
        const subsidy = Number(it.budgetSubsidy) || 0;
        const total = Number(it.budgetTotal) || (local + subsidy);
        acc.local += local; acc.subsidy += subsidy; acc.total += total; return acc;
      }, { local: 0, subsidy: 0, total: 0 });
      groups.push({ category: 'Lain-lain', items: uncategorized, totals, startIndex: cumulativeIndex });
      cumulativeIndex += uncategorized.length;
      pageBudgetTotal += totals.total;
    }

    return { groups, pageBudgetTotal };
  }

  // CSV export helper
  exportCsv(data: any[], page: number, size: number, filename = 'programs.csv') {
    const headers = ['No','Kegiatan','Tempat','Tujuan','Target Fisik','Anggaran Lokal','Anggaran Subsidi','Anggaran Total','Pelaksana','Jadwal','Keterangan'];
    const rows = data.map((r, i) => [ (page-1)*size + i +1, r.title, r.place, r.purpose, r.targetPhysical, r.budgetLocal, r.budgetSubsidy, r.budgetTotal, r.executor, r.scheduleText, r.notes]);
    const csv = [headers, ...rows].map(r => r.map(c => '"' + (c ?? '') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); window.URL.revokeObjectURL(url);
  }
}
