import React from 'react';
import Logo from './Logo';
import VotingCountdown from './VotingCountdown';
import { RefreshCw, Moon, Sun, Flag, ExternalLink, PanelLeftOpen } from 'lucide-react';

export default function Header({
  countdown,
  isRefreshing,
  onRefresh,
  theme,
  onToggleTheme,
  onOpenTeamPicker,
  teamCode,
  neutral,
  fieldKey,
  fieldName,
  gapTracker,
  lastUpdated,
  votingEnd,
  voteUrl,
  sidebarCollapsed,
  onExpandSidebar
}) {
  const isDark = theme === 'dark';
  // Logo, brand, portal link and controls live in the sidebar while it is open (lg and up)
  const hideWithSidebar = sidebarCollapsed ? '' : 'lg:hidden';

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-200 ${
      isDark
        ? 'bg-slate-900/80 border-slate-800 text-white shadow-lg shadow-black/20'
        : 'bg-white/75 border-[#E2E8F0] text-[#0F172A] shadow-sm'
    }`}>
      <div className="w-full max-w-[96%] 2xl:max-w-[1860px] mx-auto px-3 sm:px-5 lg:px-6 py-2">
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* Left Title */}
          <div className="flex items-center gap-2 min-w-0 shrink-0 sm:shrink">
            {sidebarCollapsed && (
              <button
                type="button"
                onClick={onExpandSidebar}
                title="Hiện thanh bên"
                aria-label="Hiện thanh bên"
                className={`hidden lg:flex p-1.5 rounded-lg border shrink-0 transition-all active:scale-95 ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                    : 'bg-white hover:bg-slate-100 border-[#E2E8F0] text-[#475569]'
                }`}
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}
            <div className={`${hideWithSidebar} w-7 h-7 shrink-0 select-none`}>
              <Logo className="w-full h-full" />
            </div>
            {/* Phones keep only the logo so the countdown fits on one row */}
            <h1 className="hidden sm:block text-sm font-extrabold tracking-tight whitespace-nowrap truncate">
              <span className={hideWithSidebar}>Euréka 2026 · {fieldKey}</span>
              <span className={sidebarCollapsed ? 'hidden' : 'hidden lg:inline'}>
                Bảng Xếp Hạng Bình Chọn {fieldName}
              </span>
            </h1>
          </div>

          {/* Time left to vote: always visible, even while the sidebar holds the controls */}
          <div className="ml-auto shrink-0">
            <VotingCountdown endsAt={votingEnd} voteUrl={voteUrl} theme={theme} />
          </div>

          {/* Right Action Controls */}
          <div className={`flex ${hideWithSidebar} items-center gap-1.5 shrink-0`}>

            {/* Live Status Indicator & Countdown Ring */}
            <div
              title="Quét định kỳ 60 giây"
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border ${
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
              <span className={`font-mono font-bold tabular-nums text-center min-w-[3ch] px-2 py-0.5 rounded-md border ${
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
              aria-label="Làm mới"
              className={`flex items-center p-1.5 rounded-lg text-xs font-semibold transition-all border shadow-sm ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 active:scale-95'
                  : 'bg-white hover:bg-slate-50 border-[#E2E8F0] text-[#0F172A] hover:border-slate-300 active:scale-95'
              }`}
              title="Kích hoạt quét đồng thời toàn bộ trang API ngay lập tức"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${
                isRefreshing
                  ? isDark ? 'animate-spin text-[#e879f9]' : 'animate-spin text-[#9333ea]'
                  : isDark ? 'text-slate-400' : 'text-[#64748B]'
              }`} />
            </button>

            {/* Simulation Trigger */}
            <button
              onClick={onOpenTeamPicker}
              aria-label="Chọn đội nhà"
              className={`flex items-center p-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 border ${
                isDark
                  ? 'bg-[#9333ea]/15 hover:bg-[#9333ea]/25 text-[#e879f9] border-[#9333ea]/40'
                  : 'bg-teal-50 hover:bg-teal-100/80 text-[#9333ea] border-teal-200'
              }`}
              title={neutral ? 'Chế độ trung lập. Bấm để chọn đội nhà' : `Đội nhà: ${teamCode}. Bấm để đổi`}
            >
              <Flag className="w-3.5 h-3.5" />
            </button>

            {/* Official portal link */}
            <a
              href={voteUrl}
              target="_blank"
              rel="noreferrer"
              title="Cổng bình chọn gốc"
              aria-label="Cổng bình chọn gốc"
              className={`hidden sm:flex p-1.5 rounded-lg border transition-all active:scale-95 ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-teal-400'
                  : 'bg-white hover:bg-slate-100 border-[#E2E8F0] text-[#9333ea]'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`p-1.5 rounded-lg border transition-all active:scale-95 ${
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
