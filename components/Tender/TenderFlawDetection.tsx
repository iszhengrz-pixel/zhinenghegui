
import React, { useState, useRef, useMemo } from 'react';
import { Upload, FileText, CheckCircle2, SearchIcon, Trash2, Play, FileWarning, HelpCircle, BarChart3, Network, Files, X, AlertCircle } from 'lucide-react';

interface FlawItem {
  id: string;
  category: 'compliance' | 'rationality' | 'missing';
  keyword: string;
  clauseName: string;
  description: string;
  suggestion: string;
}

const MOCK_FLAWS: FlawItem[] = [
  {
    id: 'f1',
    category: 'compliance',
    keyword: '违规',
    clauseName: '第二章 投标人须知 3.4',
    description: '招标文件中提到的分包要求存在法律违规，限制了民营企业的参与权。',
    suggestion: '修改分包条款，确保符合公平竞争法案要求。'
  },
  {
    id: 'f2',
    category: 'missing',
    keyword: '缺失',
    clauseName: '第三章 技术规范 5.1',
    description: '核心设备的关键参数描述缺失，无法判断是否符合国家标准。',
    suggestion: '补充完善核心设备的技术规格参数说明。'
  },
  {
    id: 'f3',
    category: 'rationality',
    keyword: '不符合',
    clauseName: '第五章 合同条款 12.2',
    description: '付款周期设定与行业常规不符合，可能导致供应商资金链压力过大。',
    suggestion: '建议将预付款比例由 5% 调整至 15% 以上。'
  },
  {
    id: 'f4',
    category: 'compliance',
    keyword: '违规',
    clauseName: '第八章 法律责任 2.1',
    description: '关于违约金的上限设定超过了法律规定的最高限额，涉嫌条款违规。',
    suggestion: '将违约金上限调整至合同总额的 30% 以内。'
  },
  {
    id: 'f5',
    category: 'missing',
    keyword: '缺失',
    clauseName: '附件 1 资质文件清单',
    description: '安全生产许可证复印件要求在清单中缺失，属于重大形式要件遗漏。',
    suggestion: '在附件清单中增加“安全生产许可证”条目。'
  }
];

const MOCK_DOC_CONTENT = [
  "本招标文件适用于智能合规系统采购项目。在项目实施过程中，如发现任何【违规】操作，招标方有权立即取消相关方资格。所有参标人员需签署廉洁协议，严禁私下接触。",
  "投标人应当具备国家一级系统集成资质，并提供近三年的审计报告。若相关证明文件【缺失】，则视为初步审查不合格，不再进入后续评标环节。",
  "项目工期要求自合同签署之日起 30 个日历日内完成。此项指标若与实际交付能力【不符合】，投标人需在投标文件中明确说明并提供进度优化方案，否则将扣除技术分。",
  "财务报表审计报告必须加盖会计师事务所公章。如果出现关键财务指标信息【缺失】或不完整情况，评审小组将有权判定该标书无效。",
  "对于分包商的管理，必须严格遵守招投标法。任何形式的变相转包或非法分包均属于严重【违规】行为，一经查实将列入供应商黑名单。",
  "技术方案中关于数据加密的描述若与系统整体安全性要求【不符合】，需在响应文件中进行二次技术澄清。对于安全等级达不到等保三级要求的，视为响应失败。"
];

