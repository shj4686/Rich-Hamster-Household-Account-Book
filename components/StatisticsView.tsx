
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';

interface StatisticsViewProps {
  transactions: Transaction[];
  currentDate: Date;
}

const StatisticsView: React.FC<StatisticsViewProps> = ({ transactions, currentDate }) => {
  const [activeAnalysis, setActiveAnalysis] = useState<TransactionType>('EXPENSE');
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthlyData = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  // Added explicit type for accumulator in reduce to ensure monthlyIncome and monthlyExpense are recognized as numbers
  const monthlyIncome = monthlyData.filter(t => t.type === 'INCOME').reduce((acc: number, curr) => acc + curr.amount, 0);
  const monthlyExpense = monthlyData.filter(t => t.type === 'EXPENSE').reduce((acc: number, curr) => acc + curr.amount, 0);

  const yearlyMonths = Array.from({ length: 12 }, (_, i) => {
    const monthData = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === i;
    });
    // Added explicit type for accumulator in reduce operations for yearly totals
    const income = monthData.filter(t => t.type === 'INCOME').reduce((acc: number, curr) => acc + curr.amount, 0);
    const expense = monthData.filter(t => t.type === 'EXPENSE').reduce((acc: number, curr) => acc + curr.amount, 0);
    return { month: i + 1, income, expense };
  });

  const maxYearlyValue = Math.max(...yearlyMonths.map(m => Math.max(m.income, m.expense)), 1);

  const getCategorySummary = (type: TransactionType) => {
    // Explicitly typed the initial value of reduce and the accumulator to Record<string, number>
    const summary = monthlyData
      .filter(t => t.type === type)
      .reduce((acc: Record<string, number>, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      }, {} as Record<string, number>);
    
    const total = type === 'INCOME' ? monthlyIncome : monthlyExpense;
    // Cast Object.entries to [string, number][] to fix type errors in arithmetic operations during sort and map
    return (Object.entries(summary) as [string, number][])
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0
      }));
  };

  const incomeCategories = getCategorySummary('INCOME');
  const expenseCategories = getCategorySummary('EXPENSE');
  const displayCategories = activeAnalysis === 'INCOME' ? incomeCategories : expenseCategories;

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-3xl p-6 md:p-8 border-2 border-[#004d40]/10 shadow-xl">
        <h2 className="text-xl font-black text-[#004d40] mb-8 flex items-center gap-2">
          📊 {currentYear}년 {currentMonth + 1}월 상세 분석
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <button 
            onClick={() => setActiveAnalysis('INCOME')}
            className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
              activeAnalysis === 'INCOME' 
              ? 'border-[#004d40] bg-[#004d40]/5 shadow-inner scale-[1.02]' 
              : 'border-transparent bg-gray-50 hover:bg-[#004d40]/5'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-black text-[#004d40]">총 수입</span>
              {activeAnalysis === 'INCOME' && <span className="text-[10px] bg-[#004d40] text-white px-2 py-0.5 rounded-full">분석 중</span>}
            </div>
            <div className="text-2xl font-black text-[#004d40]">+{monthlyIncome.toLocaleString()}원</div>
          </button>

          <button 
            onClick={() => setActiveAnalysis('EXPENSE')}
            className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
              activeAnalysis === 'EXPENSE' 
              ? 'border-red-500 bg-red-50 shadow-inner scale-[1.02]' 
              : 'border-transparent bg-gray-50 hover:bg-red-50'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-black text-red-500">총 지출</span>
              {activeAnalysis === 'EXPENSE' && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">분석 중</span>}
            </div>
            <div className="text-2xl font-black text-red-600">-{monthlyExpense.toLocaleString()}원</div>
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-[#2C3E50]">
              {activeAnalysis === 'INCOME' ? '💰 수입' : '💸 지출'} 카테고리 순위
            </h3>
          </div>

          {displayCategories.length > 0 ? (
            <div className="space-y-5">
              {displayCategories.map((cat, idx) => (
                <div key={cat.name} className="relative">
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="flex items-center gap-2">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] text-white ${idx === 0 ? 'bg-yellow-500' : 'bg-[#004d40]/20 text-[#004d40]'}`}>
                        {idx + 1}
                      </span>
                      {cat.name}
                    </span>
                    <span>{cat.amount.toLocaleString()}원 ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${activeAnalysis === 'INCOME' ? 'bg-[#004d40]' : 'bg-red-400'}`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-[#2C3E50]/40 font-bold">기록된 내역이 없어요. 🐹</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-3xl p-8 border-2 border-[#004d40]/10 shadow-xl">
        <h2 className="text-xl font-black text-[#004d40] mb-8">📈 {currentYear}년 월별 흐름</h2>
        <div className="h-64 flex items-end gap-2 md:gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
          {yearlyMonths.map((m) => (
            <div key={m.month} className="flex-1 min-w-[40px] flex flex-col items-center gap-1 group">
              <div className="flex items-end gap-1 w-full justify-center">
                <div 
                  className="w-2.5 md:w-4 bg-[#004d40] rounded-t-md transition-all duration-700 hover:brightness-125"
                  style={{ height: `${(m.income / maxYearlyValue) * 180}px` }}
                />
                <div 
                  className="w-2.5 md:w-4 bg-red-400 rounded-t-md transition-all duration-700 hover:brightness-110"
                  style={{ height: `${(m.expense / maxYearlyValue) * 180}px` }}
                />
              </div>
              <span className={`text-[10px] font-bold mt-2 whitespace-nowrap ${m.month === currentMonth + 1 ? 'text-[#004d40] bg-[#004d40]/10 px-2 rounded-full' : 'text-gray-400'}`}>
                {m.month}월
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StatisticsView;
