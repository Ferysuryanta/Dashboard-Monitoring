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
    sectorName?: string;
    positionName?: string;
    joinedDate?: string; // format "YYYY-MM-DD"
}
