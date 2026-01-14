
import React from 'react';
import { X, CheckCircle2, CreditCard, ArrowRight, ShieldCheck } from 'lucide-react';
import { Contract } from '../types';

interface RedeemModalProps {
  contract: Contract;
  interestOwed: number;
  onClose: () => void;
  onConfirm: (total: number) => void;
}

export const RedeemModal: React.FC<RedeemModalProps> = ({ contract, interestOwed, onClose, onConfirm }) => {
  const totalAmount = contract.loanAmount + interestOwed;
  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + 'đ';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end md:items-center justify-center z-[70] p-0 md:p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col transition-transform animate-in slide-in-from-bottom-10">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-purple-900 leading-tight">Chuộc đồ & Tất toán</h2>
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">{contract.model}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-purple-400"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-500">Tiền gốc:</span>
              <span className="font-black text-slate-800">{formatCurrency(contract.loanAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-500">Lãi cộng dồn:</span>
              <span className="font-black text-emerald-600">{formatCurrency(interestOwed)}</span>
            </div>
            
            <div className="pt-4 border-t-2 border-dashed border-slate-100">
              <div className="bg-slate-900 rounded-3xl p-5 text-center shadow-inner">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Tổng cộng tất toán</p>
                <h3 className="text-3xl font-black text-white">{formatCurrency(totalAmount)}</h3>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start space-x-3">
            <ShieldCheck size={18} className="text-blue-500 mt-0.5" />
            <p className="text-[11px] text-blue-600 font-medium leading-relaxed">
              Xác nhận bàn giao thiết bị <strong>{contract.model}</strong> cho khách hàng <strong>{contract.customerName}</strong> sau khi nhận đủ tiền.
            </p>
          </div>

          <button 
            onClick={() => onConfirm(totalAmount)}
            className="w-full py-5 bg-purple-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-purple-100 active:scale-95 transition-all flex items-center justify-center uppercase tracking-widest"
          >
            <CreditCard size={20} className="mr-2" /> XÁC NHẬN CHUỘC ĐỒ
          </button>
        </div>
      </div>
    </div>
  );
};
