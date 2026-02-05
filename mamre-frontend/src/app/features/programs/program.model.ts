export interface Program {
  id?: number;
  title: string;
  description?: string;
  type?: string; // e.g. 'Kegiatan' | 'Program' | 'Event'
  status?: string; // PLANNED | SCHEDULED | ONGOING | COMPLETED | CANCELLED
  nextSchedule?: string | null; // ISO date/time of next occurrence
}
