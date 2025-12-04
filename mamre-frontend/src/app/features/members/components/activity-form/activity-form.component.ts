// src/app/features/activity-program/components/activity-form/activity-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeId from '@angular/common/locales/id';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { from, of } from 'rxjs';
import { concatMap, toArray, map, switchMap, catchError } from 'rxjs/operators';
import {Activity, ActivityStatus} from "../../models/activity.model";
import {ActivityService} from "src/app/core/services/activity.service";

registerLocaleData(localeId);

@Component({
    selector: 'app-activity-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatIconModule,
        MatButtonModule,
        MatSnackBarModule
    ],
    templateUrl: './activity-form.component.html',
    styleUrls: ['./activity-form.component.scss'],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'id-ID' } // optional: set locale
    ]
})
export class ActivityFormComponent implements OnInit {
    form = this.fb.group({
        title: ['', Validators.required],
        description: [''],
        dateStart: ['', Validators.required],
        dateEnd: [''],
        status: ['Planned', Validators.required],
        location: ['']
    });

    editMode = false;
    id?: string;
    loading = false;

    filesToUpload: File[] = [];
    existingDocs: Array<{ id?: string; name: string; url?: string }> = [];

    constructor(
        private fb: FormBuilder,
        private svc: ActivityService,
        private route: ActivatedRoute,
        private router: Router,
        private snack: MatSnackBar
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.editMode = true;
            this.id = id;
            this.loading = true;
            this.svc.getById(id).subscribe({
                next: (res: Activity) => {
                    this.form.patchValue({
                        title: res.title,
                        description: res.description,
                        // datepicker accepts Date or ISO string; we prefer Date objects here
                        dateStart: this.normalizeDateValue(res.dateStart),
                        dateEnd: this.normalizeDateValue(res.dateEnd),
                        status: res.status,
                        location: res.location
                    });
                    this.existingDocs = res.documents || [];
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Failed to load activity', err);
                    this.loading = false;
                    this.snack.open('Gagal memuat activity', 'Tutup', { duration: 3000 });
                }
            });
        }
    }

    // runtime type-guard for Date objects
    private isRealDate(val: unknown): val is Date {
        return Object.prototype.toString.call(val) === '[object Date]' && !isNaN((val as Date).getTime());
    }

    // normalize incoming date-like values to ISO string or undefined
    private normalizeDateValue(v: unknown): string | undefined {
        if (v == null || v === '') return undefined;

        if (this.isRealDate(v)) {
            return (v as Date).toISOString();
        }

        if (typeof v === 'string') {
            const d = new Date(v);
            if (!isNaN(d.getTime())) return d.toISOString();
            return undefined;
        }

        // fallback: try toString and parse
        try {
            const d = new Date((v as any).toString());
            if (!isNaN(d.getTime())) return d.toISOString();
        } catch { /* ignore */ }

        return undefined;
    }

    // file input change handler (safe)
    onFileSelected(ev: Event) {
        const input = ev.target as HTMLInputElement;
        if (!input.files) return;
        const arr = Array.from(input.files);
        this.filesToUpload = this.filesToUpload.concat(arr);
        // reset so same files can be selected again if needed
        input.value = '';
    }

    removeLocalFile(index: number) {
        this.filesToUpload.splice(index, 1);
    }

    removeExistingDoc(index: number) {
        this.existingDocs.splice(index, 1);
        // optionally call backend delete endpoint here if implemented
    }

    cancel() {
        this.router.navigate(['/activities']);
    }

    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.snack.open('Periksa form, beberapa field wajib diisi', 'Tutup', { duration: 3000 });
            return;
        }

        this.loading = true;
        const raw = this.form.value;

        // build payload using normalizeDateValue (no instanceof on typed string)
        const payload: Partial<Activity> = {
            title: raw.title,
            description: raw.description,
            dateStart: this.normalizeDateValue(raw.dateStart),
            dateEnd: this.normalizeDateValue(raw.dateEnd),
            status: raw.status as ActivityStatus,
            location: raw.location
        };

        const save$ = this.editMode && this.id ? this.svc.update(this.id, payload as Activity) : this.svc.create(payload as Activity);

        save$
            .pipe(
                switchMap((saved: Activity) => {
                    const idToUse = saved.id ?? this.id;
                    if (!this.filesToUpload || this.filesToUpload.length === 0) {
                        return of(saved);
                    }
                    return from(this.filesToUpload).pipe(
                        concatMap(file => this.svc.uploadDocument(idToUse!, file)),
                        toArray(),
                        map(() => saved)
                    );
                }),
                catchError(err => {
                    this.loading = false;
                    console.error('Save/upload failed', err);
                    this.snack.open('Gagal menyimpan activity', 'Tutup', { duration: 3000 });
                    throw err;
                })
            )
            .subscribe({
                next: (res) => {
                    this.loading = false;
                    this.filesToUpload = [];
                    this.snack.open('Activity berhasil disimpan', 'Tutup', { duration: 2500 });
                    this.router.navigate(['/activities']);
                },
                error: () => {
                    this.loading = false;
                }
            });
    }

    // convenience getters for template checks
    get title() { return this.form.get('title'); }
    get dateStart() { return this.form.get('dateStart'); }

    protected readonly document = document;
}
