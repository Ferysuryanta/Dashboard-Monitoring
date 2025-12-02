import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PositionService, PositionOption } from 'src/app/core/services/position.service';
import {PositionFormComponent} from "../positions-form/position-form.component";
import {MatCard} from "@angular/material/card";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
    selector: 'app-position-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatPaginatorModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatCard,
        MatTooltip
    ],
    templateUrl: './position-list.component.html',
    styleUrls: ['./position-list.component.scss']
})
export class PositionListComponent implements OnInit {
    private svc = inject(PositionService);
    private dialog = inject(MatDialog);
    private snack = inject(MatSnackBar);

    displayedColumns = ['name', 'description', 'actions'];
    data: PositionOption[] = [];
    loading = false;

    // paging state
    pageIndex = 0;
    pageSize = 10;
    length = 0;

    ngOnInit(): void {
        this.loadPage();
    }

    loadPage(page = 0, size = 10) {
        this.loading = true;
        this.svc.getPaged(page, size).subscribe({
            next: (res: any) => {
                this.data = (res?.content ?? []).map((r: any) => ({ id: String(r.id), name: r.name, description: r.description }));
                this.length = res?.page?.totalElements ?? res?.totalElements ?? this.data.length;
                this.pageIndex = res?.page?.number ?? res?.number ?? page;
                this.pageSize = res?.page?.size ?? res?.size ?? size;
                this.loading = false;
            },
            error: (err) => {
                console.error('Position loadPage error', err);
                this.loading = false;
                this.snack.open('Gagal memuat daftar jabatan', 'Tutup', { duration: 4000, panelClass: ['snack-error'] });
            }
        });
    }

    onPageChange(ev: PageEvent) {
        this.loadPage(ev.pageIndex, ev.pageSize);
    }

    openAdd() {
        // Contoh di position-list.component.ts (openAdd/openEdit)
        const dialogRef = this.dialog.open(PositionFormComponent, {
            width: '640px',
            maxHeight: '80vh',
            disableClose: true,
            data: null
        });
    }

    openEdit(row: PositionOption) {
        // fetch-first variant could be used, but form handles id/object
        const dialogRef = this.dialog.open(PositionFormComponent, {
            width: '640px',
            maxHeight: '80vh',
            disableClose: true,
            data: null
        });

    }

    remove(row: PositionOption) {
        if (!confirm(`Hapus jabatan "${row.name}"?`)) return;
        this.svc.delete(row.id).subscribe({
            next: () => {
                this.snack.open('Jabatan berhasil dihapus', 'Tutup', { duration: 3000, panelClass: ['snack-success'] });
                // reload current page (if last item on page removed, you may want to adjust pageIndex)
                this.loadPage(this.pageIndex, this.pageSize);
            },
            error: (err) => {
                console.error('Delete position error', err);
                this.snack.open('Gagal menghapus jabatan', 'Tutup', { duration: 4000, panelClass: ['snack-error'] });
            }
        });
    }
}
