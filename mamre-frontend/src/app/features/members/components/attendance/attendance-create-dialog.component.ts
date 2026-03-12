import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { OverlayContainer } from '@angular/cdk/overlay';

import { AttendanceService, Attendance, CHURCH_EVENTS } from '../../../../core/services/attendance.service';
import { MemberService } from '../../../../core/services/member.service';
import { MemberDto } from '../../models/member.model';

@Component({
    selector: 'app-attendance-create-dialog',
    standalone: true,
    providers: [provideNativeDateAdapter()],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule,
        MatAutocompleteModule
    ],
    templateUrl: './attendance-create-dialog.component.html',
    styleUrls: ['./attendance-create-dialog.component.scss']
})
export class AttendanceCreateDialogComponent implements OnInit, OnDestroy {
    private svc = inject(AttendanceService);
    private memberSvc = inject(MemberService);
    private dialogRef = inject(MatDialogRef<AttendanceCreateDialogComponent>);
    private snackBar = inject(MatSnackBar);
    private fb = inject(FormBuilder);
    private overlay = inject(OverlayContainer);

    members: MemberDto[] = [];
    churchEvents = CHURCH_EVENTS;
    filteredMembers: MemberDto[] = [];
    selectedMemberId?: string | null;

    form: FormGroup = this.fb.group({
        memberName: ['', Validators.required],
        attendDate: [new Date(), Validators.required],
        event: ['Ibadah Minggu', Validators.required],
        present: [true],
        kolpiAmount: [0],
        note: ['']
    });

    ngOnInit(): void {
        this.loadMembers();
        this.form.get('memberName')?.valueChanges.subscribe(value => {
            this.filterMembers(value);
        });

        // Sync overlay container theme attribute so overlays follow the app theme
        try {
            const theme = document.body.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'light';
            const container = this.overlay.getContainerElement();
            if (container) {
                container.setAttribute('data-theme', theme);
            }
        } catch (e) {
            // ignore in non-browser env
            console.debug('[AttendanceCreateDialog] overlay theme sync failed', e);
        }
    }

    ngOnDestroy(): void {
        try {
            const container = this.overlay.getContainerElement();
            if (container) {
                container.removeAttribute('data-theme');
            }
        } catch (e) {
            // ignore
        }
    }

    loadMembers(): void {
        this.memberSvc.getPaged(0, 1000).subscribe((res: any) => {
            const content = res.content || res;
            this.members = content.map((m: any) => ({
                id: m.id,
                // be defensive: backend may use name/fullName instead of firstName/lastName
                firstName: m.firstName ?? m.name ?? m.fullName ?? '',
                lastName: m.lastName ?? '',
                email: m.email ?? m.emailAddress ?? ''
            }));
            this.filteredMembers = this.members;
            console.debug('[AttendanceCreateDialog] loaded members', this.members);
        });
    }

    // Filter by firstName only (user requested behaviour)
    filterMembers(value: string | MemberDto | null): void {
        const raw = (typeof value === 'string') ? value : (value ? (typeof value === 'string' ? value : (value.firstName || '')) : '');
        const filterValue = raw.toLowerCase();
        this.filteredMembers = this.members.filter(member =>
            (member.firstName || '').toLowerCase().includes(filterValue)
        );
    }

    // Use this for displayWith so the input shows full name when an object is selected
    displayAutocompleteValue(member: MemberDto | string | null): string {
        if (!member) return '';
        if (typeof member === 'string') return member;
        return `${member.firstName || ''} ${member.lastName || ''}`.trim();
    }

    // remove onMemberClick (if present) and handle selection via optionSelected
    onMemberSelected(event: any): void {
        const selectedMember = event.option.value as MemberDto;
        // store id for backend accuracy
        this.selectedMemberId = selectedMember?.id ?? null;
        // set the form control value to the full name string so input displays it reliably
        const fullName = `${selectedMember?.firstName || ''} ${selectedMember?.lastName || ''}`.trim();
        this.form.get('memberName')?.setValue(fullName, { emitEvent: false });
    }

    getMemberDisplayName(member: MemberDto | string | null): string {
        // keep for other usages: full name with email if available
        if (!member) return '';
        if (typeof member === 'string') return member;
        if (member.email) return `${member.firstName || ''} ${member.lastName || ''} (${member.email})`.trim();
        return `${member.firstName || ''} ${member.lastName || ''}`.trim();
    }

    save(): void {
        if (this.form.invalid) return;

        const formValue = this.form.value;
        const attendance: Attendance = {
            memberName: formValue.memberName,
            attendDate: this.formatDate(formValue.attendDate),
            event: formValue.event,
            present: formValue.present ?? true,
            kolpiAmount: formValue.kolpiAmount ?? 0,
            note: formValue.note
        };

        // if selectedMemberId set, attach for backend (assumes API accepts memberId in payload or resolve by name server-side)
        if (this.selectedMemberId) {
            (attendance as any).memberId = this.selectedMemberId;
        }

        this.svc.create(attendance).subscribe({
            next: () => {
                this.snackBar.open('Kehadiran berhasil ditambahkan', 'OK', { duration: 3000 });
                this.dialogRef.close(true);
            },
            error: () => this.snackBar.open('Gagal menambahkan kehadiran', 'OK', { duration: 3000 })
        });
    }

    cancel(): void {
        this.dialogRef.close();
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}
