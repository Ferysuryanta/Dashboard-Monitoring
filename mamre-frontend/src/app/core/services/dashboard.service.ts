import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface DashboardSummary {
    totalMembers: number;
    activeMembers: number;
    sectors: number;
    positions: number;
}

export interface MembersTrendPoint { month: string; count: number; }
export interface SectorDistribution { sector: string; count: number; }
export interface RecentActivity { id: string; name: string; email?: string; joinedDate?: string; sector?: string; position?: string; }
export interface AttendanceSummary { month: string; totalAttendances: number; uniqueMembers: number; }

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private base = '/api/dashboard';

    constructor(private http: HttpClient) {}

    getSummary(): Observable<DashboardSummary> {
        return this.http.get<DashboardSummary>(`${this.base}/summary-stats`).pipe(
            catchError(err => {
                console.error('dashboard.getSummary', err);
                return of({ totalMembers: 0, activeMembers: 0, sectors: 0, positions: 0 });
            })
        );
    }

    getMembersTrend(months = 12): Observable<MembersTrendPoint[] | { content: MembersTrendPoint[] }> {
        const params = new HttpParams().set('months', String(months));
        return this.http.get<MembersTrendPoint[] | { content: MembersTrendPoint[] }>(`${this.base}/members-trend`, { params })
            .pipe(catchError(err => { console.error('dashboard.getMembersTrend', err); return of([] as MembersTrendPoint[]); }));
    }

    getSectorDistribution(): Observable<SectorDistribution[] | { content: SectorDistribution[] }> {
        return this.http.get<SectorDistribution[] | { content: SectorDistribution[] }>(`${this.base}/sector-distribution`)
            .pipe(catchError(err => { console.error('dashboard.getSectorDistribution', err); return of([] as SectorDistribution[]); }));
    }

    getRecentActivities(size = 6): Observable<RecentActivity[] | { content: RecentActivity[] }> {
        const params = new HttpParams().set('size', String(size));
        return this.http.get<RecentActivity[] | { content: RecentActivity[] }>(`${this.base}/recent`, { params })
            .pipe(catchError(err => { console.error('dashboard.getRecentActivities', err); return of([] as RecentActivity[]); }));
    }

    getAttendanceSummary(month?: string): Observable<AttendanceSummary | null> {
        const options: { params?: HttpParams } = {};
        if (month) options.params = new HttpParams().set('month', month);
        return this.http.get<AttendanceSummary>(`${this.base}/attendance/summary`, options)
            .pipe(catchError(err => { console.error('dashboard.getAttendanceSummary', err); return of(null); }));
    }

    getCountBySector(): Observable<{ sector: string; count: number }[] | null> {
        return this.http.get<{ sector: string; count: number }[]>(`${this.base}/members/count-by-sector`)
            .pipe(catchError(err => { console.error('dashboard.getCountBySector', err); return of(null); }));
    }
}
