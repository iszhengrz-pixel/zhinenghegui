import React, { useState, useRef, useEffect } from 'react';
import { 
  RefreshCw, 
  HelpCircle, 
  Play, 
  RotateCcw, 
  Download, 
  ChevronDown,
  Search,
  X,
  Building2,
  ClipboardList,
  Clock,
  Info,
  CheckCircle2,
  AlertCircle,
  FileBarChart,
  ShieldAlert,
  FileText,
  Upload,
  Trash2,
  AlertTriangle,
  FileCheck,
  FileSearch,
  Database,
  ChevronRight,
  ChevronUp,
  ShieldCheck,
  MousePointerClick,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface ProjectInfo {
  id: string;
  name: string;
  tenderType: string;
  winner: string;
  acceptanceClause: string;
  acceptanceStatus: '待验收' | '已验收';
  paymentProgress: string;
  processStatus: '流程完整' | '存在遗漏';
  isIncomplete?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
}

type AuditModuleStatus = 'idle' | 'loading' | 'success';

const TenderAuditCheck: React.FC = () => {
  // 核心状态
  const [acceptanceStatus, setAcceptanceStatus] = useState<AuditModuleStatus>('idle');
  const [procurementStatus, setProcurementStatus] = useState<AuditModuleStatus>('idle');
  const [isDataLinked, setIsDataLinked] = useState(true);
  
  // 布局与响应式
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // 基础数据状态
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isClausesFetched, setIsClausesFetched] = useState(false);
  
  // 检索表单
  const [searchId, setSearchId] = useState('');

  // 界面交互
  const [isSearching, setIsSearching] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAuditOptionsOpen, setIsAuditOptionsOpen] = useState(false);
  const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [flashingAuditId, setFlashingAuditId] = useState<string | null>(null);
  const [globalLoadingMsg, setGlobalLoadingMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 响应式监听
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth <= 1400) setIsLeftCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setAcceptanceStatus('idle');
    setProcurementStatus('idle');
    setTimeout(() => {
      setSelectedProject({
        id: 'NB-2024-0012-CI',
        name: '宁波智慧园区二期系统建设工程',
        tenderType: '公开招标',
        winner: '宁波中城建设集团有限公司',
        acceptanceClause: '三方联合整体验收，合格后支付30%尾款',
        acceptanceStatus: '待验收',
        paymentProgress: '已支付 70%',
        processStatus: '流程完整',
        isIncomplete: false
      });
      setIsSearching(false);
      showToast("项目检索成功");
    }, 800);
  };

  const runAudit = (target: 'all' | 'acceptance' | 'procurement') => {
    if (!selectedProject) return showToast("请先检索有效项目", "error");
    
    setIsAuditOptionsOpen(false);
    if (target === 'all' || target === 'acceptance') setAcceptanceStatus('loading');
    if (target === 'all' || target === 'procurement') setProcurementStatus('loading');

    const delay = target === 'all' ? 4000 : 2000;
    if (target === 'all') setGlobalLoadingMsg("AI正在深度同步分析中...");

    setTimeout(() => {
      if (target === 'all' || target === 'acceptance') setAcceptanceStatus('success');
      if (target === 'all' || target === 'procurement') setProcurementStatus('success');
      setGlobalLoadingMsg(null);
      showToast("分析完成");
    }, delay);
  };

  const handleFetchClauses = () => {
    if (!selectedProject) return;
    setIsClausesFetched(true);
    showToast("合同条款同步成功");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    const newFiles = rawFiles.map(f => ({ id: Math.random().toString(36), name: f.name, size: (f.size / 1024 / 1024).toFixed(2) + 'MB' }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
    showToast(`已上传 ${newFiles.length} 份文件`);
  };

  const triggerLinkageFlash = (auditId: string) => {
    if (!isDataLinked || procurementStatus !== 'success') return;
    setFlashingAuditId(auditId);
    setTimeout(() => setFlashingAuditId(null), 2500);
  };

  const auditChartData = [
    { name: '流程合理性', value: 30, color: '#1E40AF' },
    { name: '制度执行', value: 35, color: '#3B82F6' },
    { name: '流程合规', value: 35, color: '#60A5FA' },
  ];

  // 骨架屏
  const ModuleSkeleton = () => (
    <div className="flex flex-col gap-3 animate-pulse p-2">
      <div className="h-6 bg-slate-100 rounded w-1/4 mb-2"></div>
      <div className="h-32 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-slate-200 animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#FFFFFF] overflow-hidden font-sans relative">
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] px-5 py-2.5 rounded-lg shadow-xl border bg-white flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Info className="w-4 h-4 text-blue-500" />
          <span className="font-bold text-[13px]">{notification.msg}</span>
        </div>
      )}

      <header className="h-[64px] w-full bg-[#FFFFFF] border-b border-[#E5E7EB] px-[16px] flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h1 className="text-[16px] font-black text-[#1F2937]">验收回款校验与招采内部审计</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              disabled={acceptanceStatus === 'loading' || procurementStatus === 'loading'} 
              onClick={() => isDataLinked ? runAudit('all') : setIsAuditOptionsOpen(!isAuditOptionsOpen)}
              className="h-[34px] px-4 rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 bg-[#1E40AF] text-white hover:bg-blue-800 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              { isDataLinked ? '一键联合审查' : '启动局部审计' }
            </button>
            {isAuditOptionsOpen && (
              <div className="absolute top-[38px] left-0 w-[180px] bg-white border border-[#E5E7EB] shadow-xl rounded-lg py-1.5 z-[60]">
                <button onClick={() => runAudit('acceptance')} className="w-full text-left px-4 py-2 text-[12px] text-slate-600 hover:bg-blue-50">仅验收核查</button>
                <button onClick={() => runAudit('procurement')} className="w-full text-left px-4 py-2 text-[12px] text-slate-600 hover:bg-blue-50">仅审计评估</button>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => {setAcceptanceStatus('idle'); setProcurementStatus('idle'); setUploadedFiles([]);}} 
            className="h-[34px] px-3 rounded-lg bg-white border border-slate-200 text-slate-600 text-[13px] font-bold hover:bg-slate-50 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button disabled={acceptanceStatus !== 'success'} className="h-[34px] px-3 rounded-lg bg-white border border-slate-200 text-slate-600 text-[13px] font-bold disabled:opacity-30">
            <Download className="w-3.5 h-3.5" />
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1"></div>

          <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-500 font-black">联动</span>
            <button onClick={() => setIsDataLinked(!isDataLinked)} className={`relative w-8 h-4 rounded-full transition-colors ${isDataLinked ? 'bg-[#1E40AF]' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isDataLinked ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSearch} className="h-[34px] px-3 text-slate-400 hover:text-blue-600 transition-colors">
            <RefreshCw className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
          </button>
          <HelpCircle className="w-5 h-5 text-[#6B7280] cursor-help" />
        </div>
      </header>

      {globalLoadingMsg && (
        <div className="h-[32px] w-full bg-[#1E40AF] text-white flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300 relative z-30">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span className="text-[11px] font-black uppercase tracking-wider">{globalLoadingMsg}</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside className={`h-full bg-white border-r border-[#E5E7EB] transition-all duration-300 flex flex-col shrink-0 ${isLeftCollapsed ? 'w-[56px]' : 'w-[240px]'}`}>
          <div className="p-3 border-b border-slate-50 flex items-center justify-between">
            {!isLeftCollapsed && <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">项目筛选</h2>}
            <button onClick={() => setIsLeftCollapsed(!isLeftCollapsed)} className="p-1 rounded hover:bg-slate-100 text-slate-400">
              {isLeftCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
            {!isLeftCollapsed ? (
              <>
                <div className="space-y-2">
                  <input type="text" placeholder="编号/名称" value={searchId} onChange={e => setSearchId(e.target.value)} className="w-full h-[34px] px-3 border border-slate-200 rounded-lg text-[12px] outline-none focus:border-blue-600" />
                  <button onClick={handleSearch} className="w-full h-[34px] bg-[#1E40AF] text-white rounded-lg text-[12px] font-bold flex items-center justify-center gap-2">
                    {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />} 检索
                  </button>
                </div>
                {selectedProject && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 relative group animate-in slide-in-from-top-2">
                    <div><label className="text-[10px] text-slate-400 font-black block">项目编号</label><div className="text-[12px] font-bold text-blue-700">{selectedProject.id}</div></div>
                    <div><label className="text-[10px] text-slate-400 font-black block">项目名称</label><div className="text-[12px] font-bold text-slate-700 leading-tight">{selectedProject.name}</div></div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="flex items-center gap-1 text-blue-700 text-[10px] font-black"><Clock className="w-3 h-3" /> {selectedProject.paymentProgress}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button onClick={() => setIsLeftCollapsed(false)} className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mx-auto"><Search className="w-4 h-4" /></button>
            )}
          </div>
        </aside>

        <main className="flex-1 bg-[#F9FAFB] p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
          
          {/* 上模块：无高度限制，根据内容撑开 */}
          <section className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 shadow-sm rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <h3 className="text-[14px] font-black text-[#1F2937] flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-blue-600" /> AI 验收回款校验
               </h3>
               {acceptanceStatus === 'success' && <span className="text-[12px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">分析已完成</span>}
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-3">
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="h-[34px] w-[160px] bg-[#1E40AF] text-white rounded-lg text-[12px] font-black flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" /> 上传验收资料
                  </button>
                  <span className="text-[10px] text-slate-400 font-bold">PDF/Word/Excel, ≤50MB</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="flex items-center gap-2 bg-white border border-slate-200 px-2 py-1 rounded-lg text-[11px] group hover:border-blue-300">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span className="max-w-[120px] truncate text-slate-600 font-bold">{file.name}</span>
                      <Trash2 className="w-3 h-3 text-slate-300 cursor-pointer hover:text-red-500" onClick={() => setUploadedFiles(uploadedFiles.filter(f => f.id !== file.id))} />
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleFetchClauses} className={`h-[34px] px-4 rounded-lg text-[12px] font-black border transition-all ${isClausesFetched ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-600 hover:text-blue-600'}`}>
                {isClausesFetched ? '合同条款已同步' : '同步合同条款'}
              </button>
            </div>

            {acceptanceStatus === 'loading' ? <ModuleSkeleton /> : (
              <div className="flex flex-col xl:flex-row gap-4">
                {/* 模块：条款与原文 */}
                <div className="flex-[6] flex flex-col border border-[#E5E7EB] rounded-xl bg-white overflow-hidden shadow-sm">
                  <div className="grid grid-cols-2 h-[34px] bg-slate-50 border-b text-[10px] font-black text-slate-500 uppercase tracking-widest items-center text-center">
                    <div className="border-r border-slate-100">合同基准</div><div>现场扫描件</div>
                  </div>
                  <div className="p-4 space-y-4">
                    {acceptanceStatus === 'success' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[12px] leading-relaxed">
                          <div className="mb-1.5 font-black text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">条款: 验收标准</div>
                          <p>项目需由业主、监理及承建方进行<span className="bg-blue-100 text-blue-800 font-bold px-1 rounded">三方联合整体验收</span>。</p>
                        </div>
                        <div onClick={() => triggerLinkageFlash('flow-compliance')} className="p-3 bg-white rounded-xl border border-blue-100 text-[12px] leading-relaxed cursor-pointer group hover:shadow-md transition-all">
                          <div className="mb-1.5 font-black text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">现场件摘要</div>
                          <p>检测结果：目前仅见<span className="text-red-600 font-black underline decoration-red-300 underline-offset-4">承建单位与业主方</span>签署。</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[12px] leading-relaxed">
                          <div className="mb-1.5 font-black text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">条款: 回款周期</div>
                          <p>验收合格后<span className="font-bold">15个工作日内</span>完成支付。</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-[12px] leading-relaxed">
                          <div className="mb-1.5 font-black text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1">付款申请件</div>
                          <p>备注要求：<span className="text-red-600 font-black">即时结算</span>，与合同不符。</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-10 text-center text-slate-300 text-[11px] font-bold uppercase tracking-widest opacity-40 italic">等待执行核查</div>
                    )}
                  </div>
                </div>

                {/* 模块：校验报告 */}
                <div className="flex-[4] flex flex-col border border-[#E5E7EB] rounded-xl bg-white shadow-sm overflow-hidden">
                  <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">AI 自动校验报告</span>
                    <span className="text-[16px] font-black text-[#1E40AF]">{acceptanceStatus === 'success' ? '88%' : '--'}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {acceptanceStatus === 'success' ? (
                      <>
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                           <div className="flex items-center gap-2 mb-1.5 text-[12px] font-black text-red-700">
                             <AlertTriangle className="w-3.5 h-3.5" /> 关键风险：参与方缺失
                           </div>
                           <p className="text-[11px] text-red-800 italic leading-snug">现场资料缺失监理方签字，违反合同合规要件。</p>
                        </div>
                        <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
                           <div className="flex items-center gap-2 mb-1.5 text-[12px] font-black text-orange-700">
                             <AlertTriangle className="w-3.5 h-3.5" /> 逻辑偏差：支付周期
                           </div>
                           <p className="text-[11px] text-orange-800 italic leading-snug">付款申请要求的即时支付与合同约定的15日周期冲突。</p>
                        </div>
                      </>
                    ) : (
                      <div className="py-10 text-center text-slate-300 text-[11px] font-bold uppercase tracking-widest opacity-40 italic">暂无报告数据</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 下模块：无高度限制 */}
          <section className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 shadow-sm rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <h3 className="text-[14px] font-black text-[#1F2937] flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4 text-blue-600" /> AI 招采内部审计
               </h3>
               {procurementStatus === 'success' && <div className="text-[11px] text-slate-400 font-bold">审计画像已同步生成</div>}
            </div>

            {procurementStatus === 'loading' ? <ModuleSkeleton /> : (
              <div className="flex flex-col xl:flex-row gap-4">
                {/* 模块：评估画像 */}
                <div className="flex-1 flex flex-col border border-[#E5E7EB] rounded-xl bg-white overflow-hidden shadow-sm">
                  <div className="p-4 border-b bg-slate-50 text-[13px] font-black text-[#1E40AF]">内控有效性：{procurementStatus === 'success' ? '85分（良好）' : '--'}</div>
                  <div className="p-4 space-y-3">
                    {procurementStatus === 'success' ? (
                      <>
                        {[
                          { id: 'flow-rational', title: '流程合理性', result: '正常', desc: '招标节点流转严密。' },
                          { id: 'flow-compliance', title: '流程合规性', result: '风险', color: 'text-red-600', desc: '跨模块核验发现验收件严重违规。' }
                        ].map((item) => (
                          <div key={item.id} className={`p-3 rounded-xl border transition-all duration-700 ${flashingAuditId === item.id ? 'bg-blue-600 text-white border-blue-400 shadow-xl' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex items-center justify-between mb-1">
                               <span className="font-black text-[13px]">{item.title}</span>
                               <span className={`text-[11px] font-black ${flashingAuditId === item.id ? 'text-white' : (item.color || 'text-emerald-600')}`}>{item.result}</span>
                            </div>
                            <p className={`text-[10px] leading-snug ${flashingAuditId === item.id ? 'text-blue-100' : 'text-slate-500'}`}>{item.desc}</p>
                          </div>
                        ))}
                        <div className="h-[120px] pt-2 flex items-center justify-center bg-slate-50/30 rounded-xl">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart><Pie data={auditChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">{auditChartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}</Pie><RechartsTooltip /></PieChart>
                          </ResponsiveContainer>
                        </div>
                      </>
                    ) : (
                      <div className="py-10 text-center text-slate-300 text-[11px] font-bold uppercase tracking-widest opacity-40 italic">等待审计执行</div>
                    )}
                  </div>
                </div>

                {/* 模块：预警建议 */}
                <div className="flex-1 flex flex-col border border-[#E5E7EB] rounded-xl bg-white shadow-sm overflow-hidden">
                  <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                    <span className="text-[12px] font-black text-slate-800 uppercase tracking-widest">风险预警</span>
                    <div className="flex gap-3 text-[11px] font-black">
                      <span className="text-red-600 underline">高: {procurementStatus === 'success' ? '1' : '0'}</span>
                      <span className="text-orange-500">中: {procurementStatus === 'success' ? '1' : '0'}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {procurementStatus === 'success' ? (
                      <>
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                          <span className="text-[11px] font-black text-red-700 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> 履约主体偏差</span>
                          <p className="text-[10px] text-red-800 mt-1 leading-snug">检测到验收单签署单位与中标单位信息不符，存在转包嫌疑。</p>
                        </div>
                        <div className="space-y-2 pt-2">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">优化建议</h4>
                           {[
                             { title: '强制CA在线签章', content: '建议接入集团电子签章平台，规避线下扫描件造假风险。' },
                             { title: '结算节点智能挂起', content: '开启结算模块与审计引擎联动，异常件自动拦截支付。' }
                           ].map((sug, i) => (
                             <div key={i} onClick={() => setExpandedSuggestion(expandedSuggestion === i ? null : i)} className="p-2.5 bg-white border border-slate-100 rounded-lg hover:border-blue-200 transition-all cursor-pointer">
                               <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                 <span>{sug.title}</span>
                                 <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSuggestion === i ? 'rotate-180' : ''}`} />
                               </div>
                               {expandedSuggestion === i && <p className="mt-1.5 text-[10px] text-slate-500 leading-snug animate-in fade-in">{sug.content}</p>}
                             </div>
                           ))}
                        </div>
                      </>
                    ) : (
                      <div className="py-10 text-center text-slate-300 text-[11px] font-bold uppercase tracking-widest opacity-40 italic">报告待生成</div>
                    )}
                  </div>
                  <div className="p-3 border-t bg-slate-50 text-center text-[10px] text-slate-400 font-bold">
                    数据源：ERP、OA、招采平台、三方合规库。
                  </div>
                </div>
              </div>
            )}
          </section>

        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
        @keyframes redFlash {
          0%, 100% { background-color: rgba(248, 250, 252, 0.5); transform: scale(1); color: #1E40AF; }
          50% { background-color: #1E40AF; transform: scale(1.02); color: white; border-color: #3B82F6; }
        }
        .animate-flash { animation: redFlash 0.8s ease-in-out 3; }
      `}</style>
    </div>
  );
};

export default TenderAuditCheck;