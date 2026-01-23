
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#F5F5DC] border-4 border-[#004d40] rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#004d40] font-bold text-xl">✕</button>
        <h2 className="text-xl font-black text-[#004d40] mb-6">🐹 {date} 기록하기</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-white rounded-xl p-1 border-2 border-[#D2B48C]">
            <button type="button" onClick={() => setType('INCOME')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${type === 'INCOME' ? 'bg-[#004d40] text-white' : 'text-[#004d40]'}`}>수입</button>
            <button type="button" onClick={() => setType('EXPENSE')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${type === 'EXPENSE' ? 'bg-[#004d40] text-white' : 'text-[#004d40]'}`}>지출</button>
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 rounded-xl border-2 border-[#D2B48C] font-bold outline-none" required>
            <option value="">카테고리 선택</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} placeholder="금액 (원)" className="w-full p-3 rounded-xl border-2 border-[#D2B48C] font-bold outline-none" required />
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="설명 (선택)" className="w-full p-3 rounded-xl border-2 border-[#D2B48C] font-bold outline-none" />
          <button type="submit" className="w-full bg-[#004d40] text-white py-4 rounded-xl font-black shadow-lg hover:brightness-110 active:scale-95 transition-all">기록하기 🐹✨</button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
