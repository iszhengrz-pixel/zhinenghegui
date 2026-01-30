
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Upload, FileText, CheckCircle2, SearchIcon, Trash2, Play, 
  FileWarning, HelpCircle, BarChart3, Network, Files, X, 
  AlertCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Info,
  TrendingUp, User, Building2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';

interface FlawItem {
  id: string;
  category: 'compliance' | 'rationality' | 'missing';
  keyword: string;
  clauseName: string;
  description: string;
  suggestion: string;
}

interface SimilarityData {
  name: string;
  score: number;
  content: string[];
  pairInfo: string;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'company' | 'person';
  x: number;
  y: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number; // 关联度 0-100
}

const MOCK_SIMILARITY_DATA: SimilarityData[] = [
  { 
    name: '投标单位A.pdf', 
    score: 88, 
    content: [
      "本项目的系统架构设计，严格遵循《国家网络安全等级保护基本要求》等标准。",
      "【标红】本项目拟采用三层架构设计，前端使用 React 框架，后端采用 Spring Boot 开发，数据库使用 MySQL。在部署方面，建议使用 Docker 容器化方案以提高交付效率。",
      "系统将提供全方位的风险预警功能，支持自定义预警阈值与多种通知方式。"
    ],
    pairInfo: "文件A - 主标书 雷同率 88%"
  },
  { 
    name: '投标单位B.docx', 
    score: 42, 
    content: [
      "我们建议在现有网络基础上增加负载均衡设备，以应对高并发访问压力。",
      "【标红】技术方案中关于数据加密的描述若与系统整体安全性要求不符合，需在响应文件中进行二次技术澄清。",
      "项目进度计划分为需求调研、系统开发、测试上线三个阶段。"
    ],
    pairInfo: "文件B - 主标书 雷同率 42%"
  },
  { 
    name: '投标单位C.pdf', 
    score: 95, 
    content: [
      "【标红】本项目拟采用三层架构设计，前端使用 React 框架，后端采用 Spring Boot 开发，数据库使用 MySQL。在部署方面，建议使用 Docker 容器化方案以提高交付效率。",
      "【标红】财务报表审计报告必须加盖会计师事务所公章。如果出现关键财务指标信息缺失或不完整情况，评审小组将有权判定该标书无效。",
      "对于分包商的管理，必须严格遵守招投标法。"
    ],
    pairInfo: "文件C - 投标单位A 雷同率 95%"
  },
  { name: '投标单位D.doc', score: 15, content: ["初步判断差异度较大，无显著雷同片段。"], pairInfo: "文件D - 主标书 雷同率 15%" },
  { name: '投标单位E.pdf', score: 64, content: ["部分标准条款描述存在重合。"], pairInfo: "文件E - 主标书 雷同率 64%" }
];

const MOCK_GRAPH: { nodes: GraphNode[]; links: GraphLink[] } = {
  nodes: [
    { id: '1', label: '中建建设集团', type: 'company', x: 200, y: 150 },
    { id: '2', label: '宏达贸易', type: 'company', x: 450, y: 100 },
    { id: '3', label: '腾飞科技', type: 'company', x: 100, y: 300 },
    { id: '4', label: '李建国 (法人)', type: 'person', x: 350, y: 350 },
    { id: '5', label: '王大壮 (控股人)', type: 'person', x: 550, y: 250 }
  ],
  links: [
    { source: '1', target: '2', value: 85 },
    { source: '1', target: '4', value: 95 },
    { source: '2', target: '4', value: 82 },
    { source: '3', target: '1', value: 20 },
    { source: '5', target: '2', value: 70 }
  ]
};

const MOCK_FLAWS: FlawItem[] = [
  { id: 'f1', category: 'compliance', keyword: '违规', clauseName: '第二章 投标人须知 3.4', description: '限制了民营企业的参与权。', suggestion: '修改分包条款。' },
  { id: 'f2', category: 'missing', keyword: '缺失', clauseName: '第三章 技术规范 5.1', description: '核心参数描述缺失。', suggestion: '补充技术规格。' }
];

