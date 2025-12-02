import { Component, Inject, OnInit } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SectorService, SectorOption } from 'src/app/core/services/sector.service';
import { take } from 'rxjs/operators';
import {MatError, MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {NgIf} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";

@Component({
    selector: 'app-sector-form',
    templateUrl: './sector-form.component.html',
    imports: [
        ReactiveFormsModule,
        MatDialogTitle,
        MatProgressSpinner,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        NgIf,
        MatButton,
        MatIcon
    ],
    styleUrls: ['./sector-form.component.scss']
})
export class SectorFormComponent implements OnInit {
    form = this.fb.group({
        code: [''],
        name: ['', Validators.required],
        description: ['']
    });

    loading = false;   // saat memuat entity untuk edit
    saving = false;    // saat menyimpan create/update
    entityId: string | number | null = null;

    constructor(
        private fb: FormBuilder,
        private svc: SectorService,
        private dialogRef: MatDialogRef<SectorFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        // data can be: null | {id, code, name, description} | id (string|number)
        if (!this.data) return;

        // if data is primitive id (string/number)
        if (typeof this.data === 'string' || typeof this.data === 'number') {
            this.entityId = this.data;
            this.loadById(this.entityId);
            return;
        }

        // if data is object and already contains fields, patch directly
        if (this.data && (this.data.name || this.data.code || this.data.description || this.data.id)) {
            // Accept both full entity or an object with id property
            if (this.data.id) this.entityId = this.data.id;
            this.form.patchValue({
                code: this.data.code ?? '',
                name: this.data.name ?? '',
                description: this.data.description ?? ''
            });
        }
    }

    private loadById(id: string | number) {
        this.loading = true;
        this.svc.getById(id).pipe(take(1)).subscribe({
            next: (res) => {
                this.loading = false;
                if (!res) {
                    // not found — close dialog or leave empty (here we close)
                    console.warn(`Sector with id=${id} not found`);
                    this.snackBar.open('Data sektor tidak ditemukan', 'Tutup', { duration: 3000, panelClass: ['snack-error'] });
                    this.dialogRef.close(false);
                    return;
                }
                this.entityId = res.id;
                this.form.patchValue({
                    code: (res as any).code ?? '',
                    name: res.name ?? '',
                    description: res.description ?? ''
                });
            },
            error: (err) => {
                this.loading = false;
                console.error('Error loading sector', err);
                this.snackBar.open('Gagal memuat data sektor', 'Tutup', { duration: 4000, panelClass: ['snack-error'] });
                this.dialogRef.close(false);
            }
        });
    }

    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.snackBar.open('Mohon lengkapi form sebelum menyimpan', 'Tutup', { duration: 2500, panelClass: ['snack-error'] });
            return;
        }

        this.saving = true;
        const payload = this.form.value;

        const op$ = this.entityId
            ? this.svc.update(this.entityId, payload)
            : this.svc.create(payload);

        op$.pipe(take(1)).subscribe({
            next: (resp) => {
                this.saving = false;
                const verb = this.entityId ? 'diperbarui' : 'disimpan';
                this.snackBar.open(`Sektor berhasil ${verb}`, 'Tutup', { duration: 3000, panelClass: ['snack-success'] });
                // notify caller that save succeeded (wrapper will refresh)
                this.dialogRef.close(true);
            },
            error: (err) => {
                this.saving = false;
                console.error('Error saving sector', err);

                // try to show useful message from backend if available
                const msg =
                    (err && err.error && (err.error.message || err.error.error || err.error)) ||
                    (err && err.message) ||
                    'Gagal menyimpan sektor. Periksa konsol untuk detail.';

                this.snackBar.open(String(msg), 'Tutup', { duration: 6000, panelClass: ['snack-error'] });
                // keep dialog open so user can retry; you can also close if you prefer
            }
        });
    }

    cancel() {
        this.dialogRef.close(false);
    }
}
