import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChart } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip);

const FONT = "'Be Vietnam Pro', 'Segoe UI', sans-serif";
const TARGET_COLOR = '#ec4899';
const SLICE_COLORS = ['#a855f7', '#6366f1', '#3b82f6', '#2dd4bf', '#22d3ee'];

export default function VoteShareDonut({ projects, theme }) {
  const isDark = theme === 'dark';
  const sorted = [...(projects || [])].sort((a, b) => b.votes - a.votes);
  const total = sorted.reduce((sum, p) => sum + p.votes, 0);

  // Top 5, plus the target project if it ever drops out of the Top 5
  const featured = sorted.slice(0, 5);
  const target = sorted.find((p) => p.isTarget);
  if (target && !featured.includes(target)) featured.push(target);

  let colorIndex = 0;
  const slices = featured.map((p) => ({
    label: p.code,
    votes: p.votes,
    color: p.isTarget ? TARGET_COLOR : SLICE_COLORS[colorIndex++],
    isTarget: p.isTarget,
  }));
  const restVotes = total - featured.reduce((sum, p) => sum + p.votes, 0);
  const restCount = sorted.length - featured.length;
  if (restCount > 0) {
    slices.push({
      label: `${restCount} đề tài khác`,
      votes: restVotes,
      color: isDark ? '#4a5086' : '#cbd5e1',
    });
  }

  const percent = (votes) => (total ? ((votes / total) * 100).toFixed(1) : '0.0');

  const data = {
    labels: slices.map((s) => s.label),
    datasets: [
      {
        data: slices.map((s) => s.votes),
        backgroundColor: slices.map((s) => s.color),
        borderWidth: 0,
        spacing: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    animation: { duration: 500 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(27, 30, 63, 0.96)' : 'rgba(255, 255, 255, 0.98)',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbcff0' : '#334155',
        borderColor: isDark ? '#363b6b' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        titleFont: { family: FONT, size: 13, weight: 'bold' },
        bodyFont: { family: FONT, size: 12 },
        callbacks: {
          label: (item) => `${item.parsed.toLocaleString('vi-VN')} phiếu (${percent(item.parsed)}%)`,
        },
      },
    },
  };

  return (
    <div className={`p-5 xl:p-6 rounded-2xl border transition-all duration-300 h-full flex flex-col ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2E8F0]'
    }`}>
      <div className={`flex items-center gap-2.5 pb-3.5 mb-3 border-b ${
        isDark ? 'border-slate-800/80' : 'border-[#E2E8F0]'
      }`}>
        <div className={`p-2 rounded-xl border shrink-0 ${
          isDark
            ? 'bg-teal-500/10 text-teal-300 border-teal-500/20'
            : 'bg-teal-50 text-teal-700 border-teal-200'
        }`}>
          <PieChart className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base xl:text-lg font-bold tracking-tight">Tỷ Trọng Phiếu Toàn Ngành</h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
            Top 5 so với các đề tài còn lại
          </p>
        </div>
      </div>

      <div className="relative h-[190px] shrink-0">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black font-mono">{total.toLocaleString('vi-VN')}</span>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>tổng phiếu</span>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5 text-xs">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-2">
            <span className={`flex items-center gap-2 min-w-0 ${s.isTarget ? 'font-bold' : ''}`}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }}></span>
              <span className="truncate">{s.label}</span>
            </span>
            <span className="font-mono font-bold shrink-0">{percent(s.votes)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
