import { Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';

@Pipe({ name: 'countUp', standalone: true, pure: false })
export class CountUpPipe implements PipeTransform {
  private lastValue: number | null = null;
  private displayed = 0;
  private rafId: number | null = null;
  private startTime = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  transform(value: number | null | undefined, duration = 800): string {
    const target = typeof value === 'number' ? value : Number(value || 0);
    if (isNaN(target)) return String(value);

    // If target changed drastically, restart animation
    if (this.lastValue === null || this.lastValue !== target) {
      this.lastValue = target;
      this.startAnimation(target, duration);
    }

    return Math.round(this.displayed).toLocaleString('id-ID');
  }

  private startAnimation(target: number, duration: number) {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    const start = performance.now();
    const initial = this.displayed || 0;
    const change = target - initial;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      this.displayed = initial + change * easeOutCubic(t);
      this.cdr.markForCheck();
      if (t < 1) {
        this.rafId = requestAnimationFrame(step);
      } else {
        this.displayed = target; // ensure exact
        this.rafId = null;
        this.cdr.markForCheck();
      }
    };

    this.rafId = requestAnimationFrame(step);
  }
}
