import React from 'react';
import { Trophy, AlertTriangle, ShieldCheck, Zap, BarChart3, TrendingUp } from 'lucide-react';

export default function HeroKpiCards({
  targetProject,
  gapTracker,
  velocity,
  overview,
  theme
}) {
  const isDark = theme === 'dark';

  const rank = targetProject?.rank || 1;
  const votes = targetProject?.votes?.toLocaleString('vi-VN') || '1,488';
  const gap = gapTracker?.gap ?? 61;
  const isClose = gapTracker?.isClose ?? false;
  const nearest = gapTracker?.nearestCompetitor;
  const isAhead = gapTracker?.isAhead ?? true;

  // Threshold logic:
  // gap >= 50: Safe (Green)
  // 25 <= gap < 50: Warning (Amber)
  // gap < 25 or trailing: Danger (Red/Rose)
  const isDanger = Math.abs(gap) < 25;
  const isWarning = isClose && !isDanger;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5 mb-6">
      
      {/* CARD 1: Vị trí hiện tại của đội nhà */}
      <div className={`kpi-purple relative overflow-hidden rounded-2xl p-5 xl:p-6 border transition-all duration-300 shadow-sm flex flex-col justify-between ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-900/95 to-teal-950/40 border-[#9333ea]/60 hover:border-[#e879f9]'
          : 'bg-white border-[#E2E8F0] hover:border-teal-300 hover:shadow-md'
      }`}>
        <div className={`absolute top-0 right-0 w-36 h-36 rounded-bl-full pointer-events-none blur-2xl ${
          isDark ? 'bg-gradient-to-bl from-[#e879f9]/20 to-transparent' : 'bg-gradient-to-bl from-teal-100/60 to-transparent'
        }`}></div>
        
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 ${
              isDark ? 'text-[#e879f9]' : 'text-[#9333ea]'
            }`}>
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Vị trí Đội Nhà</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-[#9333ea] text-white shadow-sm border border-teal-400/30">
              <span>HẠNG #{rank}</span>
            </span>
          </div>
          
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-3xl sm:text-3xl xl:text-4xl 2xl:text-[42px] font-black tracking-tight font-mono ${
              isDark ? 'text-[#e879f9]' : 'text-[#9333ea]'
            }`}>
              {votes}
            </span>
            <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
              phiếu bình chọn
            </span>
          </div>

          <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-[#475569]'} line-clamp-2 mt-2 leading-relaxed font-medium`}>
            {targetProject?.title || 'Ứng dụng AI trong chẩn đoán bệnh hại cây con trong giai đoạn vườn ươm'}
          </p>
        </div>

        <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
          isDark ? 'border-slate-800/80' : 'border-[#E2E8F0]'
        }`}>
          <span className={`font-bold flex items-center gap-1.5 ${
            isDark ? 'text-teal-400' : 'text-[#9333ea]'
          }`}>
            <span className={`w-2 h-2 rounded-full inline-block animate-pulse ${
              isDark ? 'bg-teal-400' : 'bg-[#9333ea]'
            }`}></span>
            {rank === 1 ? 'Đang dẫn đầu toàn ngành' : `Đang xếp hạng #${rank} toàn ngành`}
          </span>
          <span className={`font-mono text-[12px] px-2 py-0.5 rounded border ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-300'
              : 'bg-slate-100 border-[#E2E8F0] text-[#475569]'
          }`}>
            Mã: {targetProject?.code || 'KHNN2026-002'}
          </span>
        </div>
      </div>

      {/* CARD 2: Khoảng cách an toàn (Gap Tracker) */}
      <div className={`relative overflow-hidden rounded-2xl p-5 xl:p-6 border transition-all duration-300 shadow-sm flex flex-col justify-between ${
        !isDanger && !isWarning ? 'kpi-teal' : ''
      } ${
        isDanger
          ? isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/40 border-red-500/80 pulse-danger'
            : 'bg-rose-50/60 border-rose-300 hover:border-rose-400 pulse-danger'
          : isWarning
          ? isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-amber-500/70'
            : 'bg-amber-50/60 border-amber-300 hover:border-amber-400'
          : isDark
          ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
          : 'bg-white border-[#E2E8F0] hover:border-slate-300'
      }`}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 ${
              isDanger
                ? isDark ? 'text-red-400' : 'text-rose-600'
                : isWarning
                ? isDark ? 'text-amber-400' : 'text-amber-700'
                : isDark ? 'text-teal-400' : 'text-[#9333ea]'
            }`}>
              {isDanger || isWarning ? (
                <AlertTriangle className="w-4 h-4 animate-bounce" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>Khoảng Cách An Toàn</span>
            </span>

            {/* Visual Warning Badge */}
            {isClose ? (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-bold animate-pulse border ${
                isDanger
                  ? isDark
                    ? 'bg-red-500/20 text-red-300 border-red-500/50'
                    : 'bg-rose-100 text-rose-700 border-rose-200'
                  : isDark
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                Đang bám đuổi rất sát!
              </span>
            ) : (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-bold border ${
                isDark
                  ? 'bg-teal-500/15 text-teal-400 border-teal-500/40'
                  : 'bg-teal-50 text-[#9333ea] border-teal-200'
              }`}>
                Safe
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-3xl sm:text-3xl xl:text-4xl 2xl:text-[42px] font-black tracking-tight font-mono ${
              isDanger
                ? isDark ? 'text-red-400' : 'text-rose-600'
                : isWarning
                ? isDark ? 'text-amber-400' : 'text-amber-600'
                : isDark ? 'text-teal-400' : 'text-[#9333ea]'
            }`}>
              {isAhead ? `+${gap}` : `${gap}`}
            </span>
            <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
              phiếu chênh lệch
            </span>
          </div>

          <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-[#475569]'} mt-2 truncate font-medium`}>
            Đối thủ bám sát: <strong className={isDark ? 'text-blue-400' : 'text-blue-600'}>{nearest?.code || 'KHNN2026-054'}</strong> ({nearest?.votes?.toLocaleString('vi-VN')} phiếu)
          </p>
        </div>

        {/* Dynamic Safety Threshold Meter */}
        <div className={`mt-4 pt-3 border-t ${isDark ? 'border-slate-800/80' : 'border-[#E2E8F0]'}`}>
          <div className={`w-full h-2.5 rounded-full overflow-hidden flex border ${
            isDark ? 'bg-slate-800 border-slate-700/50' : 'bg-slate-100 border-[#E2E8F0]'
          }`}>
            <div
              className={`kpi-meter-fill h-full transition-all duration-700 rounded-full ${
                isDanger
                  ? 'bg-rose-500'
                  : isWarning
                  ? 'bg-amber-500'
                  : isDark ? 'bg-teal-500' : 'bg-[#9333ea]'
              }`}
              style={{ width: `${Math.min(100, Math.max(8, (Math.abs(gap) / 100) * 100))}%` }}
            ></div>
          </div>
          <div className={`flex justify-between text-[12px] mt-1.5 font-medium ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
            <span className={isDanger ? (isDark ? 'text-red-400 font-bold' : 'text-rose-600 font-bold') : ''}>Nguy cấp (&lt;25)</span>
            <span className={isWarning ? (isDark ? 'text-amber-400 font-bold' : 'text-amber-700 font-bold') : ''}>Cảnh báo (&lt;50)</span>
            <span className={!isClose ? (isDark ? 'text-teal-400 font-bold' : 'text-[#9333ea] font-bold') : ''}>An toàn (&ge;50)</span>
          </div>
        </div>
      </div>

      {/* CARD 3: Tốc độ tăng trưởng (Vote Velocity) */}
      <div className={`relative overflow-hidden rounded-2xl p-5 xl:p-6 border transition-all duration-300 shadow-sm flex flex-col justify-between ${
        isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-[#E2E8F0] hover:border-slate-300'
      }`}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              <Zap className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span>Tốc Độ Tăng Trưởng</span>
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold border ${
              isDark
                ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              Vote Velocity
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-3xl sm:text-3xl xl:text-4xl 2xl:text-[42px] font-black tracking-tight font-mono ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {velocity?.velocity5m >= 0 ? `+${velocity?.velocity5m || 0}` : velocity?.velocity5m}
            </span>
            <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
              phiếu / 5 phút
            </span>
          </div>

          <div className={`flex items-center gap-1.5 text-xs mt-2 font-medium ${
            isDark ? 'text-teal-400' : 'text-[#9333ea]'
          }`}>
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span>
              1 giờ qua: <strong>{(velocity?.velocity1h || 0) >= 0 ? '+' : ''}{velocity?.velocity1h || 0} phiếu</strong>
              {' · '}chu kỳ gần nhất: <strong>{(velocity?.lastCycle || 0) > 0 ? '+' : ''}{velocity?.lastCycle || 0}</strong>
            </span>
          </div>
        </div>

        <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
          isDark ? 'border-slate-800/80 text-slate-400' : 'border-[#E2E8F0] text-[#64748B]'
        }`}>
          <span>Tần suất quét API:</span>
          <span className={`font-semibold font-mono ${isDark ? 'text-slate-200' : 'text-[#0F172A]'}`}>
            60 giây / chu kỳ
          </span>
        </div>
      </div>

      {/* CARD 4: Tổng quan toàn bảng */}
      <div className={`relative overflow-hidden rounded-2xl p-5 xl:p-6 border transition-all duration-300 shadow-sm hidden md:flex flex-col justify-between ${
        isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-[#E2E8F0] hover:border-slate-300'
      }`}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 ${
              isDark ? 'text-purple-400' : 'text-purple-700'
            }`}>
              <BarChart3 className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-700'}`} />
              <span>Tổng Quan Toàn Bảng</span>
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold border ${
              isDark
                ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}>
              Toàn Ngành
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-3xl sm:text-3xl xl:text-4xl 2xl:text-[42px] font-black tracking-tight font-mono ${
              isDark ? 'text-purple-400' : 'text-purple-700'
            }`}>
              {overview?.totalProjects || 63}
            </span>
            <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
              đề tài (3 trang)
            </span>
          </div>

          <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-[#475569]'} mt-2 font-medium`}>
            Tổng phiếu toàn ngành: <strong className={`font-mono ${isDark ? 'text-slate-100' : 'text-[#0F172A]'}`}>{overview?.totalVotes?.toLocaleString('vi-VN')}</strong> phiếu
          </p>
        </div>

        {/* Vote Share Mini Progress Bar */}
        <div className={`mt-4 pt-3 border-t ${isDark ? 'border-slate-800/80' : 'border-[#E2E8F0]'}`}>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className={isDark ? 'text-slate-400' : 'text-[#64748B]'}>
              Tỷ trọng {(targetProject?.code || 'KHNN2026-002').replace('2026-', '-')}:
            </span>
            <span className={`font-bold font-mono ${isDark ? 'text-[#e879f9]' : 'text-[#9333ea]'}`}>
              {overview?.targetVoteShare || '10.5'}%
            </span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden flex border ${
            isDark ? 'bg-slate-800 border-slate-700/50' : 'bg-slate-100 border-[#E2E8F0]'
          }`}>
            <div
              className="h-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] rounded-full"
              style={{ width: `${Math.min(100, Math.max(5, (overview?.targetVoteShare || 10.5) * 2))}%` }}
            ></div>
          </div>
        </div>
      </div>

    </div>
  );
}
