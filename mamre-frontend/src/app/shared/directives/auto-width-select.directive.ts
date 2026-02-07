import { Directive, Input, AfterViewInit, OnDestroy, NgZone, inject } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { Subscription } from 'rxjs';

@Directive({ selector: '[appAutoWidthSelect]', standalone: true })
export class AutoWidthSelectDirective implements AfterViewInit, OnDestroy {
  private matSelect = inject(MatSelect);
  private ngZone = inject(NgZone);
  private sub = new Subscription();

  /** Minimum panel width in px */
  @Input() appAutoWidthSelectMin = 320;
  /** Extra padding to add to measured text width */
  @Input() appAutoWidthSelectPadding = 48;
  /** Max allowed width in px */
  @Input() appAutoWidthSelectMax = 900;

  ngAfterViewInit(): void {
    // MatSelect exposes openedChange EventEmitter<boolean>
    if ((this.matSelect as any).openedChange && (this.matSelect as any).openedChange.subscribe) {
      const s = (this.matSelect as any).openedChange.subscribe((open: boolean) => {
        if (open) this.onOpen(); else this.onClose();
      });
      this.sub.add(s);
    }
  }

  private onOpen() {
    // run outside angular to avoid change detection hits
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        try {
          const panelId = (this.matSelect as any)?.panelId as string | undefined;
          let panel: HTMLElement | null = null;

          if (panelId) {
            panel = document.getElementById(panelId) as HTMLElement | null;
          }

          // fallback: try to find panel by panelClass or generic mat-select-panel
          if (!panel) {
            const pc = (this.matSelect as any)?.panelClass;
            if (pc) {
              const el = document.querySelector('.cdk-overlay-container .' + pc) as HTMLElement | null;
              if (el) panel = el;
            }
          }
          if (!panel) {
            const el = document.querySelector('.cdk-overlay-container .mat-select-panel') as HTMLElement | null;
            if (el) panel = el;
          }
          if (!panel) return;

          // find trigger via aria-owns (preferred) or fallback to first visible .mat-select-trigger
          let triggerEl: HTMLElement | null = null;
          if (panelId) {
            triggerEl = document.querySelector(`[aria-owns="${panelId}"]`) as HTMLElement | null;
          }
          if (!triggerEl) {
            triggerEl = document.querySelector('.mat-select-trigger') as HTMLElement | null;
          }

          const triggerWidth = triggerEl ? Math.round(triggerEl.getBoundingClientRect().width) : 0;

          // measure widest option text
          let maxTextWidth = 0;
          const optionTexts = panel.querySelectorAll('.mat-option-text');
          optionTexts.forEach((node) => {
            const text = (node as HTMLElement).innerText || '';
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.font = window.getComputedStyle(node as Element).font || '13px Arial';
              const w = ctx.measureText(text).width;
              if (w > maxTextWidth) maxTextWidth = w;
            }
          });

          const padding = Number(this.appAutoWidthSelectPadding) || 48;
          const minWidth = Number(this.appAutoWidthSelectMin) || 320;
          const desired = Math.ceil(Math.max(triggerWidth, maxTextWidth + padding, minWidth));
          const maxAllowed = Math.min(window.innerWidth - 32, Number(this.appAutoWidthSelectMax) || 900);
          const finalWidth = Math.min(desired, maxAllowed);

          (panel as HTMLElement).style.width = finalWidth + 'px';
        } catch (e) {
          // ignore
        }
      }, 50);
    });
  }

  private onClose() {
    this.ngZone.runOutsideAngular(() => {
      try {
        const panelId = (this.matSelect as any)?.panelId as string | undefined;
        let panel: HTMLElement | null = null;
        if (panelId) panel = document.getElementById(panelId) as HTMLElement | null;
        if (!panel) panel = document.querySelector('.cdk-overlay-container .mat-select-panel') as HTMLElement | null;
        if (panel) (panel as HTMLElement).style.width = '';
      } catch (e) {
        // ignore
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
