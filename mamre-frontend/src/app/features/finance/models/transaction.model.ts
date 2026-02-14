export interface TransactionPayload {
  txnType: 'Pemasukan' | 'Pengeluaran' | 'INCOME' | 'EXPENSE';
  amount: number;
  txnDate: string; // ISO date
  sectorId?: number | string | null;
  category?: string;
  description?: string;
  reference?: string;
}
