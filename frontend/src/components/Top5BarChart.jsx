import React, { useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Award, BarChart2, BarChart3, AreaChart, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import RaceAreaChart from './RaceAreaChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Chart.js tooltips don't wrap text, so long titles/authors must be split into lines
const wrapText = (text, max = 36) => {
  const lines = [];
  let line = '';
  String(text || '').split(/\s+/).forEach((word) => {
    if (line && (line + ' ' + word).length > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  });
  if (line) lines.push(line);
  return lines;
};

const formatUpdated = (iso) => {
  const d = iso ? new Date(iso) : null;
  if (!d || Number.isNaN(d.getTime())) return 'Thời gian thực';
  return d.toLocaleString('vi-VN', { hour12: false });
};

const CHART_LABELS = { horizontal: 'Thanh ngang', vertical: 'Cột đứng', area: 'Miền' };

export default function Top5BarChart({ top5, theme, lastUpdated, history, teamCode, neutral }) {
  const isDark = theme === 'dark';
  // 'horizontal' (Thanh ngang), 'vertical' (Cột đứng) or 'area' (Miền); phones default to columns
  const [chartType, setChartType] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'vertical' : 'horizontal'
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState(null); // { type: 'success' | 'error', message: string }

  const exportContainerRef = useRef(null);

  if (!top5 || top5.length === 0) {
    return (
      <div className={`p-6 rounded-2xl border flex-1 flex items-center justify-center ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2E8F0]'
      }`}>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Đang tải biểu đồ Top 5...</p>
      </div>
    );
  }

  // Ensure items are sorted descending by votes (Rank 1 to 5)
  const sortedTop5 = [...top5].sort((a, b) => b.votes - a.votes);

  const isHorizontal = chartType === 'horizontal';
  // Rank 1 comes first: at the top of the horizontal chart, on the left of the column chart
  const displayItems = sortedTop5;

  const labels = displayItems.map(p => 
    isHorizontal
      ? `#${p.rank}  ${p.code}`
      : [`#${p.rank}`, p.code]
  );
  const dataValues = displayItems.map(p => p.votes);

  // Colors follow the dashboard template:
  // KHNN2026-002: purple -> pink gradient, other projects: teal -> blue gradient
  const barGradient = ({ chart, dataIndex }) => {
    const isTarget = displayItems[dataIndex]?.isTarget;
    const [start, end] = isTarget ? ['#a855f7', '#ec4899'] : ['#6366f1', '#2dd4bf'];
    const { ctx, chartArea } = chart;
    if (!chartArea) return end;
    const gradient = isHorizontal
      ? ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0)
      : ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, start);
    gradient.addColorStop(1, end);
    return gradient;
  };

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Lượt bình chọn',
        data: dataValues,
        backgroundColor: barGradient,
        borderWidth: 0,
        borderRadius: isHorizontal ? 8 : { topLeft: 8, topRight: 8 },
        borderSkipped: false,
        barPercentage: isHorizontal ? 0.7 : 0.62,
        categoryPercentage: isHorizontal ? 0.8 : 0.8,
        maxBarThickness: isHorizontal ? 48 : 96,
      },
    ],
  };

  const maxVote = Math.max(...dataValues, 100);

  // Draws "votes (+change)" above each column, or after each horizontal bar
  const valueLabelPlugin = {
    id: 'valueLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      ctx.save();
      ctx.textAlign = isHorizontal ? 'left' : 'center';
      ctx.textBaseline = isHorizontal ? 'middle' : 'bottom';
      meta.data.forEach((bar, i) => {
        const p = displayItems[i];
        const change = p.changeLastCycle > 0 ? p.changeLastCycle : 0;
        ctx.font = `800 ${chart.width < 500 ? 11 : 13}px 'Be Vietnam Pro', sans-serif`;
        ctx.fillStyle = p.isTarget
          ? (isDark ? '#e879f9' : '#9333ea')
          : (isDark ? '#f1f5f9' : '#0f172a');
        const text = change > 0
          ? `${p.votes.toLocaleString('vi-VN')} (+${change})`
          : p.votes.toLocaleString('vi-VN');
        if (isHorizontal) ctx.fillText(text, bar.x + 8, bar.y);
        else ctx.fillText(text, bar.x, bar.y - 6);
      });
      ctx.restore();
    },
  };

  const options = {
    indexAxis: isHorizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: isHorizontal ? 0 : 26, right: isHorizontal ? 0 : 14 } },
    animation: {
      duration: 500,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          family: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
          size: 13,
          weight: 'bold',
        },
        bodyFont: {
          family: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
          size: 12,
        },
        callbacks: {
          title: (items) => {
            const index = items[0].dataIndex;
            const item = displayItems[index];
            return wrapText(`#${item.rank} - ${item.code}: ${item.title}`);
          },
          label: (item) => {
            const index = item.dataIndex;
            const project = displayItems[index];
            const changeText = (project.changeLastCycle && project.changeLastCycle > 0)
              ? ` (+${project.changeLastCycle} phiếu gần đây)`
              : '';
            return [
              `Lượt bình chọn: ${project.votes.toLocaleString('vi-VN')} phiếu${changeText}`,
              ...wrapText(`Nhóm tác giả: ${project.authors}`),
              `Trang: ${project.page}`,
              project.isTarget ? '⭐ ĐỀ TÀI CỦA BẠN' : `Chênh lệch với Top 1: -${project.diffTop1} phiếu`
            ];
          },
        },
      },
    },
    scales: isHorizontal
      ? {
          x: {
            grid: {
              color: isDark ? 'rgba(51, 65, 85, 0.25)' : 'rgba(226, 232, 240, 0.8)',
            },
            ticks: {
              color: isDark ? '#94a3b8' : '#64748b',
              font: {
                family: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
                size: 11,
              },
              callback: (value) => value.toLocaleString('vi-VN'),
            },
            // Leave room after the longest bar for its vote label
            suggestedMax: Math.ceil(maxVote * (typeof window !== 'undefined' && window.innerWidth < 640 ? 1.45 : 1.2)),
          },
          y: {
            grid: {
              display: false,
            },
            ticks: {
              color: (context) => {
                const index = context.index;
                const p = displayItems[index];
                if (p?.isTarget) return isDark ? '#e879f9' : '#9333ea';
                return isDark ? '#e2e8f0' : '#1e293b';
              },
              font: (context) => {
                const index = context.index;
                const p = displayItems[index];
                return {
                  family: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
                  size: 12,
                  weight: p?.isTarget ? 'bold' : 'normal',
                };
              },
              padding: 12,
              // Left-aligned column of labels; home team stands out by color and bold
              crossAlign: 'far',
              // Narrow chart: keep only the rank and the short code so labels don't eat the bars
              callback(value) {
                const p = displayItems[value];
                if (!p) return '';
                const code = this.chart.width >= 520 ? p.code : p.code.replace(/^[A-Z]+2026-/, '');
                return `#${p.rank}  ${code}`;
              },
            },
          },
        }
      : {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: (context) => {
                const index = context.index;
                const p = displayItems[index];
                if (p?.isTarget) return isDark ? '#e879f9' : '#9333ea';
                return isDark ? '#94a3b8' : '#64748b';
              },
              font: (context) => {
                const index = context.index;
                const p = displayItems[index];
                return {
                  family: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
                  size: 12,
                  weight: p?.isTarget ? 'bold' : '600',
                };
              },
              padding: 8,
              autoSkip: false,
              maxRotation: 0,
              minRotation: 0,
              // Narrow chart: drop the shared "XXXX2026-" prefix so labels never collide
              callback(value) {
                const p = displayItems[value];
                if (!p) return '';
                const code = this.chart.width < 640 ? p.code.replace(/^[A-Z]+2026-/, '') : p.code;
                return [`#${p.rank}`, code];
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: isDark ? 'rgba(51, 65, 85, 0.45)' : 'rgba(203, 213, 225, 0.7)',
            },
            ticks: {
              color: isDark ? '#94a3b8' : '#64748b',
              font: {
                family: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
                size: 11,
              },
              callback: (value) => value.toLocaleString('vi-VN'),
            },
            suggestedMax: Math.ceil(maxVote * 1.12),
          },
        },
  };

  // Helper formatting for filename timestamp: YYYYMMDD_HHMM
  const getFormattedFileTimestamp = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}${mm}${dd}_${hh}${min}`;
  };

  // Handler for high-quality PNG export matching the active chart view
  const handleExportImage = async () => {
    if (!exportContainerRef.current) return;
    setIsExporting(true);
    setExportNotice(null);

    const now = new Date();

    try {
      // High crisp quality PNG export (pixelRatio: 2.5 for super sharp text and chart)
      const dataUrl = await toPng(exportContainerRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: isDark ? '#1b1e3f' : '#FFFFFF',
      });

      const timeSlug = getFormattedFileTimestamp(now);
      const filename = `Eureka2026_Top5_BieuDo_${timeSlug}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      setExportNotice({
        type: 'success',
        message: `Đã xuất biểu đồ ${CHART_LABELS[chartType].toLowerCase()} (PNG) thành công!`,
      });
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err) {
      console.error('Export chart image error:', err);
      setExportNotice({
        type: 'error',
        message: 'Xuất ảnh thất bại: ' + (err.message || 'Lỗi không xác định'),
      });
      setTimeout(() => setExportNotice(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`p-4 sm:p-5 xl:p-6 rounded-2xl border transition-all duration-300 shadow-sm flex flex-col justify-between h-full relative min-w-0 ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2E8F0]'
    }`}>
      {/* Export notification popup */}
      {exportNotice && (
        <div className={`absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
          exportNotice.type === 'success'
            ? 'bg-teal-600 text-white'
            : 'bg-rose-600 text-white'
        }`}>
          {exportNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{exportNotice.message}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3.5 mb-3 border-b gap-3 ${
        isDark ? 'border-slate-800/80' : 'border-[#E2E8F0]'
      }`}>
        {/* Title and Badge */}
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border shrink-0 ${
            isDark
              ? 'bg-teal-500/10 text-[#e879f9] border-teal-500/20'
              : 'bg-teal-50 text-[#9333ea] border-teal-200'
          }`}>
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base xl:text-lg font-bold tracking-tight">
              Biểu Đồ Top 5 Bình Chọn
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
              Biểu đồ {CHART_LABELS[chartType].toLowerCase()}
            </p>
          </div>
        </div>

        {/* Action Toolbar: Switch Type + Export Button placed side-by-side */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart Type Selector */}
          <div className={`p-0.5 rounded-xl border flex items-center gap-0.5 ${
            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-[#E2E8F0]'
          }`}>
            <button
              type="button"
              onClick={() => setChartType('horizontal')}
              title="Chuyển sang biểu đồ Thanh ngang"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartType === 'horizontal'
                  ? isDark
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-[#9333ea] shadow-sm font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 rotate-90" />
              <span>Thanh ngang</span>
            </button>

            <button
              type="button"
              onClick={() => setChartType('vertical')}
              title="Chuyển sang biểu đồ Cột đứng"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartType === 'vertical'
                  ? isDark
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-[#9333ea] shadow-sm font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Cột đứng</span>
            </button>

            <button
              type="button"
              onClick={() => setChartType('area')}
              title="Diễn biến cuộc đua theo thời gian (biểu đồ Miền)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartType === 'area'
                  ? isDark
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-[#9333ea] shadow-sm font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AreaChart className="w-3.5 h-3.5" />
              <span>Miền</span>
            </button>
          </div>

          {/* Export Button placed right next to Chart Type Selector */}
          <button
            type="button"
            onClick={handleExportImage}
            disabled={isExporting}
            title="Xuất ảnh biểu đồ đúng loại đang hiển thị (PNG)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
              isExporting ? 'opacity-60 cursor-not-allowed' : ''
            } ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-100 border-slate-700 hover:border-teal-500/50'
                : 'bg-white hover:bg-teal-50/50 text-[#9333ea] border-teal-300 hover:border-[#9333ea]'
            }`}
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-500" />
            ) : (
              <Download className="w-3.5 h-3.5 text-teal-600" />
            )}
            <span>{isExporting ? 'Đang xuất...' : 'Xuất ảnh'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXPORTABLE CONTAINER: Exactly what the user sees, captured cleanly to PNG */}
      {/* No action buttons, toolbar or controls inside this area */}
      {/* ========================================================================= */}
      <div
        ref={exportContainerRef}
        className={`rounded-xl p-3 sm:p-4 transition-colors flex flex-col justify-between flex-1 ${
          isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-[#0F172A]'
        }`}
      >
        {chartType === 'area' ? (
          <RaceAreaChart history={history} top5={top5} theme={theme} embedded />
        ) : (
        <div>
          {/* Legend pills */}
          <div className="flex items-center gap-2.5 text-xs pb-3 shrink-0 flex-wrap">
            {!neutral && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                isDark
                  ? 'bg-[#9333ea]/15 border-[#9333ea]/30'
                  : 'bg-teal-50 border-teal-200'
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-[#e879f9]' : 'bg-[#9333ea]'}`}></span>
                <span className={`font-bold ${isDark ? 'text-[#e879f9]' : 'text-[#9333ea]'}`}>{teamCode} (Đội nhà)</span>
              </div>
            )}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
              isDark
                ? 'bg-slate-800/50 border-slate-700/50 text-slate-400'
                : 'bg-slate-100 border-[#E2E8F0] text-[#64748B]'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#2dd4bf] to-[#6366f1]`}></span>
              <span>{neutral ? 'Các đề tài' : 'Các đề tài còn lại'}</span>
            </div>
          </div>

          {/* Chart Canvas Area */}
          <div className="h-[300px] sm:h-[360px] xl:h-[400px] 2xl:h-[430px] w-full py-1">
            <Bar key={chartType} data={chartData} options={options} plugins={[valueLabelPlugin]} />
          </div>
        </div>
        )}

        {/* Small discreet update timestamp footer */}
        <div className={`pt-2.5 mt-2 flex items-center justify-between text-[12px] ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}>
          <span>Giải thưởng Euréka 2026 • Top 5 Bình chọn</span>
          <span>Cập nhật: {formatUpdated(lastUpdated)}</span>
        </div>
      </div>
    </div>
  );
}
