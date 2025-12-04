export interface AttendanceDto {
    id: number;
    memberName?: string;
    attendDate: string;
    event?: string;
    present?: boolean;
    note?: string;

    // Field memberId dibutuhkan oleh service/controller saat membuat (POST)
    memberId?: string;
}