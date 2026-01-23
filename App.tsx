
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
      console.warn(`Localstorage parse error for ${key}`, e);
      return defaultValue;
    }
  };

  const [transactions, setTransactions] = useState<Transaction[]>(() => safeParse('rich_hamster_tx_v2', []));
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => safeParse('rich_hamster_fixed_v2', []));
  const [savings, setSavings] = useState<Saving[]>(() => safeParse('rich_hamster_savings_v2', []));
  const [loans, setLoans] = useState<Loan[]>(() => safeParse('rich_hamster_loans_v2', []));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => localStorage.setItem('rich_hamster_tx_v2', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('rich_hamster_fixed_v2', JSON.stringify(fixedExpenses)), [fixedExpenses]);
  useEffect(() => localStorage.setItem('rich_hamster_savings_v2', JSON.stringify(savings)), [savings]);
  useEffect(() => localStorage.setItem('rich_hamster_loans_v2', JSON.stringify(loans)), [loans]);

  const handleAddTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...data,
      id: Math.random().toString(36).substring(2, 11)
    };
    setTransactions(prev => [...prev, newTx]);
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

  return (
    <div className="min-h-screen bg-[#F5F5DC] p-4 md:p-8 text-[#2C3E50] transition-colors duration-500">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-[#004d40] flex items-center justify-center md:justify-start gap-3">
            <span className="text-5xl">🐹</span> 부자 햄찌 가계부
          </h1>
          <p className="text-[#004d40]/60 text-sm font-bold mt-2 tracking-wide">해바라기씨처럼 돈을 모아봐요! 🌻</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 bg-white/60 p-2 rounded-3xl border border-[#004d40]/10 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-sm">
            <button onClick={() => changeMonth(-1)} className="text-[#004d40] font-black text-xl hover:scale-125 transition-transform p-1">‹</button>
            <span className="font-black text-lg min-w-[120px] text-center">{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</span>
            <button onClick={() => changeMonth(1)} className="text-[#004d40] font-black text-xl hover:scale-125 transition-transform p-1">›</button>
          </div>
          
          <nav className="flex bg-gray-200/50 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveTab('CALENDAR')} 
              className={`px-5 py-2 text-sm font-black rounded-xl transition-all ${activeTab === 'CALENDAR' ? 'bg-[#004d40] text-white shadow-md' : 'text-[#004d40]/50 hover:text-[#004d40]'}`}
            >
              달력
            </button>
            <button 
              onClick={() => setActiveTab('STATISTICS')} 
              className={`px-5 py-2 text-sm font-black rounded-xl transition-all ${activeTab === 'STATISTICS' ? 'bg-[#004d40] text-white shadow-md' : 'text-[#004d40]/50 hover:text-[#004d40]'}`}
            >
              통계
            </button>
            <button 
              onClick={() => setActiveTab('FINANCE')} 
              className={`px-5 py-2 text-sm font-black rounded-xl transition-all ${activeTab === 'FINANCE' ? 'bg-[#004d40] text-white shadow-md' : 'text-[#004d40]/50 hover:text-[#004d40]'}`}
            >
              금융
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 mb-24">
        <aside className="lg:col-span-1 space-y-5">
          <div className="bg-[#004d40] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute right-[-10px] bottom-[-10px] text-8xl opacity-10 rotate-12 group-hover:rotate-0 transition-transform">💰</div>
            <div className="text-xs font-bold opacity-60 uppercase tracking-widest mb-1">THIS MONTH INCOME</div>
            <div className="text-2xl font-black">+{totals.income.toLocaleString()}원</div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 border-2 border-[#004d40] shadow-md relative overflow-hidden group">
            <div className="absolute right-[-10px] bottom-[-10px] text-8xl opacity-10 rotate-12 group-hover:rotate-0 transition-transform text-red-500">💸</div>
            <div className="text-xs font-bold text-[#004d40]/40 uppercase tracking-widest mb-1">THIS MONTH EXPENSE</div>
            <div className="text-2xl font-black text-red-600">-{totals.expense.toLocaleString()}원</div>
          </div>

          <div className="bg-[#FFFFF0] rounded-3xl p-6 border border-[#D2B48C] shadow-sm">
            <div className="text-xs font-bold text-[#004d40]/40 uppercase tracking-widest mb-1">CURRENT BALANCE</div>
            <div className="text-2xl font-black text-[#004d40]">{(totals.income - totals.expense).toLocaleString()}원</div>
          </div>
        </aside>

        <section className="lg:col-span-3">
          {activeTab === 'CALENDAR' && <Calendar currentDate={currentDate} transactions={transactions} onDateClick={setSelectedDate} />}
          {activeTab === 'STATISTICS' && <StatisticsView transactions={transactions} currentDate={currentDate} />}
          {activeTab === 'FINANCE' && <FinanceView fixedExpenses={fixedExpenses} setFixedExpenses={setFixedExpenses} savings={savings} setSavings={setSavings} loans={loans} setLoans={setLoans} />}
        </section>
      </main>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} 
          className="w-16 h-16 bg-[#004d40] text-white rounded-full font-black shadow-[0_10px_30px_rgba(0,77,64,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-4xl border-4 border-[#F5F5DC]"
        >
          +
        </button>
      </div>

      <AIChatbot onTransaction={handleAddTransaction} />
      
      {selectedDate && (
        <TransactionModal 
          date={selectedDate} 
          onClose={() => setSelectedDate(null)} 
          onSave={handleAddTransaction} 
        />
      )}
    </div>
  );
};

export default App;
