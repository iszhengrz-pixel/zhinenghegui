
import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  ShieldCheck, AlertTriangle, Activity, 
  ArrowUpRight, ArrowDownRight, Zap,
  Search, Sparkles
} from 'lucide-react';

// 建筑行业合规趋势数据
const DATA_TREND = [
  { name: '1月', compliance: 85, alert: 12 },
  { name: '2月', compliance: 88, alert: 8 },
  { name: '3月', compliance: 92, alert: 15 },
  { name: '4月', compliance: 90, alert: 10 },
  { name: '5月', compliance: 95, alert: 5 },
  { name: '6月', compliance: 97, alert: 3 },
];

// 风险类型分布
const DATA_RISK_DIST = [
  { name: '财务合规', value: 35, color: '#3B82F6' },
  { name: '招采风险', value: 25, color: '#10B981' },
  { name: '工程质量', value: 20, color: '#F59E0B' },
  { name: '法务诉讼', value: 20, color: '#EF4444' },
];

const HomeDashboard: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-700 bg-white min-h-full">
      
      {/* AI 智慧搜索通栏区 - 线条建筑背景深度定制 (精准复刻参考图) */}
      <div className="relative w-full bg-gradient-to-b from-blue-50/80 to-transparent pt-12 pb-12 mb-3 overflow-hidden">
        {/* 背景装饰：精准复刻用户提供的线框建筑群 (SVG) */}
        <div className="absolute bottom-0 left-0 w-full h-[240px] pointer-events-none opacity-60">
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M0 260 
                 L150 260 L150 230 L180 230 L180 260 
                 L200 260 L200 210 L220 210 L220 260
                 L240 260 L240 180 L250 160 L260 180 L260 260
                 L280 260 L280 220 L310 220 L310 240 L330 240 L330 260
                 L350 260 L350 200 L380 200 L380 260
                 L400 260 L400 210 L430 190 L460 210 L460 260
                 L480 260 L480 160 L510 160 L510 260
                 L530 260 L530 80 L550 110 L550 260
                 L570 260 L570 140 L590 140 L590 260
                 L610 260 L610 160 L630 160 L630 260
                 L650 260 L650 180 L700 180 L700 260
                 L720 260 L720 210 L750 210 L750 260
                 L770 260 L770 170 L790 150 L810 170 L810 260
                 L830 260 L830 200 L860 200 L860 260
                 L880 260 L880 180 L920 180 L920 260
                 L940 260 L940 230 L960 230 L960 260
                 L1000 260"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-[pulse_10s_ease-in-out_infinite]"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-12 flex flex-col items-center text-center">
          {/* 标题与 Logo 组合区 - 居中排列 */}
          <div className="flex flex-col items-center gap-6 mb-8">
            <img 
              src="https://www.nbuci.com/images/logonew.png" 
              alt="公司Logo" 
              className="h-[64px] w-auto object-contain drop-shadow-sm"
            />
            <div className="flex flex-col items-center">
              <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight mb-4 drop-shadow-sm">
                合规诉求，直接达<span className="text-blue-600 ml-1 relative">
                  攻略
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-400/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                  </svg>
                </span>
              </h1>
              <p className="text-slate-500 font-bold text-lg opacity-80 max-w-2xl leading-relaxed">
                AI 驱动的建筑行业合规智库，为宁波城投提供秒级风控决策与全方位合规保障
              </p>
            </div>
          </div>

          {/* 智能搜索框 - 页面居中 */}
          <div className="w-full max-w-3xl relative group">
            {/* 背景动态阴影 */}
            <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-3xl group-focus-within:bg-blue-500/20 transition-all duration-500"></div>
            
            <div className="relative flex items-center bg-white/95 backdrop-blur-2xl border border-blue-200/50 shadow-[0_10px_30px_rgba(30,64,175,0.06)] rounded-full p-2 transition-all duration-300
              group-focus-within:shadow-[0_15px_40px_rgba(30,64,175,0.1)] 
              group-focus-within:border-blue-400 
              group-focus-within:ring-4 group-focus-within:ring-blue-500/5 
              group-focus-within:bg-white group-focus-within:scale-[1.005]">
              <div className="pl-4 pr-2">
                <Search className="w-5 h-5 text-blue-300 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="在此输入您的法律咨询、合同要点或招采风险查询..." 
                className="flex-1 bg-transparent py-2.5 text-base md:text-xl outline-none text-slate-700 placeholder:text-slate-300 font-medium"
              />
              <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 active:scale-95 transition-all mr-1">
                <Sparkles className="w-6 h-6" />
                <span className="hidden sm:inline">立即搜索</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 数据内容容器 */}
      <div className="max-w-7xl mx-auto px-8 pb-20 space-y-10">
        
        {/* KPI 卡片组 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: '项目合规指数', val: '98.2', unit: '%', change: '+2.4%', isUp: true, icon: <ShieldCheck className="w-6 h-6" />, color: 'blue' },
            { label: '待处理风险项', val: '04', unit: '件', change: '-2件', isUp: true, icon: <AlertTriangle className="w-6 h-6" />, color: 'orange' },
            { label: '本月智能审查', val: '156', unit: '份', change: '+12%', isUp: true, icon: <Zap className="w-6 h-6" />, color: 'emerald' },
            { label: '平均风控响应', val: '0.8', unit: 'h', change: '-15%', isUp: true, icon: <Activity className="w-6 h-6" />, color: 'indigo' },
          ].map((stat, i) => (
            <div key={i} className="group bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-[0.03] text-${stat.color}-600 group-hover:scale-110 transition-transform duration-500`}>
                {stat.icon}
              </div>
              <div className="flex items-center gap-4 mb-5">
                <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <h3 className="text-2xl font-black text-slate-800">{stat.val}</h3>
                    <span className="text-xs font-bold text-slate-400">{stat.unit}</span>
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
                <span className="text-slate-300 ml-1 font-normal text-[10px]">较上月</span>
              </div>
            </div>
          ))}
        </div>

        {/* 图表主区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h4 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
                  系统运行合规态势
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                </h4>
                <p className="text-xs text-slate-400 mt-1">智能引擎实时分析风险分布与变化趋势</p>
              </div>
              <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                <button className="px-5 py-2 text-xs font-bold rounded-xl bg-white text-blue-600 shadow-sm">月度分析</button>
                <button className="px-5 py-2 text-xs font-bold rounded-xl text-slate-400 hover:text-slate-600">季度趋势</button>
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DATA_TREND}>
                  <defs>
                    <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#1E40AF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 700}} 
                    dy={12}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 12}} 
                    dx={-12}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -5px rgba(0,0,0,0.08)', padding: '16px'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="compliance" 
                    stroke="#1E40AF" 
                    strokeWidth={5}
                    fillOpacity={1} 
                    fill="url(#colorCompliance)" 
                    animationDuration={2500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
            <h4 className="text-[10px] font-black text-slate-400 mb-8 uppercase tracking-[0.2em]">风险分布 (风险类别穿透)</h4>
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-[240px] relative mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={DATA_RISK_DIST}
                      innerRadius={75}
                      outerRadius={100}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                    >
                      {DATA_RISK_DIST.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-black text-slate-800">42%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">核心占比</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {DATA_RISK_DIST.map((item, i) => (
                  <div key={i} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 flex items-center justify-between group hover:bg-white hover:shadow-lg hover:border-slate-100 transition-all cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: item.color}}></div>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-800">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
