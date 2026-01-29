import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Briefcase, ShieldAlert, CheckSquare, Clock, ArrowUpRight, ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';

const DATA_TASKS = [
  { name: '周一', val: 400, target: 500 },
  { name: '周二', val: 300, target: 500 },
  { name: '周三', val: 600, target: 500 },
  { name: '周四', val: 800, target: 500 },
  { name: '周五', val: 500, target: 500 },
  { name: '周六', val: 200, target: 500 },
  { name: '周日', val: 100, target: 500 },
];

const DATA_RISK = [
  { name: '极高', value: 12, color: '#DC2626' }, // High Risk - Red
  { name: '高', value: 25, color: '#F97316' },   // High Risk - Orange
  { name: '中', value: 45, color: '#EAB308' },   // Medium - Yellow/Orange
  { name: '低', value: 18, color: '#10B981' },   // Low - Green
];

const HomeDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 移除原有的欢迎语及按钮区域 */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        {[
          { label: '在审合同', val: '1,284', change: '+12.5%', isUp: true, icon: <Briefcase className="text-[#1E40AF]" />, bg: 'bg-blue-50' },
          { label: '合规预警', val: '12', change: '-4.3%', isUp: false, icon: <ShieldAlert className="text-[#DC2626]" />, bg: 'bg-red-50' },
          { label: '今日待办', val: '08', change: '2项紧急', isUp: true, icon: <CheckSquare className="text-[#F97316]" />, bg: 'bg-orange-50' },
          { label: '平均处理时长', val: '2.4d', change: '-15%', isUp: false, icon: <Clock className="text-[#10B981]" />, bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${stat.isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-800">合规任务处理进度</h4>
            <div className="flex gap-2">
                <button className="text-xs bg-[#1E40AF]/10 px-2 py-1 rounded text-[#1E40AF] font-bold">本周</button>
                <button className="text-xs px-2 py-1 rounded text-slate-400">上周</button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA_TASKS}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1E40AF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="val" stroke="#1E40AF" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-6">风险分布分布</h4>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DATA_RISK}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {DATA_RISK.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-800">100</span>
                <span className="text-xs text-slate-400">总计项</span>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {DATA_RISK.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-slate-600 font-medium">{item.name}风险</span>
                </div>
                <span className="text-slate-800 font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h4 className="font-bold text-slate-800">最近活跃案件</h4>
          <button className="text-[#1E40AF] text-sm font-bold hover:underline">查看全部</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">案件编号</th>
                <th className="px-6 py-4">案件名称</th>
                <th className="px-6 py-4">责任人</th>
                <th className="px-6 py-4">当前状态</th>
                <th className="px-6 py-4">更新日期</th>
                <th className="px-6 py-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { id: 'LGS-2024-001', name: '跨境贸易合规性审查', owner: '李华', status: '进行中', color: '#1E40AF' },
                { id: 'LGS-2024-005', name: '供应商知识产权争议', owner: '王伟', status: '待处理', color: '#F97316' },
                { id: 'LGS-2024-012', name: '年度法务审计报告', owner: '陈静', status: '已完成', color: '#10B981' },
                { id: 'LGS-2024-018', name: '新员工入职背景调查', owner: '周敏', status: '进行中', color: '#1E40AF' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-[#1E40AF] font-bold">{row.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{row.name}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold text-slate-600">{row.owner.charAt(0)}</div>
                    <span className="text-sm text-slate-600">{row.owner}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="px-2 py-1 rounded text-[11px] font-bold"
                      style={{backgroundColor: `${row.color}15`, color: row.color}}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">2024-05-18</td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;