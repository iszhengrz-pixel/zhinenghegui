
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Shield, FileText, Download, Filter, Calendar, Bookmark, 
  Scale, ChevronRight, Sparkles, Layers, Briefcase, MessageSquare, 
  Tag, CheckCircle2, Send, X, User, Bot, Loader2, List, ArrowLeft,
  BookOpen, Clock, Eye, Share2, AlignLeft, Info, BookmarkPlus,
  ArrowUpRight, FileSearch, Gavel, FileCheck, ClipboardList
} from 'lucide-react';

interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  status: 'active' | 'revised' | 'obsolete';
  level: string;
  date: string;
  source: string;
  summary: string;
  tags: string[];
  viewCount: number;
  content: {
    title: string;
    sections: {
      id: string;
      title: string;
      paragraphs: string[];
    }[];
  };
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const LAWS_DATA: KnowledgeItem[] = [
  { 
    id: 'L1', 
    title: '中华人民共和国招标投标法', 
    category: '国家法律', 
    status: 'active', 
    level: '法律', 
    date: '2017-12-27', 
    source: '全国人大常委会', 
    tags: ['招标', '投标', '基本法', '合规基础'],
    viewCount: 12540,
    summary: '本法是为了规范招标投标活动，保护国家利益、社会公共利益及招标投标活动当事人的合法权益，提高经济效益，保证项目质量而制定的。',
    content: {
      title: '中华人民共和国招标投标法 (2017修订版)',
      sections: [
        { id: 'ch1', title: '第一章 总则', paragraphs: [
          '第一条 为了规范招标投标活动，保护国家利益、社会公共利益和招标投标活动当事人的合法权益，提高经济效益，保证项目质量，制定本法。',
          '第二条 在中华人民共和国境内进行招标投标活动，适用本法。',
          '第三条 在中华人民共和国境内进行下列工程建设项目包括项目的勘察、设计、施工、监理以及与工程建设有关的重要设备、材料等的采购，必须进行招标：'
        ]},
        { id: 'ch2', title: '第二章 招标', paragraphs: [
          '第八条 招标人是依照本法规定提出招标项目、进行招标的法人或者其他组织。',
          '第九条 招标项目按照国家有关规定需要履行项目审批手续的，应当先履行审批手续，取得批准。',
          '第十条 招标分为公开招标和邀请招标。'
        ]},
        { id: 'ch3', title: '第三章 投标', paragraphs: [
          '第二十五条 投标人是响应招标、参加投标竞争的法人或者其他组织。',
          '第二十六条 投标人应当具备承担招标项目的能力；国家有关规定对投标人资格条件或者招标文件对投标人资格条件有规定的，投标人应当具备规定的资格条件。'
        ]}
      ]
    }
  },
  { 
    id: 'L2', 
    title: '招标投标法实施条例', 
    category: '行政法规', 
    status: 'active', 
    level: '行政法规', 
    date: '2019-03-02', 
    source: '国务院', 
    tags: ['实施细节', '流程规范'], 
    viewCount: 8900, 
    summary: '本条例旨在细化招标投标法的相关规定，增强可操作性，对招标投标全过程进行了深度规范。',
    content: {
      title: '中华人民共和国招标投标法实施条例',
      sections: [
        { id: 'sec1', title: '第一章 总则', paragraphs: ['第一条 根据《中华人民共和国招标投标法》，制定本条例。'] },
        { id: 'sec2', title: '第二章 招标的范围和限额', paragraphs: ['第二条 必须进行招标的工程建设项目的具体范围和规模标准，由国务院发展改革部门会同国务院有关部门制订。'] }
      ]
    }
  },
  { 
    id: 'L3', 
    title: '中华人民共和国建筑法', 
    category: '国家法律', 
    status: 'active', 
    level: '法律', 
    date: '2019-04-23', 
    source: '全国人大常委会', 
    tags: ['工程建设', '建筑许可', '质量管理'], 
    viewCount: 6540, 
    summary: '加强对建筑活动的监督管理，维护建筑市场秩序，保证建筑工程质量和安全。',
    content: { title: '中华人民共和国建筑法', sections: [] }
  },
  { id: 'L4', title: '公平竞争审查条例', category: '市场监管', status: 'active', level: '行政法规', date: '2024-05-01', source: '国务院', tags: ['公平竞争', '准入审查'], viewCount: 4500, summary: '规范政府行为，防止出台排除、限制竞争的政策措施。', content: { title: '公平竞争审查条例', sections: [] } },
  { id: 'L5', title: '中华人民共和国民法典 (合同编)', category: '国家法律', status: 'active', level: '法律', date: '2020-05-28', source: '全国人大', tags: ['合同法', '违约责任'], viewCount: 15200, summary: '规定合同的订立、效力、履行、变更、转让、终止以及违约责任。', content: { title: '民法典合同编', sections: [] } },
  { id: 'L6', title: '优化营商环境条例', category: '行政法规', status: 'active', level: '行政法规', date: '2019-10-22', source: '国务院', tags: ['营商环境', '政务服务'], viewCount: 3200, summary: '为了持续优化营商环境，不断解放和发展社会生产力。', content: { title: '优化营商环境条例', sections: [] } },
  { id: 'L7', title: '电子招标投标办法', category: '部门规章', status: 'active', level: '部门规章', date: '2013-02-04', source: '发改委等八部委', tags: ['数字化', '电子标'], viewCount: 5100, summary: '规范电子招标投标活动，促进电子招标投标健康发展。', content: { title: '电子招标投标办法', sections: [] } },
];

