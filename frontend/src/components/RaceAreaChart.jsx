import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const FONT = "'Be Vietnam Pro', 'Segoe UI', sans-serif";

// Vertical fade for the area under a line
const areaFill = (rgb, topAlpha) => ({ chart }) => {
  const { ctx, chartArea } = chart;
  if (!chartArea) return `rgba(${rgb}, ${topAlpha})`;
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, `rgba(${rgb}, ${topAlpha})`);
  gradient.addColorStop(1, `rgba(${rgb}, 0.02)`);
  return gradient;
};

// Same colors as the vote share donut
const TARGET_COLOR = '#ec4899';
const SERIES_COLORS = ['#a855f7', '#6366f1', '#3b82f6', '#2dd4bf', '#22d3ee'];

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ');

export default function RaceAreaChart({ history, top5, theme, embedded = false }) {
  const isDark = theme === 'dark';
  const points = history || [];
  const cardClass = embedded ? 'flex flex-col' : `p-5 xl:p-6 rounded-2xl border transition-all duration-300 h-full flex flex-col ${
    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2E8F0]'
  }`;

  const first = points[0];
  const last = points[points.length - 1];
  const gapChange = first && last ? last.gap - first.gap : 0;

  // One band per Top 5 project, ordered by rank like the bar charts
  let colorIndex = 0;
  const series = [...(top5 || [])]
    .sort((a, b) => b.votes - a.votes)
    .map((p) => ({ ...p, color: p.isTarget ? TARGET_COLOR : SERIES_COLORS[colorIndex++] }));

  const data = {
    labels: points.map((p) => p.timestamp),
    datasets: series.map((p, i) => ({
      label: p.code,
      data: points.map((point) => point.top5?.[p.code] ?? null),
      borderColor: p.color,
      backgroundColor: areaFill(hexToRgb(p.color), 0.32),
      fill: i < series.length - 1 ? '+1' : 'start',
      borderWidth: p.isTarget ? 3 : 2,
      tension: 0.35,
      spanGaps: true,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: p.color,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    interaction: { mode: 'index', intersect: false },
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
          title: (items) => points[items[0].dataIndex]?.timestamp,
          label: (item) => `${item.dataset.label}: ${item.parsed.y.toLocaleString('vi-VN')} phiếu`,
          footer: (items) => `Cách biệt đội nhà: ${points[items[0].dataIndex]?.gap} phiếu`,
        },
        itemSort: (a, b) => b.parsed.y - a.parsed.y,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#a3a8d3' : '#64748b',
          font: { family: FONT, size: 11 },
          maxTicksLimit: typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 6,
          maxRotation: 0,
          autoSkipPadding: 16,
          align: 'inner',
        },
      },
      y: {
        grace: '12%',
        grid: { color: isDark ? 'rgba(54, 59, 107, 0.45)' : 'rgba(203, 213, 225, 0.7)' },
        ticks: {
          color: isDark ? '#a3a8d3' : '#64748b',
          font: { family: FONT, size: 11 },
          callback: (value) => value.toLocaleString('vi-VN'),
        },
      },
    },
  };

  return (
    <div className={cardClass}>
      <div className={`flex flex-wrap items-center justify-between gap-3 ${
        embedded ? 'pb-3' : `pb-3.5 mb-3 border-b ${isDark ? 'border-slate-800/80' : 'border-[#E2E8F0]'}`
      }`}>
        {!embedded && <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border shrink-0 ${
            isDark
              ? 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20'
              : 'bg-purple-50 text-[#9333ea] border-purple-200'
          }`}>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base xl:text-lg font-bold tracking-tight">Diễn Biến Cuộc Đua</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
              Phần tô tím là khoảng cách với đối thủ gần nhất
            </p>
          </div>
        </div>}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold">
          {series.map((p) => (
            <span key={p.code} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
              {p.code}
            </span>
          ))}
          {points.length >= 2 && (
            <span
              title={`Thay đổi so với đầu kỳ (${first.timestamp}): ${gapChange >= 0 ? '+' : ''}${gapChange}`}
              className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                isDark ? 'bg-white/5 text-teal-300' : 'bg-teal-50 text-teal-700'
              }`}
            >
              Cách biệt {last.gap >= 0 ? '+' : ''}{last.gap}
              <span className="font-medium opacity-70"> ({gapChange >= 0 ? '+' : ''}{gapChange} so với đầu kỳ)</span>
            </span>
          )}
        </div>
      </div>

      {points.length >= 2 ? (
        <div className={embedded ? 'h-[300px] sm:h-[360px] xl:h-[400px] 2xl:h-[430px] w-full py-1' : 'flex-1 min-h-[280px] xl:min-h-[320px]'}>
          <Line data={data} options={options} />
        </div>
      ) : (
        <div className={`flex-1 min-h-[280px] flex items-center justify-center text-sm ${
          isDark ? 'text-slate-400' : 'text-[#64748B]'
        }`}>
          Đang tích lũy dữ liệu lịch sử...
        </div>
      )}
    </div>
  );
}
