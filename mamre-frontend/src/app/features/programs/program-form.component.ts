import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import ProgramService from './program.service';

@Component({
  selector: 'app-program-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule],
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
    status: ['PLANNED'],
    place: [''],
    purpose: [''],
    targetPhysical: [0],
    budgetLocal: [0],
    budgetSubsidy: [0],
    budgetTotal: [0],
    executor: [''],
    scheduleText: [''],
    notes: [''],
    category: ['Bidang Umum & Sekretariat']
  });

  editingId?: number;
  selectedFile?: File; // added to match template
  saving = false; // flag for UI
  uploading = false; // placeholder if implement upload

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
    this.saving = true;
    const value = this.form.value as any;
    const payload = {
      title: value.title,
      description: value.description,
      type: value.type,
      status: value.status,
      place: value.place,
      purpose: value.purpose,
      targetPhysical: value.targetPhysical,
      budgetLocal: value.budgetLocal,
      budgetSubsidy: value.budgetSubsidy,
      budgetTotal: value.budgetTotal,
      executor: value.executor,
      scheduleText: value.scheduleText,
      notes: value.notes,
      category: value.category
    };

    const done = () => { this.saving = false; this.router.navigateByUrl('/app/programs'); };

    if (this.editingId) {
      this.svc.update(this.editingId, payload as any).subscribe(() => done(), () => { this.saving = false; });
    } else {
      this.svc.create(payload as any).subscribe(() => done(), () => { this.saving = false; });
    }
  }

  cancel(): void {
    this.router.navigateByUrl('/app/programs');
  }
}
