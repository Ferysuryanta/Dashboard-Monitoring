import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProgramService } from './program.service';
import { Program } from './program.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-program-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatListModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './program-list.component.html',
  styleUrls: ['./program-list.component.scss']
})
export class ProgramListComponent implements OnInit {
  private svc = inject(ProgramService);
  protected router = inject(Router);

  programs: Program[] = [];
  loading = true;
  // pagination/search
  page = 0;
  size = 10;
  total = 0;
  q = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.svc.getPaged(this.page, this.size, this.q).subscribe((resp: any) => {
      const headers = resp.headers;
      this.total = Number(headers.get('X-Total-Count') || 0);
      this.programs = resp.body || [];
      this.loading = false;
    }, () => this.loading = false);
  }

  open(p: Program) {
    if (p.id) this.router.navigateByUrl('/app/programs/' + p.id);
  }

  create() {
    this.router.navigateByUrl('/app/programs/new');
  }

  search(term: string) {
    this.q = term;
    this.page = 0;
    this.load();
  }

  nextPage() { if ((this.page +1) * this.size < this.total) { this.page++; this.load(); } }
  prevPage() { if (this.page > 0) { this.page--; this.load(); } }

  protected readonly Math = Math;

  trackById(_idx: number, item: Program) { return item.id; }
}
