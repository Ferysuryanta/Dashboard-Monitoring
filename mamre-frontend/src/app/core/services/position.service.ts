// src/app/core/services/position.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface PositionOption { id: string; name: string; description?: string; }

@Injectable({ providedIn: 'root' })
export class PositionService {
    private base = '/api/positions'; // gunakan proxy

    constructor(private http: HttpClient) {}

    getAll(): Observable<PositionOption[]> {
        return this.http.get<any>(this.base).pipe(
            map(resp => {
                if (!resp) return [];
                const list = Array.isArray(resp) ? resp : (resp.content ?? []);
                return list.map((r: any) => ({ id: String(r.id), name: r.name, description: r.description }));
            }),
            catchError(err => {
                console.error('PositionService.getAll error', err);
                return of([] as PositionOption[]);
            })
        );
    }

    getPaged(page = 0, size = 10): Observable<any> {
        const params = new HttpParams().set('page', String(page)).set('size', String(size));
        return this.http.get<any>(this.base, { params }).pipe(
            catchError(err => {
                console.error('PositionService.getPaged error', err);
                return of({ content: [], page: { size, number: page, totalElements: 0, totalPages: 0 } });
            })
        );
    }

    getById(id: string|number): Observable<PositionOption | null> {
        return this.http.get<any>(`${this.base}/${id}`).pipe(
            map(r => r ? { id: String(r.id), name: r.name, description: r.description } : null),
            catchError(err => { console.error('PositionService.getById error', err); return of(null); })
        );
    }

    create(payload: any) { return this.http.post<any>(this.base, payload); }
    update(id: string|number, payload: any) { return this.http.put<any>(`${this.base}/${id}`, payload); }
    delete(id: string|number) { return this.http.delete(`${this.base}/${id}`); }
}
