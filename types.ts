
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
}

export interface Holiday {
  date: string;
  name: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  day: number;
}

export interface Saving {
  id: string;
  name: string;
  type: 'INSTALLMENT' | 'DEPOSIT'; // 적금 | 예금
  monthlyAmount: number; // 적금일 경우 월 납입액, 예금일 경우 총액
  rate: number; // 연이율 (%)
  term: number; // 기간 (개월)
  startDate: string;
}

export interface Loan {
  id: string;
  name: string;
  principal: number; // 원금
  rate: number; // 연이율 (%)
  term: number; // 기간 (개월)
  startDate: string;
}
