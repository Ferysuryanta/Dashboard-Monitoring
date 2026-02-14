import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout.component';

// Auth
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { ProfileComponent } from './features/auth/components/profile/profile.component';
import { AuthGuard, GuestGuard } from './core/guards/auth.guard';

// Members
import { MemberListComponent } from './features/members/components/member-list/member-list.component';
import { MemberFormComponent } from './features/members/components/member-form/member-form.component';
import { MembersRosterComponent } from './features/members/components/members-roster/members-roster.component';

// Sectors
import { SectorListComponent } from "./features/members/components/sector-list/sector-list.component";
import { SectorFormComponent } from "./features/members/components/sector-form/sector-form.component";

// Positions
import { PositionListComponent } from "./features/members/components/positions-list/position-list.component";
import { PositionFormComponent } from "./features/members/components/positions-form/position-form.component";
import {DashboardComponent} from "./features/members/components/Dashboard/dashboard.component";

// Bible Reading
import { BibleReadingComponent } from "./features/members/components/bible-reading/bible-reading.component";
import { BibleReadingReportComponent } from "./features/members/components/bible-reading-report/bible-reading-report.component";

// Attendance
import { AttendanceComponent } from "./features/members/components/attendance/attendance.component";
import { AttendanceReportComponent } from "./features/members/components/attendance-report/attendance-report.component";

export const routes: Routes = [
    // 🔐 Default: Redirect to login
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },

    // 🔐 Login Page (Guest only - redirect if already logged in)
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [GuestGuard]
    },

    // 📝 Register Page (Guest only)
    {
        path: 'register',
        component: RegisterComponent,
        canActivate: [GuestGuard]
    },

    // 📱 Main App Layout (Protected routes - requires authentication)
    {
        path: 'app',
        component: AppLayoutComponent,
        canActivate: [AuthGuard],
        children: [

            // 🔥 Dashboard as default page after login
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },

            // 👤 Members
            { path: 'members', component: MemberListComponent },
            { path: 'members/new', component: MemberFormComponent },
            { path: 'members/:id/edit', component: MemberFormComponent },
            { path: 'members/roster', component: MembersRosterComponent },

            // 🌿 Sectors (master data)
            { path: 'sectors', component: SectorListComponent },
            { path: 'sectors/new', component: SectorFormComponent },
            { path: 'sectors/:id/edit', component: SectorFormComponent },

            // 🧳 Positions (master data)
            { path: 'positions', component: PositionListComponent },
            { path: 'positions/new', component: PositionFormComponent },
            { path: 'positions/:id/edit', component: PositionFormComponent },

            // 📖 Bible Reading
            { path: 'bible-reading', component: BibleReadingComponent },
            { path: 'bible-reading-report', component: BibleReadingReportComponent },

            // 📋 Attendance
            { path: 'attendance', component: AttendanceComponent },
            { path: 'attendance-report', component: AttendanceReportComponent },

            // 📅 Programs / Kegiatan
            { path: 'programs', loadComponent: () => import('./features/programs/program-list.component').then(m => m.ProgramListComponent) },
            { path: 'programs/new', loadComponent: () => import('./features/programs/program-form.component').then(m => m.ProgramFormComponent) },
            { path: 'programs/:id', loadComponent: () => import('./features/programs/program-detail.component').then(m => m.ProgramDetailComponent) },

            // 💰 Finance
            { path: 'finance', loadComponent: () => import('./features/finance/finance-report.component').then(m => m.FinanceReportComponent) },

            // 👤 Profile & Settings
            { path: 'profile', component: ProfileComponent },
            { path: 'settings', component: ProfileComponent }, // Redirect to profile for now
        ]
    },

    // Fallback route - redirect to login
    { path: '**', redirectTo: 'login' }
];
