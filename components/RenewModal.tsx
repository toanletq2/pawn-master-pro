
import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Calculator, ArrowRight, AlertCircle } from 'lucide-react';
import { Contract } from '../types';

interface RenewModalProps {
  contract: Contract;
  suggestedDays: number;
  suggestedAmount: number;
  onClose: () => void;
  onRenew: (amount: number, days: number) => void;
}

export const RenewModal: React.FC<RenewModalProps> = ({ 
  contract, 
  suggestedDays, 
  suggestedAmount, 
  onClose, 
  onRenew 
}) => {
  const [displayAmount, setDisplayAmount] = useState('');
  const [amount, setAmount] = useState(0);

  const dailyRateTotal = (contract.loanAmount / 1000000) * contract.interestRate;

  useEffect(() => {
    setAmount(suggestedAmount);
    setDisplayAmount(suggestedAmount > 0 ? suggestedAmount.toLocaleString('vi-VN') : '');
  }, [suggestedAmount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const numValue = parseInt(rawValue) || 0;
    setAmount(numValue);
    setDisplayAmount(numValue > 0 ? numValue.toLocaleString('vi-VN') : '');
  };

  const daysFromAmount = dailyRateTotal > 0 ? Math.floor(amount / dailyRateTotal) : 0;
  
  const lastPaidDate = new Date(contract.lastPaidDate || contract.pawnDate);
  const newPaidUntil = new Date(lastPaidDate.getTime() + (daysFromAmount * 86400000));

  const handleSubmit = () => {
    if (amount > 0 && daysFromAmount > 0) {
      onRenew(amount, daysFromAmount);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end md:items-center justify-center z-[120] animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col transition-transform animate-in slide-in-from-bottom-10">
        <div className="px-6 py-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/30">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Đóng lãi gia hạn</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{contract.model}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white rounded-full transition-colors"><X size={28} /></button>
        </div>

        <div className="p-6 space-y-8">
          <div className="bg-blue-50 p-5 rounded-2xl flex items-start space-x-3 border border-blue-100 shadow-inner">
            <AlertCircle size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-black text-blue-700 uppercase tracking-widest leading-none mb-1">Nợ hiện tại ({suggestedDays} ngày)</p>
              <p className="text-base font-black text-blue-600">{suggestedAmount.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Số tiền khách đóng (VNĐ)</label>
            <div className="relative">
              <input 
                type="text" 
                inputMode="numeric"
                className="w-full px-7 py-6 bg-emerald-50 border-2 border-emerald-100 rounded-3xl text-3xl font-black text-emerald-700 outline-none focus:border-emerald-500 transition-all shadow-inner"
                placeholder="0"
                value={displayAmount}
                onChange={handleAmountChange}
              />
              <span className="absolute right-7 top-1/2 -translate-y-1/2 font-black text-emerald-200 uppercase text-sm">VNĐ</span>
            </div>
          </div>

          {daysFromAmount > 0 && (
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-tight">Số ngày gia hạn:</span>
                <span className="text-2xl font-black text-blue-600">{daysFromAmount} ngày</span>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                  <ArrowRight size={14} className="mr-2 text-blue-500" /> Ngày chốt lãi đến:
                </div>
                <p className="text-base font-black text-slate-800">{newPaidUntil.toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          )}

          <button 
            disabled={amount <= 0 || daysFromAmount <= 0}
            onClick={handleSubmit}
            className="w-full py-5.5 bg-blue-600 disabled:bg-slate-200 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 active:scale-95 transition-all uppercase tracking-widest"
          >
            XÁC NHẬN ĐÓNG LÃI
          </button>
        </div>
      </div>
    </div>
  );
};
