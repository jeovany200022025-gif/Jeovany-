
export type Language = 'pt' | 'en';

export enum InvestmentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  WITHDRAWAL_PENDING = 'WITHDRAWAL_PENDING',
  PAID = 'PAID'
}

export interface VIPPlan {
  id: string;
  name: string;
  amount: number;
  return50: {
    gain: number;
    days: number;
  };
  return75: {
    gain: number;
    days: number;
  };
}

export interface Investment {
  id: string;
  userId: string;
  planId: string;
  option: '50' | '75';
  amount: number;
  expectedGain: number;
  startDate: string;
  endDate: string;
  status: InvestmentStatus;
  daysPassed: number;
  bankName?: string;
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  holderName: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  isRead: boolean;
}

export interface AppState {
  users: User[];
  investments: Investment[];
  bankAccounts: BankAccount[];
  notifications: Notification[];
  totalCollected: number;
  totalPaid: number;
}
