import { Component, OnInit, inject, ViewChild } from '@angular/core';
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
import { MatSelect } from '@angular/material/select';

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

  @ViewChild('categorySelectRef', { read: MatSelect, static: false }) categorySelect?: MatSelect;

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

  // Dynamic sizing for category select overlay
  onCategoryOpen() {
    // wait a tick for overlay to render
    setTimeout(() => {
      try {
        const overlayRoot = document.querySelector('.cdk-overlay-container');
        if (!overlayRoot) return;
        const panel = overlayRoot.querySelector('.category-panel');
        if (!panel) return;

        // find trigger element width
        // best-effort: use public panelId to find trigger via aria-owns; fallback to .mat-select-trigger
        let triggerEl: HTMLElement | null = null;
        const panelId = (this.categorySelect as any)?.panelId as string | undefined;
        if (panelId) {
          triggerEl = document.querySelector(`[aria-owns="${panelId}"]`) as HTMLElement | null;
        }
        if (!triggerEl) {
          // fallback: try to find a visible mat-select-trigger inside the component's controls
          triggerEl = document.querySelector('.mat-select-trigger') as HTMLElement | null;
        }
        const triggerRect = triggerEl ? triggerEl.getBoundingClientRect() : null;
        const triggerWidth = triggerRect ? Math.round(triggerRect.width) : 0;

        // measure widest option text inside panel
        let maxTextWidth = 0;
        const optionTexts = panel.querySelectorAll('.mat-option-text');
        optionTexts.forEach((el) => {
          const text = (el as HTMLElement).innerText || '';
          // temporary canvas measure for text width
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // mirror font used in options
            ctx.font = window.getComputedStyle(el as Element).font || '13px Arial';
            const w = ctx.measureText(text).width;
            if (w > maxTextWidth) maxTextWidth = w;
          }
        });

        const padding = 48; // account for checkbox, icon, padding
        const desired = Math.ceil(Math.max(triggerWidth, maxTextWidth + padding, 320));
        const maxAllowed = Math.min(window.innerWidth - 32, 900);
        const finalWidth = Math.min(desired, maxAllowed);

        (panel as HTMLElement).style.width = finalWidth + 'px';
      } catch (e) {
        // noop
      }
    }, 50);
  }

  onCategoryClose() {
    // remove inline width to let default styles apply
    const overlayRoot = document.querySelector('.cdk-overlay-container');
    if (!overlayRoot) return;
    const panel = overlayRoot.querySelector('.category-panel');
    if (!panel) return;
    (panel as HTMLElement).style.width = '';
  }
}
