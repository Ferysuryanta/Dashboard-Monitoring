export type ActivityStatus = 'Planned' | 'Ongoing' | 'Completed' | 'Cancelled';

export interface Activity {
    id?: string;
    title: string;
    description?: string;
    dateStart: string;
    dateEnd?: string;
    status: ActivityStatus;
    location?: string;
    documents?: Array<{ id: string; name: string; url?: string }>;
    createdAt?: string;
    updatedAt?: string;
}
