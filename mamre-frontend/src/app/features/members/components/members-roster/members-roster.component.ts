import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {MemberService} from '../../../../core/services/member.service';
import {MemberDto} from '../../models/member.model';
import {SectorOption, SectorService} from 'src/app/core/services/sector.service';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-members-roster',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatIconModule, MatPaginatorModule],
  templateUrl: './members-roster.component.html',
  styleUrls: ['./members-roster.component.scss']
})
export class MembersRosterComponent implements OnInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  sectorId?: number;
  sectorName?: string;
  displayedMembers: MemberDto[] = [];
  loading = false;
  error?: string;

  sectors: SectorOption[] = [];
  selectedSectorId?: string; // keep string for select binding

  // pagination state
  pageSize = 10;
  pageIndex = 0;

  // server-side meta
  totalElements = 0;

  // sorting
  sortField?: string;
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(private route: ActivatedRoute, private router: Router, private svc: MemberService, private sectorSvc: SectorService) {}

  ngOnInit(): void {
    // load sectors for dropdown
    this.sectorSvc.getAll().subscribe(list => this.sectors = list || []);

    this.route.queryParamMap.subscribe(params => {
      const s = params.get('sectorId');
      const rawName = params.get('sectorName');
      // sanitize possible literal strings 'undefined' or 'null'
      this.sectorName = (rawName && rawName !== 'undefined' && rawName !== 'null') ? rawName : undefined;
      this.sectorId = s ? Number(s) : undefined;
      if (this.sectorId != null && Number.isNaN(this.sectorId)) this.sectorId = undefined;

      // set select value as string
      this.selectedSectorId = this.sectorId != null ? String(this.sectorId) : undefined;

      this.loadPreview();
    });
  }

  backToMembers() {
    // navigate back to members list (keep query params minimal)
    this.router.navigate(['/app/members']);
  }

  onSectorChange(sectorIdStr?: string) {
    if (!sectorIdStr) {
      // clear filter
      this.selectedSectorId = undefined;
      this.sectorId = undefined;
      this.sectorName = undefined;
      // update URL to remove params
      this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
      this.pageIndex = 0;
      this.loadPreview();
      return;
    }
    this.selectedSectorId = sectorIdStr;
    const sid = Number(sectorIdStr);
    this.sectorId = Number.isNaN(sid) ? undefined : sid;
    // lookup sector name for nicer URL and title
    const opt = this.sectors.find(x => String(x.id) === sectorIdStr);
    this.sectorName = opt ? opt.name : undefined;
    this.router.navigate([], { relativeTo: this.route, queryParams: { sectorId: this.sectorId, sectorName: this.sectorName }, replaceUrl: true });
    this.pageIndex = 0;
    this.loadPreview();
  }

  loadPreview() {
    this.loading = true;
    this.error = undefined;
    const sortParam = this.sortField ? `${this.sortField},${this.sortDir}` : undefined;
    this.svc.getPaged(this.pageIndex, this.pageSize, sortParam, undefined, undefined, this.sectorId).subscribe({
      next: res => {
        // trust backend computed flags; normalize to booleans for template
        this.displayedMembers = (res.content || []).map((m: MemberDto) => ({
          ...m,
          mamre: !!m.mamre,
          saitun: !!m.saitun
        } as MemberDto));
        this.totalElements = res.totalElements || (res.content ? res.content.length : 0);
        this.loading = false;
      },
      error: err => { this.error = err?.message || 'Gagal memuat roster'; this.loading = false; }
    });
  }

  // server-side paging used; displayedMembers is populated directly from API

  onPageEvent(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.loadPreview();
    // scroll table into view
    setTimeout(() => {
      const el = document.querySelector('.roster-table');
      if (el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth' });
    }, 10);
  }

  sortToggle(field: string) {
    if (this.sortField === field) {
      // toggle direction
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    this.pageIndex = 0;
    this.loadPreview();
  }

  downloadCsv() {
    this.svc.downloadExport(this.sectorId).subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = this.sectorName ? this.sectorName.replace(/\s+/g, '_') : (this.sectorId ? `sector_${this.sectorId}` : 'export');
      a.download = `roster_${safeName}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }, err => {
      this.error = err?.message || 'Gagal mengunduh file';
    });
  }

  print() {
    window.print();
  }
}
