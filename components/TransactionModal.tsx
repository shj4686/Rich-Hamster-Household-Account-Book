
import React, { useState } from 'react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';
import { Transaction, TransactionType } from '../types';

interface TransactionModalProps {
  date: string;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ date, onClose, onSave }) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || amount <= 0) return;
    onSave({ date, type, category, amount, description });
    onClose();
  };

  const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[#F5F5DC] border-4 border-[#004d40] rounded-3xl w-full max-w-md p-8 shadow-2xl overflow-hidden relative animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-6 right-6 text-[#004d40] font-bold text-2xl hover:scale-125 transition">✕</button>
        
        <h2 className="text-2xl font-black text-[#004d40] mb-8 flex items-center gap-2">
          🐹 <span className="border-b-4 border-[#D2B48C]">{date}</span> 내역 기록하기
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex bg-[#FFFFF0] rounded-2xl p-1.5 border-2 border-[#D2B48C]">
            <button
              type="button"
              onClick={() => { setType('INCOME'); setCategory(''); }}
              className={`flex-1 py-3 rounded-xl font-bold transition ${type === 'INCOME' ? 'bg-[#004d40] text-white shadow-md' : 'text-[#004d40]'}`}
            >
              수입
            </button>
            <button
              type="button"
              onClick={() => { setType('EXPENSE'); setCategory(''); }}
              className={`flex-1 py-3 rounded-xl font-bold transition ${type === 'EXPENSE' ? 'bg-[#004d40] text-white shadow-md' : 'text-[#004d40]'}`}
            >
              지출
            </button>
          </div>

          <div>
            <label className="block text-sm font-black text-[#004d40] mb-2 ml-1">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-[#D2B48C] bg-white text-base font-bold focus:border-[#004d40] outline-none"
              required
            >
              <option value="">카테고리 선택</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-black text-[#004d40] mb-2 ml-1">금액 (원)</label>
            <input
              type="number"
              value={amount === 0 ? '' : amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0"
              className="w-full p-4 rounded-xl border-2 border-[#D2B48C] bg-white text-base font-bold focus:border-[#004d40] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-black text-[#004d40] mb-2 ml-1">상세 내용</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세 내용을 적어주세요"
              className="w-full p-4 rounded-xl border-2 border-[#D2B48C] bg-white text-base font-bold focus:border-[#004d40] outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#004d40] text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:bg-[#003d32] transition active:scale-95 mt-4"
          >
            기록 완료 🐹✨
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
