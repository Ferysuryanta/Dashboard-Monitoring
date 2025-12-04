
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {AttendanceSummary} from "./dashboard.service";
import {AttendanceDto} from "../../features/members/models/attendance.model";
import {PageModel} from "../../features/members/models/page.model";


@Injectable({
    providedIn: 'root'
})
export class AttendanceService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    // --- Dashboard Attendance Summary (GET /api/dashboard/attendance/summary) ---
    getSummary(): Observable<AttendanceSummary> {
        return this.http.get<AttendanceSummary>(`${this.baseUrl}/dashboard/attendance/summary`);
    }

    // --- Create Attendance (POST /api/attendance) ---
    createAttendance(dto: { memberId: string, attendDate: string, event?: string, present?: boolean, note?: string }): Observable<AttendanceDto> {
        // Menggunakan this.baseUrl
        return this.http.post<AttendanceDto>(`${this.baseUrl}/attendance`, dto);
    }

    // --- Read Single Attendance (GET /api/attendance/{id}) ---
    getAttendanceById(id: number): Observable<AttendanceDto> {
        // Menggunakan this.baseUrl
        return this.http.get<AttendanceDto>(`${this.baseUrl}/attendance/${id}`);
    }

    // --- Update Attendance (PUT /api/attendance/{id}) ---
    updateAttendance(id: number, dto: AttendanceDto): Observable<AttendanceDto> {
        // Menggunakan this.baseUrl
        return this.http.put<AttendanceDto>(`${this.baseUrl}/attendance/${id}`, dto);
    }

    // --- Delete Attendance (DELETE /api/attendance/{id}) ---
    deleteAttendance(id: number): Observable<void> {
        // Menggunakan this.baseUrl
        return this.http.delete<void>(`${this.baseUrl}/attendance/${id}`);
    }

    // --- List/Search Attendance (GET /api/attendance) ---
    listAttendance(
        page: number,
        size: number,
        member?: string | null,
        from?: string | null,
        to?: string | null
    ): Observable<PageModel<AttendanceDto>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (member) { params = params.set('member', member); }
        if (from) { params = params.set('from', from); }
        if (to) { params = params.set('to', to); }

        return this.http.get<PageModel<AttendanceDto>>(`${this.baseUrl}/attendance`, { params });
    }
}