import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MemberService } from '../../../../core/services/member.service';
import { MemberDto } from '../../models/member.model';
import { SectorService, SectorOption } from 'src/app/core/services/sector.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-members-roster',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatIconModule],
  templateUrl: './members-roster.component.html',
  styleUrls: ['./members-roster.component.scss']
})
export class MembersRosterComponent implements OnInit {
  sectorId?: number;
  sectorName?: string;
  members: MemberDto[] = [];
  loading = false;
  error?: string;

  sectors: SectorOption[] = [];
  selectedSectorId?: string; // keep string for select binding

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

  onSectorChange(sectorIdStr?: string) {
    if (!sectorIdStr) {
      // clear filter
      this.selectedSectorId = undefined;
      this.sectorId = undefined;
      this.sectorName = undefined;
      // update URL to remove params
      this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
      this.loadPreview();
      return;
    }
    this.selectedSectorId = sectorIdStr;
    const sid = Number(sectorIdStr);
    this.sectorId = Number.isNaN(sid) ? undefined : sid;
    this.router.navigate([], { relativeTo: this.route, queryParams: { sectorId: this.sectorId, sectorName: this.sectorName }, replaceUrl: true });
    this.loadPreview();
  }

  loadPreview() {
    this.loading = true;
    this.error = undefined;
    // request reasonably large page for preview (500)
    this.svc.getPaged(0, 500, undefined, undefined, undefined, this.sectorId).subscribe({
      next: res => {
        this.members = res.content || [];
        this.loading = false;
      },
      error: err => { this.error = err?.message || 'Gagal memuat roster'; this.loading = false; }
    });
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
