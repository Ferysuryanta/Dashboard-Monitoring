import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { MemberService } from '../../../../core/services/member.service';
import { SectorService, SectorOption } from '../../../../core/services/sector.service';
import { PositionService, PositionOption } from '../../../../core/services/position.service';
import { MemberDto } from '../../models/member.model';
import { formatToLocalDateString, parseIsoLocalDate } from '../../../../core/utils/date-utils';

@Component({
    selector: 'app-member-form',
    standalone: true,
    imports: [
        CommonModule, RouterModule, ReactiveFormsModule,
        MatFormFieldModule, MatInputModule, MatSelectModule,
        MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule,
        MatDatepickerModule, MatNativeDateModule
    ],
    templateUrl: './member-form.component.html',
    styleUrls: ['./member-form.component.scss']
})
export class MemberFormComponent implements OnInit {
     form!: FormGroup;
     loading = false;
     saving = false;
     id?: string;
     sectors: SectorOption[] = [];
     positions: PositionOption[] = [];
     statuses = ['ACTIVE', 'INACTIVE', 'PENDING'];

    // helper: normalize various gender representations to backend-accepted tokens
    private normalizeGender(val: any): string | undefined {
        if (!val && val !== '') return undefined;
        const s = String(val).trim().toLowerCase();
        if (!s) return '';
        if (['male', 'm', 'laki-laki', 'laki laki', 'pria'].includes(s)) return 'MALE';
        if (['female', 'f', 'perempuan', 'wanita'].includes(s)) return 'FEMALE';
        // if already one of expected tokens, return uppercase
        if (['male', 'female', 'pria', 'wanita', 'm', 'f'].includes(s)) return s.toUpperCase();
        // unknown value: return it as-is (will likely fail backend validation)
        return val;
    }

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private memberService: MemberService,
        private sectorService: SectorService,
        private positionService: PositionService
    ) {}

    ngOnInit(): void {
        this.buildForm();

        // load sectors + positions-list first, then load member if id present
        this.loading = true;
        forkJoin({
            sectors: this.sectorService.getAll().pipe(catchError(() => of([]))),
            positions: this.positionService.getAll().pipe(catchError(() => of([])))
        }).pipe(
            tap(res => {
                this.sectors = res.sectors;
                this.positions = res.positions;
            }),
            switchMap(() => this.route.paramMap),
            switchMap(params => {
                const id = params.get('id');
                if (!id) return of(null);
                this.id = id;
                return this.memberService.getById(id).pipe(catchError(err => { console.error('load member', err); return of(null); }));
            })
        ).subscribe((m: MemberDto | null) => {
            if (m) this.patchForm(m);
            this.loading = false;
        });
    }

    private buildForm() {
        this.form = this.fb.group({
            firstName: ['', Validators.required],
            lastName: [''],
            email: ['', [Validators.required, Validators.email]],
            phone: [''],
            gender: [''],
            birthDate: [''],
            address: [''],
            status: ['ACTIVE', Validators.required],
            sectorId: [''],
            positionId: [''],
            joinedDate: ['']
        });
    }

    private patchForm(m: MemberDto) {
         this.form.patchValue({
             firstName: m.firstName || '',
             lastName: m.lastName || '',
             email: m.email || '',
             phone: m.phone || '',
             // normalize incoming gender so mat-select can match option values
             gender: this.normalizeGender(m.gender) ?? '',
             // mat-datepicker expects a Date object (or null). Convert ISO string to Date using deterministic parser.
             birthDate: m.birthDate ? parseIsoLocalDate(m.birthDate) : null,
             address: m.address || '',
             status: m.status || 'ACTIVE',
             joinedDate: m.joinedDate ? parseIsoLocalDate(m.joinedDate) : null
         });

        // sectorId: try server-provided id, else match by sectorName to find id
        if ((m as any).sectorId) {
            this.form.get('sectorId')?.setValue(String((m as any).sectorId));
        } else if (m.sectorName) {
            const sec = this.sectors.find(s => s.name?.toLowerCase() === m.sectorName?.toLowerCase());
            if (sec) this.form.get('sectorId')?.setValue(sec.id);
        }

        // positionId: try id first, else match by name
        if ((m as any).positionId) {
            this.form.get('positionId')?.setValue(String((m as any).positionId));
        } else if (m.positionName) {
            const pos = this.positions.find(p => p.name?.toLowerCase() === m.positionName?.toLowerCase());
            if (pos) this.form.get('positionId')?.setValue(pos.id);
        }
    }

    save() {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        this.saving = true;

        // build payload and ensure gender is one of allowed tokens
        const rawGender = this.normalizeGender(this.form.value.gender);
        const allowedGenders = ['MALE', 'FEMALE', 'PRIA', 'WANITA'];
        const finalGender = allowedGenders.includes(String(rawGender)) ? String(rawGender) : undefined;

        // use shared util to convert Date/ISO to 'YYYY-MM-DD'
        const toIsoDate = (v: any): string | undefined => formatToLocalDateString(v);

        const payload: Partial<MemberDto> = {
            firstName: this.form.value.firstName,
            lastName: this.form.value.lastName,
            email: this.form.value.email,
            phone: this.form.value.phone,
            gender: finalGender,
            birthDate: toIsoDate(this.form.value.birthDate),
            address: this.form.value.address,
            status: this.form.value.status,
            joinedDate: toIsoDate(this.form.value.joinedDate)
         };

         const secId = this.form.value.sectorId;
         if (secId) {
             const sec = this.sectors.find(s => s.id === secId);
             if (sec) payload.sectorName = sec.name;
         }
         const posId = this.form.value.positionId;
         if (posId) {
             const pos = this.positions.find(p => p.id === posId);
             if (pos) payload.positionName = pos.name;
         }

        // debug: log payload so developer can inspect network request body
        console.debug('Member form payload before save:', payload);

         const req$ = this.id ? this.memberService.update(this.id, payload) : this.memberService.create(payload);

         req$.pipe(
             catchError(err => { console.error('save error', err); this.saving = false; return of(null); })
         ).subscribe(res => {
             this.saving = false;
             if (res) this.router.navigate(['/app/members']);
         });
     }

    cancel() { this.router.navigate(['/app/members']); }
}