const TenderReview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<0 | 1>(0); // 0: 标书瑕疵识别, 1: 投标文件比对
  const [activeCategory, setActiveCategory] = useState<'all' | 'compliance' | 'rationality' | 'missing'>('all');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [comparisonFiles, setComparisonFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [flashingId, setFlashingId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleMultiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Explicitly cast to File[] to ensure properties like 'size' are accessible on elements.
    const files = Array.from(e.target.files || []) as File[];
    if (comparisonFiles.length + files.length > 10) {
      alert("最多支持上传 10 份文件");
      return;
    }
    const validFiles = files.filter(f => f.size <= 50 * 1024 * 1024);
    if (validFiles.length < files.length) {
      alert("部分文件超过 50MB，已忽略");
    }
    setComparisonFiles(prev => [...prev, ...validFiles]);
  };

  const removeComparisonFile = (index: number) => {
    setComparisonFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFlawClick = (flaw: FlawItem) => {
    setFlashingId(null);
    setTimeout(() => setFlashingId(flaw.id), 10);
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
                    ${isTargetFlaw ? 'animate-[flash_0.4s_ease-in-out_3]' : ''}
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
        @keyframes flash {
          0%, 100% { opacity: 1; color: #DC2626; }
          50% { opacity: 0; color: transparent; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
      `}</style>

      {/* 顶部操作区 */}
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold text-slate-800">标书智能识别</h2>
          <div className="h-6 w-px bg-slate-100"></div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab(0)}
              className={`px-4 py-1.5 text-xs font-bold rounded shadow-sm transition-all ${activeTab === 0 ? 'bg-white text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
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
        <div className="flex items-center gap-2">
           <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold border border-emerald-100">AI 已就绪</span>
        </div>
      </div>

      {activeTab === 0 ? (
        /* 标签页 1: 标书瑕疵识别 */
        <div className="flex-1 flex overflow-hidden p-5 gap-5">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            accept=".pdf,.doc,.docx"
          />

          {/* 左侧：原文区 (60%) */}
          <div className="w-[60%] bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <div className="h-12 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-slate-700">原文预览</span>
                {uploadedFile && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2 py-1 rounded ml-2 animate-in fade-in slide-in-from-left-2">
                    <span className="text-[10px] text-slate-500 max-w-[150px] truncate">{uploadedFile.name}</span>
                    <button onClick={() => setUploadedFile(null)} className="p-0.5 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="搜索关键词"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px] h-8 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/20 relative">
              {uploadedFile ? (
                <div className="max-w-3xl mx-auto space-y-6 bg-white p-10 border border-slate-100 shadow-sm rounded-lg min-h-full">
                  {MOCK_DOC_CONTENT.map((para, idx) => (
                    <p key={idx} className="text-sm text-slate-600 leading-relaxed text-justify">
                      {renderContentWithHighlights(para)}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-md p-12 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
                  >
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Upload className="w-10 h-10 text-slate-300 group-hover:text-blue-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-slate-600 group-hover:text-blue-700">点击上传标书文件</p>
                      <p className="text-xs text-slate-400 mt-1">支持 PDF、Word 格式 (最大 50MB)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：清单区 (40%) */}
          <div className="w-[40%] bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-bold text-slate-800 mb-4">瑕疵分析清单</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all border
                      ${activeCategory === cat.id 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-200'}
                    `}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {uploadedFile ? (
                filteredFlaws.length > 0 ? (
                  filteredFlaws.map((flaw, idx) => {
                    const catInfo = categories.find(c => c.id === flaw.category);
                    return (
                      <div 
                        key={flaw.id}
                        onClick={() => handleFlawClick(flaw)}
                        className="group p-4 rounded-xl border border-slate-100 bg-white hover:bg-[#F3F4F6] transition-all cursor-pointer relative overflow-hidden"
                      >
                        <div className="flex gap-4">
                          <div className="w-6 h-6 bg-[#DC2626] rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[10px] mt-0.5 shadow-sm">
                            {idx + 1}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${catInfo?.color}`}>
                                  {catInfo?.label}
                                </span>
                                <span className="font-bold text-slate-800 text-[13px]">{flaw.clauseName}</span>
                              </div>
                            </div>
                            <p className="text-[12px] text-slate-600 leading-normal">{flaw.description}</p>
                            <div className="pt-3 border-t border-slate-50">
                              <div className="flex items-start gap-2 bg-emerald-50/40 p-2 rounded-lg border border-emerald-100/50">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-emerald-800 leading-normal">
                                  <span className="font-black">整改建议：</span>{flaw.suggestion}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                    <CheckCircle2 className="w-12 h-12 text-emerald-100 mb-2" />
                    <p className="text-xs font-medium">暂无此类瑕疵记录</p>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-200 py-20">
                  <FileWarning className="w-16 h-16 opacity-10 mb-2" />
                  <p className="text-xs font-medium">请先上传标书后开启分析</p>
                </div>
              )}
            </div>
            {uploadedFile && (
              <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
                <button className="w-full py-2.5 bg-[#1E40AF] text-white rounded-xl text-xs font-bold hover:bg-[#1e3a8a] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
                  <Play className="w-3.5 h-3.5 fill-current" /> 一键导出优化建议
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 标签页 2: 投标文件比对 */
        <div className="flex-1 flex flex-col overflow-hidden p-5 gap-5">
          {/* 上半部分 (30%): 批量上传 */}
          <div className="h-[30%] bg-white border border-[#E5E7EB] rounded-2xl p-[15px] flex flex-col overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Files className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">投标文件批量导入</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">支持 PDF/Word，最多 10 份，单文件 ≤ 50MB</span>
            </div>
            
            <div className="flex-1 flex gap-5 min-h-0">
              <div className="shrink-0">
                <input 
                  type="file" 
                  multiple 
                  ref={multiFileInputRef}
                  onChange={handleMultiUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                />
                <button 
                  onClick={() => multiFileInputRef.current?.click()}
                  className="w-[200px] h-[40px] bg-[#1E40AF] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#1e3a8a] transition-all shadow-md shadow-blue-100"
                >
                  <Upload className="w-4 h-4" /> 批量上传投标文件
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl bg-slate-50/30 p-3 flex flex-wrap gap-2 content-start">
                {comparisonFiles.length > 0 ? (
                  comparisonFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm animate-in fade-in zoom-in-95">
                      <span className="text-[11px] font-bold text-slate-400 w-5">{idx + 1}.</span>
                      <span className="text-[12px] text-slate-600 max-w-[150px] truncate">{file.name}</span>
                      <button 
                        onClick={() => removeComparisonFile(idx)}
                        className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 italic">
                    <FileWarning className="w-8 h-8 opacity-20" />
                    <span className="text-[12px]">暂无上传文件</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 下半部分 (70%): 比对详情 */}
          <div className="h-[70%] flex flex-col gap-4 overflow-hidden">
            {/* 相似度统计 (20%) */}
            <div className="h-[20%] bg-white border border-[#E5E7EB] rounded-2xl p-[15px] overflow-y-auto custom-scrollbar shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[16px] font-semibold text-slate-800">相似度统计</h3>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-[11px] text-slate-500">高风险 (>70%)</span>
                </div>
              </div>
              <div className="h-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <div className="flex items-center gap-4 text-slate-300">
                  <BarChart3 className="w-8 h-8 opacity-20" />
                  <span className="text-sm font-medium">相似度分析柱状图预留位</span>
                </div>
              </div>
            </div>

            {/* 双栏布局: 雷同原文 + 配对提示 (40%) */}
            <div className="h-[40%] flex gap-4 overflow-hidden">
              <div className="flex-1 bg-white border border-[#E5E7EB] rounded-2xl p-[15px] overflow-y-auto custom-scrollbar shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">雷同原文区</h3>
                <div className="space-y-4">
                  {comparisonFiles.length > 0 ? (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                      <p className="text-xs text-red-800 leading-relaxed font-medium">
                        “本项目拟采用三层架构设计，前端使用 React 框架，后端采用 Spring Boot ...”
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-red-600 bg-red-100 px-1.5 py-0.5 rounded font-bold">高相似度片段</span>
                        <span className="text-[10px] text-slate-400">检测到 85% 文本重合</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center text-slate-300 italic text-xs">等待分析数据...</div>
                  )}
                </div>
              </div>
              <div className="w-[300px] bg-white border border-[#E5E7EB] rounded-2xl p-[15px] overflow-y-auto custom-scrollbar shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">配对提示区</h3>
                <div className="space-y-3">
                  {comparisonFiles.length >= 2 ? (
                    <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-[11px] font-bold text-slate-700">潜在串标风险</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        文件 A 与文件 B 的技术规格描述在第 12, 15 页出现大面积雷同。
                      </p>
                    </div>
                  ) : (
                    <div className="py-10 text-center text-slate-300 italic text-xs">请上传多份标书</div>
                  )}
                </div>
              </div>
            </div>

            {/* 关联关系图谱 (40%) */}
            <div className="h-[40%] bg-white border border-[#E5E7EB] rounded-2xl p-[15px] overflow-y-auto custom-scrollbar shadow-sm">
              <h3 className="text-[16px] font-semibold text-slate-800 mb-3">关联关系图谱</h3>
              <div className="h-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <div className="flex flex-col items-center gap-3 text-slate-300">
                  <Network className="w-12 h-12 opacity-10" />
                  <span className="text-sm font-medium tracking-wide">供应商及投标文件关系网络图谱预留位</span>
                  <p className="text-[11px] text-slate-400">基于投标人背景、文件特征点计算出的关联网络</p>
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
