import { Account } from './Account';

export enum TransactionType {
  Outgoing = 'Outgoing',
  Incoming = 'Incoming',
  Transfer = 'Transfer',
}

export enum TransferType {
  Internal = 'Internal',
  External = 'External',
}
export interface Transaction {
  id: number;
  identifier: string;

  toAccount?: Account;
  fromAccount?: Account;
  type: TransactionType;

  amount: number;
  message: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface Transfer {
  number?: string;
  toAccountId: number;
  fromAccountId: number;
  message: string;
  amount: number;
  type: TransferType;
}
