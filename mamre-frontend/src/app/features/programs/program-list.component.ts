import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
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
export class ProgramListComponent implements OnInit, AfterViewInit, OnDestroy {
  private svc = inject(ProgramService);
  private router = inject(Router);

  @ViewChild('summaryBar') private summaryBarRef?: ElementRef<HTMLDivElement>;
  @ViewChild('headRow') private headRowRef?: ElementRef<HTMLTableRowElement>;
  @ViewChild('subHeadRow') private subHeadRowRef?: ElementRef<HTMLTableRowElement>;

  data: any[] = [];
  grouped: any[] = [];
  pageBudgetTotal = 0;
  loading = false;
  total = 0;
  q = '';
  filter: any = { status: '', type: '', category: '' };
  categories: string[] = ['A - BIDANG UMUM & SEKRETARIAT', 'B - BIDANG PERSEKUTUAN', 'C - BIDANG KESAKSIAN', 'D - BIDANG PELAYANAN', 'E - BIDANG DANA & USAHA'];
  readonly statusOptions = [
    { value: '', label: 'Semua status' },
    { value: 'PLANNED', label: 'Direncanakan' },
    { value: 'DONE', label: 'Selesai' }
  ];
  readonly typeOptions = [
    { value: '', label: 'Semua tipe' },
    { value: 'Kegiatan', label: 'Kegiatan' },
    { value: 'Program', label: 'Program' }
  ];
  readonly mobileMetaFields = [
    { label: 'Tempat', key: 'place' },
    { label: 'Pelaksana', key: 'executor' },
    { label: 'Jadwal', key: 'scheduleText' },
    { label: 'Target fisik', key: 'targetPhysical' },
    { label: 'Keterangan', key: 'notes' }
  ];

  // track current subscription so we can cancel when switching mode
  private currentReq?: Subscription;
  stickyStyles: Record<string, string> = {
    '--pl-sticky-summary': '0px',
    '--pl-sticky-head': '53px',
    '--pl-sticky-subhead': '95px',
    '--pl-sticky-group': '137px'
  };
  private stickySyncHandle: number | null = null;

  ngOnInit(): void {
    this.reload();
  }

  ngAfterViewInit(): void {
    this.scheduleStickySync();
  }

  ngOnDestroy(): void {
    if (this.currentReq) {
      this.currentReq.unsubscribe();
      this.currentReq = undefined;
    }

    if (this.stickySyncHandle !== null) {
      window.cancelAnimationFrame(this.stickySyncHandle);
      this.stickySyncHandle = null;
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.scheduleStickySync();
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
        this.scheduleStickySync();
      },
      error: err => {
        console.error('ProgramList: getAllAggregate error (temporary)', err);
        this.loading = false;
        this.currentReq = undefined;
        this.scheduleStickySync();
      }
    });
  }

  private scheduleStickySync(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.stickySyncHandle !== null) {
      window.cancelAnimationFrame(this.stickySyncHandle);
    }

    this.stickySyncHandle = window.requestAnimationFrame(() => {
      this.stickySyncHandle = window.requestAnimationFrame(() => {
        this.syncStickyOffsets();
        this.stickySyncHandle = null;
      });
    });
  }

  private syncStickyOffsets(): void {
    const summaryHeight = this.summaryBarRef?.nativeElement.getBoundingClientRect().height ?? 0;
    const headHeight = this.headRowRef?.nativeElement.getBoundingClientRect().height ?? 0;
    const subHeadHeight = this.subHeadRowRef?.nativeElement.getBoundingClientRect().height ?? 0;

    this.stickyStyles = {
      '--pl-sticky-summary': '0px',
      '--pl-sticky-head': `${Math.ceil(summaryHeight)}px`,
      '--pl-sticky-subhead': `${Math.ceil(summaryHeight + headHeight)}px`,
      '--pl-sticky-group': `${Math.ceil(summaryHeight + headHeight + subHeadHeight)}px`
    };
  }

  // handler for filter changes
  onFilterChange() {
    this.reload();
  }

  clearFilters() {
    this.q = '';
    this.filter = { status: '', type: '', category: '' };
    this.reload();
  }

  get activeFilterCount(): number {
    return [this.q, this.filter.status, this.filter.type, this.filter.category].filter(value => !!value).length;
  }

  get completedCount(): number {
    return this.data.filter(item => item.status === 'DONE').length;
  }

  get plannedCount(): number {
    return this.data.filter(item => item.status === 'PLANNED').length;
  }

  get totalGroupsWithItems(): number {
    return this.grouped.filter(group => Array.isArray(group.items) && group.items.length > 0).length;
  }

  get hasData(): boolean {
    return Array.isArray(this.grouped) && this.grouped.some(group => group.items?.length);
  }

  getCategoryLabel(category: string | null | undefined): string {
    return category?.trim() || 'Tanpa bidang';
  }

  getStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'DONE':
        return 'Selesai';
      case 'PLANNED':
        return 'Direncanakan';
      default:
        return status?.trim() || '-';
    }
  }

  getDisplayValue(item: any, key: string): string {
    const value = item?.[key];
    if (value === null || value === undefined || value === '') return '-';
    if (key === 'targetPhysical') return String(value);
    return String(value);
  }

  trackByGroup = (_: number, group: any) => group.category;
  trackByProgram = (_: number, item: any) => item.id ?? `${item.title}-${item.scheduleText}-${item.place}`;
  trackByMetaField = (_: number, field: { label: string; key: string }) => field.key;

  search() { this.reload(); }

  openCreate() { this.router.navigateByUrl('/app/programs/new'); }

  exportTable() { this.svc.exportCsv(this.data); }

  printTable() { window.print(); }

  // directive handles dynamic sizing for category select overlay
}
