import { Injectable } from '@angular/core';

export interface DashboardWidgetPreference {
  id: string;
  visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class DashboardPreferencesService {
  private readonly storageKey = 'dashboard.widget.preferences.v1';

  getVisibilityMap(defaults: DashboardWidgetPreference[]): Record<string, boolean> {
    const fallback = this.toMap(defaults);

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return fallback;
      }

      const parsed = JSON.parse(raw) as Record<string, boolean>;
      return {
        ...fallback,
        ...parsed,
      };
    } catch {
      return fallback;
    }
  }

  saveVisibilityMap(visibility: Record<string, boolean>): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(visibility));
    } catch {
      // ignore storage failures
    }
  }

  private toMap(defaults: DashboardWidgetPreference[]): Record<string, boolean> {
    return defaults.reduce((acc, item) => {
      acc[item.id] = item.visible;
      return acc;
    }, {} as Record<string, boolean>);
  }
}
