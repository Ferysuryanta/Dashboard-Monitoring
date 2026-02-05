import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProgramService } from './program.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-program-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: './program-list.component.html',
  styleUrls: ['./program-list.component.scss']
})
export class ProgramListComponent implements OnInit {
  private svc = inject(ProgramService);
  private router = inject(Router);

  data: any[] = [];
  grouped: any[] = [];
  pageBudgetTotal = 0;
  loading = false;
  page = 1;
  size = 5;
  total = 0;
  q = '';
  filter: any = { status: '', type: '', category: '' };
  categories: string[] = ['A - BIDANG UMUM & SEKRETARIAT', 'B - BIDANG PERSEKUTUAN', 'C - BIDANG KESAKSIAN', 'D - BIDANG PELAYANAN', 'E - BIDANG DANA & USAHA'];

  displayedColumns = ['no', 'title', 'place', 'purpose', 'targetPhysical', 'budgets', 'executor', 'scheduleText', 'notes'];

  ngOnInit(): void {
    this.reload();
  }

  // helper to use Math.min in template
  min(a: number, b: number) { return Math.min(a, b); }

  reload() {
    this.loading = true;
    this.svc.getPaged(this.page, this.size, this.q, this.filter.status, this.filter.type, this.filter.category)
      .subscribe(resp => {
        const body = resp.body || [];
        this.data = body as any[];
        const totalStr = resp.headers.get('X-Total-Count') || String(this.data.length);
        this.total = Number(totalStr);
        // use service grouping utility
        const res = this.svc.groupPrograms(this.data, this.categories, this.page, this.size);
        this.grouped = res.groups;
        this.pageBudgetTotal = res.pageBudgetTotal;
        this.loading = false;
      }, () => this.loading = false);
  }

  search() { this.page = 1; this.reload(); }

  nextPage() { if (this.page * this.size < this.total) { this.page++; this.reload(); } }
  prevPage() { if (this.page > 1) { this.page--; this.reload(); } }

  openCreate() { this.router.navigateByUrl('/app/programs/new'); }
  openDetail(row: any) { this.router.navigateByUrl('/app/programs/' + row.id); }

  exportTable() { this.svc.exportCsv(this.data, this.page, this.size); }

  printTable() { window.print(); }

  protected readonly Math = Math;
}