const RULES_DATA: KnowledgeItem[] = [
  { id: 'R1', title: '宁波城投集团采购管理制度', category: '企业制度', status: 'active', level: '集团制度', date: '2024-01-15', source: '集团招采部', tags: ['内部制度', '采购流程'], viewCount: 3200, summary: '明确集团内部采购权限划分、流程节点及审批要求。', content: { title: '采购管理制度', sections: [] } },
  { id: 'R2', title: '廉洁从业“十条禁令”', category: '合规准则', status: 'active', level: '纪律规范', date: '2023-11-20', source: '纪检监察室', tags: ['廉洁', '风控'], viewCount: 5600, summary: '规范员工职业行为，明确禁令性条款与违规处理机制。', content: { title: '廉洁禁令', sections: [] } },
  { id: 'R3', title: '集团合同审批权限矩阵', category: '管理制度', status: 'active', level: '集团制度', date: '2024-02-10', source: '法律合规部', tags: ['权责划分', '审批流'], viewCount: 2800, summary: '详细规定各类合同的金额阈值与对应审批层级。', content: { title: '合同审批权限矩阵', sections: [] } },
  { id: 'R4', title: '重大项目合规风险排查清单', category: '合规工具', status: 'active', level: '操作指引', date: '2024-03-05', source: '风险管理部', tags: ['自查清单', '风险点'], viewCount: 4100, summary: '针对工程建设项目全生命周期的合规自查表。', content: { title: '合规风险排查清单', sections: [] } },
  { id: 'R5', title: '员工差旅费管理办法', category: '行政管理', status: 'active', level: '通用制度', date: '2023-12-01', source: '财务管理部', tags: ['行政合规', '报销'], viewCount: 7200, summary: '规范员工出差申请、标准及报销流程。', content: { title: '差旅费管理办法', sections: [] } },
];

