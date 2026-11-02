import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import {
  LayoutDashboard,
  TrendingUp,
  Table2,
  RefreshCw,
  Flag,
  Moon,
  Sun,
  ExternalLink,
  PanelLeftClose,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'tong-quan', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'dien-bien', label: 'Tỷ trọng phiếu', icon: TrendingUp },
  { id: 'bang-xep-hang', label: 'Bảng xếp hạng', icon: Table2 },
];

export default function Sidebar({
  countdown,
  isRefreshing,
  onRefresh,
  theme,
  onToggleTheme,
  onOpenTeamPicker,
  ready,
  collapsed,
  onCollapse,
}) {
  const isDark = theme === 'dark';
  const [active, setActive] = useState(NAV_ITEMS[0].id);

  // Highlight the last section whose top has reached the sticky area under the header
  useEffect(() => {
    const update = () => {
      let current = NAV_ITEMS[0].id;
      NAV_ITEMS.slice(1).forEach(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return;
        const line = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        if (el.getBoundingClientRect().top <= line + 24) current = id;
      });
      // At the very bottom the last section may be too short to reach the line
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = NAV_ITEMS[NAV_ITEMS.length - 1].id;
      }
      setActive(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ready]);

  const goTo = (id) => {
    setActive(id);
    if (id === NAV_ITEMS[0].id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const groupTitle = `px-3 mb-2 text-[12px] font-bold tracking-[0.14em] uppercase flex items-center gap-2 ${
    isDark ? 'text-fuchsia-300/80' : 'text-[#9333ea]'
  }`;

  const ghostBtn = `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
    isDark
      ? 'text-slate-300 hover:bg-white/5 hover:text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

  return (
    <aside
      className={`hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 flex-col border-r overflow-y-auto transition-transform duration-300 ${
        collapsed ? '-translate-x-full' : ''
      } ${
        isDark ? 'bg-[#181a37] border-white/5' : 'bg-white border-[#E2E8F0]'
      }`}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 flex items-center gap-3">
        <div className="w-10 h-10 shrink-0">
          <Logo className="w-full h-full" />
        </div>
        <div className="min-w-0">
          <div className={`text-base font-extrabold leading-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            Euréka 2026
          </div>
          <div className={`text-[12px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Live Vote Tracker
          </div>
        </div>
        <button
          type="button"
          onClick={onCollapse}
          title="Ẩn thanh bên"
          aria-label="Ẩn thanh bên"
          className={`ml-auto p-1.5 rounded-lg transition-colors ${
            isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-3 mt-2">
        <div className={groupTitle}>Báo cáo</div>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => goTo(id)}
                  className={`relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white shadow-lg shadow-fuchsia-500/25'
                      : isDark
                      ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Controls */}
      <div className="px-3 mt-7">
        <div className={groupTitle}>Điều khiển</div>

        <div
          className={`mb-2 flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold ${
            isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-600'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400"></span>
            </span>
            Quét định kỳ
          </span>
          <span className={`font-mono font-bold ${isDark ? 'text-teal-300' : 'text-[#9333ea]'}`}>{countdown}s</span>
        </div>

        <button type="button" onClick={onRefresh} disabled={isRefreshing} className={ghostBtn}>
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
        <button type="button" onClick={onOpenTeamPicker} className={ghostBtn}>
          <Flag className="w-4 h-4" />
          <span>Chọn đội nhà</span>
        </button>
        <button type="button" onClick={onToggleTheme} className={ghostBtn}>
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{isDark ? 'Chế độ sáng' : 'Chế độ tối'}</span>
        </button>
      </div>

      {/* Source link */}
      <div className="mt-auto p-4">
        <a
          href="https://binhchon.khoahoctre.com.vn/c/eureka-2026/KHNN"
          target="_blank"
          rel="noreferrer"
          className={`flex items-center justify-between gap-2 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
            isDark
              ? 'bg-gradient-to-r from-[#a855f7]/25 to-[#ec4899]/25 text-fuchsia-200 hover:from-[#a855f7]/40 hover:to-[#ec4899]/40'
              : 'bg-teal-50 text-[#9333ea] hover:bg-teal-100'
          }`}
        >
          <span>Cổng bình chọn gốc</span>
          <ExternalLink className="w-4 h-4 shrink-0" />
        </a>
      </div>
    </aside>
  );
}
