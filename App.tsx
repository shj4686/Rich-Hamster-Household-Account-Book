
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
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  const [transactions, setTransactions] = useState<Transaction[]>(() => safeParse('rich_hamster_ledger_tx', []));
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => safeParse('rich_hamster_fixed', []));
  const [savings, setSavings] = useState<Saving[]>(() => safeParse('rich_hamster_savings', []));
  const [loans, setLoans] = useState<Loan[]>(() => safeParse('rich_hamster_loans', []));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => localStorage.setItem('rich_hamster_ledger_tx', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('rich_hamster_fixed', JSON.stringify(fixedExpenses)), [fixedExpenses]);
  useEffect(() => localStorage.setItem('rich_hamster_savings', JSON.stringify(savings)), [savings]);
  useEffect(() => localStorage.setItem('rich_hamster_loans', JSON.stringify(loans)), [loans]);

  const handleAddTransaction = (data: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...data, id: Math.random().toString(36).substring(7) }]);
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const totals = useMemo(() => {
    const monthTxs = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
    });
    const income = monthTxs.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0);
    const expense = monthTxs.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);
    return { income, expense };
  }, [transactions, currentDate]);

  const years = Array.from({ length: 7 }, (_, i) => 2024 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-[#F5F5DC] pb-32 p-4 md:p-10 text-[#2C3E50]">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-black text-[#004d40] flex items-center justify-center md:justify-start gap-2">
            <span>🐹</span> 부자 햄스터 가계부
          </h1>
          <p className="text-[#004d40]/60 text-xs font-bold mt-1">부자가 되는 가장 빠른 길 🌻</p>
        </div>

        <div className="flex items-center gap-2 bg-white/50 p-1 rounded-2xl border border-[#004d40]/10 shadow-sm">
          <div className="flex items-center px-2">
            <button onClick={() => changeMonth(-1)} className="p-1 font-black text-[#004d40]">‹</button>
            <span className="font-black px-2 text-sm">{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</span>
            <button onClick={() => changeMonth(1)} className="p-1 font-black text-[#004d40]">›</button>
          </div>
          <div className="flex border-l border-[#004d40]/10 pl-1">
            <button onClick={() => setActiveTab('CALENDAR')} className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${activeTab === 'CALENDAR' ? 'bg-[#004d40] text-white' : 'text-[#004d40]/60'}`}>달력</button>
            <button onClick={() => setActiveTab('STATISTICS')} className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${activeTab === 'STATISTICS' ? 'bg-[#004d40] text-white' : 'text-[#004d40]/60'}`}>통계</button>
            <button onClick={() => setActiveTab('FINANCE')} className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${activeTab === 'FINANCE' ? 'bg-[#004d40] text-white' : 'text-[#004d40]/60'}`}>금융</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#004d40] rounded-2xl p-5 text-white shadow-md">
            <div className="text-[10px] font-bold opacity-60">이번 달 수입</div>
            <div className="text-xl font-black">+{totals.income.toLocaleString()}원</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border-2 border-[#004d40] shadow-sm">
            <div className="text-[10px] font-bold text-[#004d40]/40">이번 달 지출</div>
            <div className="text-xl font-black text-red-600">-{totals.expense.toLocaleString()}원</div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'CALENDAR' && <Calendar currentDate={currentDate} transactions={transactions} onDateClick={setSelectedDate} />}
          {activeTab === 'STATISTICS' && <StatisticsView transactions={transactions} currentDate={currentDate} />}
          {activeTab === 'FINANCE' && <FinanceView fixedExpenses={fixedExpenses} setFixedExpenses={setFixedExpenses} savings={savings} setSavings={setSavings} loans={loans} setLoans={setLoans} />}
        </div>
      </main>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40">
        <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} className="w-16 h-16 bg-[#004d40] text-white rounded-full font-black shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-4xl border-4 border-[#F5F5DC]">+</button>
      </div>

      <AIChatbot onTransaction={handleAddTransaction} />
      {selectedDate && <TransactionModal date={selectedDate} onClose={() => setSelectedDate(null)} onSave={handleAddTransaction} />}
    </div>
  );
};

export default App;
