
import React, { useState } from 'react';
import { FixedExpense, Saving, Loan } from '../types';

interface FinanceViewProps {
  fixedExpenses: FixedExpense[];
  setFixedExpenses: React.Dispatch<React.SetStateAction<FixedExpense[]>>;
  savings: Saving[];
  setSavings: React.Dispatch<React.SetStateAction<Saving[]>>;
  loans: Loan[];
  setLoans: React.Dispatch<React.SetStateAction<Loan[]>>;
}

const FinanceView: React.FC<FinanceViewProps> = ({ 
  fixedExpenses, setFixedExpenses, 
  savings, setSavings, 
  loans, setLoans 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'FIXED' | 'SAVINGS' | 'LOANS'>('FIXED');

  const calculateSavingMaturity = (s: Saving) => {
    const months = s.term;
    const rate = s.rate / 100;
    let totalPrincipal = 0;
    let totalInterest = 0;

    if (s.type === 'INSTALLMENT') {
      totalPrincipal = s.monthlyAmount * months;
      totalInterest = s.monthlyAmount * (months * (months + 1) / 2) * (rate / 12);
    } else {
      totalPrincipal = s.monthlyAmount;
      totalInterest = totalPrincipal * rate * (months / 12);
    }

    const tax = totalInterest * 0.154;
    return { principal: totalPrincipal, interest: totalInterest - tax, total: totalPrincipal + totalInterest - tax };
  };

  const calculateMonthlyLoan = (l: Loan) => {
    const monthlyRate = (l.rate / 100) / 12;
    const term = l.term;
    const numerator = l.principal * monthlyRate * Math.pow(1 + monthlyRate, term);
    const denominator = Math.pow(1 + monthlyRate, term) - 1;
    return Math.floor(numerator / denominator);
  };

  const addFixedExpense = () => {
    const name = prompt("고정 지출 명칭");
    const amount = Number(prompt("금액 (원)"));
    const day = Number(prompt("매달 출금일"));
    if (name && amount > 0) {
      setFixedExpenses(prev => [...prev, { id: Date.now().toString(), name, amount, day }]);
    }
  };

  const addSaving = () => {
    const name = prompt("상품명");
    const type = confirm("적금이면 '확인', 예금이면 '취소'") ? 'INSTALLMENT' : 'DEPOSIT';
    const monthlyAmount = Number(prompt(type === 'INSTALLMENT' ? "월 납입액" : "예치 원금"));
    const rate = Number(prompt("연 이율"));
    const term = Number(prompt("기간 (개월)"));
    if (name && monthlyAmount > 0) {
      setSavings(prev => [...prev, { id: Date.now().toString(), name, type, monthlyAmount, rate, term, startDate: new Date().toISOString().split('T')[0] }]);
    }
  };

  const addLoan = () => {
    const name = prompt("대출 명칭");
    const principal = Number(prompt("대출 원금"));
    const rate = Number(prompt("연 이율"));
    const term = Number(prompt("상환 기간 (개월)"));
    if (name && principal > 0) {
      setLoans(prev => [...prev, { id: Date.now().toString(), name, principal, rate, term, startDate: new Date().toISOString().split('T')[0] }]);
    }
  };

  const deleteItem = (setter: any, id: string) => {
    if (confirm("삭제하시겠습니까?")) {
      setter((prev: any[]) => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-white/50 p-1.5 rounded-2xl border border-[#004d40]/10 overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveSubTab('FIXED')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${activeSubTab === 'FIXED' ? 'bg-[#004d40] text-white' : 'text-[#004d40]'}`}>고정 지출</button>
        <button onClick={() => setActiveSubTab('SAVINGS')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${activeSubTab === 'SAVINGS' ? 'bg-[#004d40] text-white' : 'text-[#004d40]'}`}>목돈 모으기</button>
        <button onClick={() => setActiveSubTab('LOANS')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${activeSubTab === 'LOANS' ? 'bg-[#004d40] text-white' : 'text-[#004d40]'}`}>대출 관리</button>
      </div>

      {activeSubTab === 'FIXED' && (
        <section className="bg-white rounded-3xl p-6 border-2 border-[#004d40]/10 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-[#004d40]">🏠 고정비 관리</h2>
            <button onClick={addFixedExpense} className="text-xs bg-[#004d40] text-white px-3 py-1.5 rounded-full font-bold">+ 추가</button>
          </div>
          <div className="space-y-3">
            {fixedExpenses.map(fe => (
              <div key={fe.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                <div>
                  <div className="text-sm font-black text-[#2C3E50]">{fe.name}</div>
                  <div className="text-[10px] text-[#004d40]/60 font-bold">매달 {fe.day}일</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-black text-red-500">-{fe.amount.toLocaleString()}원</div>
                  <button onClick={() => deleteItem(setFixedExpenses, fe.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition">✕</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeSubTab === 'SAVINGS' && (
        <section className="bg-white rounded-3xl p-6 border-2 border-[#004d40]/10 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-[#004d40]">🍯 저축 현황</h2>
            <button onClick={addSaving} className="text-xs bg-[#004d40] text-white px-3 py-1.5 rounded-full font-bold">+ 추가</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savings.map(s => {
              const result = calculateSavingMaturity(s);
              return (
                <div key={s.id} className="p-5 bg-[#FFFFF0] rounded-2xl border-2 border-[#D2B48C] space-y-3 relative group">
                  <button onClick={() => deleteItem(setSavings, s.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition">✕</button>
                  <div className="flex justify-between items-start">
                    <span className="bg-[#004d40] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{s.type === 'INSTALLMENT' ? '적금' : '예금'}</span>
                    <span className="text-xs font-black text-[#004d40]">{s.rate}%</span>
                  </div>
                  <h3 className="font-black text-[#2C3E50]">{s.name}</h3>
                  <div className="pt-2 border-t border-[#D2B48C]/30 flex justify-between items-center">
                    <span className="text-xs font-black text-[#2C3E50]">만기 예상</span>
                    <span className="text-md font-black text-[#004d40]">{Math.floor(result.total).toLocaleString()}원</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeSubTab === 'LOANS' && (
        <section className="bg-white rounded-3xl p-6 border-2 border-[#004d40]/10 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-red-700">🏢 대출 관리</h2>
            <button onClick={addLoan} className="text-xs bg-[#004d40] text-white px-3 py-1.5 rounded-full font-bold">+ 추가</button>
          </div>
          <div className="space-y-4">
            {loans.map(l => (
              <div key={l.id} className="p-5 bg-red-50 rounded-2xl border border-red-100 flex flex-col md:flex-row justify-between gap-4 group relative">
                <button onClick={() => deleteItem(setLoans, l.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition">✕</button>
                <div className="space-y-1">
                  <h3 className="font-black text-[#2C3E50]">{l.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-red-400">월 상환액</div>
                  <div className="text-xl font-black text-red-600">-{calculateMonthlyLoan(l).toLocaleString()}원</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default FinanceView;
