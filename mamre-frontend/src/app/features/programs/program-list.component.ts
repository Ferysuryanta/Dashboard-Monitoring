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
import { AutoWidthSelectDirective } from 'src/app/shared/directives/auto-width-select.directive';

@Component({
  selector: 'app-program-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule, AutoWidthSelectDirective],
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
  total = 0;
  q = '';
  filter: any = { status: '', type: '', category: '' };
  categories: string[] = ['A - BIDANG UMUM & SEKRETARIAT', 'B - BIDANG PERSEKUTUAN', 'C - BIDANG KESAKSIAN', 'D - BIDANG PELAYANAN', 'E - BIDANG DANA & USAHA'];

  // track current subscription so we can cancel when switching mode
  private currentReq?: Subscription;

  ngOnInit(): void {
    this.reload();
  }

  reload() {
    // cancel any in-flight request
    if (this.currentReq) {
      console.log('ProgramList: cancelling previous request');
      this.currentReq.unsubscribe();
      this.currentReq = undefined;
    }

    this.loading = true;
    this.currentReq = this.svc.getAllAggregate(this.q, this.filter.status, this.filter.type, this.filter.category, 100).subscribe({
      next: all => {
        this.data = Array.isArray(all) ? all : (all as any).content || [];
        this.total = this.data.length;
        const res = this.svc.groupPrograms(this.data, this.categories);
        this.grouped = res.groups;
        this.pageBudgetTotal = res.pageBudgetTotal;
        this.loading = false;
        this.currentReq = undefined;
      },
      error: err => {
        console.error('ProgramList: getAllAggregate error (temporary)', err);
        this.loading = false;
        this.currentReq = undefined;
      }
    });
  }

  // handler for filter changes
  onFilterChange() {
    this.reload();
  }

  search() { this.reload(); }

  openCreate() { this.router.navigateByUrl('/app/programs/new'); }

  exportTable() { this.svc.exportCsv(this.data); }

  printTable() { window.print(); }

  // directive handles dynamic sizing for category select overlay
}
