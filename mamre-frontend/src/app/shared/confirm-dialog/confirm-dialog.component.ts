import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'primary' | 'accent' | 'warn';
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    template: `
        <h2 mat-dialog-title>
            <mat-icon class="warning-icon">warning</mat-icon>
            {{ data.title }}
        </h2>
        <mat-dialog-content>
            <p>{{ data.message }}</p>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">
                {{ data.cancelText || 'Batal' }}
            </button>
            <button mat-flat-button [color]="data.confirmColor || 'warn'" (click)="onConfirm()">
                {{ data.confirmText || 'Konfirmasi' }}
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        .warning-icon {
            color: #f44336;
            vertical-align: middle;
            margin-right: 8px;
        }
        mat-dialog-content p {
            font-size: 14px;
            color: #666;
            margin: 0;
        }
        mat-dialog-actions {
            padding: 16px 0 0 0;
        }
    `]
})
export class ConfirmDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
    ) {}

    onCancel(): void {
        this.dialogRef.close(false);
    }

    onConfirm(): void {
        this.dialogRef.close(true);
    }
}
