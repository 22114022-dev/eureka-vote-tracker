import React from 'react';
import { FIELDS } from '../fields';

export default function FieldSwitch({ fieldKey, onSelect, theme }) {
  const isDark = theme === 'dark';

  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
        Lĩnh vực
      </span>
      <div
        role="tablist"
        aria-label="Chọn lĩnh vực"
        className={`flex rounded-xl p-0.5 border text-xs font-semibold ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-[#E2E8F0]'
        }`}
      >
        {Object.values(FIELDS).map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={fieldKey === f.key}
            onClick={() => onSelect(f.key)}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              fieldKey === f.key
                ? 'bg-[#9333ea] text-white shadow-sm font-bold'
                : isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/80'
            }`}
          >
            {f.shortName}
          </button>
        ))}
      </div>
    </div>
  );
}
