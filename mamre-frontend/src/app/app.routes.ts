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
        canActivate: [GuestGuard],
        data: {
            title: 'Login',
            section: 'Autentikasi',
            description: 'Masuk ke dashboard monitoring Mamre.'
        }
    },

    // 📝 Register Page (Guest only)
    {
        path: 'register',
        component: RegisterComponent,
        canActivate: [GuestGuard],
        data: {
            title: 'Register',
            section: 'Autentikasi',
            description: 'Daftarkan akun baru untuk mengakses aplikasi.'
        }
    },

    // 📱 Main App Layout (Protected routes - requires authentication)
    {
        path: 'app',
        component: AppLayoutComponent,
        canActivate: [AuthGuard],
        children: [

            // 🔥 Dashboard as default page after login
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                component: DashboardComponent,
                data: {
                    title: 'Dashboard Mamre',
                    section: 'Monitoring Pusat',
                    description: 'Pantau metrik utama, analitik sektor, dan agenda pelayanan dari satu layar.',
                    layout: 'wide'
                }
            },

            // 👤 Members
            {
                path: 'members',
                component: MemberListComponent,
                data: {
                    title: 'Data Anggota',
                    section: 'Keanggotaan',
                    description: 'Kelola data jemaat, filter, dan pembaruan profil anggota.'
                }
            },
            {
                path: 'members/new',
                component: MemberFormComponent,
                data: {
                    title: 'Tambah Anggota',
                    section: 'Keanggotaan',
                    description: 'Tambahkan data anggota baru ke database.'
                }
            },
            {
                path: 'members/:id/edit',
                component: MemberFormComponent,
                data: {
                    title: 'Edit Anggota',
                    section: 'Keanggotaan',
                    description: 'Perbarui profil dan informasi anggota.'
                }
            },
            {
                path: 'members/roster',
                component: MembersRosterComponent,
                data: {
                    title: 'Roster Anggota',
                    section: 'Keanggotaan',
                    description: 'Lihat daftar roster anggota untuk kebutuhan pelayanan.'
                }
            },

            // 🌿 Sectors (master data)
            {
                path: 'sectors',
                component: SectorListComponent,
                data: {
                    title: 'Sektor',
                    section: 'Master Data',
                    description: 'Atur pembagian sektor dan distribusi jemaat.'
                }
            },
            {
                path: 'sectors/new',
                component: SectorFormComponent,
                data: {
                    title: 'Tambah Sektor',
                    section: 'Master Data',
                    description: 'Buat sektor baru untuk pengelompokan anggota.'
                }
            },
            {
                path: 'sectors/:id/edit',
                component: SectorFormComponent,
                data: {
                    title: 'Edit Sektor',
                    section: 'Master Data',
                    description: 'Perbarui informasi dan struktur sektor.'
                }
            },

            // 🧳 Positions (master data)
            {
                path: 'positions',
                component: PositionListComponent,
                data: {
                    title: 'Jabatan',
                    section: 'Master Data',
                    description: 'Kelola struktur jabatan dan posisi pelayanan.'
                }
            },
            {
                path: 'positions/new',
                component: PositionFormComponent,
                data: {
                    title: 'Tambah Jabatan',
                    section: 'Master Data',
                    description: 'Buat jabatan baru untuk struktur organisasi.'
                }
            },
            {
                path: 'positions/:id/edit',
                component: PositionFormComponent,
                data: {
                    title: 'Edit Jabatan',
                    section: 'Master Data',
                    description: 'Perbarui detail jabatan dan tanggung jawab pelayanan.'
                }
            },

            // 📖 Bible Reading
            {
                path: 'bible-reading',
                component: BibleReadingComponent,
                data: {
                    title: 'Baca Alkitab',
                    section: 'Pembinaan Rohani',
                    description: 'Catat progres membaca Alkitab jemaat.'
                }
            },
            {
                path: 'bible-reading-report',
                component: BibleReadingReportComponent,
                data: {
                    title: 'Laporan Baca Alkitab',
                    section: 'Pembinaan Rohani',
                    description: 'Analisis pembacaan Alkitab per sektor dan periode.'
                }
            },

            // 📋 Attendance
            {
                path: 'attendance',
                component: AttendanceComponent,
                data: {
                    title: 'Kehadiran',
                    section: 'Pelayanan',
                    description: 'Kelola pencatatan hadir dan partisipasi anggota.'
                }
            },
            {
                path: 'attendance-report',
                component: AttendanceReportComponent,
                data: {
                    title: 'Laporan Kehadiran',
                    section: 'Pelayanan',
                    description: 'Pantau tren kehadiran mingguan dan bulanan.'
                }
            },

            // 📅 Programs / Kegiatan
            {
                path: 'programs',
                loadComponent: () => import('./features/programs/program-list.component').then(m => m.ProgramListComponent),
                data: {
                    title: 'Program & Kegiatan',
                    section: 'Agenda Pelayanan',
                    description: 'Atur jadwal, status, dan detail kegiatan Mamre.'
                }
            },
            {
                path: 'programs/new',
                loadComponent: () => import('./features/programs/program-form.component').then(m => m.ProgramFormComponent),
                data: {
                    title: 'Tambah Program',
                    section: 'Agenda Pelayanan',
                    description: 'Susun kegiatan baru beserta jadwal dan statusnya.'
                }
            },
            {
                path: 'programs/:id',
                loadComponent: () => import('./features/programs/program-detail.component').then(m => m.ProgramDetailComponent),
                data: {
                    title: 'Detail Program',
                    section: 'Agenda Pelayanan',
                    description: 'Lihat ringkasan pelaksanaan dan dokumentasi program.'
                }
            },

            // 💰 Finance
            {
                path: 'finance',
                loadComponent: () => import('./features/finance/finance-report.component').then(m => m.FinanceReportComponent),
                data: {
                    title: 'Keuangan',
                    section: 'Operasional',
                    description: 'Pantau transaksi dan laporan keuangan pelayanan.'
                }
            },

            // 👤 Profile & Settings
            {
                path: 'profile',
                component: ProfileComponent,
                data: {
                    title: 'Profil Saya',
                    section: 'Akun',
                    description: 'Lihat dan perbarui informasi akun pengguna.'
                }
            },
            {
                path: 'settings',
                component: ProfileComponent,
                data: {
                    title: 'Pengaturan',
                    section: 'Akun',
                    description: 'Kelola preferensi akun dan tampilan aplikasi.'
                }
            }, // Redirect to profile for now
        ]
    },

    // Fallback route - redirect to login
    { path: '**', redirectTo: 'login' }
];
