export interface MemberDto {
    id?: string;         // UUID
    firstName: string;
    lastName: string;
    gender?: string;
    birthDate?: string;  // format "YYYY-MM-DD"
    phone?: string;
    email?: string;
    address?: string;
    status?: string;
    sectorId?: number;
    sectorName?: string;
    positionName?: string;
    joinedDate?: string; // format "YYYY-MM-DD"

    // optional flags/codes used by roster export/template
    mamre?: boolean | string;
    saitun?: boolean | string;
    kodeMamre?: string;
    kodeSaitun?: string;
}
