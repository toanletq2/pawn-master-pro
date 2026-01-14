
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, Smartphone, User, PlusCircle, Sparkles, Check, History, Search, CalendarDays, FileCheck, FileX, MapPin, IdCard, Phone, ChevronDown, ChevronUp, UserPlus, Settings, Camera
} from 'lucide-react';
import { getValuationAdvice, analyzePhoneImage } from '../services/geminiService';
import { Contract, Customer } from '../types';

interface PawnFormProps {
  contracts: Contract[];
  customers: Customer[];
  onClose: () => void;
  onAddContract: (contract: Contract, newCustomer?: Customer) => void;
}

export const PawnForm: React.FC<PawnFormProps> = ({ contracts, customers, onClose, onAddContract }) => {
  const getTodayLocal = () => new Date().toISOString().split('T')[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    model: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerIdCard: '',
    loanAmount: 0, 
    interestRate: '2000',
    pawnDate: getTodayLocal(),
    duration: '30',
    notes: '',
    isPaperless: false 
  });

  const [displayAmount, setDisplayAmount] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);

  // Load cấu hình mặc định từ localStorage
  useEffect(() => {
    const savedRate = localStorage.getItem('defaultInterestRate');
    const savedDuration = localStorage.getItem('defaultDuration');
    if (savedRate || savedDuration) {
      setFormData(prev => ({
        ...prev,
        interestRate: savedRate || prev.interestRate,
        duration: savedDuration || prev.duration
      }));
    }
  }, []);

  const formatMoneyInput = (val: string) => {
    const num = val.replace(/\D/g, '');
    return num ? parseInt(num).toLocaleString('vi-VN') : '';
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMoneyInput(e.target.value);
    setDisplayAmount(formatted);
    setFormData(prev => ({ ...prev, loanAmount: parseInt(formatted.replace(/\D/g, '')) || 0 }));
  };

  const filteredCustomers = useMemo(() => {
    if (!formData.customerName) return [];
    return customers.filter(c => 
      c.name.toLowerCase().includes(formData.customerName.toLowerCase()) || 
      c.phone.includes(formData.customerName)
    );
  }, [formData.customerName, customers]);

  const deviceHistory = useMemo(() => {
    const customer = customers.find(c => c.name.toLowerCase() === formData.customerName.toLowerCase() || c.phone === formData.customerName);
    if (!customer) return [];
    const history = contracts.filter(c => c.customerId === customer.id).map(c => c.model);
    return Array.from(new Set(history)).slice(0, 4);
  }, [formData.customerName, customers, contracts]);

  const handleSelectCustomer = (c: Customer) => {
    setFormData(prev => ({ 
      ...prev, 
      customerName: c.name, 
      customerPhone: c.phone, 
      customerAddress: c.address, 
      customerIdCard: c.idCard 
    }));
    setShowCustomerDropdown(false);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const suggestion = await analyzePhoneImage(base64Data);
        if (suggestion) {
          setFormData(prev => ({ ...prev, model: suggestion }));
        }
        setIsAiLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Lỗi khi xử lý ảnh:", err);
      setIsAiLoading(false);
    }
  };

  const handleSave = () => {
    // Lưu cấu hình cho lần sau
    localStorage.setItem('defaultInterestRate', formData.interestRate);
    localStorage.setItem('defaultDuration', formData.duration);

    const existingCustomer = customers.find(c => (c.name.toLowerCase() === formData.customerName.toLowerCase() && formData.customerPhone === c.phone) || (formData.customerPhone !== '' && c.phone === formData.customerPhone));
    let customerId = existingCustomer?.id;
    let newCust: Customer | undefined;

    if (!existingCustomer) {
      customerId = `c_${Date.now()}`;
      newCust = {
        id: customerId,
        name: formData.customerName,
        phone: formData.customerPhone || `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        address: formData.customerAddress,
        idCard: formData.customerIdCard,
        createdAt: new Date().toISOString()
      };
    }

    const pDate = new Date(formData.pawnDate);
    const dueDate = new Date(pDate.getTime() + (parseInt(formData.duration) * 86400000)).toISOString().split('T')[0];

    const newContract: Contract = {
      id: `hd_${Date.now()}`,
      customerId: customerId!,
      customerName: formData.customerName,
      customerPhone: newCust ? newCust.phone : (existingCustomer?.phone || ''),
      model: formData.model,
      loanAmount: formData.loanAmount,
      interestRate: parseFloat(formData.interestRate),
      pawnDate: formData.pawnDate,
      dueDate: dueDate,
      lastPaidDate: formData.pawnDate,
      status: 'Active',
      isPaperless: formData.isPaperless,
      notes: formData.notes,
      segments: [{ startDate: formData.pawnDate, principal: formData.loanAmount, interestRate: parseFloat(formData.interestRate) }],
      transactions: [{ id: Date.now().toString(), type: 'pawn', date: new Date().toISOString(), amount: formData.loanAmount, description: 'Lập hợp đồng mới' }]
    };

    onAddContract(newContract, newCust);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end md:items-center justify-center z-[110] animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-xl md:rounded-xl shadow-2xl flex flex-col relative overflow-hidden animate-in slide-in-from-bottom-2">
        <div className="px-5 pt-5 pb-3 flex justify-between items-center border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center">Hợp đồng mới</h2>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 no-scrollbar">
          {/* Nhập tên khách */}
          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Tên khách hàng</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-sm">
                <Search size={18} className="text-slate-300 mr-3" />
                <input 
                  type="text" 
                  className="w-full bg-transparent text-[15px] font-bold outline-none placeholder:text-slate-300" 
                  placeholder="Nhập tên khách..." 
                  value={formData.customerName} 
                  onFocus={() => setShowCustomerDropdown(true)} 
                  onChange={(e) => setFormData(p => ({ ...p, customerName: e.target.value }))} 
                />
              </div>
              
              {showCustomerDropdown && formData.customerName && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl z-50 overflow-hidden border-t-2 border-t-blue-500">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((c, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleSelectCustomer(c)} 
                        className="w-full px-5 py-4 hover:bg-blue-50 text-left text-[13px] font-bold text-slate-700 flex justify-between items-center border-b border-slate-50 last:border-0"
                      >
                        <span>{c.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{c.phone}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center bg-blue-50/20">
                      <button 
                        onClick={() => { setShowAdditionalInfo(true); setShowCustomerDropdown(false); }}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-[11px] font-black uppercase flex items-center mx-auto shadow-sm active:scale-95 transition-all"
                      >
                        <UserPlus size={14} className="mr-2" /> Thêm nhanh khách mới
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {deviceHistory.length > 0 && (
              <div className="animate-in slide-in-from-top-1 bg-blue-50/50 p-3 rounded-xl border border-blue-100 shadow-sm">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center mb-2.5">
                   <History size={12} className="mr-2" /> Gợi ý máy cũ từng cầm
                </p>
                <div className="flex flex-wrap gap-2">
                  {deviceHistory.map((m, i) => (
                    <button key={i} onClick={() => setFormData(p => ({...p, model: m}))} className="px-3 py-2 bg-white border border-blue-100 rounded-lg text-[11px] font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
              className="text-[10px] font-black text-slate-400 flex items-center uppercase tracking-widest px-1"
            >
              {showAdditionalInfo ? <ChevronUp size={14} className="mr-1.5" /> : <ChevronDown size={14} className="mr-1.5" />}
              Chi tiết: SĐT, Địa chỉ, CCCD
            </button>

            {showAdditionalInfo && (
              <div className="grid grid-cols-1 gap-3 animate-in slide-in-from-top-1">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"><Phone size={16} className="text-slate-300 mr-3" /><input type="text" className="w-full bg-transparent text-[14px] font-bold outline-none" placeholder="Số điện thoại" value={formData.customerPhone} onChange={e => setFormData(p => ({...p, customerPhone: e.target.value}))} /></div>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"><IdCard size={16} className="text-slate-300 mr-3" /><input type="text" className="w-full bg-transparent text-[14px] font-bold outline-none" placeholder="CMND/CCCD" value={formData.customerIdCard} onChange={e => setFormData(p => ({...p, customerIdCard: e.target.value}))} /></div>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"><MapPin size={16} className="text-slate-300 mr-3" /><input type="text" className="w-full bg-transparent text-[14px] font-bold outline-none" placeholder="Địa chỉ thường trú" value={formData.customerAddress} onChange={e => setFormData(p => ({...p, customerAddress: e.target.value}))} /></div>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-50">
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Thiết bị</label>
                 <div className="flex space-x-2">
                    <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus-within:border-blue-500 transition-all shadow-sm">
                      <Smartphone size={18} className="text-slate-300 mr-3" />
                      <input type="text" className="w-full bg-transparent text-[14px] font-bold outline-none" placeholder="Model máy cầm cố..." value={formData.model} onChange={e => setFormData(p => ({...p, model: e.target.value}))} />
                    </div>
                    
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                    />
                    
                    <button 
                      onClick={handleCameraClick}
                      className="w-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-sm border border-slate-200"
                      title="Chụp ảnh máy để nhận diện"
                    >
                      <Camera size={20} className={isAiLoading ? 'animate-pulse' : ''} />
                    </button>

                    <button 
                      onClick={async () => { 
                        if(!formData.model) return; 
                        setIsAiLoading(true); 
                        const res = await getValuationAdvice('', formData.model, 'Máy cũ'); 
                        if(res) alert(`AI Gợi ý:\nGiá bán: ${res.resalePriceRange}\nCầm an toàn: ${res.safeLoanRange}`);
                        setIsAiLoading(false); 
                      }} 
                      className="w-12 bg-slate-900 text-white rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-lg"
                      title="Định giá AI"
                    >
                      <Sparkles size={20} className={isAiLoading ? 'animate-spin' : 'animate-pulse text-blue-300'} />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 px-1">Ngày cầm</p>
                   <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                     <CalendarDays size={18} className="text-slate-300 mr-2" />
                     <input type="date" className="w-full bg-transparent text-[13px] font-bold outline-none" value={formData.pawnDate} onChange={e => setFormData(p => ({...p, pawnDate: e.target.value}))} />
                   </div>
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 px-1">Tiền vay (Gốc)</p>
                   <div className="flex items-center bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 shadow-sm">
                     <input 
                       type="text" 
                       inputMode="numeric"
                       className="w-full bg-transparent text-[15px] font-black text-emerald-700 outline-none" 
                       placeholder="VNĐ" 
                       value={displayAmount} 
                       onChange={handleAmountChange} 
                     />
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Cấu hình lãi và thời hạn - Có thể thu gọn */}
          <div className="space-y-3 pt-2">
            <button 
              onClick={() => setIsConfigExpanded(!isConfigExpanded)}
              className="w-full flex items-center justify-between px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest"
            >
              <span className="flex items-center"><Settings size={14} className="mr-1.5" /> Lãi suất & Thời hạn</span>
              {isConfigExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {isConfigExpanded && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl animate-in slide-in-from-top-1 shadow-inner">
                <div className="space-y-1.5">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Lãi suất (đ/1tr/ngày)</p>
                  <input 
                    type="number" 
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-blue-500" 
                    value={formData.interestRate} 
                    onChange={e => setFormData(p => ({...p, interestRate: e.target.value}))} 
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Thời hạn cầm (ngày)</p>
                  <input 
                    type="number" 
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-blue-500" 
                    value={formData.duration} 
                    onChange={e => setFormData(p => ({...p, duration: e.target.value}))} 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Loại hợp đồng</label>
            <button 
              onClick={() => setFormData(p => ({ ...p, isPaperless: !p.isPaperless }))} 
              className={`w-full px-5 py-4 rounded-xl border-2 transition-all flex items-center justify-between shadow-sm ${
                formData.isPaperless ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                {formData.isPaperless ? <FileX size={22} /> : <FileCheck size={22} />}
                <p className="text-[12px] font-black uppercase tracking-tight">{formData.isPaperless ? 'Hợp đồng không giấy' : 'Hợp đồng có giấy'}</p>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-all ${formData.isPaperless ? 'bg-rose-500' : 'bg-blue-500'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${formData.isPaperless ? 'left-6' : 'left-1'}`}></div>
              </div>
            </button>
          </div>
        </div>

        <div className="px-5 pb-8 pt-2 bg-white sticky bottom-0 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
           <button 
             onClick={handleSave} 
             disabled={!formData.customerName || !formData.model || formData.loanAmount <= 0} 
             className="w-full py-4.5 bg-blue-600 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-2xl font-black text-[15px] uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-blue-100 flex items-center justify-center"
           >
             XÁC NHẬN KÝ HĐ <Check size={20} className="ml-2" />
           </button>
        </div>
      </div>
    </div>
  );
};
