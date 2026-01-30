import React, { useState } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import HomeDashboard from './components/Dashboard/HomeDashboard';
import PartnerManagement from './components/Partners/PartnerManagement';
import TenderReview from './components/Tender/TenderReview';
import TenderComparison from './components/Tender/TenderComparison';
import TenderFlawDetection from './components/Tender/TenderFlawDetection';
import TenderAuditPerson from './components/Tender/TenderAuditPerson';
import TenderAuditCheck from './components/Tender/TenderAuditCheck';
import KnowledgeBase from './components/KnowledgeBase/KnowledgeBase';
import { MENU_DATA } from './constants';

const App: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState('viz-overview');

  const getBreadcrumb = () => {
    let parentLabel = "";
    let childLabel = "";
    
    MENU_DATA.forEach(parent => {
      if (parent.children) {
        const foundChild = parent.children.find(c => c.id === activeMenuId);
        if (foundChild) {
          parentLabel = parent.label;
          childLabel = foundChild.label;
        }
      } else if (parent.id === activeMenuId) {
        childLabel = parent.label;
      }
    });

    return (
      <nav className="flex mb-4 text-xs font-medium text-slate-400 gap-2 items-center px-4 pt-4">
        <span className="hover:text-[#1E40AF] cursor-pointer transition-colors" onClick={() => setActiveMenuId('viz-overview')}>管理后台</span>
        {parentLabel && <span>/</span>}
        {parentLabel && <span className="capitalize">{parentLabel}</span>}
        <span>/</span>
        <span className="text-slate-800 capitalize font-semibold">{childLabel || activeMenuId}</span>
      </nav>
    );
  };

  const renderContent = () => {
    const isFullWidthModule = ['kb-laws', 'kb-rules', 'kb-cases', 'tender-audit-person', 'tender-audit-check'].includes(activeMenuId);

    switch (activeMenuId) {
      case 'viz-overview':
        return (
          <div className="overflow-y-auto h-full custom-scrollbar bg-white">
            <HomeDashboard />
          </div>
        );
      case 'partners-mgmt':
        return (
          <div className="p-6 overflow-y-auto h-full custom-scrollbar bg-gray-50/30">
            <div className="max-w-7xl mx-auto">
              {getBreadcrumb()}
              <PartnerManagement />
            </div>
          </div>
        );
      case 'tender-flaw':
        return <TenderFlawDetection />;
      case 'tender-compare':
        return <TenderComparison />;
      case 'tender-audit-person':
        return <TenderAuditPerson />;
      case 'tender-audit-check':
        return <TenderAuditCheck />;
      case 'kb-laws':
      case 'kb-rules':
      case 'kb-cases':
        return (
          <div className="p-6 overflow-y-auto h-full custom-scrollbar bg-gray-50/30">
            <div className={`mx-auto ${isFullWidthModule ? 'w-full' : 'max-w-7xl'}`}>
              {getBreadcrumb()}
              <KnowledgeBase activeId={activeMenuId} />
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6 overflow-y-auto h-full custom-scrollbar bg-gray-50/30">
            <div className="max-w-7xl mx-auto">
              {getBreadcrumb()}
              <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[400px]">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                   <div className="w-12 h-12 bg-[#1E40AF]/20 rounded-lg animate-pulse"></div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">模块建设中</h3>
                <p className="text-slate-500 max-w-sm">
                  正在同步合规库与业务引擎。 <span className="text-[#1E40AF] font-bold">{activeMenuId}</span> 模块的功能预计将于近期上线。
                </p>
                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => setActiveMenuId('viz-overview')}
                    className="px-6 py-2 bg-[#1E40AF] text-white rounded-lg font-bold hover:bg-[#1e3a8a] transition-all shadow-lg shadow-blue-200"
                  >
                    返回概览
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <Header 
        isSidebarCollapsed={isSidebarCollapsed} 
        onMenuToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <div className="flex flex-1 overflow-hidden group">
        <Sidebar 
          collapsed={isSidebarCollapsed} 
          activeMenuId={activeMenuId}
          onSelect={setActiveMenuId}
        />
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-hidden">
            {renderContent()}
          </div>
          <footer className="h-10 bg-white border-t border-gray-100 px-6 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
            <div>© 2024 宁波城投智能合规风控系统 版权所有</div>
            <div className="flex gap-4">
               <span className="flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full"></span> 
                 AI 风控引擎连接中
               </span>
               <span className="hover:text-slate-600 cursor-pointer">隐私协议</span>
               <span className="hover:text-slate-600 cursor-pointer">服务条款</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;