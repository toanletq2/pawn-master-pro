
import React, { useState } from 'react';
import { 
  X, Smartphone, User, Phone, Calendar, Clock, History, DollarSign, CheckCircle2, 
  Edit2, FileText, ShieldAlert, Landmark, Receipt, ArrowUpCircle, ArrowDownCircle, Wallet, MapPin, IdCard, Save
} from 'lucide-react';
import { Contract, Transaction, InterestSegment } from '../types';

interface ContractDetailModalProps {
  contract: Contract;
  interestOwed: number;
  interestDays?: number;
  onClose: () => void;
  onRenew: () => void;
  onRedeem: () => void;
  onCancel: () => void;
  onForfeit: () => void;
  onUpdate: (updatedContract: Contract) => void;
}

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({ 
  contract, interestOwed, interestDays = 0, onClose, onRenew, onRedeem, onCancel, onForfeit, onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPrincipalModal, setShowPrincipalModal] = useState<'increase' | 'decrease' | null>(null);
  const [displayPrincipalValue, setDisplayPrincipalValue] = useState('');
  
  const [editData, setEditData] = useState({
    customerName: contract.customerName,
    customerPhone: contract.customerPhone,
    model: contract.model,
    notes: contract.notes,
    interestRate: contract.interestRate.toString()
  });

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + 'đ';

  const handlePrincipalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/\D/g, '');
    setDisplayPrincipalValue(num ? parseInt(num).toLocaleString('vi-VN') : '');
  };

  const handlePrincipalChange = () => {
    const amount = parseInt(displayPrincipalValue.replace(/\D/g, '')) || 0;
    if (amount <= 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const newPrincipal = showPrincipalModal === 'increase' ? contract.loanAmount + amount : contract.loanAmount - amount;
    
    const updatedSegments = contract.segments.map(seg => seg.endDate ? seg : { ...seg, endDate: yesterdayStr });
    
    const newSegment: InterestSegment = { 
      startDate: todayStr, 
      principal: newPrincipal, 
      interestRate: contract.interestRate 
    };
    
    const newTx: Transaction = {
      id: Date.now().toString(),
      type: showPrincipalModal === 'increase' ? 'principal_increase' : 'principal_decrease',
      date: new Date().toISOString(),
      amount: amount,
      description: showPrincipalModal === 'increase' ? `Lấy thêm ${formatCurrency(amount)}` : `Trả bớt ${formatCurrency(amount)}`
    };

    onUpdate({
      ...contract,
      loanAmount: newPrincipal,
      segments: [...updatedSegments, newSegment],
      transactions: [...contract.transactions, newTx]
    });

    setShowPrincipalModal(null);
    setDisplayPrincipalValue('');
  };

  const handleSaveEdit = () => {
    onUpdate({
      ...contract,
      customerName: editData.customerName,
      customerPhone: editData.customerPhone,
      model: editData.model,
      notes: editData.notes,
      interestRate: parseFloat(editData.interestRate)
    });
    setIsEditing(false);
  };

  const Section = ({ title, icon: Icon, children, action }: any) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
      <div className="flex items-center justify-between text-slate-400">
        <div className="flex items-center space-x-2">
          <Icon size={14} className="text-blue-500" />
          <h4 className="text-[10px] font-black uppercase tracking-widest">{title}</h4>
        </div>
        {action}
      </div>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[110] animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full max-w-md h-[94vh] md:h-auto md:max-h-[90vh] rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-transform animate-in slide-in-from-bottom-5">
        
        <div className="bg-white px-5 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg ${contract.status === 'Overdue' ? 'bg-rose-500' : 'bg-blue-600'}`}>
              <Smartphone size={22} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase leading-none tracking-tight">Chi tiết hợp đồng</h2>
              <p className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-tighter">HĐ-{contract.id.slice(-6)} • {contract.status}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button onClick={() => setIsEditing(!isEditing)} className={`p-2.5 rounded-xl transition-all ${isEditing ? 'text-blue-600 bg-blue-50' : 'text-slate-300'}`}>
              <Edit2 size={20} />
            </button>
            <button onClick={onClose} className="p-2.5 text-slate-300 hover:text-rose-500"><X size={26} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
          {/* Chế độ chỉnh sửa */}
          {isEditing && (
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4 animate-in slide-in-from-top-1 shadow-inner">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center">
                <Edit2 size={12} className="mr-2" /> Chỉnh sửa nhanh
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                   <div className="space-y-1">
                     <p className="text-[9px] font-bold text-slate-400 uppercase ml-1">Tên khách hàng</p>
                     <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm" value={editData.customerName} onChange={e => setEditData({...editData, customerName: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                     <p className="text-[9px] font-bold text-slate-400 uppercase ml-1">Số điện thoại</p>
                     <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm" value={editData.customerPhone} onChange={e => setEditData({...editData, customerPhone: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                     <p className="text-[9px] font-bold text-slate-400 uppercase ml-1">Model máy</p>
                     <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm" value={editData.model} onChange={e => setEditData({...editData, model: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                     <p className="text-[9px] font-bold text-slate-400 uppercase ml-1">Lãi suất (đ/1tr/n)</p>
                     <input type="number" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm" value={editData.interestRate} onChange={e => setEditData({...editData, interestRate: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                     <p className="text-[9px] font-bold text-slate-400 uppercase ml-1">Ghi chú</p>
                     <textarea className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold h-20 shadow-sm" value={editData.notes} onChange={e => setEditData({...editData, notes: e.target.value})} />
                   </div>
                </div>
                <button onClick={handleSaveEdit} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center shadow-lg shadow-blue-100">
                  <Save size={16} className="mr-2" /> Lưu thay đổi
                </button>
              </div>
            </div>
          )}

          {/* Tài chính & Biến động gốc */}
          <Section title="Tài chính & Tiền gốc" icon={Landmark}>
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-50">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiền gốc hiện tại</p>
                <p className="text-xl font-black text-slate-900 leading-none">{formatCurrency(contract.loanAmount)}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lãi dự kiến ({interestDays}n)</p>
                <p className="text-xl font-black text-emerald-600 leading-none">{formatCurrency(interestOwed)}</p>
              </div>
            </div>
            {contract.status === 'Active' && (
              <div className="flex items-center justify-center gap-3 pt-2">
                 <button onClick={() => setShowPrincipalModal('increase')} className="flex-1 flex items-center justify-center space-x-2 py-3 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black uppercase tracking-tighter hover:bg-blue-100 transition-all shadow-sm"><ArrowUpCircle size={16} /> <span>Lấy thêm gốc</span></button>
                 <button onClick={() => setShowPrincipalModal('decrease')} className="flex-1 flex items-center justify-center space-x-2 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-[11px] font-black uppercase tracking-tighter hover:bg-emerald-100 transition-all shadow-sm"><ArrowDownCircle size={16} /> <span>Trả bớt gốc</span></button>
              </div>
            )}
          </Section>

          {/* Ngày tháng */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase flex items-center"><Calendar size={14} className="mr-2 text-blue-500" /> Ngày cầm</p>
                <p className="text-[15px] font-black text-slate-800 leading-none">{new Date(contract.pawnDate).toLocaleDateString('vi-VN')}</p>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase flex items-center"><Clock size={14} className="mr-2 text-rose-500" /> Đáo hạn</p>
                <p className="text-[15px] font-black text-slate-800 leading-none">{new Date(contract.dueDate).toLocaleDateString('vi-VN')}</p>
             </div>
          </div>

          <Section title="Thiết bị & Khách hàng" icon={Smartphone}>
             <p className="text-[15px] font-black text-slate-800 leading-none">{contract.model}</p>
             <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-wide">{contract.customerName} • {contract.customerPhone}</p>
             <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-medium text-slate-500 leading-relaxed italic mt-3">
               {contract.notes || 'Không có ghi chú.'}
             </div>
          </Section>

          {/* Lịch sử */}
          <Section title="Nhật ký giao dịch" icon={History}>
            <div className="space-y-4 pt-1">
              {contract.transactions.slice().reverse().map((tx, idx) => (
                <div key={tx.id} className="flex space-x-4 text-[11px] relative">
                  {idx !== contract.transactions.length - 1 && <div className="absolute left-[7px] top-4 bottom-0 w-[1px] bg-slate-100"></div>}
                  <div className="w-4 h-4 bg-blue-500 rounded-full mt-0.5 flex-shrink-0 border-4 border-white shadow-sm"></div>
                  <div className="flex-1 leading-snug">
                    <div className="flex justify-between items-start">
                      <p className="font-black text-slate-800 uppercase tracking-tighter">{tx.description}</p>
                      <p className="font-bold text-slate-400 text-[10px]">{new Date(tx.date).toLocaleDateString('vi-VN')}</p>
                    </div>
                    {tx.amount > 0 && <p className="text-[10px] font-black text-blue-600 mt-1">Giao dịch: {formatCurrency(tx.amount)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Hủy/Thanh lý */}
          {contract.status === 'Active' && (
            <div className="grid grid-cols-2 gap-3 mt-4">
               <button onClick={onCancel} className="py-3.5 bg-slate-100 text-slate-500 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-sm">Hủy hợp đồng</button>
               <button onClick={onForfeit} className="py-3.5 bg-amber-50 text-amber-700 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-sm">Thanh lý đồ</button>
            </div>
          )}
        </div>

        {/* Thanh tác vụ */}
        {contract.status === 'Active' && !isEditing && (
          <div className="p-5 bg-white border-t border-slate-100 grid grid-cols-2 gap-4 sticky bottom-0 z-20 pb-10 md:pb-6 shadow-2xl">
            <button onClick={onRenew} className="py-4.5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl shadow-blue-100 active:scale-95 transition-all"><History size={18} /> <span>Gia hạn</span></button>
            <button onClick={onRedeem} className="py-4.5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl shadow-slate-200 active:scale-95 transition-all"><CheckCircle2 size={18} /> <span>Tất toán</span></button>
          </div>
        )}
      </div>

      {/* Modal thay đổi gốc */}
      {showPrincipalModal && (
        <div className="fixed inset-0 bg-black/60 z-[150] flex items-center justify-center p-6 backdrop-blur-md">
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center space-x-4 mb-6">
                 <div className={`p-3 rounded-2xl shadow-sm ${showPrincipalModal === 'increase' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {showPrincipalModal === 'increase' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                 </div>
                 <div>
                    <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-tight leading-none">{showPrincipalModal === 'increase' ? 'Lấy thêm vốn' : 'Trả bớt vốn'}</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Cập nhật tiền gốc vay</p>
                 </div>
              </div>
              <div className="relative mb-6">
                <input 
                  type="text" 
                  inputMode="numeric" 
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black text-slate-800 outline-none focus:border-blue-500 shadow-inner" 
                  placeholder="0" 
                  value={displayPrincipalValue} 
                  onChange={handlePrincipalInput} 
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xs">VNĐ</span>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => setShowPrincipalModal(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-500">Hủy</button>
                 <button onClick={handlePrincipalChange} className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white shadow-lg ${showPrincipalModal === 'increase' ? 'bg-blue-600 shadow-blue-100' : 'bg-emerald-600 shadow-emerald-100'}`}>Xác nhận</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
