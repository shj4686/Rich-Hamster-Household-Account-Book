
import React from 'react';
import { HOLIDAYS } from '../constants';
import { Transaction } from '../types';

interface CalendarProps {
  currentDate: Date;
  transactions: Transaction[];
  onDateClick: (dateStr: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ currentDate, transactions, onDateClick }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getDayTransactions = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return transactions.filter(t => t.date === dateStr);
  };

  const isHoliday = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return HOLIDAYS.find(h => h.date === dateStr);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-3xl border-2 border-[#004d40]/10 shadow-xl overflow-hidden animate-in fade-in duration-500">
      <div className="grid grid-cols-7 bg-[#004d40] text-white font-bold text-center py-3">
        <div className="text-xs opacity-70">SUN</div>
        <div className="text-xs">MON</div>
        <div className="text-xs">TUE</div>
        <div className="text-xs">WED</div>
        <div className="text-xs">THU</div>
        <div className="text-xs">FRI</div>
        <div className="text-xs opacity-70">SAT</div>
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="h-28 bg-gray-50/50 border border-gray-100" />;
          
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const dayTx = getDayTransactions(day);
          const income = dayTx.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
          const expense = dayTx.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
          const holiday = isHoliday(day);
          
          return (
            <div 
              key={day} 
              onClick={() => onDateClick(dateStr)}
              className={`h-28 border border-gray-100 p-2 cursor-pointer transition-all flex flex-col group relative ${
                isToday ? 'bg-[#004d40]/5' : 'hover:bg-[#FFFFF0]'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-bold ${
                  idx % 7 === 0 || holiday ? 'text-red-500' : idx % 7 === 6 ? 'text-blue-500' : 'text-[#2C3E50]'
                }`}>
                  {day}
                </span>
                {holiday && (
                  <span className="text-[9px] text-red-400 font-black leading-tight text-right">
                    {holiday.name}
                  </span>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-end gap-1">
                {income > 0 && (
                  <div className="text-[10px] md:text-xs text-[#004d40] font-black bg-[#004d40]/10 px-1.5 py-0.5 rounded-md truncate">
                    +{income.toLocaleString()}
                  </div>
                )}
                {expense > 0 && (
                  <div className="text-[10px] md:text-xs text-red-500 font-black bg-red-50 px-1.5 py-0.5 rounded-md truncate">
                    -{expense.toLocaleString()}
                  </div>
                )}
              </div>
              {isToday && (
                <div className="absolute bottom-1 right-1 w-2 h-2 bg-[#004d40] rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;