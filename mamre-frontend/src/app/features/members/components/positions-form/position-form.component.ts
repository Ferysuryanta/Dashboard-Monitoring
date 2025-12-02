import { Component, Inject, OnInit } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PositionService } from 'src/app/core/services/position.service';
import { take } from 'rxjs/operators';
import {MatError, MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {NgIf} from "@angular/common";

@Component({
    selector: 'app-position-form',
    templateUrl: './position-form.component.html',
    imports: [
        MatFormField,
        MatDialogTitle,
        ReactiveFormsModule,
        MatLabel,
        MatButton,
        MatIcon,
        MatError,
        MatInput,
        MatProgressSpinner,
        NgIf,
    ],
    styleUrls: ['./position-form.component.scss']
})
export class PositionFormComponent implements OnInit {
    form = this.fb.group({
        name: ['', Validators.required],
        description: ['']
    });

    loading = false;
    saving = false;
    entityId: string | number | null = null;

    constructor(
        private fb: FormBuilder,
        private svc: PositionService,
        private dialogRef: MatDialogRef<PositionFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        if (!this.data) return;

        if (typeof this.data === 'string' || typeof this.data === 'number') {
            this.entityId = this.data;
            this.loadById(this.entityId);
            return;
        }

        if (this.data && (this.data.name || this.data.description || this.data.id)) {
            if (this.data.id) this.entityId = this.data.id;
            this.form.patchValue({
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
                    this.snackBar.open('Data jabatan tidak ditemukan', 'Tutup', { duration: 3000, panelClass: ['snack-error'] });
                    this.dialogRef.close(false);
                    return;
                }
                this.entityId = res.id;
                this.form.patchValue({ name: res.name ?? '', description: res.description ?? '' });
            },
            error: (err) => {
                this.loading = false;
                console.error('Error loading position', err);
                this.snackBar.open('Gagal memuat data jabatan', 'Tutup', { duration: 4000, panelClass: ['snack-error'] });
                this.dialogRef.close(false);
            }
        });
    }

    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.snackBar.open('Lengkapi form sebelum menyimpan', 'Tutup', { duration: 2500, panelClass: ['snack-error'] });
            return;
        }

        this.saving = true;
        const payload = this.form.value;
        const op$ = this.entityId ? this.svc.update(this.entityId, payload) : this.svc.create(payload);

        op$.pipe(take(1)).subscribe({
            next: () => {
                this.saving = false;
                const verb = this.entityId ? 'diperbarui' : 'disimpan';
                this.snackBar.open(`Jabatan berhasil ${verb}`, 'Tutup', { duration: 3000, panelClass: ['snack-success'] });
                this.dialogRef.close(true);
            },
            error: (err) => {
                this.saving = false;
                console.error('Error saving position', err);
                const msg = (err && err.error && (err.error.message || err.error)) || (err && err.message) || 'Gagal menyimpan jabatan';
                this.snackBar.open(String(msg), 'Tutup', { duration: 6000, panelClass: ['snack-error'] });
            }
        });
    }

    cancel() {
        this.dialogRef.close(false);
    }
}
