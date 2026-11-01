import React, { useMemo, useState } from 'react';
import { X, Search, Star, RotateCcw } from 'lucide-react';

export default function TeamPickerModal({
  isOpen,
  onClose,
  projects,
  team,
  defaultTeam,
  onSelect,
  theme
}) {
  const isDark = theme === 'dark';
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = projects || [];
    if (!q) return all;
    return all.filter((p) =>
      `${p.code} ${p.title} ${p.authors}`.toLowerCase().includes(q)
    );
  }, [projects, query]);

  if (!isOpen) return null;

  const choose = (code) => {
    onSelect(code);
    setQuery('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border p-5 shadow-2xl ${
        isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-[#E2E8F0] text-[#0F172A]'
      }`}>
        <div className={`flex items-center justify-between pb-3 mb-3 border-b ${
          isDark ? 'border-slate-800' : 'border-[#E2E8F0]'
        }`}>
          <div>
            <h3 className="text-base font-bold">Chọn đội nhà</h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
              Toàn bộ số liệu theo dõi sẽ tính theo đề tài bạn chọn
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border mb-3 ${
          isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-[#E2E8F0]'
        }`}>
          <Search className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo mã, tên đề tài hoặc tác giả"
            className="w-full bg-transparent outline-none text-sm placeholder:text-slate-500"
          />
        </div>

        <div className="overflow-y-auto -mx-1 px-1 space-y-1.5 min-h-[120px]">
          {list.length === 0 && (
            <p className={`text-sm text-center py-6 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
              Không tìm thấy đề tài phù hợp
            </p>
          )}
          {list.map((p) => {
            const active = p.code === team;
            return (
              <button
                key={p.code}
                type="button"
                onClick={() => choose(p.code)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors ${
                  active
                    ? isDark
                      ? 'bg-[#9333ea]/20 border-[#9333ea]/60'
                      : 'bg-purple-50 border-[#9333ea]/50'
                    : isDark
                    ? 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800'
                    : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
                }`}
              >
                <span className={`w-8 shrink-0 text-center font-mono text-xs font-bold ${
                  isDark ? 'text-slate-400' : 'text-[#64748B]'
                }`}>
                  #{p.rank}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-xs font-bold ${
                    active ? (isDark ? 'text-[#e879f9]' : 'text-[#9333ea]') : ''
                  }`}>
                    {p.code}
                  </span>
                  <span className={`block text-xs truncate ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                    {p.title}
                  </span>
                </span>
                <span className="shrink-0 flex items-center gap-1.5 font-mono text-xs font-bold">
                  {p.votes.toLocaleString('vi-VN')}
                  {active && <Star className="w-3.5 h-3.5 text-[#e879f9]" />}
                </span>
              </button>
            );
          })}
        </div>

        {team !== defaultTeam && (
          <button
            type="button"
            onClick={() => choose(defaultTeam)}
            className={`mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
              isDark
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                : 'border-[#E2E8F0] text-[#475569] hover:bg-slate-50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Về đề tài mặc định ({defaultTeam})
          </button>
        )}
      </div>
    </div>
  );
}
