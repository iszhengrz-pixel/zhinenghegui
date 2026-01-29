import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { MenuItem } from '../../types';
import { MENU_DATA } from '../../constants';

interface SidebarProps {
  collapsed: boolean;
  activeMenuId: string;
  onSelect: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, activeMenuId, onSelect }) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(['viz', 'tender', 'contract']);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isExpanded = expandedIds.includes(item.id);
    const hasActiveChild = item.children?.some(child => child.id === activeMenuId);
    const isReallyActive = activeMenuId === item.id;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="w-full">
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id);
            } else {
              onSelect(item.id);
            }
          }}
          className={`
            w-full flex items-center justify-between px-4 py-3 my-0.5 rounded-2xl transition-all duration-200 group
            ${isReallyActive 
              ? 'bg-[#1E40AF] text-white font-bold shadow-lg shadow-blue-100' 
              : hasActiveChild 
                ? 'bg-blue-50/50 text-[#1E40AF] font-semibold' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-[#1E40AF]'}
            ${depth > 0 ? 'pl-12' : 'pl-4'}
          `}
        >
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            {item.icon && (
              <span className={`
                shrink-0
                ${isReallyActive ? 'text-white' : hasActiveChild ? 'text-[#1E40AF]' : 'text-slate-400 group-hover:text-[#1E40AF]'}
                transition-colors
              `}>
                {item.icon}
              </span>
            )}
            {!collapsed && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[14px] truncate leading-none whitespace-nowrap">{item.label}</span>
                {item.tag && (
                  <span className={`
                    px-2 py-0.5 text-[8px] rounded-full font-black tracking-wider leading-none shrink-0 flex items-center
                    ${isReallyActive 
                      ? 'bg-white text-[#1E40AF]' 
                      : 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-sm shadow-blue-200'}
                  `}>
                    {item.tag}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {!collapsed && hasChildren && (
            <span className="shrink-0 ml-2">
              {isExpanded 
                ? <ChevronDown className="w-4 h-4 opacity-40" /> 
                : <ChevronRight className="w-4 h-4 opacity-40" />}
            </span>
          )}
        </button>

        {!collapsed && hasChildren && isExpanded && (
          <div className="mt-1 space-y-1 relative">
            <div className="absolute left-6 top-0 bottom-4 w-px bg-slate-100"></div>
            {item.children!.map(child => {
               const isChildActive = activeMenuId === child.id;
               return (
                 <button
                   key={child.id}
                   onClick={() => onSelect(child.id)}
                   className={`
                     w-full flex items-center px-4 py-2.5 my-0.5 rounded-xl text-left transition-all duration-200 pl-12
                     ${isChildActive 
                       ? 'text-[#1E40AF] bg-blue-50/80 font-bold' 
                       : 'text-slate-500 hover:bg-slate-50/80 hover:text-[#1E40AF]'}
                     text-[13px] relative group/item min-w-0
                   `}
                 >
                   {isChildActive && (
                     <div className="absolute left-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#1E40AF] rounded-full border-2 border-white shadow-sm -ml-[3.5px]"></div>
                   )}
                   <div className="flex items-center gap-2 min-w-0">
                     <span className="truncate whitespace-nowrap">{child.label}</span>
                     {child.tag && (
                       <span className="px-1.5 py-0.5 text-[8px] bg-indigo-50 text-indigo-600 rounded-full font-black tracking-wider leading-none shrink-0 flex items-center border border-indigo-100">
                         {child.tag}
                       </span>
                     )}
                   </div>
                 </button>
               );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside 
      className={`
        bg-white border-r border-slate-200 transition-all duration-300 flex flex-col h-full z-40 shadow-[4px_0_12px_rgba(0,0,0,0.01)]
        ${collapsed ? 'w-20' : 'w-[280px]'}
      `}
    >
      <nav className="flex-1 overflow-y-auto px-3 py-6 custom-scrollbar">
        {MENU_DATA.map(item => renderMenuItem(item))}
      </nav>
    </aside>
  );
};

export default Sidebar;