import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  RefreshCw, HelpCircle, XCircle, Search, CheckCircle2, 
  Upload, FileText, Trash2, ArrowRight, ExternalLink,
  AlertCircle, Info, UserPlus, FileSpreadsheet, Play,
  ChevronDown, Filter, ShieldAlert, Loader2, PanelLeftClose, PanelLeftOpen,
  FileCheck, MousePointerClick, Building2, Layers, ChevronRight, History,
  FileSearch, Maximize2, SplitSquareHorizontal, X, Download
} from 'lucide-react';

interface ArchiveFile {
  id: string;
  name: string;
  type: 'pdf' | 'excel';
  time: string;
}

interface ProjectInfo {
  id: string;
  name: string;
  type: string;
  winner: string;
  status: '已存档' | '未存档';
  archiveFiles: ArchiveFile[];
}

interface DifferenceItem {
  id: number;
  type: '关键' | '一般';
  clause: string;
  tenderContent: string;
  contractContent: string;
  desc: string;
  anchorId: string; // 用于原文定位
}

interface Personnel {
  id: string;
  name: string;
  idCard: string;
  position: string;
  company: string;
  status: '已完成' | '待核验';
}

interface PersonnelRisk {
  id: number;
  personName: string;
  personId: string;
  level: '高' | '中' | '低';
  type: string;
  detail: string;
  suggestion: string;
}

