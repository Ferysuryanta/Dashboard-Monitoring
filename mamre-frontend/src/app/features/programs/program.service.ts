import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  // New: paged + search
  getPaged(page = 0, size = 10, q?: string) {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (q) params = params.set('q', q);
    return this.http.get<Program[]>(this.base, { params, observe: 'response' as const }).pipe(
      catchError(err => { console.error('program.getPaged', err); throw err; })
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
}
