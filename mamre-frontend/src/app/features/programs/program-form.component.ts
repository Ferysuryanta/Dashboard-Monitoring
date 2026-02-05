import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProgramService } from './program.service';

@Component({
  selector: 'app-program-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './program-form.component.html',
  styleUrls: ['./program-form.component.scss']
})
export class ProgramFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProgramService);
  protected router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    type: ['Kegiatan'],
    status: ['PLANNED']
  });

  editingId?: number;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.editingId = id;
      this.svc.getById(id).subscribe(p => {
        if (p) this.form.patchValue(p as any);
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.value as any;
    const payload = { title: value.title, description: value.description, type: value.type, status: value.status } as import('./program.model').Program;
    if (this.editingId) {
      this.svc.update(this.editingId, payload).subscribe(() => this.router.navigateByUrl('/app/programs'));
    } else {
      this.svc.create(payload).subscribe(() => this.router.navigateByUrl('/app/programs'));
    }
  }

  cancel(): void {
    this.router.navigateByUrl('/app/programs');
  }
}
