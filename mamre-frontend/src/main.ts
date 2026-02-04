import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { AuthInterceptor } from './app/core/interceptors/auth.interceptor';
import { APP_INITIALIZER } from '@angular/core';
import { ThemeService } from './app/core/services/theme.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(BrowserAnimationsModule),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (themeService: ThemeService) => {
        return () => {
          // try to restore previously selected theme before app starts so overlays
          // created during bootstrap inherit the correct data-theme attribute.
          try {
            const saved = localStorage.getItem('theme');
            themeService.setDarkMode(saved === 'dark');
          } catch (e) {
            // ignore; keep default
          }
        };
      },
      deps: [ThemeService],
      multi: true
    }
  ]
}).catch(err => console.error(err));
