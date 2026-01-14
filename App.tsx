
import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import AIChatbot from './components/AIChatbot';
import TransactionModal from './components/TransactionModal';
import StatisticsView from './components/StatisticsView';
import FinanceView from './components/FinanceView';
import { Transaction, FixedExpense, Saving, Loan } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'STATISTICS' | 'FINANCE'>('CALENDAR');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // 가계부 내역
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('rich_hamster_ledger_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // 금융 데이터
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => {
    const saved = localStorage.getItem('rich_hamster_fixed_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [savings, setSavings] = useState<Saving[]>(() => {
    const saved = localStorage.getItem('rich_hamster_savings');
    return saved ? JSON.parse(saved) : [];
  });
  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('rich_hamster_loans');
    return saved ? JSON.parse(saved) : [];
  });

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

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    setCurrentDate(new Date(currentDate.getFullYear(), newMonth, 1));
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const currentTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
  });

  const totalIncome = currentTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = currentTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const openTodayModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  const years = Array.from({ length: 7 }, (_, i) => 2024 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-[#F5F5DC] pb-32 p-4 md:p-10 text-[#2C3E50]">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-end mb-8 md:mb-12 gap-6">
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#004d40] tracking-tight flex items-center gap-3">
            <span className="text-4xl md:text-5xl">🐹</span>
            부자 햄스터 가계부
          </h1>
          <p className="text-[#004d40]/70 font-bold text-xs mt-2 ml-1">차곡차곡 모아서 부자가 되어 봐요! 🌻</p>
        </div>

        {/* 날짜와 탭 메뉴가 나란히 배치되는 컨트롤 영역 */}
        <div className="flex flex-row items-center gap-4 md:gap-6 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide no-scrollbar">
          
          {/* 날짜 선택기 (배경 제거) */}
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <button 
              onClick={() => changeMonth(-1)} 
              disabled={currentDate.getFullYear() <= 2024 && currentDate.getMonth() <= 0}
              className="text-2xl font-black text-[#004d40] hover:scale-110 transition disabled:opacity-10 px-1"
            >
              ‹
            </button>
            
            <div className="flex items-center gap-0.5">
              <select 
                value={currentDate.getFullYear()} 
                onChange={handleYearChange}
                className="bg-transparent font-black text-[#2C3E50] text-lg md:text-xl outline-none cursor-pointer hover:text-[#004d40] transition appearance-none"
              >
                {years.map(y => <option key={y} value={y}>{y}년</option>)}
              </select>
              <select 
                value={currentDate.getMonth()} 
                onChange={handleMonthChange}
                className="bg-transparent font-black text-[#2C3E50] text-lg md:text-xl outline-none cursor-pointer hover:text-[#004d40] transition appearance-none"
              >
                {months.map(m => <option key={m} value={m}>{m + 1}월</option>)}
              </select>
            </div>

            <button 
              onClick={() => changeMonth(1)} 
              disabled={currentDate.getFullYear() >= 2030 && currentDate.getMonth() >= 11}
              className="text-2xl font-black text-[#004d40] hover:scale-110 transition disabled:opacity-10 px-1"
            >
              ›
            </button>
          </div>

          {/* 탭 메뉴 (배경 제거, 간결한 언더라인 스타일) */}
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 border-l-2 border-[#004d40]/10 pl-4">
             <button 
               onClick={() => setActiveTab('CALENDAR')}
               className={`px-3 py-2 text-sm md:text-base font-black transition-all whitespace-nowrap ${activeTab === 'CALENDAR' ? 'text-[#004d40] border-b-4 border-[#004d40]' : 'text-[#004d40]/40 hover:text-[#004d40]/70'}`}
             >
               달력
             </button>
             <button 
               onClick={() => setActiveTab('STATISTICS')}
               className={`px-3 py-2 text-sm md:text-base font-black transition-all whitespace-nowrap ${activeTab === 'STATISTICS' ? 'text-[#004d40] border-b-4 border-[#004d40]' : 'text-[#004d40]/40 hover:text-[#004d40]/70'}`}
             >
               통계
             </button>
             <button 
               onClick={() => setActiveTab('FINANCE')}
               className={`px-3 py-2 text-sm md:text-base font-black transition-all whitespace-nowrap ${activeTab === 'FINANCE' ? 'text-[#004d40] border-b-4 border-[#004d40]' : 'text-[#004d40]/40 hover:text-[#004d40]/70'}`}
             >
               금융
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#004d40] rounded-2xl p-4 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute -right-2 -bottom-2 opacity-10 text-7xl group-hover:scale-110 transition">💰</div>
            <h3 className="text-xs font-bold text-[#D2B48C] mb-0.5">이번 달 수입</h3>
            <div className="text-xl font-black">+{totalIncome.toLocaleString()}원</div>
          </div>

          <div className="bg-white rounded-2xl p-4 text-[#2C3E50] border-2 border-[#004d40] shadow-md relative overflow-hidden group">
             <div className="absolute -right-2 -bottom-2 opacity-10 text-7xl group-hover:scale-110 transition">💸</div>
            <h3 className="text-xs font-bold text-[#004d40]/50 mb-0.5">이번 달 지출</h3>
            <div className="text-xl font-black text-red-600">-{totalExpense.toLocaleString()}원</div>
          </div>

          <div className="bg-[#FFFFF0] rounded-2xl p-4 text-[#004d40] border border-[#D2B48C] shadow-sm">
             <h3 className="text-xs font-bold text-[#004d40]/50 mb-0.5">현재 잔액</h3>
             <div className="text-xl font-black">{(totalIncome - totalExpense).toLocaleString()}원</div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'CALENDAR' && (
            <Calendar currentDate={currentDate} transactions={transactions} onDateClick={(date) => setSelectedDate(date)} />
          )}
          {activeTab === 'STATISTICS' && (
            <StatisticsView transactions={transactions} currentDate={currentDate} />
          )}
          {activeTab === 'FINANCE' && (
            <FinanceView 
              fixedExpenses={fixedExpenses} 
              setFixedExpenses={setFixedExpenses}
              savings={savings}
              setSavings={setSavings}
              loans={loans}
              setLoans={setLoans}
            />
          )}
        </div>
      </main>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={openTodayModal}
          className="bg-[#004d40] text-white w-16 h-16 rounded-full font-black shadow-2xl hover:bg-[#003d32] hover:scale-110 transition active:scale-95 flex items-center justify-center text-4xl border-4 border-[#F5F5DC]"
        >
          +
        </button>
      </div>

      <AIChatbot 
        onTransaction={(data) => {
          let txDate = data.date || new Date().toISOString().split('T')[0];
          handleAddTransaction({
            type: (data.type as any) || 'EXPENSE',
            category: data.category || '기타',
            amount: Number(data.amount) || 0,
            description: data.description || 'AI 비서의 기록',
            date: txDate
          });
        }} 
      />

      {selectedDate && (
        <TransactionModal date={selectedDate} onClose={() => setSelectedDate(null)} onSave={handleAddTransaction} />
      )}
    </div>
  );
};

export default App;
