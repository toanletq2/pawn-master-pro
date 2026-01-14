
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  AlertCircle, 
  Plus, 
  Smartphone, 
  Bell,
  User,
  History,
  CheckCircle2,
  SearchIcon,
  ShieldCheck,
  FileX,
  FileCheck,
  Search,
  MapPin,
  IdCard,
  Phone,
  ChevronRight,
  Wallet,
  DollarSign
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { PawnForm } from './components/PawnForm';
import { RenewModal } from './components/RenewModal';
import { RedeemModal } from './components/RedeemModal';
import { ContractDetailModal } from './components/ContractDetailModal';
import { Contract, ContractStatus, Customer, InterestSegment, Transaction } from './types';

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Nguyễn Văn A', phone: '0901234567', address: '123 Quận 1, TP.HCM', idCard: '079123456789', createdAt: '2025-01-01' },
  { id: 'c2', name: 'Trần Thị B', phone: '0987654321', address: '456 Quận 3, TP.HCM', idCard: '079987654321', createdAt: '2025-01-05' }
];

const INITIAL_CONTRACTS: Contract[] = [
  { 
    id: '1', 
    customerId: 'c1',
    customerName: 'Nguyễn Văn A', 
    customerPhone: '0901234567', 
    model: 'iPhone 15 Pro Max', 
    loanAmount: 25000000, 
    interestRate: 2000, 
    status: 'Active', 
    isPaperless: true,
    pawnDate: '2025-01-10', 
    dueDate: '2025-02-10',
    lastPaidDate: '2025-01-10',
    notes: 'Máy màu Titan tự nhiên, iCloud chính chủ.',
    segments: [{ startDate: '2025-01-10', principal: 25000000, interestRate: 2000 }],
    transactions: [
      { id: 'tx1', type: 'pawn', date: '2025-01-10T10:00:00Z', amount: 25000000, description: 'Lập hợp đồng mới' }
    ]
  }
];

