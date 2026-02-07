import {Directive, ElementRef, HostListener, OnInit} from '@angular/core';
import {NgControl} from '@angular/forms';

// Simple directive that formats a numeric input with thousand separators on blur
// and removes separators on focus. Keeps model value as a number via NgControl.
@Directive({ selector: '[appNumberFormat]', standalone: true })
export class NumberFormatDirective implements OnInit {
  constructor(private el: ElementRef<HTMLInputElement>, private control?: NgControl) {}

  ngOnInit(): void {
    // initialize displayed formatted value if model has a value
    try {
      const raw = this.control?.control?.value;
      if (raw !== undefined && raw !== null && raw !== '') {
        this.el.nativeElement.value = this.formatNumber(Number(raw) || 0);
      }
    } catch (e) {
      // ignore
    }
  }

  @HostListener('focus')
  onFocus() {
    const v = this.el.nativeElement.value || '';
    // remove non-digit characters except minus and dot
    this.el.nativeElement.value = v.replace(/[^0-9.-]+/g, '');
  }

  @HostListener('input')
  onInput() {
    // update model as number when user types
    if (this.control && this.control.control) {
      const raw = this.el.nativeElement.value.replace(/[^0-9.-]+/g, '');
      const n = raw === '' || raw === '-' ? null : Number(raw);
      this.control.control.setValue(n, { emitEvent: true });
    }
  }

  @HostListener('blur')
  onBlur() {
    const raw = this.el.nativeElement.value.replace(/[^0-9.-]+/g, '');
    const n = raw === '' || raw === '-' ? 0 : Number(raw);
    this.el.nativeElement.value = this.formatNumber(n);
    if (this.control && this.control.control) {
      this.control.control.setValue(n, { emitEvent: true });
    }
  }

  private formatNumber(n: number): string {
    try {
      return n.toLocaleString('id-ID');
    } catch (e) {
      return String(n);
    }
  }
}