const KnowledgeBase: React.FC<{ activeId: string }> = ({ activeId }) => {
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('全部');
  
  // AI 对话
  const [isQAPanelOpen, setIsQAPanelOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState('');

  // 滚动高亮索引
  const [activeSection, setActiveSection] = useState('');

  const { data, title, color } = useMemo(() => {
    let sourceData = LAWS_DATA;
    if (activeId === 'kb-rules') sourceData = RULES_DATA;
    if (activeId === 'kb-cases') sourceData = LAWS_DATA; 

    return { 
      data: sourceData, 
      title: activeId === 'kb-laws' ? '法律法规库' : activeId === 'kb-rules' ? '合规制度库' : '合规案例库',
      color: activeId === 'kb-laws' ? 'blue' : activeId === 'kb-rules' ? 'emerald' : 'orange'
    };
  }, [activeId]);

  const filteredData = data.filter(item => 
    (item.title.includes(searchQuery) || item.tags.some(t => t.includes(searchQuery))) &&
    (activeFilter === '全部' || item.level === activeFilter || item.category === activeFilter)
  );

  const selectedItem = data.find(i => i.id === selectedId) || data[0];

  const handleOpenDetail = (id: string) => {
    setSelectedId(id);
    setViewMode('detail');
    window.scrollTo(0, 0);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPos = container.scrollTop + 100;
    
    selectedItem.content.sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element && element.offsetTop <= scrollPos) {
        setActiveSection(section.id);
      }
    });
  };

  const handleSendMessage = (text: string = userInput) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: '刚刚' };
    setChatHistory(prev => [...prev, userMsg]);
    setUserInput('');
    setIsTyping(true);
    setTimeout(() => {
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: `基于《${selectedItem.title}》，针对您的问题“${text}”，AI 分析如下：依据相关条款，该行为可能涉及程序性违规，建议立即核查相关环节。`, timestamp: '刚刚' };
      setChatHistory(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-500 relative w-full px-0">
      
      {/* 1. 顶部操作通栏 */}
      <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between gap-6 w-full shrink-0">
        <div className="flex items-center gap-6 flex-1">
          {viewMode === 'detail' && (
            <button 
              onClick={() => setViewMode('list')}
              className="p-2.5 bg-slate-50 hover:bg-white border border-slate-100 rounded-xl text-slate-500 transition-all flex items-center gap-2 group shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold">返回列表</span>
            </button>
          )}
          <div className="relative flex-1 max-w-2xl">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder={`在 ${title} 中检索标题、文号、关键词、标签...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 transition-all font-medium"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-8">
           <div className="hidden xl:flex items-center gap-6 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Eye className="w-4 h-4 text-slate-300" /> 累计查阅 <span className="text-slate-700">4.2w+</span>
              </span>
           </div>
           <button 
             onClick={() => setIsQAPanelOpen(true)}
             className="bg-[#1E40AF] text-white px-8 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
           >
             <Sparkles className="w-4 h-4" />
             AI 助手
           </button>
        </div>
      </div>

      {/* 2. 主体通栏区域 */}
      <div className="flex-1 flex gap-6 min-h-0 overflow-hidden w-full px-1">
        
        {viewMode === 'list' ? (
          /* --- 横向列表模式 --- */
          <div className="flex-1 flex gap-6 overflow-hidden w-full">
            {/* 侧边分类树 */}
            <div className="w-64 bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm shrink-0 flex flex-col space-y-8 overflow-y-auto custom-scrollbar">
               <section>
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <Layers className="w-3.5 h-3.5" /> 效力体系
                 </h4>
                 <div className="space-y-1">
                   {['全部', '国家法律', '行政法规', '部门规章', '集团制度', '准则规程'].map(f => (
                     <button 
                       key={f}
                       onClick={() => setActiveFilter(f)}
                       className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border
                         ${activeFilter === f 
                           ? `bg-${color}-50 text-${color}-600 border-${color}-100 shadow-sm` 
                           : 'text-slate-500 border-transparent hover:bg-slate-50'}
                       `}
                     >
                       {f}
                     </button>
                   ))}
                 </div>
               </section>
               <section>
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <Tag className="w-3.5 h-3.5" /> 热门标签
                 </h4>
                 <div className="flex flex-wrap gap-2">
                   {['招投标', '合同', '风险', '廉洁', '分包'].map(t => (
                     <span key={t} className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400 rounded-lg hover:border-blue-200 hover:text-blue-500 cursor-pointer transition-all">#{t}</span>
                   ))}
                 </div>
               </section>
            </div>

            {/* 横向列表展示区 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-20 space-y-3">
              {filteredData.length > 0 ? filteredData.map(item => (
                <div 
                  key={item.id}
                  onClick={() => handleOpenDetail(item.id)}
                  className="group bg-white p-6 rounded-[20px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer flex items-center gap-6"
                >
                  {/* 标题与摘要 - 移除了左侧图标 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                       <h3 className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors truncate">{item.title}</h3>
                       <span className={`px-2 py-0.5 rounded-lg bg-${color}-50 text-${color}-600 text-[9px] font-black uppercase border border-${color}-100 shrink-0`}>
                         {item.level}
                       </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate font-medium leading-relaxed">{item.summary}</p>
                  </div>

                  {/* 元数据分栏 */}
                  <div className="flex items-center gap-10 shrink-0 pr-4">
                    <div className="hidden lg:flex flex-col items-center gap-1 w-20">
                       <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">分类</span>
                       <span className="text-[11px] text-slate-500 font-bold">{item.category}</span>
                    </div>
                    <div className="hidden md:flex flex-col items-center gap-1 w-24">
                       <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">发布日期</span>
                       <span className="text-[11px] text-slate-500 font-mono">{item.date}</span>
                    </div>
                    <div className="hidden sm:flex flex-col items-center gap-1 w-16">
                       <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">查阅</span>
                       <span className="text-[11px] text-slate-600 font-black">{item.viewCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 hover:text-blue-600 hover:bg-blue-50 transition-all">
                          <BookmarkPlus className="w-4 h-4" />
                       </button>
                       <button className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 opacity-0 group-hover:opacity-100 transition-all">
                          <ChevronRight className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-300 gap-4 bg-white rounded-[32px] border border-dashed border-slate-200">
                   <Search className="w-12 h-12 opacity-10" />
                   <p className="text-sm font-bold">未检索到匹配的合规文档</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* --- 详情模式 --- */
          <div className="flex-1 flex gap-6 overflow-hidden relative animate-in slide-in-from-right-10 duration-700 w-full">
            {/* 左侧动态目录索引 */}
            <div className="w-80 bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm shrink-0 flex flex-col overflow-hidden">
               <div className="flex items-center gap-3 mb-8 text-slate-800">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <AlignLeft className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest">章节目录</span>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-3">
                 {selectedItem.content.sections.length > 0 ? selectedItem.content.sections.map(sec => (
                   <button 
                     key={sec.id}
                     onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' })}
                     className={`w-full text-left px-5 py-4 rounded-2xl text-[13px] font-bold transition-all border
                       ${activeSection === sec.id 
                         ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                         : 'bg-white border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
                     `}
                   >
                     {sec.title}
                   </button>
                 )) : (
                   <div className="p-10 text-center text-slate-300 italic text-xs">暂无结构化章节</div>
                 )}
               </div>
            </div>

            {/* 正文阅读通栏区 */}
            <div className="flex-1 bg-white rounded-[24px] border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
               <div className="px-10 py-5 border-b border-slate-100 bg-slate-50/10 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-8 text-[11px] font-bold text-slate-400">
                     <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm"><Calendar className="w-4 h-4 text-slate-300" /> 发布: {selectedItem.date}</span>
                     <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm"><Scale className="w-4 h-4 text-slate-300" /> 类型: {selectedItem.level}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <button className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-blue-600 bg-white border border-slate-200 rounded-xl shadow-sm transition-all">
                        <Download className="w-4 h-4" /> 导出PDF
                     </button>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-16 custom-scrollbar scroll-smooth">
                 <div className="max-w-4xl mx-auto space-y-16 pb-40">
                    <div className="space-y-8">
                       <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">{selectedItem.content.title}</h1>
                       <div className="bg-gradient-to-br from-blue-600/5 to-indigo-600/5 p-8 rounded-[32px] border border-blue-100/50 shadow-inner">
                          <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                             <Sparkles className="w-4 h-4" /> AI 核心要点导读
                          </h5>
                          <p className="text-[15px] text-slate-600 leading-loose font-medium text-justify">{selectedItem.summary}</p>
                       </div>
                    </div>

                    {selectedItem.content.sections.map(section => (
                      <section key={section.id} id={section.id} className="scroll-mt-24">
                        <h2 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-4">
                           <div className="w-3 h-8 bg-[#1E40AF] rounded-full"></div>
                           {section.title}
                        </h2>
                        <div className="space-y-8">
                           {section.paragraphs.map((p, idx) => (
                             <div key={idx} className="group relative">
                                <p className="text-[17px] text-slate-600 leading-[2.2] text-justify hover:text-slate-900 transition-colors">
                                  {p}
                                </p>
                             </div>
                           ))}
                        </div>
                      </section>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* AI 咨询抽屉 */}
      {isQAPanelOpen && (
        <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-[-30px_0_80px_-20px_rgba(30,64,175,0.15)] border-l border-slate-100 z-[100] flex flex-col animate-in slide-in-from-right duration-700">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-[#1E40AF] to-[#312E81] text-white">
             <div className="flex items-center gap-4">
               <Bot className="w-7 h-7" />
               <h3 className="text-[15px] font-black tracking-tight">AI 智能合规助手</h3>
             </div>
             <button onClick={() => setIsQAPanelOpen(false)} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors">
               <X className="w-6 h-6" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-50/20">
             {chatHistory.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-8">
                  <div className="w-24 h-24 rounded-[32px] bg-blue-50 flex items-center justify-center border border-blue-100">
                    <Sparkles className="w-12 h-12 text-blue-600 animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">您可以针对该文档的合规细节进行深度提问。</p>
               </div>
             )}
             {chatHistory.map((msg) => (
               <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                 <div className={`max-w-[90%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`p-5 rounded-[28px] text-[14px] leading-loose shadow-sm border
                        ${msg.role === 'user' 
                          ? 'bg-[#1E40AF] text-white border-blue-700 rounded-tr-none' 
                          : 'bg-white text-slate-700 border-slate-200 rounded-tl-none'}
                      `}>
                         {msg.content}
                      </div>
                 </div>
               </div>
             ))}
             {isTyping && (
               <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 p-5 rounded-[28px] rounded-tl-none flex items-center gap-4 shadow-sm">
                     <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                     <span className="text-xs text-slate-400 font-black">AI 正在生成回复...</span>
                  </div>
               </div>
             )}
          </div>

          <div className="p-8 bg-white border-t border-slate-50">
             <div className="relative group">
               <input 
                type="text" 
                placeholder="在此输入您的疑问..." 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="w-full pl-6 pr-16 py-5 bg-slate-50 border border-slate-200 rounded-[28px] text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 transition-all font-medium"
               />
               <button 
                onClick={() => handleSendMessage()}
                disabled={!userInput.trim() || isTyping}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-3.5 bg-[#1E40AF] text-white rounded-[22px] hover:bg-blue-700 shadow-xl"
               >
                 <Send className="w-6 h-6" />
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
