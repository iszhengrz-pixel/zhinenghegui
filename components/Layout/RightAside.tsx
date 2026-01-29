
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Zap, Wrench, MessageCircle, HelpCircle, ExternalLink } from 'lucide-react';

const RightAside: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`
      relative h-full bg-white border-l border-gray-200 transition-all duration-300 flex flex-col
      ${isOpen ? 'w-72' : 'w-0'}
    `}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:text-blue-600 transition-colors z-10"
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="flex flex-col h-full overflow-hidden opacity-100 transition-opacity delay-100">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-slate-800">辅助工作区</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <section>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                快捷操作
                <span className="text-[10px] bg-slate-100 px-1.5 rounded">Config</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {['发起审批', '新建合同', '添加风险', '合规报备'].map((item) => (
                  <button key={item} className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all text-[12px] font-medium border border-transparent hover:border-blue-100">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center mb-2">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                常用工具
              </h4>
              <ul className="space-y-2">
                {[
                  { label: '风险等级计算器', desc: '快速评估案件等级' },
                  { label: '法条检索助手', desc: '查询最新合规标准' },
                  { label: '智能合同审查', desc: 'AI辅助要点提取' },
                ].map((tool, idx) => (
                  <li key={idx} className="p-3 rounded-lg border border-gray-100 hover:shadow-sm cursor-pointer transition-shadow">
                    <p className="text-[13px] font-semibold text-slate-800">{tool.label}</p>
                    <p className="text-[11px] text-slate-500">{tool.desc}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                在线咨询
              </h4>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg">
                <p className="text-[13px] font-medium mb-3">法务专线已在线，随时为您解答专业问题。</p>
                <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold backdrop-blur-sm transition-colors">
                  开始对话
                </button>
              </div>
            </section>
          </div>

          <div className="p-4 border-t border-gray-100 bg-slate-50">
            <button className="flex items-center justify-center gap-2 w-full text-[13px] text-slate-500 hover:text-slate-800">
              <HelpCircle className="w-4 h-4" />
              查看帮助文档
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightAside;
