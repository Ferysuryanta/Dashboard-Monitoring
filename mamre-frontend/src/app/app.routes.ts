import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout.component';

// Members
import { MemberListComponent } from './features/members/components/member-list/member-list.component';
import { MemberFormComponent } from './features/members/components/member-form/member-form.component';

// Sectors
import { SectorListComponent } from "./features/members/components/sector-list/sector-list.component";
import { SectorFormComponent } from "./features/members/components/sector-form/sector-form.component";

// Positions
import { PositionListComponent } from "./features/members/components/positions-list/position-list.component";
import { PositionFormComponent } from "./features/members/components/positions-form/position-form.component";
import {DashboardComponent} from "./features/members/components/Dashboard/dashboard.component";

// Bible Reading
import { BibleReadingComponent } from "./features/members/components/bible-reading/bible-reading.component";

// Attendance
import { AttendanceComponent } from "./features/members/components/attendance/attendance.component";

// Dashboard

export const routes: Routes = [
    {
        path: '',
        component: AppLayoutComponent,
        children: [

            // 🔥 Dashboard as default page
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },

            // 👤 Members
            { path: 'members', component: MemberListComponent },
            { path: 'members/new', component: MemberFormComponent },
            { path: 'members/:id/edit', component: MemberFormComponent },

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

            // 📋 Attendance
            { path: 'attendance', component: AttendanceComponent },
        ]
    },

    // Fallback route
    { path: '**', redirectTo: 'dashboard' }
];
