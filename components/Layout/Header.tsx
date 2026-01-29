import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, LogOut, Menu, ChevronDown, User, Settings, Shield } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isSidebarCollapsed }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white text-slate-800 flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm border-b border-slate-200">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center">
          {/* 公司 Logo：高度适配，比例不变 */}
          <img 
            src="https://www.nbuci.com/images/logonew.png"
            alt="宁波城建投资集团有限公司" 
            className="h-10 w-auto object-contain"
            onError={(e) => {
              // 如果图片未就绪，使用占位符或保持原样
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* 垂直分割线 */}
          <div className="h-6 w-px bg-slate-200 mx-4 hidden sm:block"></div>
          <h1 className="text-lg font-bold text-slate-800 hidden sm:block tracking-tight">
            智能合规风控系统
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索预警、案件或风控规则..." 
            className="pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm w-72 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-2"></div>

        <div className="relative" ref={userMenuRef}>
          <div 
            className="flex items-center gap-3 pl-2 cursor-pointer group py-1.5 px-2 rounded-xl hover:bg-slate-50 transition-colors"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-tight">张建国</p>
              <p className="text-[10px] text-slate-500 leading-tight uppercase tracking-wider font-bold">高级风控官</p>
            </div>
            <div className="relative">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                alt="Avatar" 
                className="w-9 h-9 rounded-full border border-slate-200 object-cover shadow-sm bg-white"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 text-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-slate-50 mb-1">
                <p className="text-sm font-bold text-slate-900">张建国</p>
                <p className="text-xs text-slate-500">jianguo.zhang@example.com</p>
              </div>
              
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 transition-colors">
                <User className="w-4 h-4 text-slate-400" />
                个人资料
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 transition-colors">
                <Settings className="w-4 h-4 text-slate-400" />
                账号设置
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 transition-colors text-orange-600">
                <Shield className="w-4 h-4" />
                安全中心
              </button>
              
              <div className="h-px bg-slate-50 my-1"></div>
              
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                <LogOut className="w-4 h-4" />
                退出当前系统
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;