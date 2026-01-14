
import React from 'react';
import { 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line
} from 'recharts';
import { TrendingUp, DollarSign, Wallet, Calendar, AlertTriangle, Smartphone } from 'lucide-react';
import { Contract } from '../types';

interface DashboardProps {
  contracts: Contract[];
  calculateTotalInterest: (contract: Contract) => { totalInterest: number; overdueDays: number; totalDays: number };
}

const SummaryCard = ({ title, value, icon: Icon, color, trend, sub }: any) => (
  <div className="bg-white p-3.5 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-1.5 rounded-lg ${color} bg-opacity-10`}>
        <Icon size={16} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && <span className="text-[9px] font-bold text-emerald-500">{trend}</span>}
    </div>
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
      <h3 className="text-[16px] font-black text-slate-900 leading-none">{value}</h3>
      {sub && <p className="text-[8px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">{sub}</p>}
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ contracts, calculateTotalInterest }) => {
  const activeContracts = contracts.filter(c => c.status === 'Active' || c.status === 'Overdue');
  
  const totalPrincipal = activeContracts.reduce((sum, c) => sum + c.loanAmount, 0);
  const totalInterest = activeContracts.reduce((sum, c) => sum + calculateTotalInterest(c).totalInterest, 0);
  const overdueCount = activeContracts.filter(c => calculateTotalInterest(c).overdueDays > 0).length;
  
  const today = new Date().toISOString().split('T')[0];
  const dueTodayCount = activeContracts.filter(c => c.dueDate === today).length;

  const formatLargeNumber = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)} tỷ`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)} tr`;
    return value.toLocaleString('vi-VN') + 'đ';
  };

  // Fake chart data based on some logic or keep current placeholders for visual
  const chartData = [
    { day: '05/03', amount: 45000000, count: 3 },
    { day: '06/03', amount: 12000000, count: 1 },
    { day: '07/03', amount: 85000000, count: 5 },
    { day: '08/03', amount: 32000000, count: 2 },
    { day: '09/03', amount: 15000000, count: 1 },
    { day: '10/03', amount: 95000000, count: 6 },
    { day: 'Hôm nay', amount: totalPrincipal > 0 ? totalPrincipal : 55000000, count: activeContracts.length },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard title="Vốn cầm" value={formatLargeNumber(totalPrincipal)} icon={Wallet} color="bg-blue-500" sub="Dư nợ hiện tại" />
        <SummaryCard title="Lãi dự tính" value={formatLargeNumber(totalInterest)} icon={DollarSign} color="bg-emerald-500" sub="Chưa thu hồi" />
        <SummaryCard title="Quá hạn" value={`${overdueCount} HĐ`} icon={AlertTriangle} color="bg-rose-500" sub="Cần nhắc nợ" />
        <SummaryCard title="Đến hạn" value={`${dueTodayCount} HĐ`} icon={Calendar} color="bg-orange-500" sub="Trong hôm nay" />
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[10px] font-black text-slate-800 flex items-center uppercase tracking-[0.1em]">
            <TrendingUp size={14} className="mr-2 text-blue-500" /> Xu hướng hoạt động
          </h3>
          <div className="flex items-center space-x-2 text-[8px] font-bold text-slate-400 uppercase">
            <div className="flex items-center"><div className="w-1.5 h-1.5 bg-blue-500 rounded-sm mr-1"></div> Vốn vay</div>
            <div className="flex items-center"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-sm mr-1"></div> Số lượng</div>
          </div>
        </div>
        
        <div className="h-44 -ml-5">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9}} dy={5} />
              <YAxis hide yAxisId="left" />
              <YAxis hide yAxisId="right" orientation="right" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '10px' }}
                formatter={(value: any) => formatLargeNumber(value)}
              />
              <Bar yAxisId="left" dataKey="amount" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={18} />
              <Line yAxisId="right" type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981', strokeWidth: 1, stroke: '#fff' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <Smartphone size={20} className="text-blue-400" />
          </div>
          <div>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Thống kê thực tế</p>
            <h4 className="text-[15px] font-black leading-none">{activeContracts.length} HĐ đang hoạt động</h4>
          </div>
        </div>
        <div className="text-right">
           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Hiệu quả</p>
           <p className="text-xs font-bold leading-none">Vốn quay vòng: {((totalInterest / (totalPrincipal || 1)) * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};
