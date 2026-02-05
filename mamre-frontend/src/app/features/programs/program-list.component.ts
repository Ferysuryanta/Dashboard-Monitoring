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
import ProgramService from './program.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

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
  page = 0; // 0-based paging
  size = 5;
  total = 0;
  q = '';
  filter: any = { status: '', type: '', category: '' };
  categories: string[] = ['A - BIDANG UMUM & SEKRETARIAT', 'B - BIDANG PERSEKUTUAN', 'C - BIDANG KESAKSIAN', 'D - BIDANG PELAYANAN', 'E - BIDANG DANA & USAHA'];

  // new: load all mode
  loadAll = false;

  displayedColumns = ['no', 'title', 'place', 'purpose', 'targetPhysical', 'budgets', 'executor', 'scheduleText', 'notes'];

  // track current subscription so we can cancel when switching mode
  private currentReq?: Subscription;

  ngOnInit(): void {
    this.reload();
  }

  // helper to use Math.min in template
  min(a: number, b: number) { return Math.min(a, b); }

  reload() {
    // cancel any in-flight request
    if (this.currentReq) {
      console.log('ProgramList: cancelling previous request');
      this.currentReq.unsubscribe();
      this.currentReq = undefined;
    }

    this.loading = true;
    if (this.loadAll) {
      console.log('ProgramList: reload -> loadAll branch (calling getAllAggregate)');
      // use getAllAggregate to fetch all pages via paged API
      this.currentReq = this.svc.getAllAggregate(this.q, this.filter.status, this.filter.type, this.filter.category, 100).subscribe({
        next: res => {
          const arr = Array.isArray(res) ? res : (res as any).content || [];
          this.data = arr as any[];
          this.total = this.data.length;
          const resGroup = this.svc.groupPrograms(this.data, this.categories, this.page, this.size);
          this.grouped = resGroup.groups;
          this.pageBudgetTotal = resGroup.pageBudgetTotal;
          this.loading = false;
          this.currentReq = undefined;
        },
        error: err => {
          console.error('ProgramList: getAllAggregate error', err);
          this.loading = false;
          this.currentReq = undefined;
        }
      });
      return;
    }

    console.log('ProgramList: reload -> paged branch (calling getPaged)', { page: this.page, size: this.size, q: this.q, filter: this.filter });
    this.currentReq = this.svc.getPaged(this.page, this.size, this.q, this.filter.status, this.filter.type, this.filter.category).subscribe({
      next: resp => {
        const body = resp.body || [];
        const totalStr = resp.headers.get('X-Total-Count') || String(body.length);
        const totalNum = Number(totalStr);

        // if paged returned empty body but totalElements > 0, fallback to fetching all
        if ((body.length === 0 || !body) && totalNum > 0) {
          console.warn('ProgramList: paged response empty but X-Total-Count > 0, falling back to getAllAggregate');
          // cancel current subscription just in case
          if (this.currentReq) { this.currentReq.unsubscribe(); this.currentReq = undefined; }
          this.currentReq = this.svc.getAllAggregate(this.q, this.filter.status, this.filter.type, this.filter.category, 100).subscribe({
            next: all => {
              this.data = Array.isArray(all) ? all : (all as any).content || [];
              this.total = this.data.length;
              const res = this.svc.groupPrograms(this.data, this.categories, this.page, this.size);
              this.grouped = res.groups;
              this.pageBudgetTotal = res.pageBudgetTotal;
              this.loading = false;
              this.currentReq = undefined;
            },
            error: err => {
              console.error('ProgramList: fallback getAllAggregate error', err);
              this.loading = false;
              this.currentReq = undefined;
            }
          });
          return;
        }

        this.data = body as any[];
        this.total = totalNum;
        // use service grouping utility
        const res = this.svc.groupPrograms(this.data, this.categories, this.page, this.size);
        this.grouped = res.groups;
        this.pageBudgetTotal = res.pageBudgetTotal;
        this.loading = false;
        this.currentReq = undefined;
      },
      error: err => {
        console.error('ProgramList: getPaged error', err);
        this.loading = false;
        this.currentReq = undefined;
      }
    });
  }

  // new handler for filter changes - respects loadAll flag and avoids race
  onFilterChange() {
    this.page = 0;
    // If loadAll is active, call reload which will use getAllNoPaging; otherwise do paged reload
    this.reload();
  }

  // load all mode control
  toggleLoadAll() {
    this.loadAll = !this.loadAll;
    // reset paging when switching modes
    if (!this.loadAll) {
      this.page = 0;
    }
    console.log('ProgramList: toggleLoadAll ->', this.loadAll);
    this.reload();
  }

  search() { this.page = 0; this.reload(); }

  nextPage() { if ((this.page + 1) * this.size < this.total) { this.page++; this.reload(); } }
  prevPage() { if (this.page > 0) { this.page--; this.reload(); } }

  openCreate() { this.router.navigateByUrl('/app/programs/new'); }
  openDetail(row: any) { this.router.navigateByUrl('/app/programs/' + row.id); }

  exportTable() { this.svc.exportCsv(this.data, this.page, this.size); }

  printTable() { window.print(); }

  protected readonly Math = Math;
}
