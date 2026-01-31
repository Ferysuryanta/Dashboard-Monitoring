import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Normalizes Spring Boot Page response to handle both 2.x and 3.x formats.
 * Spring Boot 3.x puts pagination info inside a 'page' object.
 */
function normalizePageResponse<T>(res: any, defaultSize: number, defaultPage: number): PagedBibleReading {
    const content = res?.content || [];
    // Spring Boot 3.x format: { content: [], page: { size, number, totalElements, totalPages } }
    // Spring Boot 2.x format: { content: [], size, number, totalElements, totalPages }
    const pageInfo = res?.page || res;
    return {
        content: content,
        totalElements: pageInfo?.totalElements ?? 0,
        totalPages: pageInfo?.totalPages ?? 0,
        size: pageInfo?.size ?? defaultSize,
        number: pageInfo?.number ?? defaultPage
    };
}

export interface BibleReading {
    id?: number;
    memberId: string;
    memberName?: string;
    readingDate: string;
    bookName: string;
    chapter?: number;
    verseStart?: number;
    verseEnd?: number;
    completed: boolean;
    notes?: string;
}

export interface PagedBibleReading {
    content: BibleReading[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// Daftar kitab Alkitab
export const BIBLE_BOOKS = [
    // Perjanjian Lama
    'Kejadian', 'Keluaran', 'Imamat', 'Bilangan', 'Ulangan',
    'Yosua', 'Hakim-hakim', 'Rut', '1 Samuel', '2 Samuel',
    '1 Raja-raja', '2 Raja-raja', '1 Tawarikh', '2 Tawarikh',
    'Ezra', 'Nehemia', 'Ester', 'Ayub', 'Mazmur', 'Amsal',
    'Pengkhotbah', 'Kidung Agung', 'Yesaya', 'Yeremia', 'Ratapan',
    'Yehezkiel', 'Daniel', 'Hosea', 'Yoel', 'Amos', 'Obaja',
    'Yunus', 'Mikha', 'Nahum', 'Habakuk', 'Zefanya', 'Hagai',
    'Zakharia', 'Maleakhi',
    // Perjanjian Baru
    'Matius', 'Markus', 'Lukas', 'Yohanes', 'Kisah Para Rasul',
    'Roma', '1 Korintus', '2 Korintus', 'Galatia', 'Efesus',
    'Filipi', 'Kolose', '1 Tesalonika', '2 Tesalonika',
    '1 Timotius', '2 Timotius', 'Titus', 'Filemon', 'Ibrani',
    'Yakobus', '1 Petrus', '2 Petrus', '1 Yohanes', '2 Yohanes',
    '3 Yohanes', 'Yudas', 'Wahyu'
];

@Injectable({ providedIn: 'root' })
export class BibleReadingService {
    private base = '/api/bible-reading';

    constructor(private http: HttpClient) {}

    getAll(page = 0, size = 20, sortBy = 'readingDate', sortDir = 'desc'): Observable<PagedBibleReading> {
        const params = new HttpParams()
            .set('page', String(page))
            .set('size', String(size))
            .set('sortBy', sortBy)
            .set('sortDir', sortDir);

        return this.http.get<any>(this.base, { params })
            .pipe(
                map(res => normalizePageResponse(res, size, page)),
                catchError(err => {
                    console.error('bibleReading.getAll', err);
                    return of({ content: [], totalElements: 0, totalPages: 0, size: size, number: page });
                })
            );
    }

    getById(id: number): Observable<BibleReading | null> {
        return this.http.get<BibleReading>(`${this.base}/${id}`)
            .pipe(catchError(err => {
                console.error('bibleReading.getById', err);
                return of(null);
            }));
    }

    getByMember(memberId: string, page = 0, size = 20): Observable<PagedBibleReading> {
        const params = new HttpParams()
            .set('page', String(page))
            .set('size', String(size));

        return this.http.get<any>(`${this.base}/member/${memberId}`, { params })
            .pipe(
                map(res => normalizePageResponse(res, size, page)),
                catchError(err => {
                    console.error('bibleReading.getByMember', err);
                    return of({ content: [], totalElements: 0, totalPages: 0, size: size, number: page });
                })
            );
    }

    getByDateRange(startDate: string, endDate: string, page = 0, size = 20): Observable<PagedBibleReading> {
        const params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate)
            .set('page', String(page))
            .set('size', String(size));

        return this.http.get<any>(`${this.base}/date-range`, { params })
            .pipe(
                map(res => normalizePageResponse(res, size, page)),
                catchError(err => {
                    console.error('bibleReading.getByDateRange', err);
                    return of({ content: [], totalElements: 0, totalPages: 0, size: size, number: page });
                })
            );
    }

    create(reading: BibleReading): Observable<BibleReading> {
        return this.http.post<BibleReading>(this.base, reading);
    }

    update(id: number, reading: BibleReading): Observable<BibleReading> {
        return this.http.put<BibleReading>(`${this.base}/${id}`, reading);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }

    checkInToday(memberId: string, bookName: string, chapter?: number): Observable<BibleReading> {
        return this.http.post<BibleReading>(`${this.base}/check-in`, {
            memberId,
            bookName,
            chapter
        });
    }

    hasReadToday(memberId: string): Observable<{ hasRead: boolean }> {
        return this.http.get<{ hasRead: boolean }>(`${this.base}/has-read-today/${memberId}`)
            .pipe(catchError(() => of({ hasRead: false })));
    }

    getMemberHistory(memberId: string, days = 30): Observable<BibleReading[]> {
        const params = new HttpParams().set('days', String(days));
        return this.http.get<BibleReading[]>(`${this.base}/history/${memberId}`, { params })
            .pipe(catchError(() => of([])));
    }
}
