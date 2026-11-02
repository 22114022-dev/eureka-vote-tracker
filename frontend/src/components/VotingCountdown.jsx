import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Hourglass } from 'lucide-react';

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

const pad = (n) => String(n).padStart(2, '0');

const formatRemaining = (ms) => {
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const clock = `${pad(Math.floor(total / 3600) % 24)}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`;
  return days > 0 ? `${days}n ${clock}` : clock;
};

const WEEKDAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

// Dates are shown in Vietnam time whatever the viewer's timezone is
const formatDate = (date) => {
  const vn = new Date(date.getTime() + 7 * HOUR_MS);
  return `${WEEKDAYS[vn.getUTCDay()]}, ${pad(vn.getUTCDate())}/${pad(vn.getUTCMonth() + 1)}/${vn.getUTCFullYear()}`;
};

const formatTime = (date) => {
  const vn = new Date(date.getTime() + 7 * HOUR_MS);
  return `${pad(vn.getUTCHours())}:${pad(vn.getUTCMinutes())}`;
};

const formatLeftInWords = (ms) => {
  const days = Math.floor(ms / DAY_MS);
  const hours = Math.floor((ms % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((ms % HOUR_MS) / 60000);
  if (days > 0) return `${days} ngày ${hours} giờ`;
  return hours > 0 ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
};

const tone = (ms, isDark) => {
  if (ms <= 0) return isDark ? 'bg-slate-800/80 border-slate-700/80 text-slate-400' : 'bg-slate-100 border-[#E2E8F0] text-[#64748B]';
  if (ms <= HOUR_MS) return `animate-pulse ${isDark ? 'bg-red-500/20 border-red-500/50 text-red-300' : 'bg-rose-100 border-rose-200 text-rose-700'}`;
  if (ms <= DAY_MS) return isDark ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-amber-100 border-amber-200 text-amber-800';
  return isDark ? 'bg-teal-500/10 border-teal-500/30 text-teal-300' : 'bg-teal-50 border-teal-200 text-[#9333ea]';
};

export default function VotingCountdown({ endsAt, voteUrl, theme }) {
  const isDark = theme === 'dark';
  const [now, setNow] = useState(() => Date.now());
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close the details on a click elsewhere or Escape
  useEffect(() => {
    if (!isOpen) return undefined;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setIsOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const deadline = endsAt ? new Date(endsAt) : null;
  if (!deadline || Number.isNaN(deadline.getTime())) return null;

  const remaining = deadline.getTime() - now;

  const labelClass = isDark ? 'text-slate-400' : 'text-[#64748B]';
  const rows = [
    ['Hôm nay', formatDate(new Date(now))],
    ['Kết thúc', `${formatTime(deadline)}, ${formatDate(deadline)}`],
    ['Còn lại', remaining > 0 ? formatLeftInWords(remaining) : 'Đã hết thời gian bình chọn'],
  ];

  return (
    <div ref={rootRef} className="sm:relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Xem chi tiết thời gian bình chọn"
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold font-mono tabular-nums whitespace-nowrap shrink-0 ${tone(remaining, isDark)}`}
      >
        <Hourglass className="w-3.5 h-3.5 shrink-0" />
        {remaining > 0 ? formatRemaining(remaining) : 'Đã kết thúc'}
      </button>

      {isOpen && (
        <div className={`absolute left-3 right-3 top-12 sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-72 z-50 p-3 rounded-xl border shadow-xl text-xs ${
          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-[#E2E8F0] text-[#0F172A]'
        }`}>
          <div className="font-bold mb-2">Thời gian bình chọn</div>
          <dl className="space-y-1.5">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3">
                <dt className={labelClass}>{label}</dt>
                <dd className="font-semibold text-right">{value}</dd>
              </div>
            ))}
          </dl>
          {voteUrl && remaining > 0 && (
            <a
              href={voteUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#a855f7] to-[#ec4899] active:scale-[0.98] transition-all"
            >
              <span>Bình chọn cho đội nhà</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
