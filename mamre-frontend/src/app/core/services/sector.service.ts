import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface SectorOption { id: string; code?: string; name: string; description?: string; }

@Injectable({ providedIn: 'root' })
export class SectorService {
    // use proxy; change to full backend url if not using proxy
    private base = '/api/sectors';

    constructor(private http: HttpClient) {}

    getAll(): Observable<SectorOption[]> {
        return this.http.get<any>(this.base).pipe(
            map(resp => {
                if (!resp) return [];
                const list = Array.isArray(resp) ? resp : (resp.content ?? []);
                return list.map((r: any) => ({ id: String(r.id), code: r.code, name: r.name, description: r.description }));
            }),
            catchError(err => {
                console.error('SectorService.getAll error', err);
                return of([] as SectorOption[]);
            })
        );
    }

    getPaged(page = 0, size = 10): Observable<any> {
        const params = new HttpParams().set('page', String(page)).set('size', String(size));
        return this.http.get<any>(this.base, { params }).pipe(
            catchError(err => {
                console.error('SectorService.getPaged error', err);
                return of({ content: [], page: { size, number: page, totalElements: 0, totalPages: 0 } });
            })
        );
    }

    getById(id: string|number): Observable<SectorOption | null> {
        return this.http.get<any>(`${this.base}/${id}`).pipe(
            map(r => r ? { id: String(r.id), name: r.name, code: r.code, description: r.description } : null),
            catchError(err => {
                console.error('SectorService.getById error', err);
                return of(null);
            })
        );
    }

    create(payload: any) {
        return this.http.post<any>(this.base, payload);
    }
    update(id: string|number, payload: any) {
        return this.http.put<any>(`${this.base}/${id}`, payload);
    }
    delete(id: string|number) {
        return this.http.delete(`${this.base}/${id}`);
    }
}