const MOCK_DOC_CONTENT = [
  "本招标文件适用于智能合规系统采购项目。在项目实施过程中，如发现任何【违规】操作，招标方有权立即取消相关方资格。所有参标人员需签署廉洁协议，严禁私下接触。",
  "投标人应当具备国家一级系统集成资质，并提供近三年的审计报告。若相关证明文件【缺失】，则视为初步审查不合格，不再进入后续评标环节。",
  "项目工期要求自合同签署之日起 30 个日历日内完成。此项指标若与实际交付能力【不符合】，投标人需在投标文件中明确说明并提供进度优化方案，否则将扣除技术分。",
  "财务报表审计报告必须加盖会计师事务所公章。如果出现关键财务指标信息【缺失】或不完整情况，评审小组将有权判定该标书无效。",
  "对于分包商的管理，必须严格遵守招投标法。任何形式的变相转包或非法分包均属于严重【违规】行为，一经查实将列入供应商黑名单。",
  "技术方案中关于数据加密的描述若与系统整体安全性要求【不符合】，需在响应文件中进行二次技术澄清。对于安全等级达不到等保三级要求的，视为响应失败。"
];

interface TenderReviewProps {
  defaultTab?: 0 | 1;
}

const TenderReview: React.FC<TenderReviewProps> = ({ defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState<0 | 1>(defaultTab);
  const [activeCategory, setActiveCategory] = useState<'all' | 'compliance' | 'rationality' | 'missing'>('all');
  const [comparisonFiles, setComparisonFiles] = useState<File[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [flashingId, setFlashingId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  // 当外部 defaultTab 变化时（如从侧边栏切换菜单），同步内部状态
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // 比对模块核心状态
  const [selectedSimIdx, setSelectedSimIdx] = useState<number>(0);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [graphScale, setGraphScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    { id: 'all', label: '全部瑕疵', color: 'bg-slate-100 text-slate-700' },
    { id: 'compliance', label: '合规性缺陷', color: 'bg-red-100 text-red-700' },
    { id: 'rationality', label: '合理性偏差', color: 'bg-orange-100 text-orange-700' },
    { id: 'missing', label: '条款缺失', color: 'bg-blue-100 text-blue-700' },
  ] as const;

  const filteredFlaws = useMemo(() => {
    return activeCategory === 'all' 
      ? MOCK_FLAWS 
      : MOCK_FLAWS.filter(f => f.category === activeCategory);
  }, [activeCategory]);

  const maxSimilarity = useMemo(() => Math.max(...MOCK_SIMILARITY_DATA.map(d => d.score)), []);
  const selectedData = MOCK_SIMILARITY_DATA[selectedSimIdx];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleMultiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setComparisonFiles(prev => [...prev, ...files].slice(0, 10));
  };

  const handleBarClick = (data: any) => {
    if (data && typeof data.activeTooltipIndex === 'number') {
      setSelectedSimIdx(data.activeTooltipIndex);
      setCurrentPage(1);
    }
  };

  const renderContentWithHighlights = (text: string) => {
    if (!uploadedFile) return text;
    let parts: React.ReactNode[] = [text];

    const riskKeywords = ['违规', '缺失', '不符合'];
    riskKeywords.forEach(kw => {
      const newParts: React.ReactNode[] = [];
      parts.forEach(part => {
        if (typeof part === 'string') {
          const regex = new RegExp(`(${kw})`, 'g');
          const segments = part.split(regex);
          segments.forEach((seg, i) => {
            if (seg === kw) {
              const isTargetFlaw = MOCK_FLAWS.some(f => f.keyword === kw && f.id === flashingId);
              newParts.push(
                <span 
                  key={`${seg}-${i}`} 
                  className={`text-[#DC2626] font-bold px-0.5 rounded transition-all
                    ${isTargetFlaw ? 'animate-pulse' : ''}
                  `}
                >
                  {seg}
                </span>
              );
            } else if (seg) {
              newParts.push(seg);
            }
          });
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    if (searchQuery.trim()) {
      const newParts: React.ReactNode[] = [];
      parts.forEach(part => {
        if (typeof part === 'string') {
          const regex = new RegExp(`(${searchQuery})`, 'gi');
          const segments = part.split(regex);
          segments.forEach((seg, i) => {
            if (seg.toLowerCase() === searchQuery.toLowerCase()) {
              newParts.push(<span key={`search-${i}`} className="bg-[#FFF3CD] rounded px-0.5">{seg}</span>);
            } else if (seg) {
              newParts.push(seg);
            }
          });
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    }

    return <>{parts}</>;
  };

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] overflow-hidden">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        @keyframes dash { to { stroke-dashoffset: 0; } }
        .animate-dash { stroke-dasharray: 5; animation: dash 10s linear infinite; }
      `}</style>

      {/* 顶部操作区 */}
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">标书智能识别</h2>
          <div className="h-6 w-px bg-slate-100"></div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab(0)}
              className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${activeTab === 0 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              标书瑕疵识别
            </button>
            <button 
              onClick={() => setActiveTab(1)}
              className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${activeTab === 1 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              投标文件比对
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold border border-emerald-100">
           AI 比对引擎运行中
        </div>
      </div>

      {activeTab === 0 ? (
        /* 标书瑕疵识别内容 */
        <div className="flex-1 flex overflow-hidden p-5 gap-5">
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept=".pdf,.doc,.docx" />
          <div className="w-[60%] bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <div className="h-12 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-slate-700">原文预览</span>
                {uploadedFile && <span className="text-[10px] bg-slate-50 border px-2 py-0.5 rounded text-slate-500">{uploadedFile.name}</span>}
              </div>
              <div className="relative">
                <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="搜索关键词" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[180px] h-8 pl-9 pr-3 bg-slate-50 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-100 transition-all" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/20">
              {uploadedFile ? (
                <div className="max-w-3xl mx-auto space-y-6 bg-white p-10 shadow-sm rounded-lg border border-slate-100">
                   {MOCK_DOC_CONTENT.map((para, i) => <p key={i} className="text-sm text-slate-600 leading-relaxed text-justify">{renderContentWithHighlights(para)}</p>)}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-blue-50/30 transition-all group" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform"><Upload className="w-8 h-8 text-slate-300 group-hover:text-blue-500" /></div>
                  <p className="text-sm text-slate-400 font-bold">点击或拖拽上传招标文件</p>
                </div>
              )}
            </div>
          </div>
          <div className="w-[40%] bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-bold text-slate-800 mb-4">分析详情</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => <button key={cat.id} onClick={() => setActiveCategory(cat.id as any)} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${activeCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500 hover:border-blue-200'}`}>{cat.label}</button>)}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {uploadedFile ? filteredFlaws.map((flaw, idx) => (
                <div key={flaw.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-all cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 bg-red-600 rounded text-white text-[10px] flex items-center justify-center shrink-0 font-bold">{idx+1}</div>
                    <div className="space-y-1">
                      <p className="text-[13px] font-bold text-slate-800">{flaw.clauseName}</p>
                      <p className="text-[12px] text-slate-500">{flaw.description}</p>
                    </div>
                  </div>
                </div>
              )) : <div className="h-full flex items-center justify-center text-slate-300 py-20 italic">等待文件解析...</div>}
            </div>
          </div>
        </div>
      ) : (
        /* 投标文件比对内容 */
        <div className="flex-1 flex flex-col overflow-hidden p-5 gap-5">
          {/* 上半部分: 批量上传 (30%) */}
          <div className="h-[25%] bg-white border border-[#E5E7EB] rounded-2xl p-[15px] flex flex-col shadow-sm shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Files className="w-4 h-4 text-blue-600" /> 投标文件批量导入
              </h3>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">最多支持 10 份文件 | 单文件 ≤ 50MB</span>
            </div>
            <div className="flex-1 flex gap-4 min-h-0">
              <input type="file" multiple onChange={handleMultiUpload} className="hidden" id="multi-upload" />
              <label 
                htmlFor="multi-upload"
                className="w-[200px] h-[40px] bg-[#1E40AF] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#1e3a8a] cursor-pointer shadow-lg shadow-blue-100"
              >
                <Upload className="w-4 h-4" /> 批量上传投标文件
              </label>
              <div className="flex-1 overflow-x-auto flex items-center gap-2 px-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                {comparisonFiles.length > 0 ? comparisonFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap animate-in zoom-in-95">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] font-bold text-slate-600">{f.name}</span>
                    <X onClick={() => setComparisonFiles(prev => prev.filter((_, idx) => idx !== i))} className="w-3.5 h-3.5 text-slate-300 hover:text-red-500 cursor-pointer" />
                  </div>
                )) : <span className="text-[11px] text-slate-300 italic">等待文件导入...</span>}
              </div>
            </div>
          </div>

          {/* 下半部分: 详情区 (70%) */}
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            {/* 统计区 */}
            <div className="h-[22%] bg-white border border-[#E5E7EB] rounded-2xl p-[15px] flex flex-col shadow-sm shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[16px] font-semibold text-slate-800">相似度统计</h3>
                <div className="text-2xl font-black text-[#1E40AF]">最高相似度：{maxSimilarity}%</div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_SIMILARITY_DATA} onClick={handleBarClick}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
                    <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={40}>
                      {MOCK_SIMILARITY_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === selectedSimIdx ? '#1E40AF' : '#E2E8F0'} className="cursor-pointer transition-all" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 雷同区 */}
            <div className="h-[38%] flex gap-4 shrink-0 overflow-hidden">
              <div className="flex-1 bg-white border border-[#E5E7EB] rounded-2xl p-[15px] flex flex-col shadow-sm">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" /> 雷同原文定位
                  </h3>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} className="p-1 hover:bg-slate-50 rounded text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-[10px] text-slate-500 font-bold px-2">{currentPage} / 3</span>
                    <button onClick={() => setCurrentPage(p => Math.min(3, p+1))} className="p-1 hover:bg-slate-50 rounded text-slate-400"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                  <div className="text-[13px] text-slate-600 leading-relaxed text-justify space-y-4">
                    {selectedData.content.map((para, i) => (
                      <p key={i} className={para.includes('【标红】') ? 'bg-red-50 border-l-4 border-red-500 p-2 text-red-800' : ''}>
                        {para.replace('【标红】', '')}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-[300px] bg-white border border-[#E5E7EB] rounded-2xl p-[15px] flex flex-col shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">配对提示</h3>
                <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl animate-in fade-in slide-in-from-right-2">
                    <p className="text-[12px] font-bold text-red-700 mb-1">{selectedData.pairInfo}</p>
                    <p className="text-[10px] text-red-600/80 leading-normal">
                      检测到核心技术架构描述与参考文本高度重合。系统已自动标记相关段落并记录在案。
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <p className="text-[11px] font-bold text-blue-700 mb-1">风险建议</p>
                    <p className="text-[10px] text-blue-600/80 leading-normal">
                      建议法务部门针对该标书的技术负责人背景进行穿透扫描，排除关联交易风险。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 图谱区 */}
            <div className="flex-1 bg-white border border-[#E5E7EB] rounded-2xl p-[15px] flex flex-col shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3 relative z-10 shrink-0">
                <h3 className="text-[16px] font-semibold text-slate-800 flex items-center gap-2">
                  <Network className="w-4 h-4 text-blue-600" /> 关联关系图谱
                </h3>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur p-1 rounded-lg border border-slate-100 shadow-sm">
                  <button onClick={() => setGraphScale(s => Math.max(0.5, s - 0.1))} className="p-1.5 hover:bg-slate-50 rounded text-slate-500"><ZoomOut className="w-4 h-4" /></button>
                  <span className="text-[10px] font-bold text-slate-400 w-8 text-center">{Math.round(graphScale * 100)}%</span>
                  <button onClick={() => setGraphScale(s => Math.min(2, s + 0.1))} className="p-1.5 hover:bg-slate-50 rounded text-slate-500"><ZoomIn className="w-4 h-4" /></button>
                  <div className="w-px h-4 bg-slate-200 mx-1"></div>
                  <button onClick={() => setGraphScale(1)} className="p-1.5 hover:bg-slate-50 rounded text-slate-500"><Maximize2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="flex-1 bg-slate-50/30 rounded-xl relative overflow-hidden cursor-move border border-slate-100">
                <svg width="100%" height="100%" viewBox="0 0 700 400" className="transition-transform duration-300" style={{ transform: `scale(${graphScale})` }}>
                  <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="25" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L9,3 z" fill="#CBD5E1" />
                    </marker>
                  </defs>
                  {MOCK_GRAPH.links.map((link, i) => {
                    const s = MOCK_GRAPH.nodes.find(n => n.id === link.source)!;
                    const t = MOCK_GRAPH.nodes.find(n => n.id === link.target)!;
                    const isHigh = link.value >= 80;
                    return (
                      <g key={i}>
                        <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={isHigh ? '#EF4444' : '#CBD5E1'} strokeWidth={link.value / 20} strokeDasharray={isHigh ? 'none' : '5,5'} className={isHigh ? '' : 'animate-dash'} markerEnd="url(#arrow)" />
                        <text x={(s.x + t.x) / 2} y={(s.y + t.y) / 2} fill={isHigh ? '#EF4444' : '#94A3B8'} fontSize="9" fontWeight="bold" textAnchor="middle" dy="-5">{link.value}%</text>
                      </g>
                    );
                  })}
                  {MOCK_GRAPH.nodes.map(node => (
                    <g key={node.id} className="cursor-pointer group/node" onClick={(e) => { e.stopPropagation(); setSelectedNode(node); }}>
                      <circle cx={node.x} cy={node.y} r="22" fill="white" stroke={node.type === 'company' ? '#1E40AF' : '#F97316'} strokeWidth="2" className="transition-all group-hover/node:stroke-[4px] shadow-sm" />
                      <text x={node.x} y={node.y} textAnchor="middle" dy=".3em" fontSize="12" fontWeight="bold" fill={node.type === 'company' ? '#1E40AF' : '#F97316'}>{node.type === 'company' ? '企' : '人'}</text>
                      <text x={node.x} y={node.y + 35} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">{node.label}</text>
                    </g>
                  ))}
                </svg>
                {selectedNode && (
                  <div className="absolute right-4 bottom-4 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 animate-in slide-in-from-right-4">
                    <div className="flex items-center justify-between mb-3 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedNode.type === 'company' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {selectedNode.type === 'company' ? '企业实体' : '关联自然人'}
                      </span>
                      <X onClick={() => setSelectedNode(null)} className="w-4 h-4 text-slate-300 hover:text-slate-600 cursor-pointer" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-2 truncate">{selectedNode.label}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]"><span className="text-slate-400">风险扫描</span><span className="font-bold text-red-500">2 项存疑</span></div>
                      <div className="flex items-center justify-between text-[11px]"><span className="text-slate-400">历史中标</span><span className="font-bold text-slate-700">14 次</span></div>
                      <div className="flex items-center justify-between text-[11px]"><span className="text-slate-400">资信评级</span><span className="font-bold text-emerald-600">稳健 (A)</span></div>
                    </div>
                    <button className="w-full mt-4 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 transition-colors">查看完整资信档案</button>
                  </div>
                )}
                <div className="absolute left-4 bottom-4 flex items-center gap-4 text-[10px] font-bold text-slate-400 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span>企业主体</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500"></span>自然人</div>
                  <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-red-500"></span>高关联度 (≥80%)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenderReview;
