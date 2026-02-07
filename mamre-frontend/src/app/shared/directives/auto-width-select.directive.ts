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

          // fallback: try to find panel by panelClass or generic mat-select-panel (legacy + MDC)
          if (!panel) {
            const pc = (this.matSelect as any)?.panelClass;
            if (pc) {
              // panelClass can be string or array
              const cls = Array.isArray(pc) ? pc[0] : String(pc || '');
              if (cls) {
                const el = document.querySelector('.cdk-overlay-container .' + cls) as HTMLElement | null;
                if (el) panel = el;
              }
            }
          }

          if (!panel) {
            // support both legacy and MDC panel class names
            const el = document.querySelector('.cdk-overlay-container .mat-select-panel, .cdk-overlay-container .mat-mdc-select-panel') as HTMLElement | null;
            if (el) panel = el;
          }

          if (!panel) return;

          // find trigger via aria-owns (preferred) or fallback to common trigger selectors
          let triggerEl: HTMLElement | null = null;
          if (panelId) {
            triggerEl = document.querySelector(`[aria-owns="${panelId}"]`) as HTMLElement | null;
          }
          if (!triggerEl) {
            // legacy and mdc triggers
            triggerEl = document.querySelector('.mat-select-trigger, .mat-mdc-select .mat-mdc-select-value-text, .mat-mdc-select-trigger') as HTMLElement | null;
          }

          const triggerWidth = triggerEl ? Math.round(triggerEl.getBoundingClientRect().width) : 0;

          // measure widest option text - try several selectors (legacy + MDC)
          let maxTextWidth = 0;
          const optionSelector = '.mat-option-text, .mat-mdc-select-panel .mdc-list-item__primary-text, .mdc-list-item__primary-text';
          const optionTexts = panel.querySelectorAll(optionSelector);
          optionTexts.forEach((node) => {
            const text = (node as HTMLElement).innerText || '';
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // pick the computed font from the option node if available
              const computed = window.getComputedStyle(node as Element);
              ctx.font = (computed && computed.font) ? computed.font : ((computed && computed.fontSize ? computed.fontSize + ' ' + (computed.fontFamily || 'Arial') : '13px Arial'));
              const w = ctx.measureText(text).width;
              if (w > maxTextWidth) maxTextWidth = w;
            }
          });

          const padding = Number(this.appAutoWidthSelectPadding) || 48;
          const minWidth = Number(this.appAutoWidthSelectMin) || 320;
          const desired = Math.ceil(Math.max(triggerWidth, maxTextWidth + padding, minWidth));
          const maxAllowed = Math.min(window.innerWidth - 32, Number(this.appAutoWidthSelectMax) || 900);
          const finalWidth = Math.min(desired, maxAllowed);

          // apply safely
          (panel as HTMLElement).style.boxSizing = 'border-box';
          (panel as HTMLElement).style.minWidth = minWidth + 'px';
          (panel as HTMLElement).style.maxWidth = maxAllowed + 'px';
          (panel as HTMLElement).style.width = finalWidth + 'px';
        } catch (e) {
          // ignore - best-effort sizing
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
        if (!panel) panel = document.querySelector('.cdk-overlay-container .mat-select-panel, .cdk-overlay-container .mat-mdc-select-panel') as HTMLElement | null;
        if (panel) {
          // reset the inline styles we set
          panel.style.width = '';
          panel.style.minWidth = '';
          panel.style.maxWidth = '';
          panel.style.boxSizing = '';
        }
      } catch (e) {
        // ignore
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
