import React, { useState } from 'react';
import { 
  RefreshCw, 
  HelpCircle, 
  Play, 
  RotateCcw, 
  Download, 
  ChevronDown,
  Info,
  Search,
  X,
  Building2,
  Calendar,
  ClipboardList,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface ProjectInfo {
  id: string;
  name: string;
  tenderType: string;
  winner: string;
  acceptanceClause: string;
  acceptanceStatus: '待验收' | '已验收';
  paymentProgress: string;
  processStatus: '流程完整' | '存在遗漏';
}

const TenderAuditCheck: React.FC = () => {
  // 核心业务状态
  const [isDataLinked, setIsDataLinked] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);

  // 检索表单状态
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [tenderType, setTenderType] = useState('全部');
  const [projectStage, setProjectStage] = useState('全部');

  // 按钮样式逻辑
  const isActionEnabled = !!selectedProject;
  
  const primaryBtnClass = isActionEnabled 
    ? "h-[36px] px-4 rounded-[4px] bg-[#1E40AF] text-white text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-sm active:scale-95"
    : "h-[36px] px-4 rounded-[4px] bg-slate-100 text-slate-400 text-[14px] font-medium flex items-center justify-center gap-2 cursor-not-allowed group relative";

  const secondaryBtnClass = isActionEnabled
    ? "h-[36px] px-4 rounded-[4px] bg-white border border-[#1E40AF] text-[#1E40AF] text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-blue-50 transition-all shadow-sm"
    : "h-[36px] px-4 rounded-[4px] bg-white border border-slate-200 text-slate-300 text-[14px] font-medium flex items-center justify-center gap-2 cursor-not-allowed";

  const refreshBtnClass = "h-[36px] px-4 rounded-[4px] bg-white border border-slate-200 text-slate-600 text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all";

  const handleSearch = () => {
    setIsSearching(true);
    // 模拟搜索延迟
    setTimeout(() => {
      setSelectedProject({
        id: 'NB-2024-0012-CI',
        name: '宁波智慧园区二期系统建设工程',
        tenderType: '公开招标',
        winner: '宁波中城建设集团有限公司',
        acceptanceClause: '三方联合整体验收，合格后支付30%尾款',
        acceptanceStatus: '待验收',
        paymentProgress: '已支付 70%',
        processStatus: '流程完整'
      });
      setIsSearching(false);
    }, 600);
  };

  const handleClearSearch = () => {
    setSelectedProject(null);
    setSearchId('');
    setSearchName('');
    setTenderType('全部');
    setProjectStage('全部');
  };

  // Add missing handleRefresh function to fix the 'Cannot find name' error.
  const handleRefresh = () => {
    if (selectedProject) {
      handleSearch();
    } else {
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 500);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#FFFFFF] overflow-hidden font-sans">
      {/* 顶部通栏 - 80px */}
      <header className="h-[80px] w-full bg-[#FFFFFF] border-b border-[#E5E7EB] px-[20px] flex items-center justify-between shrink-0 z-50">
        
        {/* 左侧：标题 */}
        <div className="flex items-center">
          <h1 className="text-[18px] font-[600] text-[#1F2937]">验收回款校验与招采内部审计</h1>
        </div>

        {/* 中间：核心操作组 */}
        <div className="flex items-center gap-[15px]">
          <div className="relative group">
            <button disabled={!isActionEnabled} className={primaryBtnClass}>
              <Play className="w-4 h-4 fill-current" /> 一键审查
              {!isActionEnabled && (
                <div className="invisible group-hover:visible absolute bottom-[-45px] left-1/2 -translate-x-1/2 w-[220px] bg-slate-800 text-white text-[12px] p-2 rounded shadow-xl z-[100] text-center">
                  请检索有效项目或补充项目基础信息
                  <div className="absolute top-[-4px] left-1/2 -translate-x-1/2 border-l-[4px] border-r-[4px] border-b-[4px] border-l-transparent border-r-transparent border-b-slate-800"></div>
                </div>
              )}
            </button>
          </div>
          
          <button disabled={!isActionEnabled} className={secondaryBtnClass}>
            <RotateCcw className="w-4 h-4" /> 重新审查
          </button>

          {/* 导出报告下拉组 */}
          <div className="relative">
            <button 
              disabled={!isActionEnabled} 
              onClick={() => setIsExportOpen(!isExportOpen)}
              className={secondaryBtnClass}
            >
              <Download className="w-4 h-4" /> 导出报告 <ChevronDown className="w-4 h-4 opacity-50" />
            </button>
            {isExportOpen && isActionEnabled && (
              <div className="absolute top-[40px] right-0 w-[220px] bg-white border border-[#E5E7EB] shadow-lg rounded-[4px] py-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                <button className="w-full text-left px-4 py-2 text-[13px] text-slate-600 hover:bg-slate-50">单独导出验收回款校验报告</button>
                <button className="w-full text-left px-4 py-2 text-[13px] text-slate-600 hover:bg-slate-50">单独导出招采内部审计报告</button>
                <div className="h-px bg-slate-100 my-1"></div>
                <button className="w-full text-left px-4 py-2 text-[13px] text-[#1E40AF] font-bold hover:bg-blue-50">合并导出两份报告</button>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {/* 数据联动开关 */}
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-[4px] border border-slate-100">
            <span className="text-[13px] text-slate-500 font-medium">数据联动</span>
            <button 
              onClick={() => setIsDataLinked(!isDataLinked)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${isDataLinked ? 'bg-[#1E40AF]' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isDataLinked ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* 右侧：辅助功能 */}
        <div className="flex items-center gap-[15px]">
          <button onClick={handleRefresh} className={refreshBtnClass}>
            <RefreshCw className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} /> 刷新
          </button>
          
          <div className="relative group cursor-help">
            <HelpCircle className="w-[24px] h-[24px] text-[#6B7280] hover:text-slate-600 transition-colors" />
            <div className="invisible group-hover:visible absolute right-0 top-[35px] w-[320px] p-4 bg-slate-800 text-white text-[12px] leading-relaxed rounded-[8px] shadow-xl z-[70] opacity-0 group-hover:opacity-100 transition-all">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                <p>验收资料支持 PDF/Word/Excel 格式，单文件 ≤ 50MB；审计模块自动抓取招采流程数据，无需手动上传。</p>
              </div>
              <div className="absolute -top-1.5 right-2.5 w-3 h-3 bg-slate-800 rotate-45"></div>
            </div>
          </div>
        </div>
      </header>

      {/* 下部主体区 */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 左侧固定区 - 300px */}
        <aside className="w-[300px] h-full bg-[#FFFFFF] border-r border-[#E5E7EB] p-[20px] overflow-y-auto custom-scrollbar shrink-0 flex flex-col">
          <h2 className="text-[16px] font-[600] text-[#1F2937] mb-[20px]">项目基础信息检索</h2>
          
          <div className="space-y-[15px] mb-[20px]">
            {/* 项目编号 */}
            <div className="relative group">
              <input 
                type="text" 
                placeholder="项目编号关键词" 
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[4px] text-[13px] outline-none focus:border-[#1E40AF] transition-all pr-[30px]"
              />
              {searchId && (
                <button onClick={() => setSearchId('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 项目名称 */}
            <div className="relative group">
              <input 
                type="text" 
                placeholder="项目名称关键词" 
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[4px] text-[13px] outline-none focus:border-[#1E40AF] transition-all pr-[30px]"
              />
              {searchName && (
                <button onClick={() => setSearchName('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 招标类型 */}
            <select 
              value={tenderType}
              onChange={(e) => setTenderType(e.target.value)}
              className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[4px] text-[13px] outline-none focus:border-[#1E40AF] transition-all cursor-pointer"
            >
              <option value="全部">全部招标类型</option>
              <option value="公开招标">公开招标</option>
              <option value="邀请招标">邀请招标</option>
              <option value="竞争性谈判">竞争性谈判</option>
              <option value="单一来源">单一来源</option>
            </select>

            {/* 项目阶段 */}
            <select 
              value={projectStage}
              onChange={(e) => setProjectStage(e.target.value)}
              className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[4px] text-[13px] outline-none focus:border-[#1E40AF] transition-all cursor-pointer"
            >
              <option value="全部">全部项目阶段</option>
              <option value="待验收">待验收</option>
              <option value="已验收未回款">已验收未回款</option>
              <option value="已回款">已回款</option>
            </select>

            <button 
              onClick={handleSearch}
              className="w-full h-[40px] bg-[#1E40AF] text-[#FFFFFF] rounded-[4px] text-[14px] font-[600] flex items-center justify-center gap-2 hover:bg-blue-800 transition-all active:scale-95"
            >
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              检索项目
            </button>
          </div>

          {/* 项目详情卡片 */}
          {selectedProject && (
            <div className="bg-[#F9FAFB] p-[15px] rounded-[4px] border border-[#E5E7EB] animate-in fade-in slide-in-from-top-2 duration-300 relative group">
              <button 
                onClick={handleClearSearch}
                className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-[12px]">
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">项目编号</label>
                  <div className="text-[13px] font-bold text-[#1E40AF]">{selectedProject.id}</div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">项目名称</label>
                  <div className="text-[13px] font-medium text-slate-700 leading-snug">{selectedProject.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">招标类型</label>
                    <div className="text-[12px] text-slate-600 font-medium">{selectedProject.tenderType}</div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">验收状态</label>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedProject.acceptanceStatus === '已验收' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                      {selectedProject.acceptanceStatus}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">中标单位</label>
                  <div className="text-[12px] text-slate-700 flex items-center gap-1.5 font-medium truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {selectedProject.winner}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">合同验收条款</label>
                  <div className="text-[12px] text-slate-500 leading-relaxed italic">
                    "{selectedProject.acceptanceClause}"
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                    <Clock className="w-3 h-3" /> {selectedProject.paymentProgress}
                  </span>
                  <span className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold rounded ${selectedProject.processStatus === '流程完整' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    <ClipboardList className="w-3 h-3" /> {selectedProject.processStatus}
                  </span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* 右侧自适应区 */}
        <main className="flex-1 h-full bg-[#F9FAFB] p-[20px] overflow-y-auto custom-scrollbar flex flex-col gap-[20px]">
          
          {/* 上半部卡片 - 50% */}
          <section className="flex-1 min-h-0 bg-[#FFFFFF] border border-[#E5E7EB] p-[20px] shadow-sm rounded-sm">
            {/* 验收/回款统计预留区 */}
          </section>

          {/* 下半部卡片 - 50% */}
          <section className="flex-1 min-h-0 bg-[#FFFFFF] border border-[#E5E7EB] p-[20px] shadow-sm rounded-sm">
            {/* 招采审计明细预留区 */}
          </section>

        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>
    </div>
  );
};

export default TenderAuditCheck;