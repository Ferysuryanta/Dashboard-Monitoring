import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import ProgramService from './program.service';
import { Subscription } from 'rxjs';
import { NumberFormatDirective } from 'src/app/shared/directives/number-format.directive';

@Component({
  selector: 'app-program-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, NumberFormatDirective],
  templateUrl: './program-form.component.html',
  styleUrls: ['./program-form.component.scss']
})
export class ProgramFormComponent implements OnInit, OnDestroy {
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

  private subs = new Subscription();

  // display strings for formatted numbers (thousand-sep)
  displayBudgetLocal = '0';
  displayBudgetSubsidy = '0';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.editingId = id;
      this.svc.getById(id).subscribe(p => {
        if (p) this.form.patchValue(p as any);
      });
    }

    // compute budgetTotal reactively when budgetLocal or budgetSubsidy change
    const s = this.form.valueChanges.subscribe(() => {
      const local = Number(this.form.get('budgetLocal')?.value) || 0;
      const subsidy = Number(this.form.get('budgetSubsidy')?.value) || 0;
      const total = local + subsidy;
      // update without emitting to avoid recursion
      this.form.get('budgetTotal')?.setValue(total, { emitEvent: false });
    });
    this.subs.add(s);

    // initialize display strings from controls
    this.displayBudgetLocal = this.formatNumber(this.form.get('budgetLocal')?.value || 0);
    this.displayBudgetSubsidy = this.formatNumber(this.form.get('budgetSubsidy')?.value || 0);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
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
    // include file metadata (if selected) - actual upload not implemented here
    if (this.selectedFile) {
      (payload as any).attachmentName = this.selectedFile.name;
      (payload as any).attachmentSize = this.selectedFile.size;
    }

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

  // --- number formatting helpers (display only, store numeric in form controls) ---
  formatNumber(n: number): string {
    if (n === null || n === undefined) return '0';
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  parseNumberString(s: string): number {
    if (!s) return 0;
    // remove non-digit characters (dots, commas, spaces)
    const cleaned = s.replace(/[^0-9-]/g, '');
    return Number(cleaned) || 0;
  }

  onNumberInput(field: 'budgetLocal' | 'budgetSubsidy', raw: string) {
    const num = this.parseNumberString(raw);
    this.form.get(field)?.setValue(num, { emitEvent: true });
    // show raw digits while typing
    if (field === 'budgetLocal') this.displayBudgetLocal = raw;
    else this.displayBudgetSubsidy = raw;
  }

  onNumberBlur(field: 'budgetLocal' | 'budgetSubsidy') {
    const v = Number(this.form.get(field)?.value) || 0;
    const formatted = this.formatNumber(v);
    if (field === 'budgetLocal') this.displayBudgetLocal = formatted;
    else this.displayBudgetSubsidy = formatted;
  }

  onNumberFocus(field: 'budgetLocal' | 'budgetSubsidy') {
    // show raw numeric value for editing
    const v = Number(this.form.get(field)?.value) || 0;
    if (field === 'budgetLocal') this.displayBudgetLocal = v.toString();
    else this.displayBudgetSubsidy = v.toString();
  }

  // --- custom file control ---
  triggerFileDialog() {
    const input = document.getElementById('fileUpload') as HTMLInputElement | null;
    if (input) input.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.selectedFile = file;
    else this.selectedFile = undefined;
  }

  removeFile() {
    this.selectedFile = undefined;
    const input = document.getElementById('fileUpload') as HTMLInputElement | null;
    if (input) input.value = '';
  }
}
