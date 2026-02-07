import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Program } from './program.model';

@Injectable({ providedIn: 'root' })
class ProgramService {
  private base = '/api/programs';
  constructor(private http: HttpClient) {}

  /**
   * Get all programs (no paging). Uses backend GET /api/programs (no page/size params)
   */
  getAllNoPaging(status?: string): Observable<Program[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Program[]>(this.base, { params }).pipe(catchError(err => { console.error('program.getAllNoPaging', err); return of([] as Program[]); }));
  }

  getAll(page = 0, size = 20, status?: string): Observable<Program[] | { content: Program[] }> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));
    if (status) params = params.set('status', status);
    return this.http.get<Program[] | { content: Program[] }>(this.base, { params }).pipe(
      catchError(err => { console.error('program.getAll', err); return of([] as Program[]); })
    );
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
  groupPrograms(data: any[], categories: string[]) {
    const groups: any[] = [];
    let cumulativeIndex = 0;
    let pageBudgetTotal = 0;

    for (const cat of categories) {
      // Normalize category label and derive possible matching tokens
      const label = (cat || '').toString().trim();
      const afterDash = label.split(/\s*-\s*/).slice(1).join(' - ').trim(); // part after ' - '
      const prefix = (label.split(/\s*-\s*/)[0] || '').trim(); // e.g. 'E'

      const matchTokens = [label.toLowerCase()];
      if (afterDash) matchTokens.push(afterDash.toLowerCase());
      if (prefix) matchTokens.push(prefix.toLowerCase());

      const items = data.filter(x => {
        const itemCat = (x.category || '').toString().trim().toLowerCase();
        return matchTokens.includes(itemCat);
      });

      // compute totals (zero when no items)
      const totals = items.reduce((acc: any, it: any) => {
        const local = Number(it.budgetLocal) || 0;
        const subsidy = Number(it.budgetSubsidy) || 0;
        const total = Number(it.budgetTotal) || (local + subsidy);
        acc.local += local; acc.subsidy += subsidy; acc.total += total; return acc;
      }, { local: 0, subsidy: 0, total: 0 });

      // Always add the category group so the UI shows headings starting from A
      groups.push({ category: label, items, totals, startIndex: cumulativeIndex });
      // Increment start index only by number of items in this category
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

  // CSV export helper (pagination removed) - outputs sequential numbering starting at 1
  exportCsv(data: any[], filename = 'programs.csv') {
    const headers = ['No','Kegiatan','Tempat','Tujuan','Target Fisik','Anggaran Lokal','Anggaran Subsidi','Anggaran Total','Pelaksana','Jadwal','Keterangan'];
    const rows = data.map((r, i) => [ i + 1, r.title, r.place, r.purpose, r.targetPhysical, r.budgetLocal, r.budgetSubsidy, r.budgetTotal, r.executor, r.scheduleText, r.notes]);
    const csv = [headers, ...rows].map(r => r.map(c => '"' + (c ?? '') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); window.URL.revokeObjectURL(url);
  }

  /**
   * Aggregate fetch: call paged endpoint repeatedly until all pages are fetched.
   * Useful when backend only exposes paged API but caller needs full dataset.
   */
  getAllAggregate(q?: string, status?: string, type?: string, category?: string, pageSize = 100): Observable<Program[]> {
    return new Observable<Program[]>((observer) => {
      let page = 0;
      let collected: Program[] = [];
      let cancelled = false;

      const fetchPage = () => {
        // build params and call backend paged endpoint
        this.http.get<Program[]>(this.base, { params: new HttpParams().set('page', String(page)).set('size', String(pageSize)).appendAll(q ? { q } : {}).appendAll(status ? { status } : {}).appendAll(type ? { type } : {}).appendAll(category ? { category } : {}), observe: 'response' as const })
          .pipe(catchError(err => { throw err; }))
          .subscribe({
            next: (resp: HttpResponse<Program[]>) => {
              if (cancelled) return;
              const body = resp.body || [];
              collected = collected.concat(body as Program[]);
              const totalStr = resp.headers.get('X-Total-Count') || String(collected.length);
              const total = Number(totalStr);
              if (isNaN(total) || collected.length < total) {
                // there are more pages - fetch next
                page++;
                fetchPage();
              } else {
                observer.next(collected);
                observer.complete();
              }
            },
            error: (err) => {
              if (!cancelled) observer.error(err);
            }
          });
      };

      fetchPage();

      return () => { cancelled = true; };
    });
  }
}

export default ProgramService
