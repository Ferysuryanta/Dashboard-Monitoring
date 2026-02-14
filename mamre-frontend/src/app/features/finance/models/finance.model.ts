export interface PerSectorFinance {
    sectorId: number | null;
    sectorName?: string;
    income: number;
    expense: number;
    net: number;
    note?: string;
}

export interface MonthlyFinanceReport {
    month: number;
    year: number;
    totalIncome: number;
    totalExpense: number;
    net: number;
    perSector: PerSectorFinance[];
}
