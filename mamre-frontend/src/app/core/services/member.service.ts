import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {environment} from "../../../environments/environment";
import {MemberDto} from "../../features/members/models/member.model";
import { normalizePageResponse } from '../utils/response-normalizer';

export interface PagedResult<T> {
    content: T[];
    pageable?: any;
    totalElements?: number;
    totalPages?: number;
    number?: number;
    size?: number;
    first?: boolean;
    last?: boolean;
    numberOfElements?: number;
    empty?: boolean;
}

@Injectable({ providedIn: 'root' })
export class MemberService {
    private base = `${environment.apiUrl}/members`;

    constructor(private http: HttpClient) {}

    /**
     * Server-side paging + search + status + sort
     * sort: e.g. 'firstName,asc'
     */
    getPaged(page = 0, size = 20, sort?: string, search?: string, status?: string, sectorId?: number): Observable<PagedResult<MemberDto>> {
        let params = new HttpParams()
            .set('page', String(page))
            .set('size', String(size));

        if (sort) params = params.append('sort', sort);
        if (search) params = params.append('search', search);
        if (status) params = params.append('status', status);
        if (sectorId != null) params = params.append('sectorId', String(sectorId));

        return this.http.get<any>(this.base, { params }).pipe(
            map(res => {
                // Normalize Spring Boot 3.x pagination response
                const normalized = normalizePageResponse<MemberDto>(res, size, page);
                return {
                    content: normalized.content,
                    totalElements: normalized.totalElements,
                    totalPages: normalized.totalPages,
                    number: normalized.number,
                    size: normalized.size,
                    first: normalized.number === 0,
                    last: normalized.number >= normalized.totalPages - 1,
                    empty: normalized.content.length === 0
                } as PagedResult<MemberDto>;
            }),
            catchError(err => {
                console.error('[MemberService] getPaged error', err);
                return throwError(() => err);
            })
        );
    }

    // convenience: map full page content (if you ever need array)
    getAllMapped(page = 0, size = 1000): Observable<MemberDto[]> {
        return this.getPaged(page, size).pipe(
            // map handled in caller if needed
            // but keep convenience if needed elsewhere
            // map(resp => resp.content || [])
            // not mapping here to keep type stable
            catchError(err => {
                return throwError(() => err);
            })
        ) as Observable<MemberDto[]>;
    }

    create(payload: Partial<MemberDto>) { return this.http.post<MemberDto>(this.base, payload); }
    update(id: string, payload: Partial<MemberDto>) { return this.http.put<MemberDto>(`${this.base}/${id}`, payload); }
    delete(id: string) { return this.http.delete<void>(`${this.base}/${id}`); }
    getById(id: string) { return this.http.get<MemberDto>(`${this.base}/${id}`); }

    /**
     * @deprecated Gunakan ExportService.exportMembersCsv() agar seluruh export anggota
     * (CSV/Excel/PDF) lewat satu service yang konsisten.
     */
    downloadCsvExport(sectorId?: number, status?: string) {
        let params = new HttpParams();
        if (sectorId != null) params = params.append('sectorId', String(sectorId));
        if (status) params = params.append('status', status);
        return this.http.get(`${this.base}/export`, { params, responseType: 'blob' as 'json' });
    }

    /**
     * @deprecated Gunakan ExportService.exportMembersCsv(). Alias ini dipertahankan
     * sementara untuk kompatibilitas.
     */
    downloadExport(sectorId?: number, status?: string) {
        return this.downloadCsvExport(sectorId, status);
    }
}
