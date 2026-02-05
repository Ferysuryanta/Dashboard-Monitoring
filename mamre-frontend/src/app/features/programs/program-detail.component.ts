import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ProgramService } from './program.service';
import { Program } from './program.model';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatDividerModule, MatIconModule, MatListModule],
  templateUrl: './program-detail.component.html',
  styleUrls: ['./program-detail.component.scss']
})
export class ProgramDetailComponent implements OnInit {
  private svc = inject(ProgramService);
  private route = inject(ActivatedRoute);

  program: Program | null = null;
  loading = true;
  docs: any[] = [];
  selectedFile?: File;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.svc.getById(id).subscribe(res => { this.program = res; this.loading = false; this.loadDocs(); }, () => this.loading = false);
    } else this.loading = false;
  }

  loadDocs() {
    if (!this.program?.id) return;
    this.svc.listDocuments(this.program.id).subscribe(d => this.docs = d || []);
  }

  selectFile(ev: any) { this.selectedFile = ev.target.files?.[0]; }

  upload() {
    if (!this.program?.id || !this.selectedFile) return;
    this.svc.uploadDocument(this.program.id, this.selectedFile).subscribe(() => { this.selectedFile = undefined; this.loadDocs(); });
  }

  download(docId: number) {
    const url = this.svc.downloadDocument(docId);
    window.open(url, '_blank');
  }
}
