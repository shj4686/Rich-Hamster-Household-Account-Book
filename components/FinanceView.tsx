
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

  // 적금 만기 수령액 계산 (단리 기준, 일반 과세 15.4% 적용)
  const calculateSavingMaturity = (s: Saving) => {
    const months = s.term;
    const rate = s.rate / 100;
    let totalPrincipal = 0;
    let totalInterest = 0;

    if (s.type === 'INSTALLMENT') {
      totalPrincipal = s.monthlyAmount * months;
      // 적금 이자 계산: 월납입액 * n(n+1)/2 * (이율/12)
      totalInterest = s.monthlyAmount * (months * (months + 1) / 2) * (rate / 12);
    } else {
      totalPrincipal = s.monthlyAmount;
      totalInterest = totalPrincipal * rate * (months / 12);
    }

    const tax = totalInterest * 0.154;
    const afterTaxInterest = totalInterest - tax;
    return { principal: totalPrincipal, interest: afterTaxInterest, total: totalPrincipal + afterTaxInterest };
  };

  // 대출 월 납입금 계산 (원리금 균등 상환 기준)
  const calculateMonthlyLoan = (l: Loan) => {
    const monthlyRate = (l.rate / 100) / 12;
    const term = l.term;
    const numerator = l.principal * monthlyRate * Math.pow(1 + monthlyRate, term);
    const denominator = Math.pow(1 + monthlyRate, term) - 1;
    return Math.floor(numerator / denominator);
  };

  const addFixedExpense = () => {
    const name = prompt("고정 지출 명칭 (예: 월세, 통신비)");
    const amount = Number(prompt("금액 (원)"));
    const day = Number(prompt("매달 출금일 (1~31)"));
    if (name && amount > 0) {
      setFixedExpenses(prev => [...prev, { id: Date.now().toString(), name, amount, day }]);
    }
  };

  const addSaving = () => {
    const name = prompt("상품명 (예: 청년희망적금)");
    const type = confirm("적금이면 '확인', 예금이면 '취소'를 눌러주세요.") ? 'INSTALLMENT' : 'DEPOSIT';
    const monthlyAmount = Number(prompt(type === 'INSTALLMENT' ? "월 납입액 (원)" : "예치 원금 (원)"));
    const rate = Number(prompt("연 이율 (%)"));
    const term = Number(prompt("기간 (개월)"));
    if (name && monthlyAmount > 0) {
      setSavings(prev => [...prev, { id: Date.now().toString(), name, type, monthlyAmount, rate, term, startDate: new Date().toISOString().split('T')[0] }]);
    }
  };

  const addLoan = () => {
    const name = prompt("대출 명칭 (예: 전세자금대출)");
    const principal = Number(prompt("대출 원금 (원)"));
    const rate = Number(prompt("연 이율 (%)"));
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
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex gap-2 bg-white/50 p-1.5 rounded-2xl border border-[#004d40]/10 overflow-x-auto">
        <button onClick={() => setActiveSubTab('FIXED')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${activeSubTab === 'FIXED' ? 'bg-[#004d40] text-white' : 'text-[#004d40]'}`}>고정 지출</button>
        <button onClick={() => setActiveSubTab('SAVINGS')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${activeSubTab === 'SAVINGS' ? 'bg-[#004d40] text-white' : 'text-[#004d40]'}`}>목돈 모으기</button>
        <button onClick={() => setActiveSubTab('LOANS')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${activeSubTab === 'LOANS' ? 'bg-[#004d40] text-white' : 'text-[#004d40]'}`}>대출 관리</button>
      </div>

      {activeSubTab === 'FIXED' && (
        <section className="bg-white rounded-3xl p-6 border-2 border-[#004d40]/10 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-[#004d40]">🏠 매달 나가는 고정비</h2>
            <button onClick={addFixedExpense} className="text-xs bg-[#004d40] text-white px-3 py-1.5 rounded-full font-bold">+ 추가</button>
          </div>
          <div className="space-y-3">
            {fixedExpenses.length > 0 ? fixedExpenses.map(fe => (
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
            )) : <p className="text-center py-10 text-gray-400 text-sm font-bold">기록된 고정 지출이 없어요. 🐹</p>}
            <div className="pt-4 border-t border-dashed mt-4 flex justify-between items-center">
              <span className="text-sm font-black">월 고정 지출 합계</span>
              <span className="text-lg font-black text-red-600">-{fixedExpenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}원</span>
            </div>
          </div>
        </section>
      )}

      {activeSubTab === 'SAVINGS' && (
        <section className="bg-white rounded-3xl p-6 border-2 border-[#004d40]/10 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-[#004d40]">🍯 햄스터의 보물창고 (적금)</h2>
            <button onClick={addSaving} className="text-xs bg-[#004d40] text-white px-3 py-1.5 rounded-full font-bold">+ 추가</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savings.length > 0 ? savings.map(s => {
              const result = calculateSavingMaturity(s);
              return (
                <div key={s.id} className="p-5 bg-[#FFFFF0] rounded-2xl border-2 border-[#D2B48C] space-y-3 relative group">
                  <button onClick={() => deleteItem(setSavings, s.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition">✕</button>
                  <div className="flex justify-between items-start">
                    <span className="bg-[#004d40] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{s.type === 'INSTALLMENT' ? '적금' : '예금'}</span>
                    <span className="text-xs font-black text-[#004d40]">{s.rate}%</span>
                  </div>
                  <h3 className="font-black text-[#2C3E50]">{s.name}</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-gray-500">
                      <span>원금 합계</span>
                      <span>{result.principal.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-[#004d40]">
                      <span>만기 이자(세후)</span>
                      <span>+{Math.floor(result.interest).toLocaleString()}원</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#D2B48C]/30 flex justify-between items-center">
                    <span className="text-xs font-black text-[#2C3E50]">만기 시 예상 수령액</span>
                    <span className="text-md font-black text-[#004d40]">{Math.floor(result.total).toLocaleString()}원</span>
                  </div>
                </div>
              );
            }) : <p className="col-span-full text-center py-10 text-gray-400 text-sm font-bold">목돈 모으기 계획을 세워보세요! 🐹🌻</p>}
          </div>
          <div className="mt-8 bg-[#004d40] text-white p-5 rounded-2xl flex justify-between items-center shadow-lg">
             <div>
               <div className="text-xs font-bold opacity-70">현재까지 모인 모든 원금</div>
               <div className="text-2xl font-black">{savings.reduce((acc, curr) => acc + (curr.type === 'DEPOSIT' ? curr.monthlyAmount : curr.monthlyAmount * curr.term), 0).toLocaleString()}원</div>
             </div>
             <div className="text-4xl">💰</div>
          </div>
        </section>
      )}

      {activeSubTab === 'LOANS' && (
        <section className="bg-white rounded-3xl p-6 border-2 border-[#004d40]/10 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-red-700">🏢 대출 및 상환 관리</h2>
            <button onClick={addLoan} className="text-xs bg-[#004d40] text-white px-3 py-1.5 rounded-full font-bold">+ 추가</button>
          </div>
          <div className="space-y-4">
            {loans.length > 0 ? loans.map(l => (
              <div key={l.id} className="p-5 bg-red-50 rounded-2xl border border-red-100 flex flex-col md:flex-row justify-between gap-4 group relative">
                <button onClick={() => deleteItem(setLoans, l.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition">✕</button>
                <div className="space-y-1">
                  <h3 className="font-black text-[#2C3E50]">{l.name}</h3>
                  <div className="text-[10px] font-bold text-gray-400">원금 {l.principal.toLocaleString()}원 / {l.rate}% / {l.term}개월</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-red-400">매달 예상 상환액</div>
                  <div className="text-xl font-black text-red-600">-{calculateMonthlyLoan(l).toLocaleString()}원</div>
                </div>
              </div>
            )) : <p className="text-center py-10 text-gray-400 text-sm font-bold">대출 내역이 없습니다. 🐹✨</p>}
          </div>
          {loans.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
               <div className="flex justify-between items-center">
                 <span className="text-sm font-black text-gray-500">매달 총 대출 상환액</span>
                 <span className="text-lg font-black text-red-600">-{loans.reduce((acc, curr) => acc + calculateMonthlyLoan(curr), 0).toLocaleString()}원</span>
               </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default FinanceView;
