import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Filter, User, Building2, ShieldCheck, History, 
  AlertCircle, ChevronRight, CheckCircle2, XCircle, Clock, 
  Sparkles, ExternalLink, MapPin, Landmark, FileText, Download, 
  Edit3, RefreshCw, TrendingUp, AlertTriangle, ArrowUpDown
} from 'lucide-react';
import { Partner } from '../../types';

const MOCK_PARTNERS: Partner[] = [
  {
    id: '1',
    name: '中建建设集团有限公司',
    code: '91110000101122334K',
    riskLevel: 'low',
    rating: 'AAA',
    status: 'active',
    collabCount: 15,
    lastUpdated: '2024-05-20',
    legalRep: '张伟',
    regCapital: '100,000万',
    address: '北京市朝阳区建设路88号',
    history: [
      { id: 'C1', name: '某大型基建项目总包合同', date: '2023-10-12', type: '合同' },
      { id: 'T1', name: '华南区分公司年度招标', date: '2023-08-05', type: '投标' },
      { id: 'C3', name: '设备租赁服务协议', date: '2024-02-14', type: '合同' }
    ],
    alerts: [],
    tags: ['战略伙伴', '纳税A级', '高新企业']
  },
  {
    id: '2',
    name: '宏达物资贸易中心',
    code: '91310115055667788P',
    riskLevel: 'high',
    rating: 'C',
    status: 'suspended',
    collabCount: 2,
    lastUpdated: '2024-05-22',
    legalRep: '李红',
    regCapital: '500万',
    address: '上海市浦东新区外环路12号',
    history: [
      { id: 'C2', name: '钢材采购协议', date: '2024-01-10', type: '合同' }
    ],
    alerts: [
      { id: 'A1', title: '法人代表变更异常预警', date: '2024-05-21', severity: 'high' },
      { id: 'A2', title: '涉及司法诉讼案件增加', date: '2024-05-18', severity: 'medium' }
    ],
    tags: ['重点关注', '小微企业']
  },
  {
    id: '3',
    name: '腾飞科技有限公司',
    code: '91440300MA5FGH992E',
    riskLevel: 'medium',
    rating: 'AA',
    status: 'active',
    collabCount: 8,
    lastUpdated: '2024-05-19',
    legalRep: '陈明',
    regCapital: '2,000万',
    address: '深圳市南山区科技园T3大厦',
    history: [
      { id: 'C4', name: '软件开发外包合同', date: '2024-03-01', type: '合同' }
    ],
    alerts: [
      { id: 'A3', title: '经营范围增项备案', date: '2024-05-15', severity: 'medium' }
    ],
    tags: ['独角兽', '软件领军']
  }
];

