import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {environment} from "../../../environments/environment";
import {MemberDto} from "../../features/members/models/member.model";

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
    getPaged(page = 0, size = 20, sort?: string, search?: string, status?: string): Observable<PagedResult<MemberDto>> {
        let params = new HttpParams()
            .set('page', String(page))
            .set('size', String(size));

        if (sort) params = params.append('sort', sort);
        if (search) params = params.append('search', search);
        if (status) params = params.append('status', status);

        return this.http.get<PagedResult<MemberDto>>(this.base, { params }).pipe(
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
}
