import React, { createContext, useContext, useState, useEffect } from 'react';

export type TransactionType = 'entrada' | 'saida';

export type TransactionCategory = 'gasto-fixo' | 'gasto-desnecessario' | 'alimento' | 'cartao';

export type BankAccount = 'c6-bank' | 'nubank' | 'inter';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description: string;
  account: BankAccount;
  date: Date;
  createdAt: Date;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getTransactionsByDate: (date: Date) => Transaction[];
  getTransactionsByMonth: (year: number, month: number) => Transaction[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions deve ser usado dentro de um TransactionProvider');
  }
  return context;
};

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Carregar transações do localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('pocket-viz-transactions');
    if (savedTransactions) {
      const parsed = JSON.parse(savedTransactions);
      const transactionsWithDates = parsed.map((t: any) => ({
        ...t,
        date: new Date(t.date),
        createdAt: new Date(t.createdAt)
      }));
      setTransactions(transactionsWithDates);
    }
  }, []);

  // Salvar transações no localStorage
  useEffect(() => {
    localStorage.setItem('pocket-viz-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getTransactionsByDate = (date: Date) => {
    return transactions.filter(t => 
      t.date.toDateString() === date.toDateString()
    );
  };

  const getTransactionsByMonth = (year: number, month: number) => {
    return transactions.filter(t => 
      t.date.getFullYear() === year && t.date.getMonth() === month
    );
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      deleteTransaction,
      getTotalIncome,
      getTotalExpenses,
      getBalance,
      getTransactionsByDate,
      getTransactionsByMonth
    }}>
      {children}
    </TransactionContext.Provider>
  );
};