const TenderAuditPerson: React.FC = () => {
  // --- 状态管理 ---
  const [searchKeyword, setSearchKeyword] = useState('');
  const [tenderType, setTenderType] = useState('全部');
  const [searchResults, setSearchResults] = useState<ProjectInfo[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // 全局业务状态
  const [auditStatus, setAuditStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMessage, setShowMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // 合同核查状态
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const personInputRef = useRef<HTMLInputElement>(null);
  const [isArchivedFetched, setIsArchivedFetched] = useState(false);
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);
  const [isContractLoading, setIsContractLoading] = useState(false);

  // 原文比对弹窗状态
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [activeDiffId, setActiveDiffId] = useState<number | null>(null);
  const leftDocRef = useRef<HTMLDivElement>(null);
  const midDocRef = useRef<HTMLDivElement>(null);

  // 人员核查状态
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [flashingPersonId, setFlashingPersonId] = useState<string | null>(null);
  const [newPerson, setNewPerson] = useState({ name: '', idCard: '', position: '', company: '' });

  // 响应式状态
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);

  // --- 模拟数据 ---
  const differences = useMemo<DifferenceItem[]>(() => [
    { id: 1, type: '关键', clause: '支付条款-预付款', tenderContent: '合同签订后7个工作日内支付30%', contractContent: '项目进场并提交开工报告后15日内支付15%', desc: '预付款比例下调，且支付前提条件增加', anchorId: 'diff-1' },
    { id: 2, type: '关键', clause: '工期节点-整体验收', tenderContent: '总工期180日历天', contractContent: '总工期210日历天（含30天试运行）', desc: '总工期描述与投标承诺不一致', anchorId: 'diff-2' },
    { id: 3, type: '一般', clause: '售后服务-响应时间', tenderContent: '2小时内到达现场', contractContent: '4小时内远程响应，必要时12小时内到场', desc: '售后响应等级有所降低', anchorId: 'diff-3' },
  ], []);

  const initialPersonnel = useMemo<Personnel[]>(() => [
    { id: 'p1', name: '王振宇', idCard: '110101199001011234', position: '项目经理', company: '宁波中城建设集团有限公司', status: '已完成' },
    { id: 'p2', name: '李晓萌', idCard: '33020119920512445X', position: '技术负责人', company: '宁波中城建设集团有限公司', status: '已完成' },
    { id: 'p3', name: '张大勇', idCard: '330212198511206678', position: '安全员', company: '宁波中城建设集团有限公司', status: '已完成' },
    { id: 'p4', name: '赵丽', idCard: '330205199408081122', position: '质量员', company: '宁波中城建设集团有限公司', status: '已完成' },
    { id: 'p5', name: '孙强', idCard: '110108198812305566', position: '造价师', company: '宁波中城建设集团有限公司', status: '已完成' },
  ], []);

  const personnelRisks = useMemo<PersonnelRisk[]>(() => [
    { id: 1, personName: '王振宇', personId: 'p1', level: '高', type: '用工风险', detail: '该人员当前在“慈溪智慧产业园”项目担任项目经理，处于在建状态，存在一人双岗风险。', suggestion: '建议核实其在建项目完工证明或更换项目经理。' },
    { id: 2, personName: '李晓萌', personId: 'p2', level: '中', type: '社保风险', detail: '近三月社保缴纳单位为“杭州优选科技”，与投标单位名称不一致。', suggestion: '建议要求其提供最新的社保证明及劳动合同。' },
  ], []);

  // --- 监听窗口大小 ---
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width <= 1366) {
        setIsLeftCollapsed(true);
      } else {
        setIsLeftCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 提示逻辑 ---
  const triggerMsg = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setShowMessage({ text, type });
    setTimeout(() => setShowMessage(null), 3000);
  };

  // --- 业务逻辑 ---

  const handleGlobalAudit = () => {
    if (!selectedProject) {
      triggerMsg('请先检索并选择有效项目', 'error');
      return;
    }
    if (!isArchivedFetched) {
      triggerMsg('请先在侧边栏选取投标存档文件', 'error');
      return;
    }
    setAuditStatus('loading');
    setTimeout(() => {
      setAuditStatus('success');
      setUploadedFile({ name: '宁波城投智慧办公大楼系统建设合同_最终版.pdf', size: '4.2MB' });
      setPersonnelList(initialPersonnel);
      triggerMsg('AI 全局审查完成，已发现 5 处合同差异及 2 项人员风险点');
    }, 3000);
  };

  const handleReset = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setAuditStatus('idle');
      setSelectedProject(null);
      setSearchResults([]);
      setSearchKeyword('');
      setTenderType('全部');
      setUploadedFile(null);
      setIsArchivedFetched(false);
      setSelectedArchiveId(null);
      setPersonnelList([]);
      setIsRefreshing(false);
      triggerMsg('系统已重置，相关审查数据已清空', 'info');
    }, 800);
  };

  const handleRefresh = () => {
    if (auditStatus === 'success') {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        triggerMsg('数据已刷新，已同步最新核验结果');
      }, 1000);
    } else {
      handleReset();
    }
  };

  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      triggerMsg('请输入项目编号或名称进行检索', 'error');
      return;
    }
    setIsSearching(true);
    setSearchResults([]);
    setSelectedProject(null);
    setSelectedArchiveId(null);
    setIsArchivedFetched(false);

    // 模拟多结果搜索
    setTimeout(() => {
      const mockResults: ProjectInfo[] = ([
        {
          id: 'NB-2024-001-CI',
          name: '宁波城投智慧办公大楼系统建设项目',
          type: '公开招标',
          winner: '宁波中城建设集团有限公司',
          status: '已存档',
          archiveFiles: [
            { id: 'f-01', name: '投标文件_商务标_2024最终版.pdf', type: 'pdf', time: '2024-03-12' },
            { id: 'f-02', name: '投标文件_技术标_盖章扫描件.pdf', type: 'pdf', time: '2024-03-12' },
          ]
        },
        {
          id: 'NB-2024-002-CI',
          name: '宁波智慧园区二期弱电智能化工程',
          type: '邀请招标',
          winner: '浙江环宇建筑集团',
          status: '已存档',
          archiveFiles: [
            { id: 'f-04', name: '技术投标文件.pdf', type: 'pdf', time: '2024-01-05' },
          ]
        },
        {
          id: 'NB-2023-098-CI',
          name: '宁波城市之光数字化展厅建设',
          type: '竞争性谈判',
          winner: '宁波中城建设集团有限公司',
          status: '已存档',
          archiveFiles: [
            { id: 'f-05', name: '全套投标文件.pdf', type: 'pdf', time: '2023-11-20' },
          ]
        }
      ] as ProjectInfo[]).filter(p => p.name.includes(searchKeyword) || p.id.includes(searchKeyword));

      setSearchResults(mockResults);
      setIsSearching(false);
      if (mockResults.length > 0) {
        triggerMsg(`匹配到 ${mockResults.length} 个相关项目`);
      } else {
        triggerMsg('未找到匹配项目，请更换关键词', 'error');
      }
    }, 800);
  };

  const handleSelectProject = (project: ProjectInfo) => {
    setSelectedProject(project);
    triggerMsg(`已进入项目：${project.id}`);
  };

  const handleSelectArchive = (file: ArchiveFile) => {
    setIsContractLoading(true);
    setSelectedArchiveId(file.id);
    setTimeout(() => {
      setIsArchivedFetched(true);
      setIsContractLoading(false);
      triggerMsg(`已确认选取存档：${file.name}`);
    }, 800);
  };

  const validateFile = (file: File, type: 'contract' | 'personnel') => {
    const fileName = file.name.toLowerCase();
    const fileSize = file.size;

    if (type === 'contract') {
      const isFormatValid = fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx');
      if (!isFormatValid) {
        triggerMsg('仅支持 PDF/Word 格式文件，请重新上传', 'error');
        return false;
      }
      if (fileSize > 50 * 1024 * 1024) {
        triggerMsg('单文件大小不得超过 50MB，请重新上传', 'error');
        return false;
      }
    } else {
      const isFormatValid = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv');
      if (!isFormatValid) {
        triggerMsg('仅支持 Excel/CSV 格式文件，请重新上传', 'error');
        return false;
      }
      if (fileSize > 10 * 1024 * 1024) {
        triggerMsg('单文件大小不得超过 10MB，请重新上传', 'error');
        return false;
      }
    }
    return true;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProject) {
      triggerMsg('请先检索并选择有效项目', 'error');
      e.target.value = '';
      return;
    }
    const file = e.target.files?.[0];
    if (file && validateFile(file, 'contract')) {
      setIsContractLoading(true);
      setTimeout(() => {
        setUploadedFile({
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + 'MB'
        });
        setIsContractLoading(false);
        triggerMsg('合同文件上传成功');
      }, 1000);
    }
  };

  const handlePersonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file, 'personnel')) {
      setIsVerifying(true);
      setTimeout(() => {
        setPersonnelList(initialPersonnel);
        setIsVerifying(false);
        triggerMsg('人员信息导入成功');
      }, 1200);
    }
  };

  const handleStartVerify = () => {
    if (personnelList.length === 0) {
      triggerMsg('请先录入 / 导入关键人员信息', 'error');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setAuditStatus('success');
      triggerMsg('多源数据核验完成，已生成风险画像');
    }, 2000);
  };

  const handleAddPerson = () => {
    if (!newPerson.name || !newPerson.idCard) {
      triggerMsg('姓名与身份证号不能为空', 'error');
      return;
    }
    const id = 'p' + (personnelList.length + 1);
    setPersonnelList([...personnelList, { ...newPerson, id, status: '待核验' }]);
    setIsModalOpen(false);
    setNewPerson({ name: '', idCard: '', position: '', company: '' });
    triggerMsg(`已成功添加人员：${newPerson.name}`);
  };

  const triggerFlash = (personId: string) => {
    setFlashingPersonId(personId);
    setTimeout(() => setFlashingPersonId(null), 1500);
    const element = document.getElementById(`person-row-${personId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const maskIdCard = (id: string) => {
    if (!id) return '';
    return id.substring(0, 3) + '****' + id.substring(id.length - 11);
  };

  const scrollToDiff = (diff: DifferenceItem) => {
    setActiveDiffId(diff.id);
    const leftEl = document.getElementById(`left-${diff.anchorId}`);
    const midEl = document.getElementById(`mid-${diff.anchorId}`);
    leftEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    midEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 视觉反馈
    setTimeout(() => setActiveDiffId(null), 2000);
  };

  // --- 骨架屏组件 ---
  const Skeleton = ({ rows = 3 }: { rows?: number }) => (
    <div className="flex flex-col gap-4 h-full w-full animate-pulse p-4">
      <div className="h-6 w-1/3 bg-slate-100 rounded mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 w-full bg-slate-50 rounded"></div>
        ))}
        <div className="h-24 w-full bg-slate-50 rounded mt-4 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-slate-200 animate-spin" />
        </div>
      </div>
    </div>
  );

  const isSmallRes = windowWidth <= 1366;
  const isResultVisible = auditStatus === 'success';

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* 消息提示 */}
      {showMessage && (
        <div className={`fixed top-[20px] left-1/2 -translate-x-1/2 px-5 py-3 rounded-md shadow-lg z-[1000] flex items-center gap-3 animate-in fade-in slide-in-from-top-4
          ${showMessage.type === 'error' ? 'bg-red-50 border border-red-100 text-red-600' : 
            showMessage.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 
            'bg-blue-50 border border-blue-100 text-blue-700'}
        `}>
          {showMessage.type === 'error' ? <XCircle className="w-4 h-4" /> : 
           showMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
          <span className="text-[14px] font-medium">{showMessage.text}</span>
        </div>
      )}

      {/* 顶部通栏 */}
      <header className="h-[64px] w-full bg-white border-b border-slate-200 px-[20px] flex items-center justify-between shrink-0 relative z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-[18px] font-bold text-slate-800 tracking-tight">中标合同与人员审查</h1>
        </div>
        <div className="flex items-center gap-[12px]">
          <button 
            onClick={handleGlobalAudit}
            disabled={!selectedProject || !isArchivedFetched || auditStatus !== 'idle'} 
            className={`h-[36px] px-[20px] rounded-[6px] text-[14px] font-bold flex items-center justify-center transition-all
              ${selectedProject && isArchivedFetched && auditStatus === 'idle' ? 'bg-[#1E40AF] text-white hover:bg-blue-800 shadow-md shadow-blue-100 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
            `}
          >
            {auditStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            一键审查
          </button>
          <button 
            onClick={handleReset}
            disabled={auditStatus === 'loading' || isRefreshing} 
            className={`h-[36px] px-[16px] border rounded-[6px] text-[14px] font-semibold flex items-center justify-center transition-all 
              ${auditStatus !== 'loading' && !isRefreshing ? 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50' : 'bg-white border-slate-200 text-slate-300 cursor-not-allowed'}
            `}
          >
            重新审查
          </button>
          <button 
            onClick={() => triggerMsg('审查报告导出成功，正在下载……')}
            disabled={!isResultVisible} 
            className={`h-[36px] px-[16px] border rounded-[6px] text-[14px] font-semibold flex items-center justify-center transition-all
              ${isResultVisible ? 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50' : 'bg-white border-slate-200 text-slate-300 cursor-not-allowed'}
            `}
          >
            导出审查报告
          </button>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <button 
            onClick={handleRefresh}
            className="h-[36px] px-[12px] bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-600 rounded-[6px] text-[14px] flex items-center gap-[6px] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing || isVerifying || isContractLoading ? 'animate-spin' : ''}`} />刷新
          </button>
        </div>
      </header>

      {/* 页面主容器 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧项目检索与存档选择 */}
        <aside className={`h-full bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shrink-0 ${isLeftCollapsed ? 'w-[64px]' : 'w-[320px]'}`}>
          <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            {!isLeftCollapsed && <h2 className="text-[14px] font-bold text-slate-700 flex items-center gap-2"><Building2 className="w-4 h-4 text-blue-500" />项目与存档选择</h2>}
            <button 
              onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
              className={`p-1.5 rounded-md hover:bg-slate-100 text-slate-400 transition-colors ${isLeftCollapsed ? 'mx-auto' : ''}`}
            >
              {isLeftCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {isLeftCollapsed ? (
              <div className="flex flex-col items-center gap-4">
                <button onClick={() => setIsLeftCollapsed(false)} className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-all">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* 第一阶段：搜索输入 */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold uppercase tracking-widest px-1">检索项目</label>
                    <div className="relative group">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text" 
                        value={searchKeyword} 
                        onChange={e => setSearchKeyword(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="项目编号或名称关键词" 
                        className="w-full h-[38px] pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all hover:border-slate-300" 
                      />
                      {searchKeyword && (
                        <XCircle className="w-4 h-4 text-slate-300 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer hover:text-red-500" onClick={() => setSearchKeyword('')} />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold uppercase tracking-widest px-1">招标类型</label>
                    <select value={tenderType} onChange={e => setTenderType(e.target.value)} className="w-full h-[38px] px-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] outline-none hover:border-slate-300 cursor-pointer focus:border-blue-600 focus:bg-white transition-all">
                      <option value="全部">全部类型</option>
                      <option value="公开招标">公开招标</option>
                      <option value="邀请招标">邀请招标</option>
                      <option value="单一来源">单一来源</option>
                    </select>
                  </div>
                  <button onClick={handleSearch} disabled={isSearching} className="w-full h-[40px] bg-blue-600 text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100">
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}执行检索
                  </button>
                </div>

                {/* 加载状态 */}
                {isSearching && (
                  <div className="mt-4 space-y-4 animate-pulse">
                    <div className="h-20 w-full bg-slate-50 rounded-2xl border border-slate-100"></div>
                    <div className="h-20 w-full bg-slate-50 rounded-2xl border border-slate-100"></div>
                  </div>
                )}

                {/* 第二阶段：搜索结果列表 */}
                {!isSearching && searchResults.length > 0 && !selectedProject && (
                   <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                     <div className="flex items-center justify-between px-1">
                        <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <History className="w-3.5 h-3.5 text-blue-500" /> 检索结果 ({searchResults.length})
                        </span>
                     </div>
                     <div className="space-y-2">
                        {searchResults.map(p => (
                           <div 
                             key={p.id}
                             onClick={() => handleSelectProject(p)}
                             className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group"
                           >
                              <div className="flex items-center justify-between mb-2">
                                 <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded leading-none">{p.id}</span>
                                 <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                              </div>
                              <div className="text-[13px] font-bold text-slate-800 leading-tight mb-2">{p.name}</div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                 <Building2 className="w-3 h-3" />
                                 <span className="truncate">{p.winner}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                   </div>
                )}

                {/* 第三阶段：选定项目后的存档选择 */}
                {!isSearching && selectedProject && (
                  <div className="mt-2 space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                    {/* 项目简报 & 返回按钮 */}
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/30 border border-blue-100 rounded-2xl shadow-sm relative group">
                      <button 
                        onClick={() => {setSelectedProject(null); setSelectedArchiveId(null); setIsArchivedFetched(false);}}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="取消选择并返回列表"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <div className="space-y-3">
                        <div className="flex flex-col gap-0.5"><span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">当前选择</span><span className="text-[13px] font-bold text-blue-700">{selectedProject.id}</span></div>
                        <div className="flex flex-col gap-0.5"><span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">项目名称</span><span className="text-[13px] font-bold text-slate-800 leading-tight">{selectedProject.name}</span></div>
                        <div className="flex flex-col gap-0.5"><span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">中标单位</span><span className="text-[13px] font-bold text-slate-800 truncate">{selectedProject.winner}</span></div>
                      </div>
                    </div>

                    {/* 存档文件选择步进 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-blue-500" /> 投标存档文件 ({selectedProject.archiveFiles.length})
                        </span>
                        <div className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">Step 2</div>
                      </div>
                      <div className="space-y-2.5">
                        {selectedProject.archiveFiles.map(file => (
                          <div 
                            key={file.id} 
                            onClick={() => !selectedArchiveId && handleSelectArchive(file)}
                            className={`p-3.5 rounded-2xl border transition-all group flex flex-col gap-2 relative overflow-hidden cursor-pointer
                              ${selectedArchiveId === file.id ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5'}
                            `}
                          >
                            <div className="flex items-start gap-3 relative z-10">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selectedArchiveId === file.id ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                {file.type === 'pdf' ? <FileText className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-[13px] font-bold text-slate-700 truncate leading-tight group-hover:text-blue-600 transition-colors" title={file.name}>{file.name}</span>
                                <span className="text-[10px] text-slate-400 mt-1 font-mono">存档时间：{file.time}</span>
                              </div>
                            </div>
                            
                            {selectedArchiveId === file.id ? (
                               <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-white/60 py-1.5 px-3 rounded-xl border border-emerald-100">
                                 <CheckCircle2 className="w-3.5 h-3.5" /> 已作为基准
                               </div>
                            ) : (
                               <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <MousePointerClick className="w-3.5 h-3.5" /> 点击选取此文件
                               </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 初始或空状态 */}
                {!isSearching && searchResults.length === 0 && !selectedProject && (
                  <div className="py-20 flex flex-col items-center justify-center text-center px-4 space-y-4 opacity-40">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-[13px] font-bold text-slate-400 leading-relaxed">请输入关键词或项目编号执行检索</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* 右侧主内容区 */}
        <main className="flex-1 h-full p-[20px] flex flex-col gap-[20px] overflow-y-auto custom-scrollbar">
          
          {/* 上半部: 合同一致性核查 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-[20px] shadow-sm flex flex-col min-h-[400px] shrink-0">
            {auditStatus === 'loading' || isContractLoading ? <Skeleton rows={6} /> : (
              <>
                <div className="flex items-center justify-between mb-[20px] shrink-0">
                  <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" /> AI 中标合同一致性核查
                  </h3>
                  <div className="flex items-center gap-3">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
                    {isResultVisible && (
                      <button 
                        onClick={() => setIsCompareModalOpen(true)}
                        className="h-[36px] px-[16px] bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[14px] font-bold hover:bg-blue-100 transition-all flex items-center gap-2"
                      >
                        <SplitSquareHorizontal className="w-4 h-4" /> 查看原文对比
                      </button>
                    )}
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={isResultVisible || !selectedProject}
                      className={`h-[36px] px-[16px] rounded-lg text-[14px] font-semibold flex items-center justify-center gap-2 transition-all border
                        ${!selectedProject || isResultVisible ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50'}
                      `}
                    >
                      <Upload className="w-4 h-4" />上传中标合同
                    </button>
                    {!isArchivedFetched && selectedProject && (
                      <div className="flex items-center gap-2 text-[12px] text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 font-bold animate-pulse">
                        <AlertCircle className="w-4 h-4" /> 待在侧边栏选取投标存档文件
                      </div>
                    )}
                  </div>
                </div>

                {uploadedFile && (
                  <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] animate-in fade-in slide-in-from-left-2 w-fit">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-slate-700 font-bold">{uploadedFile.name}</span>
                    <span className="text-slate-400 mx-2">|</span>
                    <span className="text-slate-400">{uploadedFile.size}</span>
                    {!isResultVisible && (
                      <button onClick={() => setUploadedFile(null)} className="ml-2 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                <div className={`flex flex-1 gap-[20px] min-h-0 ${isSmallRes ? 'flex-col' : 'flex-row'}`}>
                  {/* 比对视图 */}
                  <div className="flex-[6] flex flex-col border border-slate-100 rounded-xl bg-slate-50 overflow-hidden">
                    <div className="grid grid-cols-3 h-[36px] bg-slate-100/80 border-b shrink-0 text-[12px] font-bold text-slate-500 text-center items-center">
                      <div>投标文件 (选取)</div><div className="text-blue-600">中标合同 (上传)</div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-[15px] bg-white">
                      {isResultVisible ? (
                        <div className="grid grid-cols-2 gap-[15px] text-[13px] text-slate-600 leading-[2]">
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">1.1 预付款比例：本合同签署完成后<b className="text-red-600">7个工作日</b>内，甲方向乙方支付合同总额的30%作为预付款。</div>
                          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">第四条 预付款：乙方项目进场并提交开工报告后<b className="text-red-600">15日内</b>，甲向乙方支付合同总额的<b className="text-red-600">15%</b>。</div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 italic py-10">
                          <AlertCircle className="w-12 h-12 opacity-10 mb-2" />
                          <p className="text-[14px]">{!selectedProject ? '请先通过侧边栏检索项目' : (!isArchivedFetched ? '请先选取投标存档文件' : (uploadedFile ? '等待启动 AI 全局审查' : '请上传中标合同文件'))}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 差异清单 */}
                  <div className="flex-[4] flex flex-col border border-slate-100 rounded-xl bg-white shadow-sm overflow-hidden">
                    <div className="p-[12px] bg-slate-50 border-b flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[12px] font-bold">
                        <span className="text-slate-500">总差异项：<span className="text-slate-900">{isResultVisible ? 5 : 0}</span></span>
                        <span className="text-red-600">关键风险：<span>{isResultVisible ? 2 : 0}</span></span>
                      </div>
                      <HelpCircle className="w-4 h-4 text-slate-300 cursor-help" />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left text-[12px]">
                        <thead className="sticky top-0 bg-slate-50 border-b text-slate-400 font-bold uppercase z-10">
                          <tr><th className="p-3 w-10">#</th><th className="p-3 w-20">类型</th><th className="p-3">条款描述</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {isResultVisible ? (
                            differences.map((diff, i) => (
                              <tr key={diff.id} className={`transition-colors hover:bg-slate-50 ${diff.type === '关键' ? 'bg-red-50/30' : ''}`}>
                                <td className="p-3 text-slate-400">{i + 1}</td>
                                <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${diff.type === '关键' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{diff.type}</span></td>
                                <td className="p-3">
                                  <p className="font-bold text-slate-800 mb-1">{diff.clause}</p>
                                  <p className="text-slate-500 leading-normal">{diff.desc}</p>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan={3} className="p-20 text-center text-slate-300 italic">暂无比对差异报告</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {isResultVisible && (
                      <div className="p-[12px] bg-blue-50 border-t flex items-center justify-between">
                        <span className="text-[11px] text-blue-700 font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> 结果已自动同步至合同审批流程</span>
                        <button className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1">审批链路 <ArrowRight className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>

          {/* 下半部: 人员风险核验 */}
          <section className="bg-white border border-slate-200 rounded-2xl p-[20px] shadow-sm flex flex-col min-h-[400px] shrink-0">
            {auditStatus === 'loading' || isVerifying ? <Skeleton rows={6} /> : (
              <>
                <div className="flex items-center justify-between mb-[20px] shrink-0">
                  <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-blue-600" /> AI 关键人员资信与风险画像
                  </h3>
                  <div className="flex items-center gap-3">
                    <input type="file" ref={personInputRef} className="hidden" onChange={handlePersonFileUpload} accept=".xlsx,.xls,.csv" />
                    <button 
                      onClick={() => setIsModalOpen(true)} 
                      className="h-[36px] px-[16px] bg-white border border-slate-200 text-slate-700 rounded-lg text-[14px] font-semibold hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" /> 单条录入
                    </button>
                    <button 
                      onClick={() => personInputRef.current?.click()}
                      className="h-[36px] px-[16px] bg-white border border-slate-200 text-slate-700 rounded-lg text-[14px] font-semibold hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Excel 导入
                    </button>
                    <button 
                      onClick={handleStartVerify}
                      disabled={personnelList.length === 0 || isVerifying}
                      className={`h-[36px] px-[20px] rounded-lg text-[14px] font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-100
                        ${personnelList.length > 0 && !isVerifying ? 'bg-[#1E40AF] text-white hover:bg-blue-800 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                      `}
                    >
                      <Play className="w-4 h-4" /> 启动资信核验
                    </button>
                  </div>
                </div>

                <div className={`flex flex-1 gap-[20px] min-h-0 ${isSmallRes ? 'flex-col' : 'flex-row'}`}>
                  {/* 人员名录 */}
                  <div className="flex-1 flex flex-col border border-slate-100 rounded-xl bg-white overflow-hidden shadow-sm">
                    <div className="p-[12px] bg-slate-50 border-b flex items-center justify-between">
                      <span className="text-[12px] font-bold text-slate-500">关键人员名录 ({personnelList.length})</span>
                      <Filter className="w-4 h-4 text-slate-300" />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left text-[12px]">
                        <thead className="sticky top-0 bg-slate-50 border-b text-slate-400 font-bold uppercase z-10">
                          <tr><th className="p-3 w-10">序</th><th className="p-3">姓名</th><th className="p-3">岗位</th><th className="p-3">核验状态</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {personnelList.length > 0 ? (
                            personnelList.map((p, i) => (
                              <tr key={p.id} id={`person-row-${p.id}`} className={`transition-all duration-300 hover:bg-slate-50 group ${flashingPersonId === p.id ? 'bg-blue-50 ring-1 ring-inset ring-blue-200' : ''}`}>
                                <td className="p-3 text-slate-400">{i + 1}</td>
                                <td className="p-3">
                                  <div className="font-bold text-slate-800">{p.name}</div>
                                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{maskIdCard(p.idCard)}</div>
                                </td>
                                <td className="p-3 text-slate-600">{p.position}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${p.status === '已完成' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                                    {p.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan={4} className="p-20 text-center text-slate-300 italic">请先上传或录入人员基础信息</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 风险画像 */}
                  <div className="flex-1 flex flex-col border border-slate-100 rounded-xl bg-white overflow-hidden shadow-sm">
                    <div className="p-[12px] bg-slate-50 border-b flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[12px] font-bold">
                        <span className="text-red-600">高风险：{isResultVisible ? 1 : 0}</span>
                        <span className="text-orange-500">中风险：{isResultVisible ? 1 : 0}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-300 hover:text-blue-600 cursor-pointer transition-colors" />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {isResultVisible ? (
                        <div className="divide-y divide-slate-50">
                          {personnelRisks.map((risk) => (
                            <div key={risk.id} onClick={() => triggerFlash(risk.personId)} className={`p-4 transition-all hover:bg-slate-50 cursor-pointer border-l-4 ${risk.level === '高' ? 'border-red-500 bg-red-50/20' : 'border-orange-500 bg-orange-50/20'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[14px] font-bold text-slate-800 underline decoration-dotted decoration-slate-300">{risk.personName}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${risk.level === '高' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                  {risk.level}风险项
                                </span>
                              </div>
                              <p className="text-[13px] text-slate-600 leading-relaxed mb-3"><b>{risk.type}：</b>{risk.detail}</p>
                              <div className="text-[12px] text-blue-700 bg-white/80 p-2 rounded border border-blue-50 shadow-sm flex items-start gap-2">
                                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                                <span><b>处置建议：</b>{risk.suggestion}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-4">
                          <ShieldAlert className="w-16 h-16 text-slate-100" />
                          <p className="text-slate-300 text-[14px] italic">启动多源核验后，系统将自动穿透背景分析潜在风险</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* 底部占位 */}
          <div className="h-10"></div>
        </main>
      </div>

      {/* 原文比对大弹窗 */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white w-[96vw] h-[92vh] rounded-[24px] shadow-2xl overflow-hidden flex flex-col relative border border-slate-200">
              {/* 头部 */}
              <div className="h-[70px] border-b border-slate-100 flex items-center justify-between px-8 shrink-0 bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                       <SplitSquareHorizontal className="w-6 h-6 text-white" />
                    </div>
                    <div>
                       <h2 className="text-[18px] font-black text-slate-800 tracking-tight">AI 条款一致性深度核查 - 原文比对视图</h2>
                       <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Dual-View Contract Consistency Deep-Dive Analysis</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => setIsCompareModalOpen(false)}
                    className="p-3 hover:bg-red-50 hover:text-red-500 rounded-full transition-all text-slate-400"
                 >
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* 主体三栏 */}
              <div className="flex-1 flex overflow-hidden">
                 {/* 第一栏：投标文件原文 (40%) */}
                 <div className="flex-[4] border-r border-slate-100 flex flex-col bg-white">
                    <div className="h-12 bg-slate-50/30 border-b flex items-center px-6 justify-between shrink-0">
                       <span className="text-[12px] font-black text-slate-500 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> 投标文件 (存档基准)
                       </span>
                       <span className="text-[10px] bg-white border px-2 py-0.5 rounded-full text-slate-400 font-mono">ID: DOC-TENDER-2024</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-50/10 leading-[2.2]">
                       <div className="max-w-2xl mx-auto space-y-8 text-slate-600 text-[14px]">
                          <p>第一章 项目背景及商务要求...</p>
                          <p>1.1 项目总体概况说明：本项目由宁波城建投资集团发起，旨在构建全方位的智慧办公生态体系...</p>
                          <div id="left-diff-1" className={`p-4 rounded-2xl transition-all duration-700 border-2 ${activeDiffId === 1 ? 'bg-red-50 border-red-500 shadow-lg scale-[1.02]' : 'bg-slate-50 border-transparent'}`}>
                             <span className="text-[11px] font-black text-red-600 mb-2 block uppercase tracking-wider">条款定位 - 1.1 预付款比例</span>
                             本合同签署完成后，基于招标文件及响应承诺，<b className="text-red-700">在7个工作日内</b>，甲方向乙方支付合同总额的30%作为启动预付款，以确保核心资源到位。
                          </div>
                          <p>1.2 项目周期与节点管理：本项目作为年度重点工程，必须在规定时限内交付...</p>
                          <div id="left-diff-2" className={`p-4 rounded-2xl transition-all duration-700 border-2 ${activeDiffId === 2 ? 'bg-red-50 border-red-500 shadow-lg scale-[1.02]' : 'bg-slate-50 border-transparent'}`}>
                             <span className="text-[11px] font-black text-red-600 mb-2 block uppercase tracking-wider">条款定位 - 1.2 总工期承诺</span>
                             乙方承诺，在满足开工条件的前提下，本项目<b className="text-red-700">总工期为180日历天</b>，包含需求分析、系统开发、硬件安装及初步调试。
                          </div>
                          <p>1.3 售后支持体系：乙方需提供不少于3年的原厂免费维保服务...</p>
                          <div id="left-diff-3" className={`p-4 rounded-2xl transition-all duration-700 border-2 ${activeDiffId === 3 ? 'bg-orange-50 border-orange-500 shadow-lg scale-[1.02]' : 'bg-slate-50 border-transparent'}`}>
                             <span className="text-[11px] font-black text-orange-600 mb-2 block uppercase tracking-wider">条款定位 - 1.3 售后响应效率</span>
                             如遇紧急故障，技术支持人员应在<b className="text-orange-700">2小时内到达现场</b>，或提供同等时效的远程技术响应，并确保系统不间断运行。
                          </div>
                          {Array.from({length: 10}).map((_, i) => (
                             <p key={i}>补充条款说明文本 {i+1}：严格按照国家法律法规执行，确保所有流程合规、透明。宁波城投保留对任何违规行为的最终解释权及问责权利。</p>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* 第二栏：中标合同原文 (40%) */}
                 <div className="flex-[4] border-r border-slate-100 flex flex-col bg-white">
                    <div className="h-12 bg-blue-50/30 border-b flex items-center px-6 justify-between shrink-0">
                       <span className="text-[12px] font-black text-blue-700 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> 中标合同 (当前审查件)
                       </span>
                       <span className="text-[10px] bg-white border border-blue-100 px-2 py-0.5 rounded-full text-blue-400 font-mono">FILE: CONTRACT_FINAL_v1.pdf</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 leading-[2.2]">
                       <div className="max-w-2xl mx-auto space-y-8 text-slate-700 text-[14px]">
                          <p>合同编号：NB-CT-2024-CONTRACT-001</p>
                          <p>第一章 合作内容与基本概况...</p>
                          <p>第一条 本项目合同签署地为宁波市，双方基于互信互惠原则达成如下一致意见...</p>
                          <div id="mid-diff-1" className={`p-4 rounded-2xl transition-all duration-700 border-2 ${activeDiffId === 1 ? 'bg-red-50 border-red-500 shadow-lg scale-[1.02]' : 'bg-blue-50/50 border-transparent'}`}>
                             <span className="text-[11px] font-black text-red-600 mb-2 block uppercase tracking-wider">检测到变动条款 - 第四条 支付方式</span>
                             乙方项目进场并提交开工报告通过甲方审核后，<b className="text-red-700">15日内</b>，甲向乙方支付合同总额的<b className="text-red-700">15%</b>作为第一笔进度款。
                          </div>
                          <p>第二条 权利与义务：甲乙双方需严格履行各自职责，确保项目高质量推进...</p>
                          <div id="mid-diff-2" className={`p-4 rounded-2xl transition-all duration-700 border-2 ${activeDiffId === 2 ? 'bg-red-50 border-red-500 shadow-lg scale-[1.02]' : 'bg-blue-50/50 border-transparent'}`}>
                             <span className="text-[11px] font-black text-red-600 mb-2 block uppercase tracking-wider">检测到变动条款 - 第八条 工期计划</span>
                             本合同约定的<b className="text-red-700">总工期为210日历天</b>。其中包含核心系统试运行期30天。乙方需在开工之日起算。
                          </div>
                          <p>第三条 争议解决方式：如产生法律纠纷，优先通过友好协商解决，协商不成提请宁波仲裁委员会裁决。</p>
                          <div id="mid-diff-3" className={`p-4 rounded-2xl transition-all duration-700 border-2 ${activeDiffId === 3 ? 'bg-orange-50 border-orange-500 shadow-lg scale-[1.02]' : 'bg-blue-50/50 border-transparent'}`}>
                             <span className="text-[11px] font-black text-orange-600 mb-2 block uppercase tracking-wider">检测到变动条款 - 第十二条 运维标准</span>
                             乙方需提供远程在线支持。如有必要到场，技术人员应在<b className="text-orange-700">4小时内提供远程响应，或12小时内到达指定现场</b>进行故障排除。
                          </div>
                          {Array.from({length: 10}).map((_, i) => (
                             <p key={i}>补充协议正文文本 {i+1}：合同条款效力高于所有前期沟通纪要及口头承诺。如需修改，须经双方法定代表人签字并加盖公章方能生效。条款独立，部分无效不影响整体效力。</p>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* 第三栏：差异清单定位器 (20%) */}
                 <div className="flex-[2] bg-slate-50 flex flex-col shrink-0 border-l border-slate-100">
                    <div className="p-5 border-b flex items-center justify-between bg-white shrink-0">
                       <span className="text-[13px] font-black text-slate-800">差异明细 (双向对齐)</span>
                       <div className="flex items-center gap-1">
                          <span className="text-[11px] font-black text-red-600 bg-red-50 px-1.5 rounded">{differences.filter(d=>d.type==='关键').length} 风险</span>
                       </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                       {differences.map((diff) => (
                          <div 
                             key={diff.id} 
                             onClick={() => scrollToDiff(diff)}
                             className={`group p-4 bg-white rounded-2xl border transition-all cursor-pointer hover:shadow-xl hover:scale-[1.02]
                                ${activeDiffId === diff.id ? 'border-blue-500 ring-2 ring-blue-100 ring-inset' : 'border-slate-100 hover:border-blue-300'}
                             `}
                          >
                             <div className="flex items-center justify-between mb-2.5">
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight
                                   ${diff.type === '关键' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}
                                `}>
                                   {diff.type}等级差异
                                </span>
                                <span className="text-[10px] text-slate-300 font-bold group-hover:text-blue-500 transition-colors">条款 #{diff.id}</span>
                             </div>
                             <h4 className="text-[13px] font-bold text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{diff.clause}</h4>
                             <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{diff.desc}</p>
                             
                             <div className="bg-slate-50 rounded-xl p-2.5 space-y-2 border border-slate-100/50">
                                <div className="flex items-start gap-2">
                                   <div className="w-1 h-3.5 bg-slate-300 rounded-full mt-0.5 shrink-0"></div>
                                   <p className="text-[10px] text-slate-400 line-through truncate opacity-60">投标：{diff.tenderContent}</p>
                                </div>
                                <div className="flex items-start gap-2">
                                   <div className="w-1 h-3.5 bg-blue-500 rounded-full mt-0.5 shrink-0"></div>
                                   <p className="text-[11px] font-bold text-blue-600 leading-tight">现行：{diff.contractContent}</p>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                    <div className="p-5 border-t bg-white shrink-0">
                       <button 
                          onClick={() => triggerMsg('定位成功，正在导出当前对比片段...')}
                          className="w-full py-3 bg-[#1E40AF] text-white rounded-xl text-[13px] font-black hover:bg-blue-800 transition-all shadow-xl shadow-blue-100 active:scale-95 flex items-center justify-center gap-2"
                       >
                          <Download className="w-4 h-4" /> 导出详细对比报告
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* 录入人员弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-[480px] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-[16px] font-bold text-slate-800">单条录入人员核验信息</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors">
                <XCircle className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[12px] text-slate-400 font-bold uppercase">姓名</label>
                  <input type="text" value={newPerson.name} onChange={e => setNewPerson({...newPerson, name: e.target.value})} className="w-full h-[40px] border border-slate-200 rounded-lg px-3 text-[14px] focus:border-blue-600 outline-none hover:border-slate-300 transition-all" placeholder="输入真实姓名" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] text-slate-400 font-bold uppercase">身份证号</label>
                  <input type="text" value={newPerson.idCard} onChange={e => setNewPerson({...newPerson, idCard: e.target.value})} className="w-full h-[40px] border border-slate-200 rounded-lg px-3 text-[14px] focus:border-blue-600 outline-none hover:border-slate-300 transition-all" placeholder="18位身份证号" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] text-slate-400 font-bold uppercase">预期岗位</label>
                <input type="text" value={newPerson.position} onChange={e => setNewPerson({...newPerson, position: e.target.value})} className="w-full h-[40px] border border-slate-200 rounded-lg px-3 text-[14px] focus:border-blue-600 outline-none hover:border-slate-300 transition-all" placeholder="例如：项目经理" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] text-slate-400 font-bold uppercase">所属投标单位</label>
                <input type="text" value={newPerson.company} onChange={e => setNewPerson({...newPerson, company: e.target.value})} className="w-full h-[40px] border border-slate-200 rounded-lg px-3 text-[14px] focus:border-blue-600 outline-none hover:border-slate-300 transition-all" placeholder="请输入单位全称" />
              </div>
            </div>
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-[14px] font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-all">取消</button>
              <button onClick={handleAddPerson} className="px-8 py-2 bg-blue-600 text-white text-[14px] font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">确认添加</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        @keyframes redFlash {
          0%, 100% { background-color: transparent; }
          50% { background-color: rgba(220, 38, 38, 0.1); }
        }
        .animate-red-flash {
          animation: redFlash 0.5s ease-in-out 3;
        }

        @keyframes progressBar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress-bar {
          animation: progressBar 3s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default TenderAuditPerson;
