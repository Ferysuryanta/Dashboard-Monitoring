export interface Program {
  id?: number;
  title: string;
  description?: string;
  type?: string; // e.g. 'Kegiatan' | 'Program' | 'Event'
  status?: string; // PLANNED | SCHEDULED | ONGOING | COMPLETED | CANCELLED
  nextSchedule?: string | null; // ISO date/time of next occurrence

  // new fields
  tempat?: string;
  tujuan?: string;
  targetFisik?: number | null;
  anggaranLocal?: number | null;
  anggaranSubsidi?: number | null;
  anggaranTotal?: number | null;
  pelaksana?: string;
  keterangan?: string;

  // compatibility aliases used by UI (legacy names)
  budgetLocal?: number | null;
  budgetSubsidi?: number | null;
  budgetTotal?: number | null;
  jadwalText?: string | null;
  category?: string | null;
}
