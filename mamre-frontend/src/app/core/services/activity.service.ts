import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activity } from '../../features/members/models/activity.model';
import { environment } from '../../../environments/environment';
import {PageModel} from "../../features/members/models/page.model";

@Injectable({
    providedIn: 'root'
})
export class ActivityService {
    private base = `${environment.apiUrl}/activities`;

    constructor(private http: HttpClient) {}

    // typed pagination result
    list(page = 0, size = 20, search?: string): Observable<PageModel<Activity>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        if (search) params = params.set('search', search);
        return this.http.get<PageModel<Activity>>(this.base, { params });
    }

    getById(id: string): Observable<Activity> {
        return this.http.get<Activity>(`${this.base}/${id}`);
    }

    create(payload: Activity): Observable<Activity> {
        // pastikan tanggal adalah string ISO yang dikoreksi
        const body = this.normalizeDates(payload);
        return this.http.post<Activity>(this.base, body);
    }

    update(id: string, payload: Activity): Observable<Activity> {
        const body = this.normalizeDates(payload);
        return this.http.put<Activity>(`${this.base}/${id}`, body);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }

    // upload without progress (simple)
    uploadDocument(id: string, file: File): Observable<any> {
        const fd = new FormData();
        fd.append('file', file);
        return this.http.post<any>(`${this.base}/${id}/documents`, fd);
    }

    // upload with progress events (useful for UI)
    uploadDocumentWithProgress(id: string, file: File): Observable<HttpEvent<any>> {
        const fd = new FormData();
        fd.append('file', file);
        const req = new HttpRequest('POST', `${this.base}/${id}/documents`, fd, {
            reportProgress: true,
        });
        return this.http.request(req);
    }

    // delete a specific document
    deleteDocument(activityId: string, documentId: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${activityId}/documents/${documentId}`);
    }

    // helper: pastikan date fields adalah string ISO yang dikoreksi (sesuai model Activity)
    private normalizeDates(payload: Activity): any {
        const out: any = { ...payload };

        // helper isRealDate
        const isRealDate = (v: unknown): v is Date =>
            Object.prototype.toString.call(v) === '[object Date]' && !isNaN((v as Date).getTime());

        // helper untuk mengkonversi tanggal lokal ke ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)
        const toLocalISODate = (d: Date): string => {
            const offset = d.getTimezoneOffset() * 60000;
            const localTime = d.getTime() - offset;

            // Kita ambil tanggalnya (YYYY-MM-DD) dan tambahkan T00:00:00.000Z
            return new Date(localTime).toISOString().split('T')[0] + 'T00:00:00.000Z';
        }

        // dateStart
        if (isRealDate(payload.dateStart)) {
            // [PERBAIKAN] Gunakan helper toLocalISODate()
            out.dateStart = toLocalISODate(payload.dateStart as Date);
        } else if (typeof payload.dateStart === 'string' && payload.dateStart.trim()) {
            const d = new Date(payload.dateStart);
            if (!isNaN(d.getTime())) {
                // [PERBAIKAN] Jika input adalah string yang valid, konversi ke Date dan koreksi
                out.dateStart = toLocalISODate(d);
            }
        }

        // dateEnd (same logic)
        if (isRealDate(payload.dateEnd)) {
            // [PERBAIKAN] Gunakan helper toLocalISODate()
            out.dateEnd = toLocalISODate(payload.dateEnd as Date);
        } else if (typeof payload.dateEnd === 'string' && payload.dateEnd.trim()) {
            const d = new Date(payload.dateEnd);
            if (!isNaN(d.getTime())) {
                // [PERBAIKAN] Jika input adalah string yang valid, konversi ke Date dan koreksi
                out.dateEnd = toLocalISODate(d);
            }
        }

        return out;
    }
}