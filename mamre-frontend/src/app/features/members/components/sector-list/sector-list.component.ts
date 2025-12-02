import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SectorService, SectorOption } from 'src/app/core/services/sector.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {SectorFormComponent} from "../sector-form/sector-form.component";
import {MatCard} from "@angular/material/card";

@Component({
    selector: 'app-sector-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatPaginatorModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatCard
    ],
    templateUrl: './sector-list.component.html',
    styleUrls: ['./sector-list.component.scss']
})
export class SectorListComponent implements OnInit {
    private svc = inject(SectorService);
    private dialog = inject(MatDialog);

    displayedColumns = ['code', 'name', 'description', 'actions'];
    data: SectorOption[] = [];
    loading = false;

    // paginator state (simple)
    pageIndex = 0;
    pageSize = 10;
    length = 0;

    ngOnInit(): void {
        this.loadPage();
    }

    loadPage(page = 0, size = 10) {
        this.loading = true;
        this.svc.getPaged(page, size).subscribe((res: any) => {
            this.data = (res?.content ?? []).map((r: any) => ({ id: String(r.id), code: r.code, name: r.name, description: r.description }));
            // spring page fields may be in res.page or top-level like totalElements/totalPages
            this.length = res?.page?.totalElements ?? res?.totalElements ?? this.data.length;
            this.pageIndex = res?.page?.number ?? res?.number ?? page;
            this.pageSize = res?.page?.size ?? res?.size ?? size;
            this.loading = false;
        }, err => {
            console.error('loadPage error', err);
            this.loading = false;
        });
    }

    onPageChange(event: any) {
        this.loadPage(event.pageIndex, event.pageSize);
    }

    openAdd() {
        const ref = this.dialog.open(SectorFormComponent, { width: '560px', data: null });
        ref.afterClosed().subscribe(res => { if (res) this.loadPage(this.pageIndex, this.pageSize); });
    }

    openEdit(row: SectorOption) {
        const ref = this.dialog.open(SectorFormComponent, { width: '560px', data: row });
        ref.afterClosed().subscribe(res => { if (res) this.loadPage(this.pageIndex, this.pageSize); });
    }

    remove(row: SectorOption) {
        if (!confirm(`Hapus sektor "${row.name}"?`)) return;
        this.svc.delete(row.id).subscribe(() => this.loadPage(this.pageIndex, this.pageSize), e => console.error(e));
    }
}
