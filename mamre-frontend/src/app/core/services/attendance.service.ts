import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { normalizePageResponse, PagedResponse } from '../utils/response-normalizer';

export interface Attendance {
    id?: number;
    memberName: string;
    attendDate: string;
    event?: string;
    present: boolean;
    kolpiAmount?: number;  // Jumlah Kolekte/Persembahan
    note?: string;
}

export interface PagedAttendance extends PagedResponse<Attendance> {}

// Daftar event/kegiatan umum gereja
export const CHURCH_EVENTS = [
    'Ibadah Minggu',
    'Ibadah Rabu',
    'Ibadah Pemuda',
    'Ibadah Lansia',
    'Ibadah Anak',
    'Persekutuan Doa',
    'Rapat Jemaat',
    'Latihan Paduan Suara',
    'Pelayanan Sosial',
    'Kegiatan Sektor',
    'Retreat',
    'Paskah',
    'Natal',
    'Tahun Baru',
    'Lainnya'
];

@Injectable({ providedIn: 'root' })
export class AttendanceService {
    private base = '/api/attendance';

    constructor(private http: HttpClient) {}

    getAll(page = 0, size = 10, member?: string, from?: string, to?: string, sectorId?: number, sectorName?: string): Observable<PagedAttendance> {
        let params = new HttpParams()
            .set('page', String(page))
            .set('size', String(size));

        if (member) params = params.set('member', member);
        if (from) params = params.set('from', from);
        if (to) params = params.set('to', to);
        if (sectorId != null) params = params.set('sectorId', String(sectorId));
        if (sectorName) params = params.set('sectorName', sectorName);

        return this.http.get<any>(this.base, { params })
            .pipe(
                map(res => normalizePageResponse<Attendance>(res, size, page)),
                catchError(err => {
                    console.error('attendance.getAll', err);
                    return of({ content: [], totalElements: 0, totalPages: 0, size: size, number: page });
                })
            );
    }

    getById(id: number): Observable<Attendance | null> {
        return this.http.get<Attendance>(`${this.base}/${id}`)
            .pipe(catchError(err => {
                console.error('attendance.getById', err);
                return of(null);
            }));
    }

    create(attendance: Attendance): Observable<Attendance> {
        return this.http.post<Attendance>(this.base, attendance);
    }

    update(id: number, attendance: Attendance): Observable<Attendance> {
        return this.http.put<Attendance>(`${this.base}/${id}`, attendance);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }

    // Batch create untuk input kehadiran banyak anggota sekaligus
    batchCreate(attendances: Attendance[]): Observable<Attendance[]> {
        return this.http.post<Attendance[]>(`${this.base}/batch`, attendances)
            .pipe(catchError(err => {
                console.error('attendance.batchCreate', err);
                return of([]);
            }));
    }
}
