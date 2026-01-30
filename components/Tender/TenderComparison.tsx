
import React, { useState, useRef, useEffect } from 'react';
import { 
  RotateCw, HelpCircle, Upload, FileText, Trash2, X, AlertCircle, 
  ChevronLeft, ChevronRight, Filter, Network, ZoomIn, ZoomOut, 
  Maximize2, Building2, Loader2, CheckCircle2, Download, Info,
  PanelLeftClose, PanelLeftOpen, FileWarning, Search, User
} from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  raw: File;
}

interface FeatureCard {
  id: string;
  title: string;
  result: string;
}

interface SimilarityPair {
  id: string;
  files: string;
  score: number;
  level: 'high' | 'medium' | 'low';
}

interface RiskItem {
  id: string;
  index: number;
  pair: string;
  type: string;
  detail: string;
  level: 'high' | 'medium';
  suggestion: string;
}

const TenderComparison: React.FC = () => {
  // 基础状态
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResultLoaded, setIsResultLoaded] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // 交互状态
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isRiskFlashing, setIsRiskFlashing] = useState(false);
  const [graphScale, setGraphScale] = useState(1);
  const [dimensionFilter, setDimensionFilter] = useState('全部维度');
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error', message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 响应式监听
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1366) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    handleResize(); // 初始执行
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 数据预设
  const featureCards: FeatureCard[] = [
    { id: 'price', title: '报价结构', result: '已采集：报价项、单价、总价、优惠比例。系统自动提取了所有子项目的单价构成，并与历史同类项目均价进行了偏差率计算。' },
    { id: 'tech', title: '技术方案表述', result: '已采集：系统架构、安全等级、实施周期、运维承诺。深度分析了技术方案中的核心组件及其版本号。' },
    { id: 'format', title: '格式细节', result: '已采集：字体字号、页眉页脚、落款印章、附件完整度。识别出 3 处文档元数据中的隐藏作者信息重合。' },
    { id: 'business', title: '商务条款表述', result: '已采集：质保期、付款方式、违约责任、履约保证。识别出在“不可抗力”条款描述中存在高度一致性。' }
  ];

  const similarityPairs: SimilarityPair[] = [
    { id: 'pair-1', files: '投标文件_A.pdf - 投标文件_C.pdf', score: 92, level: 'high' },
    { id: 'pair-2', files: '投标文件_B.docx - 投标文件_A.pdf', score: 82, level: 'medium' },
    { id: 'pair-3', files: '投标文件_C.pdf - 投标文件_D.pdf', score: 71, level: 'low' },
    { id: 'pair-4', files: '投标文件_D.pdf - 投标文件_B.docx', score: 45, level: 'low' },
  ];

  const riskList: RiskItem[] = [
    { id: 'risk-1', index: 1, pair: '中标建设(A) - 宏达贸易(B)', type: '股权关联', detail: '中标建设持有宏达贸易 60% 股权，且两家公司在同一地址办公。', level: 'high', suggestion: '建议核查是否存在串标行为' },
    { id: 'risk-2', index: 2, pair: '腾飞科技(C) - 中标建设(A)', type: '人员关联', detail: '两家公司共用同一名财务负责人(李某)，且法定代表人为堂兄弟关系。', level: 'medium', suggestion: '建议核查人员任职合规性' },
    { id: 'risk-3', index: 3, pair: '宏达贸易(B) - 腾飞科技(C)', type: '投标联系人', detail: '两份电子标书上传的 IP 地址及电脑 MAC 地址完全一致。', level: 'high', suggestion: '极高串标嫌疑，建议移交纪检调查' }
  ];

  // 辅助函数
  const showMessage = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const processFiles = (newFiles: File[]) => {
    const updatedFiles = [...files];
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    let errorOccurred = false;

    newFiles.forEach(f => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (!ext || !allowedExtensions.includes(ext)) {
        showMessage("仅支持 PDF/Word 格式文件，请重新上传", "error");
        errorOccurred = true;
        return;
      }
      if (f.size > 50 * 1024 * 1024) {
        showMessage("单文件大小不得超过 50MB，请重新上传", "error");
        errorOccurred = true;
        return;
      }
      if (updatedFiles.length >= 10) {
        showMessage("最多支持 10 份文件比对，请删除多余文件", "error");
        errorOccurred = true;
        return;
      }
      updatedFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + 'MB',
        raw: f
      });
    });

    if (!errorOccurred) {
      setFiles(updatedFiles);
    }
  };

  const handleStartCompare = () => {
    if (files.length < 2) return;
    setIsComparing(true);
    setIsResultLoaded(false);
    setTimeout(() => {
      setIsComparing(false);
      setIsResultLoaded(true);
      setSelectedPairId('pair-1');
      showMessage("比对分析完成，检测到 3 处高风险项", "success");
    }, 5000);
  };

  const handleReset = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setFiles([]);
      setIsResultLoaded(false);
      setIsComparing(false);
      setIsRefreshing(false);
      setSelectedFeatureId(null);
      setSelectedPairId(null);
      setDimensionFilter('全部维度');
      showMessage("系统已重置，您可以重新上传文件", "info");
    }, 800);
  };

  const handleRefresh = () => {
    if (isResultLoaded) {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 800);
    } else {
      window.location.reload();
    }
  };

  // 骨架屏组件
  const SectionSkeleton = ({ title }: { title: string }) => (
    <div className="animate-pulse h-full flex flex-col gap-4">
      <div className="h-6 w-1/4 bg-gray-200 rounded shrink-0"></div>
      <div className="bg-gray-100/50 rounded-xl border border-gray-100 flex flex-col p-8 gap-4">
        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gray-200 animate-spin" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#F9FAFB] text-[14px] overflow-hidden font-sans relative">
      
      {/* 全局消息提示 */}
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-md shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-4 duration-300
          ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
            notification.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 
            'bg-blue-50 border-blue-100 text-blue-700'}
        `}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
           notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
          <span className="font-bold">{notification.message}</span>
        </div>
      )}

      {/* 顶部操作通栏 */}
      <header className="h-[64px] w-full bg-white border-b border-[#E5E7EB] px-[20px] shrink-0 flex items-center justify-between z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-[16px] font-black text-[#1F2937] tracking-tight">标书智能识别</h2>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            {/* 分段切换按钮 */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                className="px-5 py-1.5 text-xs font-bold rounded transition-all text-slate-400 hover:text-slate-600"
              >
                标书瑕疵识别
              </button>
              <button 
                className="px-5 py-1.5 text-xs font-bold rounded shadow-sm transition-all bg-white text-blue-600"
              >
                投标文件比对
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-[12px]">
          <button 
            onClick={handleStartCompare}
            disabled={files.length < 2 || isComparing || isRefreshing} 
            className={`h-[38px] px-6 rounded-lg font-bold flex items-center justify-center transition-all shadow-sm
              ${files.length >= 2 && !isComparing && !isRefreshing ? 'bg-[#1E40AF] text-white hover:bg-blue-700 active:scale-95 hover:shadow-blue-200 hover:shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
            `}
          >
            {isComparing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlayIcon className="w-4 h-4 mr-2" />}
            {isComparing ? '正在分析' : '开始比对'}
          </button>
          <button 
            onClick={handleReset}
            disabled={!isResultLoaded || isComparing || isRefreshing} 
            className={`h-[38px] px-5 rounded-lg bg-white border border-[#1E40AF] text-[#1E40AF] font-bold transition-all
              ${isResultLoaded && !isComparing && !isRefreshing ? 'hover:bg-blue-50 hover:shadow-md' : 'opacity-40 cursor-not-allowed'}
            `}
          >
            重新比对
          </button>
          <button 
            onClick={() => showMessage("分析报告导出成功，正在下载 PDF 文件...")}
            disabled={!isResultLoaded || isComparing || isRefreshing} 
            className={`h-[38px] px-5 rounded-lg bg-white border border-[#1E40AF] text-[#1E40AF] font-bold transition-all
              ${isResultLoaded && !isComparing && !isRefreshing ? 'hover:bg-blue-50 hover:shadow-md' : 'opacity-40 cursor-not-allowed'}
            `}
          >
            <Download className="w-4 h-4 mr-2 inline-block" />导出分析报告
          </button>
          
          <div className="ml-2 flex items-center gap-2 text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full font-bold border border-emerald-100">
             AI 已就绪
          </div>
        </div>
      </header>

      {/* 处理进度条 */}
      {isComparing && (
        <div className="h-[40px] w-full bg-[#1E40AF] text-white flex items-center justify-center gap-3 animate-in slide-in-from-top duration-300 relative z-30">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-[12px] font-black tracking-[0.05em]">AI 正在深度处理全文，请稍候（预计 5-15 秒，视文件数量而定）...</span>
          <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
            <div className="h-full bg-white animate-progress-bar"></div>
          </div>
        </div>
      )}

      <div className="flex flex-1 w-full overflow-hidden">
        {/* 左侧文件管理 */}
        <aside className={`bg-white border-r border-[#E5E7EB] flex flex-col shrink-0 transition-all duration-300 relative ${isSidebarCollapsed ? 'w-[64px]' : 'w-[300px]'}`}>
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            {!isSidebarCollapsed && <h3 className="text-[15px] font-black text-[#1F2937]">投标文件管理</h3>}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-1.5 rounded-md hover:bg-gray-100 text-gray-400 transition-colors ${isSidebarCollapsed ? 'mx-auto' : ''}`}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>

          <div className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="shrink-0">
              <input type="file" multiple ref={fileInputRef} onChange={(e) => processFiles(Array.from(e.target.files || []))} className="hidden" accept=".pdf,.doc,.docx" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isComparing || isRefreshing}
                className={`w-full h-[40px] rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-all
                  ${isComparing || isRefreshing ? 'bg-gray-50 text-gray-300' : 'bg-[#1E40AF] hover:bg-blue-700 text-white hover:shadow-blue-200'}
                  ${isSidebarCollapsed ? 'px-0' : 'px-4'}
                `}
              >
                <Upload className="w-5 h-5 shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">上传文件</span>}
              </button>
            </div>

            <div className={`text-[11px] text-gray-400 font-bold uppercase tracking-wider ${isSidebarCollapsed ? 'text-center' : ''}`}>
              {isSidebarCollapsed ? files.length : `已导入 ${files.length} / 10`}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-2">
              {files.map((file) => (
                <div key={file.id} className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FileText className={`w-5 h-5 shrink-0 transition-colors ${selectedPairId ? 'text-blue-500' : 'text-gray-300'}`} />
                    {!isSidebarCollapsed && (
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] text-gray-700 truncate font-bold">{file.name}</span>
                        <span className="text-[11px] text-gray-400">{file.size}</span>
                      </div>
                    )}
                  </div>
                  {!isSidebarCollapsed && !isComparing && !isResultLoaded && (
                    <button 
                      onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))} 
                      className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {files.length === 0 && !isSidebarCollapsed && (
                <div className="h-40 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300 gap-3">
                  <div className="p-3 bg-gray-50 rounded-full"><Upload className="w-6 h-6 opacity-40" /></div>
                  <span className="text-xs font-bold">待上传比对文件</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* 右侧主区域 - 统一间距 p-5 space-y-5 */}
        <main className="flex-1 bg-[#F9FAFB] overflow-y-auto custom-scrollbar p-5 space-y-5">
          
          {/* 第一栏：特征卡片 */}
          <section className="bg-white border border-[#E5E7EB] p-4 lg:p-6 rounded-3xl shadow-sm h-auto shrink-0">
            {isComparing || isRefreshing ? <SectionSkeleton title="AI 特征采集结果" /> : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[18px] font-black text-[#1F2937]">AI 特征采集结果</h3>
                  <HelpCircle className="w-4 h-4 text-gray-300" />
                </div>
                {isResultLoaded ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {featureCards.map((card) => (
                      <div 
                        key={card.id} 
                        onClick={() => { setSelectedFeatureId(card.id); setDimensionFilter(card.title); setIsFlashing(true); setTimeout(() => setIsFlashing(false), 1200); }} 
                        className={`p-5 rounded-2xl cursor-pointer transition-all border flex flex-col gap-3 group min-h-[140px]
                          ${selectedFeatureId === card.id ? 'bg-[#E0E7FF] border-[#E5E7EB] shadow-md' : 'bg-[#F9FAFB] border-transparent hover:bg-white hover:border-blue-100 hover:shadow-lg'}
                        `}
                      >
                        <div className="text-[15px] font-black text-[#1F2937] group-hover:text-blue-700 transition-colors">{card.title}</div>
                        <div className="text-[13px] text-[#4B5563] leading-relaxed">{card.result}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-gray-300 italic gap-3 bg-gray-50/30 rounded-2xl border border-dashed border-gray-100">
                    <Search className="w-12 h-12 opacity-10" />
                    <p className="font-bold">导入至少2份文件并点击“开始比对”开启特征分析</p>
                  </div>
                )}
              </>
            )}
          </section>

          {/* 第二栏：相似度分析 */}
          <section className="bg-white border border-[#E5E7EB] p-4 lg:p-6 rounded-3xl shadow-sm h-auto flex flex-col">
            {isComparing || isRefreshing ? <SectionSkeleton title="跨文件相似度比对结果" /> : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <h3 className="text-[18px] font-black text-[#1F2937]">跨文件相似度比对结果</h3>
                  <div className="text-[20px] font-black text-[#DC2626] flex items-center gap-3">
                    <span className="text-[13px] text-gray-400 font-bold uppercase tracking-widest">全局峰值相似度:</span>
                    <span className={`bg-red-50 px-4 py-1.5 rounded-xl border border-red-100 transition-all shadow-sm ${isResultLoaded ? 'opacity-100 scale-100' : 'opacity-20 scale-95'}`}>{isResultLoaded ? '92%' : '--%'}</span>
                  </div>
                </div>

                {isResultLoaded ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative group flex-1 max-w-[280px]">
                        <select 
                          value={dimensionFilter} 
                          onChange={(e) => setDimensionFilter(e.target.value)}
                          className="w-full h-[40px] pl-4 pr-10 border border-[#E5E7EB] rounded-xl bg-white text-gray-700 font-bold appearance-none outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all cursor-pointer"
                        >
                          <option>全部维度</option>
                          {featureCards.map(c => <option key={c.id}>{c.title}</option>)}
                        </select>
                        <Filter className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors pointer-events-none" />
                      </div>
                      <div className="relative group flex-1 max-w-[240px]">
                        <select className="w-full h-[40px] pl-4 pr-10 border border-[#E5E7EB] rounded-xl bg-white text-gray-700 font-bold appearance-none outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all cursor-pointer">
                          <option>全部风险等级</option>
                          <option className="text-red-600 font-black">≥90%（高风险）</option>
                          <option>≥80%</option>
                          <option>≥70%</option>
                        </select>
                        <ChevronDownIcon className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                      {/* 原文展示区 */}
                      <div className="flex-[65] w-full border border-[#E5E7EB] rounded-2xl flex flex-col bg-white shadow-sm overflow-hidden">
                        <div className="p-10 text-[#4B5563] leading-[2.5] text-[15px] bg-slate-50/30">
                          <div className="space-y-8">
                            <p className="text-justify indent-8">
                              本项目的系统架构设计，严格遵循《国家网络安全等级保护基本要求》、《政务信息系统建设管理办法》等标准。在技术选型上，拟采用成熟稳定的三层架构设计，
                              <span className={`transition-all duration-300 rounded px-1.5 py-0.5 mx-0.5 ${isFlashing ? 'animate-red-flash' : 'text-[#DC2626] font-black bg-red-50/50'}`}>
                                前端使用 React v18 框架进行组件化开发，后端采用 Spring Boot 微服务治理框架，数据库使用 MySQL 8.0 进行数据持久化。在部署方面，建议使用 Docker 容器化方案
                              </span>
                              以提高交付效率。该方案已经在集团多个同类项目中得到成功验证。
                            </p>
                            <p className="text-justify indent-8">
                              财务报表审计报告必须加盖会计师事务所公章及注册会计师私章。如果出现关键财务指标信息缺失或不完整情况，评审小组将有权根据《采购管理办法》判定该标书无效。
                              <span className="text-[#F97316] font-black underline decoration-orange-300 underline-offset-4">分包商的管理必须严格遵守中华人民共和国招标投标法，严禁任何形式的变相转包或非法分包行为</span>，一经查实将取消其参选资格并列入供应商黑名单。
                            </p>
                            <p className="text-justify indent-8">
                              关于售后服务保障，我方承诺提供 7*24 小时的响应服务。在质放期内，若系统出现一级故障（即业务完全不可用），我方技术人员将在 1 小时内响应，2 小时内到达现场（或开启远程协助），并在 4 小时内修复故障。
                            </p>
                          </div>
                        </div>
                        <div className="h-[54px] border-t border-[#E5E7EB] flex items-center justify-center gap-6 bg-white shrink-0">
                          <button className="p-2 text-gray-400 hover:bg-slate-50 rounded-lg transition-all"><ChevronLeft className="w-6 h-6" /></button>
                          <span className="text-[13px] text-gray-500 font-black tracking-widest">第 01 / 05 页</span>
                          <button className="p-2 text-blue-600 hover:bg-slate-50 rounded-lg transition-all"><ChevronRight className="w-6 h-6" /></button>
                        </div>
                      </div>

                      {/* 配对列表 */}
                      <div className="flex-[35] w-full border border-[#E5E7EB] rounded-2xl bg-white shadow-sm overflow-hidden sticky top-8">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">相似对照组</span>
                          <span className="text-[11px] font-bold text-slate-500">数量: {similarityPairs.length}</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {similarityPairs.map((pair) => (
                            <div 
                              key={pair.id} 
                              onClick={() => { setSelectedPairId(pair.id); setIsFlashing(true); setTimeout(() => setIsFlashing(false), 1200); }} 
                              className={`p-5 flex items-center justify-between cursor-pointer transition-all hover:pl-8
                                ${selectedPairId === pair.id ? 'bg-blue-50/80 border-l-[6px] border-blue-600' : 'hover:bg-slate-50'}
                              `}
                            >
                              <div className="flex flex-col min-w-0 pr-4">
                                <span className="text-[13px] text-gray-800 truncate font-bold">{pair.files}</span>
                                <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight font-medium">自动比对结果</span>
                              </div>
                              <div className="flex items-center gap-4 shrink-0">
                                <span className={`text-[16px] font-black ${pair.level === 'high' ? 'text-[#DC2626]' : 'text-[#F97316]'}`}>{pair.score}%</span>
                                {pair.level === 'high' && <span className="px-2 py-0.5 bg-red-100 text-[#DC2626] text-[10px] rounded-lg font-black border border-red-200 shadow-sm">风险</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-24 flex flex-col items-center justify-center text-gray-300 gap-5 bg-gray-50/30 rounded-2xl border border-dashed border-gray-100">
                    <FileWarning className="w-16 h-16 opacity-10" />
                    <p className="font-bold">暂无有效比对数据，请先上传并分析</p>
                  </div>
                )}
              </>
            )}
          </section>

          {/* 第三栏：关系图谱 */}
          <section className="bg-white border border-[#E5E7EB] p-4 lg:p-6 rounded-3xl shadow-sm h-auto flex flex-col">
            {isComparing || isRefreshing ? <SectionSkeleton title="企业关联关系分析" /> : (
              <>
                <h3 className="text-[18px] font-black text-[#1F2937] mb-5 shrink-0">企业关联关系分析</h3>
                {isResultLoaded ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <select className="w-[280px] h-[40px] pl-4 pr-10 border border-[#E5E7EB] rounded-xl bg-white text-gray-700 font-bold outline-none focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer">
                        <option>全部投标主体</option>
                        <option>中标建设集团 (A)</option>
                        <option>宏达贸易有限公司 (B)</option>
                        <option>腾飞科技有限公司 (C)</option>
                      </select>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                         <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-600"></span> 企业主体</span>
                         <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> 自然人</span>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                      {/* 图谱展示区 */}
                      <div className="flex-[60] w-full min-h-[500px] border border-[#E5E7EB] rounded-2xl relative bg-slate-50 overflow-hidden shadow-inner group/graph">
                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-2xl opacity-0 group-hover/graph:opacity-100 transition-opacity">
                          <button onClick={() => setGraphScale(s => Math.min(2, s + 0.1))} className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-blue-100"><ZoomIn className="w-5 h-5 text-gray-600" /></button>
                          <button onClick={() => setGraphScale(s => Math.max(0.5, s - 0.1))} className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-blue-100"><ZoomOut className="w-5 h-5 text-gray-600" /></button>
                          <button onClick={() => setGraphScale(1)} className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-blue-100"><Maximize2 className="w-5 h-5 text-gray-600" /></button>
                        </div>
                        <div className="w-full h-full flex items-center justify-center transition-transform duration-500" style={{ transform: `scale(${graphScale})` }}>
                          <svg width="100%" height="100%" viewBox="0 0 500 400" className="cursor-grab active:cursor-grabbing">
                            <defs>
                              <marker id="arrow-red-main" markerWidth="10" markerHeight="10" refX="25" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#DC2626" /></marker>
                              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#DC2626" /><stop offset="100%" stopColor="#EF4444" /></linearGradient>
                            </defs>
                            <path d="M100 150 L400 150" stroke="url(#lineGrad)" strokeWidth="4" markerEnd="url(#arrow-red-main)" className="cursor-pointer hover:stroke-[6px] transition-all" onClick={() => { setIsRiskFlashing(true); setTimeout(() => setIsRiskFlashing(false), 1200); }} />
                            <text x="250" y="130" textAnchor="middle" fontSize="12" fill="#DC2626" fontWeight="900" className="drop-shadow-sm">股权穿透关联 (95% 风险)</text>
                            
                            <path d="M400 150 L250 300" stroke="#F97316" strokeWidth="2" strokeDasharray="6,4" className="cursor-pointer" />
                            <text x="340" y="240" textAnchor="middle" fontSize="11" fill="#F97316" fontWeight="800" transform="rotate(35, 340, 240)">人员交叉重合</text>
                            
                            <g transform="translate(100, 150)" className="hover:scale-110 transition-transform"><circle r="32" fill="white" stroke="#1E40AF" strokeWidth="4" className="shadow-lg" /><Building2 className="w-8 h-8 text-blue-600" x="-16" y="-16" /><text y="54" textAnchor="middle" fontSize="11" fill="#1F2937" fontWeight="900">投标人 A</text></g>
                            <g transform="translate(400, 150)" className="hover:scale-110 transition-transform"><circle r="32" fill="white" stroke="#1E40AF" strokeWidth="4" className="shadow-lg" /><Building2 className="w-8 h-8 text-blue-600" x="-16" y="-16" /><text y="54" textAnchor="middle" fontSize="11" fill="#1F2937" fontWeight="900">投标人 B</text></g>
                            <g transform="translate(250, 300)" className="hover:scale-110 transition-transform"><circle r="28" fill="white" stroke="#F97316" strokeWidth="4" className="shadow-lg" /><User className="w-6 h-6 text-orange-600" x="-12" y="-12" /><text y="48" textAnchor="middle" fontSize="11" fill="#1F2937" fontWeight="900">共同负责人</text></g>
                          </svg>
                        </div>
                      </div>

                      {/* 风险清单 */}
                      <div className="flex-[40] w-full border border-[#E5E7EB] rounded-2xl bg-white shadow-sm overflow-hidden h-auto">
                        <div className="p-5 bg-slate-50 border-b border-slate-100">
                          <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <FileWarning className="w-4 h-4 text-red-500" /> 检测到的风险列表
                          </h4>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {riskList.map((risk) => (
                            <div key={risk.id} className={`p-6 transition-all border-l-[6px] border-transparent hover:bg-slate-50 ${(risk.id === 'risk-1' && isRiskFlashing) ? 'animate-risk-flash' : ''} ${risk.level === 'high' ? 'border-l-red-500 bg-red-50/20' : 'bg-white'}`}>
                              <div className="flex items-start justify-between mb-3">
                                <span className="text-[15px] font-black text-gray-900 leading-tight">{risk.pair}</span>
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${risk.level === 'high' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                                  {risk.level === 'high' ? '高危风险' : '中级警告'}
                                </span>
                              </div>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
                                   <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> 风险类型：{risk.type}
                                </div>
                                <div className="text-[13px] text-slate-600 leading-relaxed font-medium pl-3.5 border-l-2 border-slate-100">{risk.detail}</div>
                                <div className="mt-2 text-[12px] font-black text-red-800 bg-white/80 p-3 rounded-xl border border-red-100/50 shadow-sm flex items-start gap-2">
                                   <Info className="w-4 h-4 mt-0.5 shrink-0" />
                                   <span>处置建议：{risk.suggestion}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-24 flex flex-col items-center justify-center text-gray-300 gap-5 bg-gray-50/30 rounded-2xl border border-dashed border-slate-100">
                    <Network className="w-16 h-16 opacity-10" />
                    <p className="font-bold">企业图谱关联信息待生成</p>
                  </div>
                )}
              </>
            )}
          </section>

          {/* 页面底部留白 */}
          <div className="h-20"></div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        
        @keyframes redFlash {
          0%, 100% { background-color: transparent; }
          50% { background-color: rgba(220, 38, 38, 0.15); }
        }
        @keyframes riskFlash {
          0%, 100% { background-color: rgba(220, 38, 38, 0.05); transform: scale(1); }
          50% { background-color: rgba(220, 38, 38, 0.2); transform: scale(1.01); }
        }
        @keyframes progressBar {
          0% { width: 0%; }
          50% { width: 85%; }
          100% { width: 100%; }
        }
        .animate-red-flash { animation: redFlash 0.5s ease-in-out 3; }
        .animate-risk-flash { animation: riskFlash 0.5s ease-in-out 3; z-index: 20; position: relative; }
        .animate-progress-bar { animation: progressBar 5s linear forwards; }

        html, body, #root { height: 100%; margin: 0; overflow: hidden; font-size: 14px; }
      `}</style>
    </div>
  );
};

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);

export default TenderComparison;
