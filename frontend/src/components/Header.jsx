import React from 'react';
import { RefreshCw, Moon, Sun, Sliders, ExternalLink, Activity, PanelLeftOpen } from 'lucide-react';

export default function Header({
  countdown,
  isRefreshing,
  onRefresh,
  theme,
  onToggleTheme,
  onOpenSimulate,
  gapTracker,
  lastUpdated,
  fetchDurationMs,
  sidebarCollapsed,
  onExpandSidebar
}) {
  const isDark = theme === 'dark';
  // Logo, brand, portal link and controls live in the sidebar while it is open (lg and up)
  const hideWithSidebar = sidebarCollapsed ? '' : 'lg:hidden';

  return (
    <header className={`relative lg:sticky lg:top-0 z-40 border-b backdrop-blur-xl transition-colors duration-200 ${
      isDark
        ? 'bg-slate-900/80 border-slate-800 text-white shadow-lg shadow-black/20'
        : 'bg-white/75 border-[#E2E8F0] text-[#0F172A] shadow-sm'
    }`}>
      <div className="w-full max-w-[96%] 2xl:max-w-[1860px] mx-auto px-3 sm:px-5 lg:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Left Title and Badges */}
          <div className="flex items-center gap-3 min-w-0">
            {sidebarCollapsed && (
              <button
                type="button"
                onClick={onExpandSidebar}
                title="Hiện thanh bên"
                aria-label="Hiện thanh bên"
                className={`hidden lg:flex p-2 rounded-xl border shrink-0 transition-all active:scale-95 ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                    : 'bg-white hover:bg-slate-100 border-[#E2E8F0] text-[#475569]'
                }`}
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            )}
            <div className={`${hideWithSidebar} w-11 h-11 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center shadow-md shadow-[#9333ea]/20 shrink-0 text-white font-bold text-xl select-none`}>
              🌾
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg xl:text-xl font-extrabold tracking-tight">
                  <span className={hideWithSidebar}>Euréka 2026 — </span>Bảng Xếp Hạng Bình Chọn Khoa Học Nông Nghiệp
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[12px] font-semibold rounded-full border shrink-0 ${
                  isDark
                    ? 'bg-[#9333ea]/20 text-[#e879f9] border-[#9333ea]/40'
                    : 'bg-teal-50 text-[#9333ea] border-teal-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-[#e879f9]' : 'bg-[#9333ea]'}`}></span>
                  Official API Live
                </span>
                {fetchDurationMs ? (
                  <span className={`hidden sm:inline-flex items-center gap-1 text-[12px] font-mono px-2 py-0.5 rounded-md border shrink-0 ${
                    isDark
                      ? 'text-slate-400 bg-slate-800/80 border-slate-700/60'
                      : 'text-[#475569] bg-slate-100 border-[#E2E8F0]'
                  }`}>
                    <Activity className={`w-3 h-3 ${isDark ? 'text-[#e879f9]' : 'text-[#9333ea]'}`} />
                    {fetchDurationMs}ms
                  </span>
                ) : null}
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#475569]'} mt-0.5 flex items-center gap-2 flex-wrap`}>
                <span>
                  Giám sát Top 5 & Đề tài trọng điểm: <strong className={isDark ? 'text-[#e879f9]' : 'text-[#9333ea]'}>KHNN2026-002</strong>
                </span>
                <a
                  href="https://binhchon.khoahoctre.com.vn/c/eureka-2026/KHNN"
                  target="_blank"
                  rel="noreferrer"
                  className={`${hideWithSidebar} inline-flex items-center gap-1 font-semibold hover:underline transition-colors ${
                    isDark ? 'text-teal-400 hover:text-teal-300' : 'text-[#9333ea] hover:text-[#7e22ce]'
                  }`}
                >
                  <span>Cổng bình chọn gốc</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className={`flex ${hideWithSidebar} items-center flex-wrap gap-2 sm:gap-2.5 self-start lg:self-center shrink-0`}>
            
            {/* Live Status Indicator & Countdown Ring */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border ${
              isDark
                ? 'bg-slate-800/80 border-slate-700/80 text-slate-300'
                : 'bg-slate-50 border-[#E2E8F0] text-[#475569]'
            }`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isDark ? 'bg-teal-400' : 'bg-teal-500'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isDark ? 'bg-[#e879f9]' : 'bg-[#9333ea]'
                }`}></span>
              </span>
              <span className="hidden sm:inline">Quét định kỳ 60s</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded-md border ${
                isDark
                  ? 'text-[#e879f9] bg-teal-500/10 border-teal-500/20'
                  : 'text-[#9333ea] bg-teal-50 border-teal-200'
              }`}>
                {countdown}s
              </span>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-sm ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 active:scale-95'
                  : 'bg-white hover:bg-slate-50 border-[#E2E8F0] text-[#0F172A] hover:border-slate-300 active:scale-95'
              }`}
              title="Kích hoạt quét đồng thời 3 trang API ngay lập tức"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${
                isRefreshing
                  ? isDark ? 'animate-spin text-[#e879f9]' : 'animate-spin text-[#9333ea]'
                  : isDark ? 'text-slate-400' : 'text-[#64748B]'
              }`} />
              <span>Làm mới</span>
            </button>

            {/* Simulation Trigger */}
            <button
              onClick={onOpenSimulate}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 border ${
                isDark
                  ? 'bg-[#9333ea]/15 hover:bg-[#9333ea]/25 text-[#e879f9] border-[#9333ea]/40'
                  : 'bg-teal-50 hover:bg-teal-100/80 text-[#9333ea] border-teal-200'
              }`}
              title="Mô phỏng thay đổi số phiếu để thử nghiệm cơ chế cảnh báo"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thử nghiệm</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400 hover:text-amber-300'
                  : 'bg-white hover:bg-slate-100 border-[#E2E8F0] text-[#475569] hover:text-[#0F172A]'
              }`}
              title={isDark ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
              aria-label={isDark ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

          </div>

        </div>
      </div>
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#a855f7] to-transparent opacity-70"></div>
    </header>
  );
}
