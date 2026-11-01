import React from 'react';
import { Swords, Compass, ShieldAlert } from 'lucide-react';

export default function HeadToHeadRadar({
  headToHead,
  chasingPack,
  gapTracker,
  theme
}) {
  const isDark = theme === 'dark';

  const rank1 = headToHead?.rank1;
  const rank2 = headToHead?.rank2;
  const gap = headToHead?.gap ?? (rank1?.votes - rank2?.votes) ?? 61;
  const p1Share = headToHead?.p1Share ?? 51.0;
  const p2Share = headToHead?.p2Share ?? 49.0;

  const isCritical = Math.abs(gap) < 25;
  const isWarning = Math.abs(gap) < 50;

  return (
    <div className={`p-4 sm:p-5 xl:p-6 rounded-2xl border transition-all duration-300 shadow-sm flex flex-col justify-between h-full min-w-0 ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2E8F0]'
    }`}>
      {/* Top: Section Header */}
      <div>
        <div className={`flex flex-wrap items-center justify-between pb-3.5 mb-4 border-b gap-2 ${
          isDark ? 'border-slate-800/80' : 'border-[#E2E8F0]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border shrink-0 ${
              isDark
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base xl:text-lg font-bold tracking-tight">
                So Kèo Trực Diện & Nhóm Bám Đuổi
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                Đối đầu trực tiếp #1 vs #2 và nhóm uy hiếp Top 5
              </p>
            </div>
          </div>
          
          <span className={`px-2.5 py-1 text-[12px] font-bold rounded-full uppercase tracking-wider shrink-0 border ${
            isCritical
              ? isDark
                ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                : 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse'
              : isWarning
              ? isDark
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                : 'bg-amber-100 text-amber-800 border-amber-200'
              : isDark
              ? 'bg-teal-500/15 text-teal-400 border-teal-500/40'
              : 'bg-teal-50 text-[#9333ea] border-teal-200'
          }`}>
            {isCritical ? '🚨 Cực kỳ nguy cấp' : isWarning ? '⚠️ Tranh chấp gắt' : '✅ Vùng an toàn'}
          </span>
        </div>

        {/* Head-to-Head Tug-of-War Card */}
        <div className={`p-4 rounded-xl border mb-5 ${
          isDark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-[#E2E8F0]'
        }`}>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-between text-xs mb-2.5">
            {/* Rank 1 Side (KHNN2026-002) */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-3 h-3 rounded-full ${
                isDark ? 'bg-[#e879f9] shadow-sm shadow-[#e879f9]/50' : 'bg-[#9333ea]'
              }`}></span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-extrabold text-xs xl:text-sm ${
                    isDark ? 'text-[#e879f9]' : 'text-[#9333ea]'
                  }`}>
                    {rank1?.code || 'KHNN2026-002'}
                  </span>
                  <span className={`text-[12px] font-semibold px-1 py-0.2 rounded border ${
                    isDark
                      ? 'text-teal-400 bg-[#9333ea]/30 border-[#9333ea]/50'
                      : 'text-[#9333ea] bg-teal-50 border-teal-200'
                  }`}>
                    {rank1?.isTarget ? 'Đội nhà' : 'Dẫn đầu'}
                  </span>
                </div>
                <div className={`font-mono text-sm xl:text-base font-black ${
                  isDark ? 'text-slate-100' : 'text-[#0F172A]'
                }`}>
                  {rank1?.votes?.toLocaleString('vi-VN')} <span className={`text-[12px] font-normal ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>phiếu</span>
                </div>
              </div>
            </div>

            {/* Center Gap Badge */}
            <div className={`col-span-2 order-last justify-self-center sm:order-none text-center px-3 py-1.5 rounded-xl border shadow-sm shrink-0 ${
              isDark
                ? 'bg-slate-900/90 border-slate-700'
                : 'bg-white border-[#E2E8F0]'
            }`}>
              <span className={`text-[12px] uppercase font-bold block tracking-wider ${
                isDark ? 'text-slate-400' : 'text-[#64748B]'
              }`}>
                Cách biệt
              </span>
              <span className={`text-xs xl:text-sm font-mono font-black ${
                isCritical
                  ? isDark ? 'text-red-400' : 'text-rose-600'
                  : isWarning
                  ? isDark ? 'text-amber-400' : 'text-amber-600'
                  : isDark ? 'text-teal-400' : 'text-[#9333ea]'
              }`}>
                +{gap} phiếu
              </span>
            </div>

            {/* Rank 2 Side (KHNN2026-054) */}
            <div className="text-right flex items-center gap-2.5 flex-row-reverse min-w-0">
              <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></span>
              <div>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className={`text-[12px] font-semibold px-1 py-0.2 rounded border ${
                    isDark
                      ? 'text-blue-300 bg-blue-500/20 border-blue-500/40'
                      : 'text-blue-700 bg-blue-50 border-blue-200'
                  }`}>
                    Top 2
                  </span>
                  <span className={`font-extrabold text-xs xl:text-sm ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {rank2?.code || 'KHNN2026-054'}
                  </span>
                </div>
                <div className={`font-mono text-sm xl:text-base font-black ${
                  isDark ? 'text-slate-100' : 'text-[#0F172A]'
                }`}>
                  {rank2?.votes?.toLocaleString('vi-VN')} <span className={`text-[12px] font-normal ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>phiếu</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tug-of-War Split Bar */}
          <div className={`relative w-full h-4 rounded-full overflow-hidden flex shadow-inner border ${
            isDark ? 'bg-slate-700/80 border-slate-700/60' : 'bg-slate-200 border-slate-300'
          }`}>
            <div
              className="h-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] transition-all duration-700 relative flex items-center justify-end pr-2"
              style={{ width: `${p1Share}%` }}
              title={`${rank1?.code}: ${p1Share}%`}
            >
              <span className="text-[12px] font-black text-white drop-shadow-sm">{p1Share}%</span>
            </div>
            <div
              className="h-full bg-gradient-to-r from-[#3b82f6] to-[#2dd4bf] transition-all duration-700 relative flex items-center justify-start pl-2"
              style={{ width: `${p2Share}%` }}
              title={`KHNN2026-054: ${p2Share}%`}
            >
              <span className="text-[12px] font-black text-white drop-shadow-sm">{p2Share}%</span>
            </div>
          </div>

          <div className={`flex flex-wrap justify-between items-center gap-x-2 text-[12px] mt-2 ${
            isDark ? 'text-slate-400' : 'text-[#64748B]'
          }`}>
            <span className="truncate max-w-[48%] sm:max-w-[30%]">AI Cây Con (Trang 1)</span>
            <span className={`font-semibold order-last w-full text-center mt-1 sm:order-none sm:w-auto sm:mt-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              Ngưỡng báo động: &lt;50 phiếu
            </span>
            <span className="truncate max-w-[48%] sm:max-w-[30%] text-right">Sâm Cau Đen (Trang 3)</span>
          </div>
        </div>

        {/* Chasing Pack (Ranks #6 - #8) */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2.5">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-slate-200' : 'text-[#0F172A]'
            }`}>
              <Compass className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span>Nhóm Bám Đuổi Sát Top 5 (Ranks #6 - #8)</span>
            </span>
            <span className={`text-[12px] font-medium ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
              Cách ngưỡng Top 5 từ 147 - 187 phiếu
            </span>
          </div>

          <div className="space-y-2">
            {chasingPack && chasingPack.length > 0 ? (
              chasingPack.map((p) => (
                <div
                  key={p.code}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    isDark
                      ? 'bg-slate-800/50 hover:bg-slate-800/80 border-slate-700/60'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className={`w-6 h-6 rounded-lg font-mono font-bold flex items-center justify-center text-xs shrink-0 border ${
                      isDark
                        ? 'bg-slate-700/80 text-slate-200 border-slate-600/50'
                        : 'bg-white text-[#0F172A] border-[#E2E8F0] shadow-2xs'
                    }`}>
                      #{p.rank}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold font-mono ${isDark ? 'text-slate-200' : 'text-[#0F172A]'}`}>
                          {p.code}
                        </span>
                        <span className={`text-[12px] px-1.5 py-0.2 rounded font-medium border ${
                          isDark
                            ? 'text-slate-400 bg-slate-700/50 border-slate-600/40'
                            : 'text-[#64748B] bg-white border-[#E2E8F0]'
                        }`}>
                          Trang {p.page}
                        </span>
                      </div>
                      <p className={`text-[12px] truncate mt-0.5 ${
                        isDark ? 'text-slate-300' : 'text-[#475569]'
                      }`}>
                        {p.title}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className={`font-mono font-extrabold block text-xs xl:text-sm ${
                      isDark ? 'text-slate-100' : 'text-[#0F172A]'
                    }`}>
                      {p.votes.toLocaleString('vi-VN')}
                    </span>
                    <span className={`text-[12px] font-medium ${
                      isDark ? 'text-amber-400' : 'text-amber-600'
                    }`}>
                      Cách Top 5: -{p.gapToTop5 || 147}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                Không có dữ liệu nhóm bám đuổi.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer warning advice */}
      <div className={`mt-4 pt-3 border-t text-xs flex items-center justify-between ${
        isDark ? 'border-slate-800 text-slate-400' : 'border-[#E2E8F0] text-[#64748B]'
      }`}>
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldAlert className={`w-4 h-4 shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          <span>Chiến lược: Duy trì khoảng cách &ge; 100 phiếu để bảo toàn ngôi đầu bảng an toàn.</span>
        </span>
      </div>
    </div>
  );
}