const PartnerManagement: React.FC = () => {
  const [partners] = useState<Partner[]>(MOCK_PARTNERS);
  const [selectedId, setSelectedId] = useState<string | null>('1');
  const [activeTab, setActiveTab] = useState<'basic' | 'profile' | 'history' | 'dynamic'>('basic');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [isNewMode, setIsNewMode] = useState(false);

  const filteredPartners = useMemo(() => {
    return partners.filter(p => {
      const matchSearch = p.name.includes(searchQuery) || p.code.includes(searchQuery);
      const matchRisk = riskFilter === 'all' || p.riskLevel === riskFilter;
      return matchSearch && matchRisk;
    });
  }, [partners, searchQuery, riskFilter]);

  const selectedPartner = partners.find(p => p.id === selectedId);
  const hasAlerts = selectedPartner?.alerts && selectedPartner.alerts.length > 0;

  const handleNewRegistration = () => {
    setIsNewMode(true);
    setSelectedId(null);
    setActiveTab('basic');
  };

  const handleSelectPartner = (id: string) => {
    setSelectedId(id);
    setIsNewMode(false);
  };

  const renderBasicInfo = () => {
    const data = isNewMode ? null : selectedPartner;
    return (
      <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                登记表单录入
              </h4>
              <button className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-all flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                AI 自动补全
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">企业名称</label>
                <input type="text" defaultValue={data?.name} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="输入企业全称" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">统一社会信用代码</label>
                  <input type="text" defaultValue={data?.code} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">法定代表人</label>
                  <input type="text" defaultValue={data?.legalRep} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">注册地址</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="text" defaultValue={data?.address} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h4 className="text-sm font-bold text-slate-800">第三方同步预览 (天眼查/企查查)</h4>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400 mb-1">注册资本</p>
                <p className="text-lg font-bold text-slate-800">{data?.regCapital || '---'}</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400 mb-1">经营状态</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${data?.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <p className="text-sm font-bold text-slate-800">{data?.status === 'active' ? '在营（开业）' : '吊销/异常'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">核验税务记录</button>
                <button className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">导出分析报告</button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button className="px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all" onClick={() => setIsNewMode(false)}>取消</button>
          <button className="px-8 py-2 rounded-xl text-sm font-bold bg-[#1E40AF] text-white hover:bg-[#1e3a8a] shadow-lg shadow-blue-200 transition-all">保存登记</button>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col items-center text-center">
          <ShieldCheck className="w-8 h-8 text-emerald-600 mb-2" />
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">合规状态</p>
          <p className="text-xl font-black text-emerald-600 mt-1">稳健</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex flex-col items-center text-center">
          <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">信用评级</p>
          <p className="text-xl font-black text-blue-600 mt-1">{selectedPartner?.rating || '---'}</p>
        </div>
        <div className={`p-4 rounded-2xl flex flex-col items-center text-center border ${selectedPartner?.riskLevel === 'high' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
          <AlertTriangle className={`w-8 h-8 mb-2 ${selectedPartner?.riskLevel === 'high' ? 'text-red-600' : 'text-slate-400'}`} />
          <p className={`text-xs font-bold uppercase tracking-wider ${selectedPartner?.riskLevel === 'high' ? 'text-red-800' : 'text-slate-500'}`}>风险等级</p>
          <p className={`text-xl font-black mt-1 uppercase ${selectedPartner?.riskLevel === 'high' ? 'text-red-600' : 'text-slate-600'}`}>
            {selectedPartner?.riskLevel === 'low' ? '低风险' : selectedPartner?.riskLevel === 'medium' ? '中风险' : '高风险'}
          </p>
        </div>
      </div>

      <section>
        <h4 className="text-sm font-bold text-slate-800 mb-4">企业特质标签</h4>
        <div className="flex flex-wrap gap-2">
          {selectedPartner?.tags?.map(tag => (
            <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200 shadow-sm transition-all hover:bg-white">
              {tag}
            </span>
          ))}
          <button className="px-3 py-1.5 border border-dashed border-slate-300 text-slate-400 rounded-full text-xs font-bold hover:border-blue-400 hover:text-blue-500 transition-all">
            + 添加自定义标签
          </button>
        </div>
      </section>

      <section>
        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-500" />
          不良记录清单
        </h4>
        <div className="border border-slate-100 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-4 py-3">记录类型</th>
                <th className="px-4 py-3">具体事项</th>
                <th className="px-4 py-3">判定日期</th>
                <th className="px-4 py-3">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {selectedPartner?.riskLevel === 'high' ? (
                <>
                  <tr className="hover:bg-red-50/30">
                    <td className="px-4 py-3 font-bold text-red-600">行政处罚</td>
                    <td className="px-4 py-3 text-slate-600">虚假宣传及不正当竞争罚款 20 万元</td>
                    <td className="px-4 py-3 text-slate-400">2023-11-20</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">已执行</span></td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">暂无不良记录</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  const renderHistory = () => (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-800">历史合作资产</h4>
        <button className="text-xs font-bold text-blue-600 flex items-center gap-1">
          <Download className="w-3 h-3" />
          导出对账单
        </button>
      </div>
      <div className="space-y-3">
        {selectedPartner?.history?.map(item => (
          <div key={item.id} className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === '合同' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                {item.type === '合同' ? <FileText className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span className="font-mono">{item.id}</span>
                  <span>•</span>
                  <span>{item.date}</span>
                  <span>•</span>
                  <span>{item.type}</span>
                </p>
              </div>
            </div>
            <button className="p-2 text-slate-300 group-hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ))}
        {(!selectedPartner?.history || selectedPartner.history.length === 0) && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-300">
            <History className="w-12 h-12 mb-2 opacity-20" />
            <p className="text-sm">暂无历史合作数据</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDynamic = () => (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex items-start gap-4">
        <div className="p-2 bg-red-100 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h5 className="text-sm font-bold text-red-900">实时风险监控中</h5>
          <p className="text-xs text-red-700 mt-1 leading-relaxed">系统实时扫描全网舆情与工商变更。如有重大预警，将立即推送到通知中心。</p>
        </div>
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
        {selectedPartner?.alerts?.map(alert => (
          <div key={alert.id} className="relative">
            <div className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm ${alert.severity === 'high' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
            <div className={`p-4 rounded-2xl border ${alert.severity === 'high' ? 'bg-white border-red-200 shadow-sm shadow-red-50' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{alert.date}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${alert.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {alert.severity === 'high' ? '严重预警' : '中度变动'}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800">{alert.title}</p>
            </div>
          </div>
        ))}
        {(!selectedPartner?.alerts || selectedPartner.alerts.length === 0) && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h5 className="font-bold text-slate-800 mb-1">动态更新正常</h5>
            <p className="text-sm text-slate-400">该合作伙伴近期资信平稳，无风险预警</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="按企业名称、统一信用代码筛选..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold py-2 px-3 rounded-xl outline-none"
            >
              <option value="all">所有风险等级</option>
              <option value="low">低风险</option>
              <option value="medium">中风险</option>
              <option value="high">高风险</option>
            </select>
            <select className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold py-2 px-3 rounded-xl outline-none">
              <option>所有合作状态</option>
              <option>在营</option>
              <option>中止</option>
            </select>
          </div>
        </div>
        <button 
          onClick={handleNewRegistration}
          className="bg-[#1E40AF] text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#1e3a8a] shadow-lg shadow-blue-100 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          新增登记
        </button>
      </div>

      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left List Pane */}
        <div className="w-80 bg-white border border-slate-200 rounded-2xl flex flex-col shrink-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">合作伙伴列表 ({filteredPartners.length})</span>
            <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {filteredPartners.map(p => (
              <button
                key={p.id}
                onClick={() => handleSelectPartner(p.id)}
                className={`w-full text-left p-4 rounded-xl transition-all border group relative
                  ${selectedId === p.id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'}
                  ${p.riskLevel === 'high' ? 'border-l-4 border-l-red-500' : ''}
                `}
              >
                <div className="flex flex-col gap-1.5">
                  <h5 className={`text-sm font-bold truncate ${selectedId === p.id ? 'text-blue-700' : 'text-slate-800'}`}>
                    {p.name}
                  </h5>
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-black tracking-tight ${p.riskLevel === 'high' ? 'bg-red-100 text-red-700' : p.riskLevel === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {p.riskLevel.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">评分: <span className="text-slate-700 font-bold">{p.rating}</span></span>
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100 group-hover:border-slate-200 transition-colors">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {p.lastUpdated}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 rounded leading-tight">
                      合作 {p.collabCount} 次
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm overflow-hidden min-w-0">
          <div className="px-6 pt-6 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isNewMode ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white'}`}>
                  {isNewMode ? <Building2 className="w-8 h-8" /> : <Landmark className="w-8 h-8" />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 leading-none mb-2">
                    {isNewMode ? '新增合作伙伴登记' : selectedPartner?.name}
                  </h2>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-mono text-slate-400">{isNewMode ? '等待填写基础数据' : selectedPartner?.code}</p>
                    {!isNewMode && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        已核验
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {!isNewMode && (
                <div className="flex items-center gap-2">
                  <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-100">
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-100">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-8">
              {[
                { id: 'basic', label: '基础信息', icon: <Building2 className="w-4 h-4" /> },
                { id: 'profile', label: '合规画像', icon: <ShieldCheck className="w-4 h-4" /> },
                { id: 'history', label: '合作历史', icon: <History className="w-4 h-4" /> },
                { 
                  id: 'dynamic', 
                  label: '风险动态', 
                  icon: <AlertCircle className="w-4 h-4" />, 
                  dot: hasAlerts && !isNewMode
                },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative pb-4 px-1 flex items-center gap-2 text-sm font-bold transition-all
                    ${activeTab === tab.id 
                      ? 'text-[#1E40AF]' 
                      : 'text-slate-400 hover:text-slate-600'}
                  `}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.dot && (
                    <span className="absolute top-0 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
                  )}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1E40AF] rounded-t-full shadow-sm"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'basic' && renderBasicInfo()}
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'dynamic' && renderDynamic()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerManagement;