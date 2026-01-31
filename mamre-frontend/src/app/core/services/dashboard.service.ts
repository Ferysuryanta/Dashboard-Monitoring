import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {DashboardSummary} from "../../features/members/models/dashboard.model";



export interface MembersTrendPoint { month: string; count: number; }
export interface SectorDistribution { sector: string; count: number; }
export interface RecentActivity { id: string; name: string; email?: string; joinedDate?: string; sector?: string; position?: string; }
export interface AttendanceSummary { month: string; totalAttendances: number; uniqueMembers: number; }
export interface GenderDistribution { gender: string; count: number; }
export interface StatusDistribution { status: string; count: number; }
export interface UpcomingBirthday { id: string; name: string; birthDate: string; daysUntil: number; sectorName?: string; positionName?: string; }
export interface BibleReadingProgress { month: string; targetDays: number; completedDays: number; percentage: number; }

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private base = '/api/dashboard';

    constructor(private http: HttpClient) {}

    getSummary(): Observable<DashboardSummary> {
        return this.http.get<DashboardSummary>(`${this.base}/summary-stats`).pipe(
            catchError(err => { console.error('dashboard.getSummary', err); return of({ totalMembers: 0, activeMembers: 0, sectors: 0, positions: 0 }); })
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

    // new: attendance summary (month format YYYY-MM)
    getAttendanceSummary(month?: string): Observable<AttendanceSummary | null> {
        // build typed options object so TS picks overload returning Observable<T>
        const options: { params?: HttpParams } = {};
        if (month) {
            options.params = new HttpParams().set('month', month);
        }

        return this.http.get<AttendanceSummary>(`${this.base}/attendance/summary`, options)
            .pipe(
                catchError(err => {
                    console.error('dashboard.getAttendanceSummary', err);
                    return of(null);
                })
            );
    }

    // new: count by sector (list)
    getCountBySector(): Observable<{ sector: string; count: number }[] | null> {
        return this.http.get<{ sector: string; count: number }[]>(`${this.base}/members/count-by-sector`)
            .pipe(catchError(err => { console.error('dashboard.getCountBySector', err); return of(null); }));
    }

    // new: gender distribution
    getGenderDistribution(): Observable<GenderDistribution[]> {
        return this.http.get<GenderDistribution[]>(`${this.base}/gender-distribution`)
            .pipe(catchError(err => { console.error('dashboard.getGenderDistribution', err); return of([]); }));
    }

    // new: status distribution
    getStatusDistribution(): Observable<StatusDistribution[]> {
        return this.http.get<StatusDistribution[]>(`${this.base}/status-distribution`)
            .pipe(catchError(err => { console.error('dashboard.getStatusDistribution', err); return of([]); }));
    }

    // new: upcoming birthdays
    getUpcomingBirthdays(days = 30, limit = 5): Observable<UpcomingBirthday[]> {
        const params = new HttpParams()
            .set('days', String(days))
            .set('limit', String(limit));
        return this.http.get<UpcomingBirthday[]>(`${this.base}/upcoming-birthdays`, { params })
            .pipe(catchError(err => { console.error('dashboard.getUpcomingBirthdays', err); return of([]); }));
    }

    // new: bible reading progress - Membaca Alkitab Mamre
    getBibleReadingProgress(year?: number): Observable<BibleReadingProgress[]> {
        const options: { params?: HttpParams } = {};
        if (year) {
            options.params = new HttpParams().set('year', String(year));
        }
        return this.http.get<BibleReadingProgress[]>(`${this.base}/bible-reading-progress`, options)
            .pipe(catchError(err => { console.error('dashboard.getBibleReadingProgress', err); return of([]); }));
    }
}
