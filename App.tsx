
import React, { useState, useEffect, useMemo } from 'react';
import Calendar from './components/Calendar';
import AIChatbot from './components/AIChatbot';
import TransactionModal from './components/TransactionModal';
import StatisticsView from './components/StatisticsView';
import FinanceView from './components/FinanceView';
import { Transaction, FixedExpense, Saving, Loan } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'STATISTICS' | 'FINANCE'>('CALENDAR');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const safeParse = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return defaultValue;
      return JSON.parse(saved);
    } catch (e) {
      console.error(`Error parsing ${key}:`, e);
      return defaultValue;
    }
  };

  const [transactions, setTransactions] = useState<Transaction[]>(() => safeParse('rich_hamster_ledger_transactions', []));
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => safeParse('rich_hamster_fixed_expenses', []));
  const [savings, setSavings] = useState<Saving[]>(() => safeParse('rich_hamster_savings', []));
  const [loans, setLoans] = useState<Loan[]>(() => safeParse('rich_hamster_loans', []));

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('rich_hamster_ledger_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('rich_hamster_fixed_expenses', JSON.stringify(fixedExpenses));
  }, [fixedExpenses]);

  useEffect(() => {
    localStorage.setItem('rich_hamster_savings', JSON.stringify(savings));
  }, [savings]);

  useEffect(() => {
    localStorage.setItem('rich_hamster_loans', JSON.stringify(loans));
  }, [loans]);

  const handleAddTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...data,
      id: Math.random().toString(36).substring(2, 9)
    };
    setTransactions(prev => [...prev, newTx]);
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const { totalIncome, totalExpense } = useMemo(() => {
    const currentMonthTxs = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
    });
    
    return {
      totalIncome: currentMonthTxs.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0),
      totalExpense: currentMonthTxs.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0)
    };
  }, [transactions, currentDate]);

  const years = Array.from({ length: 7 }, (_, i) => 2024 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-[#F5F5DC] pb-32 p-4 md:p-10 text-[#2C3E50]">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-end mb-8 md:mb-12 gap-6">
        <div className="flex flex-col items-center md:items-start shrink-0">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#004d40] tracking-tight flex items-center gap-3">
            <span className="text-4xl md:text-5xl">🐹</span>
            부자 햄스터 가계부
          </h1>
          <p className="text-[#004d40]/70