type ViewType = 'home' | 'contracts' | 'customers' | 'overdue';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewType>('home');
  const [showPawnForm, setShowPawnForm] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [selectedRenewContract, setSelectedRenewContract] = useState<Contract | null>(null);
  const [selectedRedeemContract, setSelectedRedeemContract] = useState<Contract | null>(null);
  const [selectedContractDetail, setSelectedContractDetail] = useState<Contract | null>(null);
  const [contractFilter, setContractFilter] = useState<ContractStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const calculateTotalInterest = (contract: Contract) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let totalInterest = 0;
    let totalDays = 0;

    contract.segments.forEach(segment => {
      const start = new Date(segment.startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = segment.endDate ? new Date(segment.endDate) : today;
      end.setHours(0, 0, 0, 0);

      const diffTime = Math.max(0, end.getTime() - start.getTime());
      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      const interest = Math.round((segment.principal / 1000000) * segment.interestRate * days);
      totalInterest += interest;
      totalDays += days;
    });

    const dueDate = new Date(contract.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    let overdueDays = 0;
    if (today > dueDate && (contract.status === 'Active' || contract.status === 'Overdue')) {
      const diffOverdue = today.getTime() - dueDate.getTime();
      overdueDays = Math.max(0, Math.floor(diffOverdue / 86400000));
    }
    return { totalInterest, overdueDays, totalDays };
  };

  const overdueContracts = useMemo(() => 
    contracts.filter(c => calculateTotalInterest(c).overdueDays > 0 && (c.status === 'Active' || c.status === 'Overdue'))
  , [contracts]);

  const overdueCount = overdueContracts.length;

  const handleAddContract = (newContract: Contract, newCustomer?: Customer) => {
    if (newCustomer) setCustomers(prev => [...prev, newCustomer]);
    setContracts(prev => [newContract, ...prev]);
    setShowPawnForm(false);
    setActiveTab('contracts');
  };

  const handleUpdateContract = (updated: Contract) => {
    setContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (selectedContractDetail?.id === updated.id) setSelectedContractDetail(updated);
  };

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN');

  const getStatusConfig = (status: ContractStatus) => {
    switch (status) {
      case 'Active': return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Đang cầm', accent: 'bg-blue-600' };
      case 'Redeemed': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Đã chuộc', accent: 'bg-emerald-600' };
      case 'Overdue': return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', label: 'Quá hạn', accent: 'bg-rose-600' };
      case 'Forfeited': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', label: 'Thanh lý', accent: 'bg-amber-600' };
      case 'Cancelled': return { color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100', label: 'Đã hủy', accent: 'bg-slate-400' };
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 z-50">
        <div className="p-6 flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md">
            <Smartphone size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter text-slate-900 leading-none">PawnMaster</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Ver 2.0</span>
          </div>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 pt-4">
          {[
            { id: 'home', label: 'Tổng quan', icon: LayoutDashboard },
            { id: 'contracts', label: 'Sổ hợp đồng', icon: FileText },
            { id: 'customers', label: 'Khách hàng', icon: Users },
            { id: 'overdue', label: 'Quá hạn', icon: AlertCircle, badge: overdueCount },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id as any)} 
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all relative ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={18} className="mr-3" />
              <span className="font-bold text-[14px]">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white border-b border-slate-100 h-14 flex items-center justify-between px-6 z-40 sticky top-0">
          <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase">
            {activeTab === 'home' ? 'Tổng quan' : activeTab === 'contracts' ? 'Hợp đồng' : activeTab === 'customers' ? 'Khách hàng' : 'Trễ hạn'}
          </h1>
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-[10px] shadow-sm">AD</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50 no-scrollbar pb-24 lg:pb-8">
          <div className="max-w-6xl mx-auto p-4 md:p-6">
            {activeTab === 'home' && <Dashboard contracts={contracts} calculateTotalInterest={calculateTotalInterest} />}
            
            {activeTab === 'contracts' && (
              <div className="space-y-4">
                <div className="sticky top-0 bg-slate-50 pt-1 pb-4 z-30 flex flex-col gap-3">
                  <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      type="text" 
                      placeholder="Tìm khách hàng, model máy..." 
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-blue-500 outline-none transition-all shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
                    {['All', 'Active', 'Overdue', 'Redeemed', 'Forfeited', 'Cancelled'].map((f) => (
                      <button 
                        key={f} 
                        onClick={() => setContractFilter(f as any)} 
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border whitespace-nowrap ${
                          contractFilter === f 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        {f === 'All' ? 'Tất cả' : getStatusConfig(f as any)?.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contracts
                    .filter(c => {
                      const matchF = contractFilter === 'All' || c.status === contractFilter;
                      const matchS = c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || c.model.toLowerCase().includes(searchTerm.toLowerCase());
                      return matchF && matchS;
                    })
                    .map(c => {
                      const fin = calculateTotalInterest(c);
                      const cfg = getStatusConfig(c.status);
                      const isActive = c.status === 'Active' || c.status === 'Overdue';
                      return (
                        <div 
                          key={c.id} 
                          className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col"
                        >
                          <div onClick={() => setSelectedContractDetail(c)} className="cursor-pointer">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg?.accent}`}></div>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg ${cfg?.bg} ${cfg?.color} flex items-center justify-center border border-slate-100`}>
                                  <Smartphone size={20} />
                                </div>
                                <div>
                                  <h3 className="text-sm font-bold text-slate-900 leading-none">{c.model}</h3>
                                  <p className="text-[10px] font-medium text-slate-400 mt-1.5 flex items-center"><User size={10} className="mr-1" /> {c.customerName}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border border-current opacity-70 ${cfg?.bg} ${cfg?.color}`}>{cfg?.label}</span>
                                {c.isPaperless && (
                                  <span className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border border-rose-100 flex items-center"><FileX size={10} className="mr-1" /> Không giấy</span>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 mb-3">
                              <div>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Tiền gốc</p>
                                <p className="text-sm font-black text-slate-900">{formatCurrency(c.loanAmount)}đ</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Lãi dồn ({fin.totalDays}n)</p>
                                <p className={`text-sm font-black ${fin.overdueDays > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatCurrency(fin.totalInterest)}đ</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-50">
                            <div onClick={() => setSelectedContractDetail(c)} className="flex flex-col cursor-pointer">
                              <span className="text-[8px] font-bold text-slate-400 uppercase">Hạn trả</span>
                              <span className={`text-[11px] font-bold ${fin.overdueDays > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                                {new Date(c.dueDate).toLocaleDateString('vi-VN')}
                                {fin.overdueDays > 0 && <span className="text-[9px] font-black animate-pulse ml-1 text-rose-500">! TRỄ {fin.overdueDays}N</span>}
                              </span>
                            </div>
                            {isActive && (
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setSelectedRenewContract(c); }}
                                  className="px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                >
                                  Đóng lãi
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setSelectedRedeemContract(c); }}
                                  className="px-2.5 py-1.5 bg-slate-900 text-white rounded text-[9px] font-black uppercase hover:bg-black transition-all shadow-sm"
                                >
                                  Chuộc đồ
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="space-y-4">
                <div className="relative max-w-md">
                   <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                    type="text" 
                    placeholder="Tìm tên, SĐT, CCCD..." 
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none transition-all shadow-sm"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customers
                    .filter(cust => cust.name.toLowerCase().includes(searchTerm.toLowerCase()) || cust.phone.includes(searchTerm))
                    .map(cust => {
                      const custContracts = contracts.filter(c => c.customerId === cust.id);
                      return (
                        <div key={cust.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col space-y-3">
                          <div className="flex items-center space-x-3">
                             <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white text-sm font-bold uppercase">{cust.name.charAt(0)}</div>
                             <div>
                                <h3 className="text-sm font-bold text-slate-900 leading-none">{cust.name}</h3>
                                <p className="text-[10px] font-bold text-blue-600 mt-1 flex items-center"><Phone size={10} className="mr-1" /> {cust.phone}</p>
                             </div>
                          </div>
                          <div className="grid grid-cols-1 gap-1.5 border-t border-slate-50 pt-3">
                             <div className="flex items-center text-[10px] text-slate-500 font-medium"><IdCard size={12} className="mr-2 text-slate-400" /> CCCD: {cust.idCard || 'N/A'}</div>
                             <div className="flex items-center text-[10px] text-slate-500 font-medium"><MapPin size={12} className="mr-2 text-slate-400" /> {cust.address || 'Chưa cập nhật'}</div>
                             <div className="flex items-center text-[10px] text-slate-500 font-medium cursor-pointer hover:text-blue-600" onClick={() => { setSearchTerm(cust.name); setActiveTab('contracts'); }}>
                               <FileText size={12} className="mr-2 text-slate-400" /> Xem {custContracts.length} hợp đồng
                             </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {activeTab === 'overdue' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {overdueContracts.map(c => (
                     <div key={c.id} onClick={() => setSelectedContractDetail(c)} className="bg-white p-4 rounded-lg border border-rose-200 shadow-sm cursor-pointer relative overflow-hidden">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                       <div className="flex justify-between items-start">
                         <div>
                           <h4 className="text-sm font-bold text-slate-900">{c.model}</h4>
                           <p className="text-[10px] text-slate-400 font-bold mt-1">{c.customerName}</p>
                         </div>
                         <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase">Quá hạn</span>
                       </div>
                       <div className="mt-3 text-right">
                          <p className="text-xs font-black text-rose-500 animate-pulse uppercase tracking-tighter">TRỄ {calculateTotalInterest(c).overdueDays} NGÀY</p>
                       </div>
                     </div>
                   ))}
                   {overdueCount === 0 && (
                     <div className="col-span-full py-12 text-center">
                        <CheckCircle2 size={48} className="mx-auto text-emerald-300 mb-3" />
                        <p className="text-slate-400 font-bold">Tất cả hợp đồng đều trong hạn!</p>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 lg:hidden z-[100] flex items-center justify-around h-16 pb-2 px-2 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.1)]">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-300'}`}>
            <LayoutDashboard size={20} />
            <span className="text-[8px] font-bold mt-1.5 uppercase">Home</span>
          </button>
          <button onClick={() => setActiveTab('contracts')} className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg ${activeTab === 'contracts' ? 'text-blue-600' : 'text-slate-300'}`}>
            <FileText size={20} />
            <span className="text-[8px] font-bold mt-1.5 uppercase">Sổ HĐ</span>
          </button>
          <div className="relative -mt-8 px-2">
             <button onClick={() => setShowPawnForm(true)} className="w-14 h-14 bg-blue-600 text-white rounded-xl shadow-xl flex items-center justify-center border-4 border-white active:scale-95 transition-all">
               <Plus size={28} />
             </button>
          </div>
          <button onClick={() => setActiveTab('customers')} className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg ${activeTab === 'customers' ? 'text-blue-600' : 'text-slate-300'}`}>
            <Users size={20} />
            <span className="text-[8px] font-bold mt-1.5 uppercase">Khách</span>
          </button>
          <button onClick={() => setActiveTab('overdue')} className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg relative ${activeTab === 'overdue' ? 'text-rose-600' : 'text-slate-300'}`}>
            <AlertCircle size={20} />
            <span className="text-[8px] font-bold mt-1.5 uppercase">Trễ nợ</span>
            {overdueCount > 0 && (
              <span className="absolute top-0.5 right-1/4 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-bounce shadow-lg">
                {overdueCount}
              </span>
            )}
          </button>
        </nav>

        {showPawnForm && <PawnForm contracts={contracts} customers={customers} onClose={() => setShowPawnForm(false)} onAddContract={handleAddContract} />}
        
        {selectedContractDetail && (() => {
          const fin = calculateTotalInterest(selectedContractDetail);
          return (
            <ContractDetailModal 
              contract={selectedContractDetail}
              interestOwed={fin.totalInterest}
              interestDays={fin.totalDays}
              onClose={() => setSelectedContractDetail(null)}
              onRenew={() => { setSelectedRenewContract(selectedContractDetail); setSelectedContractDetail(null); }}
              onRedeem={() => { setSelectedRedeemContract(selectedContractDetail); setSelectedContractDetail(null); }}
              onCancel={() => handleUpdateContract({ ...selectedContractDetail, status: 'Cancelled' })}
              onForfeit={() => handleUpdateContract({ ...selectedContractDetail, status: 'Forfeited' })}
              onUpdate={handleUpdateContract}
            />
          );
        })()}

        {selectedRenewContract && (() => {
          const fin = calculateTotalInterest(selectedRenewContract);
          return (
            <RenewModal 
              contract={selectedRenewContract} 
              suggestedDays={fin.totalDays}
              suggestedAmount={fin.totalInterest}
              onClose={() => setSelectedRenewContract(null)}
              onRenew={(amount, days) => {
                const todayStr = new Date().toISOString().split('T')[0];
                const newContract: Contract = {
                  ...selectedRenewContract,
                  lastPaidDate: todayStr,
                  segments: [{ startDate: todayStr, principal: selectedRenewContract.loanAmount, interestRate: selectedRenewContract.interestRate }],
                  transactions: [...selectedRenewContract.transactions, { id: Date.now().toString(), type: 'interest_payment', date: new Date().toISOString(), amount, description: `Đóng lãi gia hạn ${days} ngày` }]
                };
                handleUpdateContract(newContract);
                setSelectedRenewContract(null);
              }}
            />
          );
        })()}

        {selectedRedeemContract && (
          <RedeemModal 
            contract={selectedRedeemContract}
            interestOwed={calculateTotalInterest(selectedRedeemContract).totalInterest}
            onClose={() => setSelectedRedeemContract(null)}
            onConfirm={(total) => {
              handleUpdateContract({ 
                ...selectedRedeemContract, 
                status: 'Redeemed', 
                transactions: [...selectedRedeemContract.transactions, { 
                  id: Date.now().toString(), 
                  type: 'redemption', 
                  date: new Date().toISOString(), 
                  amount: total, 
                  description: 'Tất toán chuộc đồ' 
                }] 
              });
              setSelectedRedeemContract(null);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default App;
