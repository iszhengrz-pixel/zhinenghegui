import React, { useState, useMemo } from 'react';
import { 
  Upload, FileText, Network, Files, X, 
  AlertCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2,
  Info, ShieldAlert, Download, Share2, Filter, RefreshCcw, FileOutput,
  Fingerprint, DollarSign, Cpu, FileCheck, Users, Link2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';

interface SimilarityData {
  name: string;
  score: number;
  attributes: {
    pricing: string;
    techStack: string;
    format: string;
    metadata: string;
  };
  collusionFeatures: { label: string; severity: 'high' | 'medium' }[];
  content: { text: string; isHighlighted: boolean }[];
  pairInfo: string;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'company' | 'person';
  x: number;
  y: number;
  riskCount: number;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
  relationType: string;
}

const MOCK_SIMILARITY_DATA: SimilarityData[] = [
  { 
    name: '投标单位A.pdf', 
    score: 88, 
    attributes: {
      pricing: "单价分析表与主标书完全一致",
      techStack: "微服务架构(React+SpringBoot)",
      format: "页边距2.5cm，标题三号黑体",
      metadata: "作者：Admin, 创建工具：Office 365"
    },
    collusionFeatures: [
      { label: "高度内容雷同", severity: 'high' },
      { label: "报价规律吻合", severity: 'high' },
      { label: "文档属性重合", severity: 'medium' }
    ],
    content: [
      { text: "本项目的系统架构设计，严格遵循《国家网络安全等级保护基本要求》等标准。", isHighlighted: false },
      { text: "本项目拟采用三层架构设计，前端使用 React 框架，后端采用 Spring Boot 开发，数据库使用 MySQL。在部署方面，建议使用 Docker 容器化方案以提高交付效率。", isHighlighted: true },
      { text: "系统将提供全方位的风险预警功能，支持自定义预警阈值与多种通知方式。", isHighlighted: false }
    ], 
    pairInfo: "文件A - 主标书 雷同率 88%" 
  },
  { 
    name: '投标单位B.docx', 
    score: 42, 
    attributes: {
      pricing: "报价结构存在差异",
      techStack: "传统单体架构",
      format: "页边距2.0cm，标题小二宋体",
      metadata: "作者：User-B, 创建工具：WPS Office"
    },
    collusionFeatures: [
      { label: "特定表述重合", severity: 'medium' }
    ],
    content: [
      { text: "我们建议在现有网络基础上增加负载均衡设备，以应对高并发访问压力。", isHighlighted: false },
      { text: "技术方案中关于数据加密的描述若与系统整体安全性要求不符合，需在响应文件中进行二次技术澄清。", isHighlighted: true },
      { text: "项目进度计划分为三个阶段。", isHighlighted: false }
    ], 
    pairInfo: "文件B - 主标书 雷同率 42%" 
  },
  { 
    name: '投标单位C.pdf', 
    score: 95, 
    attributes: {
      pricing: "报价取整习惯与单位A完全一致",
      techStack: "微服务架构(React+SpringBoot)",
      format: "页边距2.5cm，标题三号黑体",
      metadata: "作者：Admin, 创建工具：Office 365"
    },
    collusionFeatures: [
      { label: "串标嫌疑极高", severity: 'high' },
      { label: "报价结构镜像", severity: 'high' },
      { label: "格式特征码一致", severity: 'high' }
    ],
    content: [
      { text: "本项目拟采用三层架构设计，前端使用 React 框架，后端采用 Spring Boot 开发，数据库使用 MySQL。在部署方面，建议使用 Docker 容器化方案以提高交付效率。", isHighlighted: true },
      { text: "财务报表审计报告必须加盖会计师事务所公章。如果出现关键财务指标信息缺失或不完整情况，评审小组将有权判定该标书无效。", isHighlighted: true },
      { text: "严格遵守招投标法。", isHighlighted: false }
    ], 
    pairInfo: "文件C - 投标单位A 雷同率 95%" 
  },
  { 
    name: '投标单位D.doc', 
    score: 15, 
    attributes: {
      pricing: "独特报价模型",
      techStack: "低代码平台方案",
      format: "自定义格式",
      metadata: "作者：IT-Dept, 创建工具：Word 2016"
    },
    collusionFeatures: [],
    content: [{ text: "初步判断差异度较大，无显著雷同片段。", isHighlighted: false }], 
    pairInfo: "文件D - 主标书 雷同率 15%" 
  },
  { 
    name: '投标单位E.pdf', 
    score: 64, 
    attributes: {
      pricing: "存在常规报价重合",
      techStack: "微服务方案(部分参考)",
      format: "标准政府格式",
      metadata: "作者：XiaoWang, 创建工具：Office 365"
    },
    collusionFeatures: [
      { label: "标准条款雷同", severity: 'medium' }
    ],
    content: [{ text: "部分标准条款描述存在重合。", isHighlighted: true }], 
    pairInfo: "文件E - 主标书 雷同率 64%" 
  }
];

const MOCK_GRAPH: { nodes: GraphNode[]; links: GraphLink[] } = {
  nodes: [
    { id: '1', label: '中建建设集团', type: 'company', x: 200, y: 150, riskCount: 0 },
    { id: '2', label: '宏达贸易', type: 'company', x: 450, y: 100, riskCount: 2 },
    { id: '3', label: '腾飞科技', type: 'company', x: 100, y: 300, riskCount: 0 },
    { id: '4', label: '李建国', type: 'person', x: 350, y: 350, riskCount: 1 },
    { id: '5', label: '王大壮', type: 'person', x: 550, y: 250, riskCount: 0 }
  ],
  links: [
    { source: '1', target: '2', value: 85, relationType: '共同历史股东' },
    { source: '1', target: '4', value: 95, relationType: '现任法人' },
    { source: '2', target: '4', value: 82, relationType: '前任核心高管' },
    { source: '3', target: '1', value: 20, relationType: '一般上下游' },
    { source: '5', target: '2', value: 70, relationType: '直系亲属持股' }
  ]
};

const TenderComparison: React.FC = () => {
  const [comparisonFiles, setComparisonFiles] = useState<File[]>([]);
  const [selectedSimIdx, setSelectedSimIdx] = useState<number>(0);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [graphScale, setGraphScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [similarityFilter, setSimilarityFilter] = useState('all');

  const filteredData = useMemo(() => {
    if (similarityFilter === 'all') return MOCK_SIMILARITY_DATA;
    const threshold = parseInt(similarityFilter);
    return MOCK_SIMILARITY_DATA.filter(d => d.score >= threshold);
  }, [similarityFilter]);

  const maxSimilarity = useMemo(() => Math.max(...MOCK_SIMILARITY_DATA.map(d => d.score)), []);
  const selectedData = filteredData[selectedSimIdx] || filteredData[0] || MOCK_SIMILARITY_DATA[0];

  const handleBarClick = (data: any) => {
    if (data && typeof data.activeTooltipIndex === 'number') {
      setSelectedSimIdx(data.activeTooltipIndex);
      setCurrentPage(1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] overflow-y-auto custom-scrollbar relative">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        @keyframes dash { to { stroke-dashoffset: 0; } }
        .animate-dash { stroke-dasharray: 5; animation: dash 10s linear infinite; }
      `}</style>

      {/* Header */}
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">标书审查-投标文件比对 (串标分析中心)</h2>
          <div className="h-6 w-px bg-slate-100"></div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <div className="px-4 py-1.5 text-xs font-bold rounded bg-white text-blue-600 shadow-sm">AI 穿透视图</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold border border-blue-100 uppercase tracking-wider">内容与特征深度识别引擎已就绪</span>
        </div>
      </div>

      <div className="p-5 space-y-6 pb-28">
        {/* 1. 采集与特征分析区 */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-blue-600" /> Bidding Document Fingerprint & Content Feature Extraction
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">已采集属性: 报价、方案、格式、元数据</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-blue-600">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-bold">报价结构特征</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{selectedData.attributes.pricing}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-indigo-600">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-bold">技术方案表述</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{selectedData.attributes.techStack}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-emerald-600">
                <FileCheck className="w-4 h-4" />
                <span className="text-xs font-bold">文档格式细节</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{selectedData.attributes.format}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-purple-600">
                <Link2 className="w-4 h-4" />
                <span className="text-xs font-bold">元数据溯源</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{selectedData.attributes.metadata}</p>
            </div>
          </div>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData} onClick={handleBarClick}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={44}>
                  {filteredData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === selectedSimIdx ? '#1E40AF' : (entry.score >= 80 ? '#EF4444' : '#E2E8F0')} 
                      className="cursor-pointer transition-all hover:opacity-80" 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. 串标风险识别 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-2xl flex flex-col shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" /> 特征相似度对比 - 串标典型特征标记
              </h3>
              <div className="flex items-center gap-3">
                <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} className="p-1.5 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-[11px] font-bold text-slate-600 bg-white px-4 py-1.5 rounded-lg border border-slate-200 shadow-sm">{currentPage} / 3</span>
                <button onClick={() => setCurrentPage(p => Math.min(3, p+1))} className="p-1.5 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 transition-all"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-8 space-y-6 bg-white min-h-[400px]">
              {selectedData.content.map((item, idx) => (
                <div key={idx} className={`text-[14px] leading-relaxed p-5 rounded-2xl transition-all ${item.isHighlighted ? 'bg-red-50 text-slate-800 border-l-4 border-[#DC2626] shadow-sm' : 'text-slate-500'}`}>
                  {item.isHighlighted && <span className="text-[10px] font-black bg-[#DC2626] text-white px-2 py-0.5 rounded-full mr-2 mb-2 inline-block shadow-sm">串标特征匹配</span>}
                  <p className={item.isHighlighted ? 'font-medium' : ''}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
              串标风险因子 (Typical Indicators)
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </h3>
            <div className="space-y-4">
              {selectedData.collusionFeatures.map((f, i) => (
                <div key={i} className={`p-4 rounded-xl border flex items-center justify-between shadow-sm ${f.severity === 'high' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
                  <span className="text-xs font-black">{f.label}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${f.severity === 'high' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'}`}>
                    {f.severity === 'high' ? '极高风险' : '中度嫌疑'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. 企业信息库联动 */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm relative overflow-hidden flex flex-col min-h-[600px]">
          <div className="flex items-center justify-between mb-8 shrink-0 relative z-10">
            <div className="space-y-1">
              <h3 className="text-[18px] font-bold text-slate-800 flex items-center gap-2">
                <Network className="w-6 h-6 text-blue-600" /> 投标主体关联关系穿透 - 联动企业信息库分析
              </h3>
              <p className="text-sm text-slate-400 font-medium">穿透结果：标记潜在股权、高管、历史关联风险，辅助判定违规串标行为</p>
            </div>
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              <button onClick={() => setGraphScale(s => Math.max(0.3, s - 0.1))} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all"><ZoomOut className="w-5 h-5" /></button>
              <div className="w-14 text-center text-[11px] font-black text-slate-400">{Math.round(graphScale * 100)}%</div>
              <button onClick={() => setGraphScale(s => Math.min(2, s + 0.1))} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all"><ZoomIn className="w-5 h-5" /></button>
              <div className="w-px h-5 bg-slate-200 mx-1"></div>
              <button onClick={() => setGraphScale(1)} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all"><Maximize2 className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="flex-1 bg-slate-50/40 rounded-3xl relative overflow-hidden border border-slate-100 shadow-inner group">
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 700 450" 
              className="transition-transform duration-500 origin-center cursor-grab active:cursor-grabbing"
              style={{ transform: `scale(${graphScale})` }}
            >
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#CBD5E1" />
                </marker>
              </defs>
              
              {MOCK_GRAPH.links.map((link, i) => {
                const s = MOCK_GRAPH.nodes.find(n => n.id === link.source)!;
                const t = MOCK_GRAPH.nodes.find(n => n.id === link.target)!;
                const isHighRisk = link.value >= 80;
                return (
                  <g key={i}>
                    <line 
                      x1={s.x} y1={s.y} x2={t.x} y2={t.y} 
                      stroke={isHighRisk ? '#EF4444' : '#CBD5E1'} 
                      strokeWidth={link.value / 12} 
                      strokeDasharray={isHighRisk ? 'none' : '8,4'}
                      markerEnd="url(#arrowhead)"
                      className={isHighRisk ? '' : 'animate-dash'}
                    />
                    <rect 
                      x={(s.x + t.x) / 2 - 35} 
                      y={(s.y + t.y) / 2 - 10} 
                      width="70" height="20" 
                      rx="6" fill="white" stroke={isHighRisk ? '#EF4444' : '#E2E8F0'} 
                    />
                    <text 
                      x={(s.x + t.x) / 2} 
                      y={(s.y + t.y) / 2} 
                      fill={isHighRisk ? '#EF4444' : '#94A3B8'} 
                      fontSize="9" fontWeight="black" textAnchor="middle" dy=".3em"
                    >
                      {link.relationType}
                    </text>
                  </g>
                );
              })}

              {MOCK_GRAPH.nodes.map(node => (
                <g 
                  key={node.id} 
                  className="cursor-pointer group/node" 
                  onClick={(e) => { e.stopPropagation(); setSelectedNode(node); }}
                >
                  <circle 
                    cx={node.x} cy={node.y} r="30" 
                    fill="white" 
                    stroke={node.type === 'company' ? '#1E40AF' : '#F97316'} 
                    strokeWidth="4" 
                    className="transition-all duration-300 group-hover/node:stroke-[6px]"
                  />
                  {node.riskCount > 0 && <circle cx={node.x + 22} cy={node.y - 22} r="10" fill="#EF4444" />}
                  {node.riskCount > 0 && <text x={node.x + 22} y={node.y - 22} textAnchor="middle" dy=".3em" fill="white" fontSize="10" fontWeight="black">{node.riskCount}</text>}
                  <text x={node.x} y={node.y} textAnchor="middle" dy=".3em" fontSize="14" fontWeight="black" fill={node.type === 'company' ? '#1E40AF' : '#F97316'}>{node.type === 'company' ? '企' : '人'}</text>
                  <text x={node.x} y={node.y + 48} textAnchor="middle" fontSize="12" fontWeight="black" fill="#1E293B">{node.label}</text>
                </g>
              ))}
            </svg>

            {selectedNode && (
              <div className="absolute right-8 top-8 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-30">
                <div className="flex items-center justify-between mb-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedNode.type === 'company' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {selectedNode.type === 'company' ? 'Company Entity' : 'Natural Person'}
                  </span>
                  <button onClick={() => setSelectedNode(null)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <h4 className="text-[17px] font-black text-slate-900 mb-4 truncate" title={selectedNode.label}>{selectedNode.label}</h4>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-[12px]"><span className="text-slate-400 font-bold tracking-tight uppercase">穿透风险标记</span><span className={`font-black ${selectedNode.riskCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{selectedNode.riskCount > 0 ? `${selectedNode.riskCount} 项关联异常` : '合规正常'}</span></div>
                  <div className="flex items-center justify-between text-[12px]"><span className="text-slate-400 font-bold tracking-tight uppercase">资信评级</span><span className="font-black text-slate-800">稳健 (A)</span></div>
                </div>
                <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-black hover:bg-blue-700">同步联动库数据</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部控制栏 - 适配 280px 侧边栏 */}
      <div className="fixed bottom-0 right-0 left-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-5 flex items-center justify-center gap-[15px] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] z-50 transition-all duration-300 ml-0 group-has-[aside:not(.w-20)]:ml-[280px] group-has-[aside.w-20]:ml-20">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 w-[200px] shadow-sm">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={similarityFilter}
            onChange={(e) => setSimilarityFilter(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-600 outline-none w-full cursor-pointer appearance-none"
          >
            <option value="all">相似度筛选：全部</option>
            <option value="80">相似度 ≥ 80%</option>
            <option value="60">相似度 ≥ 60%</option>
            <option value="40">相似度 ≥ 40%</option>
          </select>
        </div>
        
        <button className="h-[44px] px-8 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-200 transition-all border border-slate-200 active:scale-95">
          <RefreshCcw className="w-4 h-4" />
          重新比对
        </button>
        
        <button className="h-[44px] px-12 py-2 bg-[#1E40AF] text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#1e3a8a] transition-all shadow-xl shadow-blue-100 active:scale-95">
          <FileOutput className="w-4 h-4" />
          导出比对报告
        </button>
      </div>
    </div>
  );
};

export default TenderComparison;