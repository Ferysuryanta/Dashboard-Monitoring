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

import {ActivityListComponent} from "./features/members/components/activity-list/activity-list.component";
import {ActivityDetailComponent} from "./features/members/components/activity-detail/activity-detail.component";
import {ActivityFormComponent} from "./features/members/components/activity-form/activity-form.component";
import {AttendanceListComponent} from "./features/members/components/attendance-list/attendance-list.component";
import {AttendanceFormComponent} from "./features/members/components/attendance-form/attendance-form.component";


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

            // 📋 Activities
            { path: 'activities/new', component: ActivityFormComponent },
            { path: 'activities/:id', component: ActivityDetailComponent },
            { path: 'activities/:id/edit', component: ActivityFormComponent },
            { path: 'activities', component: ActivityListComponent },

            // Attendance
            { path: 'attendance', component: AttendanceListComponent },
            { path: 'attendance/new', component: AttendanceFormComponent },
            // { path: 'attendance/:id', component: ActivityDetailComponent },
            { path: 'attendance/:id/edit', component: AttendanceFormComponent },
        ]
    },

    // Fallback route
    { path: '**', redirectTo: 'dashboard' }
];
