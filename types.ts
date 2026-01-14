
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  idCard: string;
  createdAt: string;
}

export interface InterestSegment {
  startDate: string;
  endDate?: string; // Nếu có endDate, đoạn này đã kết thúc (chốt lãi)
  principal: number;
  interestRate: number;
}

export type ContractStatus = 'Active' | 'Redeemed' | 'Forfeited' | 'Cancelled' | 'Overdue';

export interface Transaction {
  id: string;
  type: 'pawn' | 'renewal' | 'interest_payment' | 'principal_increase' | 'principal_decrease' | 'redemption';
  date: string;
  amount: number;
  description: string;
}

export interface Contract {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  model: string;
  loanAmount: number; // Tiền gốc hiện tại
  interestRate: number; // Lãi suất hiện tại (đ/1tr/ngày)
  pawnDate: string;
  dueDate: string;
  lastPaidDate: string;
  status: ContractStatus;
  isPaperless: boolean;
  notes: string;
  segments: InterestSegment[]; // Lịch sử các phân đoạn tiền gốc để tính lãi
  transactions: Transaction[];
}
