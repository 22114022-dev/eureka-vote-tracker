import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Star,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function LeaderboardTable({
  projects,
  targetProject,
  theme
}) {
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState('all'); // 'all', 'top5', '1', '2', '3'
  const [sortField, setSortField] = useState('rank');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Filter logic
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects.filter((p) => {
      // Page filter
      if (selectedPage === 'top5' && p.rank > 5) return false;
      if (['1', '2', '3'].includes(selectedPage) && p.page?.toString() !== selectedPage) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = p.code?.toLowerCase().includes(q);
        const titleMatch = p.title?.toLowerCase().includes(q);
        const authorMatch = p.authors?.toLowerCase().includes(q);
        return codeMatch || titleMatch || authorMatch;
      }

      return true;
    });
  }, [projects, selectedPage, searchQuery]);

  // Sort logic
  const sortedProjects = useMemo(() => {
    const sorted = [...filteredProjects];
    sorted.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'code') {
        return sortDirection === 'asc'
          ? (valA || '').localeCompare(valB || '')
          : (valB || '').localeCompare(valA || '');
      }

      return sortDirection === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });
    return sorted;
  }, [filteredProjects, sortField, sortDirection]);

  // Pagination logic
  const actualPageSize = pageSize === 'all' ? sortedProjects.length || 1 : Number(pageSize);
  const totalPages = Math.ceil(sortedProjects.length / actualPageSize) || 1;
  const paginatedProjects = useMemo(() => {
    if (pageSize === 'all') return sortedProjects;
    const start = (currentPage - 1) * actualPageSize;
    return sortedProjects.slice(start, start + actualPageSize);
  }, [sortedProjects, currentPage, actualPageSize, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'votes' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const headers = ['Hạng', 'Mã đề tài', 'Tên đề tài', 'Nhóm tác giả', 'Trang', 'Lượt bình chọn', 'Chênh lệch Top 1', 'Biến động 1h'];
    const rows = sortedProjects.map(p => [
      p.rank,
      p.code,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${(p.authors || '').replace(/"/g, '""')}"`,
      p.page,
      p.votes,
      p.diffTop1,
      p.change1h || 0
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Eureka2026_KHNN_Leaderboard_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2E8F0]'
    }`}>
      {/* Table Toolbar */}
      <div className={`p-4 sm:p-5 xl:p-6 border-b ${isDark ? 'border-slate-800/80' : 'border-[#E2E8F0]'}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Title & Count Badge */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg xl:text-xl font-bold tracking-tight">
                  Bảng Xếp Hạng Chi Tiết Toàn Ngành
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300'
                    : 'bg-slate-100 border-[#E2E8F0] text-[#475569]'
                }`}>
                  {sortedProjects.length} / 63 đề tài
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'} mt-1`}>
                Đồng bộ trực tiếp qua Official API từ tất cả 3 trang bình chọn Euréka 2026
              </p>
            </div>
          </div>

          {/* Controls: Search, Filter Tabs, Page Size & CSV Button */}
          <div className="flex flex-wrap items-center gap-2.5 xl:gap-3">
            
            {/* Search Input */}
            <div className="relative min-w-[220px] sm:w-[280px] xl:w-[320px]">
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-slate-400' : 'text-[#64748B]'
              }`} />
              <input
                type="text"
                placeholder="Tìm mã (002), tên đề tài, tác giả..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full pl-9 pr-3 py-1.5 xl:py-2 rounded-xl text-xs border outline-none transition-all ${
                  isDark
                    ? 'bg-slate-800/90 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#e879f9] focus:ring-1 focus:ring-[#e879f9]'
                    : 'bg-white border-[#E2E8F0] text-[#0F172A] placeholder-slate-400 focus:border-[#9333ea] focus:ring-1 focus:ring-[#9333ea]'
                }`}
              />
            </div>

            {/* Filter Tabs */}
            <div className={`flex rounded-xl p-0.5 border text-xs font-semibold ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-[#E2E8F0]'
            }`}>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'top5', label: 'Top 5' },
                { id: '1', label: 'Trang 1' },
                { id: '2', label: 'Trang 2' },
                { id: '3', label: 'Trang 3' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setSelectedPage(tab.id); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedPage === tab.id
                      ? 'bg-[#9333ea] text-white shadow-sm font-bold'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(e.target.value);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-white border-[#E2E8F0] text-[#475569] hover:border-slate-300'
              }`}
            >
              <option value="15">15 / trang</option>
              <option value="25">25 / trang</option>
              <option value="all">Xem tất cả 63</option>
            </select>

            {/* Export CSV Button */}
            <button
              onClick={exportCSV}
              className={`flex items-center gap-1.5 px-3 py-1.5 xl:py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-50 border-[#E2E8F0] text-[#0F172A] hover:border-slate-300'
              }`}
              title="Xuất danh sách sang file Excel / CSV"
            >
              <Download className={`w-3.5 h-3.5 ${isDark ? 'text-teal-400' : 'text-[#9333ea]'}`} />
              <span>Xuất CSV</span>
            </button>
          </div>

        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs border-collapse">
          <thead className={`border-b text-[12px] uppercase tracking-wider font-bold select-none ${
            isDark
              ? 'bg-slate-800/60 border-slate-800 text-slate-400'
              : 'bg-slate-50 border-[#E2E8F0] text-[#64748B]'
          }`}>
            <tr>
              <th
                onClick={() => handleSort('rank')}
                className={`py-3 px-3.5 cursor-pointer transition-colors w-16 text-center ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-[#0F172A]'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Hạng</span>
                  <ArrowUpDown className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
              </th>
              
              <th
                onClick={() => handleSort('code')}
                className={`py-3 px-3.5 cursor-pointer transition-colors w-36 whitespace-nowrap ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-[#0F172A]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>Mã đề tài</span>
                  <ArrowUpDown className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
              </th>
              
              <th className="py-3 px-4 min-w-[340px] xl:min-w-[440px] 2xl:min-w-[560px]">
                Tên công trình nghiên cứu
              </th>
              
              <th className="py-3 px-3.5 min-w-[200px] xl:min-w-[260px]">
                Nhóm tác giả
              </th>
              
              <th
                onClick={() => handleSort('page')}
                className={`py-3 px-3 cursor-pointer text-center w-20 transition-colors ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-[#0F172A]'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Trang</span>
                  <ArrowUpDown className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
              </th>
              
              <th
                onClick={() => handleSort('votes')}
                className={`py-3 px-4 cursor-pointer text-right w-32 whitespace-nowrap transition-colors ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-[#0F172A]'
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Lượt bình chọn</span>
                  <ArrowUpDown className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
              </th>
              
              <th
                onClick={() => handleSort('diffTop1')}
                className={`py-3 px-4 cursor-pointer text-right w-32 whitespace-nowrap transition-colors ${
                  isDark ? 'hover:text-slate-200' : 'hover:text-[#0F172A]'
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Cách Top 1</span>
                  <ArrowUpDown className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
              </th>
              
              <th className="py-3 px-3.5 text-center w-24 whitespace-nowrap" title="Số phiếu thay đổi trong 1 giờ qua">
                Biến động 1h
              </th>
            </tr>
          </thead>

          <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-[#E2E8F0]'}`}>
            {paginatedProjects.length > 0 ? (
              paginatedProjects.map((p) => {
                const isTarget = p.isTarget || p.code === 'KHNN2026-002';
                const isTop1 = p.rank === 1;
                const isTop2 = p.rank === 2;
                const isTop3 = p.rank === 3;

                return (
                  <tr
                    key={p.code}
                    className={`transition-all duration-200 ${
                      isTarget
                        ? isDark
                          ? 'bg-[#9333ea]/15 hover:bg-[#9333ea]/25 border-l-4 border-l-[#e879f9] shadow-sm'
                          : 'bg-teal-50/90 hover:bg-teal-100/70 border-l-4 border-l-[#9333ea]'
                        : isDark
                        ? 'hover:bg-slate-800/40 text-slate-300'
                        : 'hover:bg-slate-50/90 text-[#475569]'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-3.5 font-bold font-mono text-center">
                      <div className="flex items-center justify-center">
                        {isTop1 ? (
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border ${
                            isDark
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            🥇
                          </span>
                        ) : isTop2 ? (
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                            isDark
                              ? 'bg-slate-400/20 text-slate-300 border-slate-400/40'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}>
                            🥈
                          </span>
                        ) : isTop3 ? (
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                            isDark
                              ? 'bg-amber-700/20 text-amber-600 border-amber-700/40'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            🥉
                          </span>
                        ) : (
                          <span className={`font-mono text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                            #{p.rank}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Code & Target Badge */}
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`font-mono font-extrabold ${
                          isTarget
                            ? isDark ? 'text-[#e879f9] text-sm' : 'text-[#9333ea] text-sm'
                            : isDark ? 'text-slate-200' : 'text-[#0F172A]'
                        }`}>
                          {p.code}
                        </span>
                        {isTarget && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-black bg-[#9333ea] text-white shadow-sm border border-teal-400/30">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Đề tài của bạn
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4">
                      <p className={`leading-relaxed text-xs sm:text-[13px] ${
                        isTarget
                          ? isDark ? 'text-white font-bold' : 'text-[#0F172A] font-bold'
                          : isDark ? 'text-slate-200' : 'text-[#0F172A]'
                      }`}>
                        {p.title}
                      </p>
                    </td>

                    {/* Authors */}
                    <td className="py-3.5 px-3.5">
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'} leading-relaxed`}>
                        {p.authors || '—'}
                      </p>
                    </td>

                    {/* Page */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[12px] font-semibold border ${
                        isDark
                          ? 'bg-slate-800/80 border-slate-700/60 text-slate-300'
                          : 'bg-slate-100 border-[#E2E8F0] text-[#475569]'
                      }`}>
                        Trang {p.page}
                      </span>
                    </td>

                    {/* Vote Count */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono">
                      <span className={`text-sm xl:text-base font-black ${
                        isTarget
                          ? isDark ? 'text-[#e879f9]' : 'text-[#9333ea]'
                          : isDark ? 'text-slate-100' : 'text-[#0F172A]'
                      }`}>
                        {p.votes.toLocaleString('vi-VN')}
                      </span>
                    </td>

                    {/* Diff to Top 1 */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-xs">
                      {p.diffTop1 === 0 ? (
                        <span className={`font-black px-2 py-0.5 rounded border ${
                          isDark
                            ? 'text-[#e879f9] bg-teal-500/10 border-teal-500/30'
                            : 'text-[#9333ea] bg-teal-50 border-teal-200'
                        }`}>
                          Top 1
                        </span>
                      ) : (
                        <span className={isDark ? 'text-slate-400' : 'text-[#64748B]'}>
                          -{p.diffTop1.toLocaleString('vi-VN')}
                        </span>
                      )}
                    </td>

                    {/* Cycle Change */}
                    <td className="py-3.5 px-3.5 text-center whitespace-nowrap font-mono">
                      {p.change1h > 0 ? (
                        <span className={`font-bold text-xs px-1.5 py-0.5 rounded border ${
                          isDark
                            ? 'text-teal-400 bg-teal-500/15 border-teal-500/30'
                            : 'text-[#9333ea] bg-teal-50 border-teal-200'
                        }`}>
                          +{p.change1h}
                        </span>
                      ) : (
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className={`py-14 text-center ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                  <p className="text-sm font-semibold">Không tìm thấy đề tài nào phù hợp với bộ lọc tìm kiếm.</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Thử xóa từ khóa hoặc chọn hiển thị tất cả các trang.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className={`p-4 xl:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
        isDark
          ? 'border-slate-800 text-slate-400 bg-slate-900/40'
          : 'border-[#E2E8F0] text-[#64748B] bg-slate-50/60'
      }`}>
        <div>
          Hiển thị{' '}
          <strong className={isDark ? 'text-slate-200' : 'text-[#0F172A]'}>
            {sortedProjects.length > 0 ? (currentPage - 1) * actualPageSize + 1 : 0}
          </strong>{' '}
          đến{' '}
          <strong className={isDark ? 'text-slate-200' : 'text-[#0F172A]'}>
            {Math.min(currentPage * actualPageSize, sortedProjects.length)}
          </strong>{' '}
          trong tổng số <strong className={isDark ? 'text-slate-200' : 'text-[#0F172A]'}>{sortedProjects.length}</strong> đề tài
        </div>

        {pageSize !== 'all' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all ${
                currentPage === 1
                  ? isDark
                    ? 'opacity-40 cursor-not-allowed border-slate-800'
                    : 'opacity-40 cursor-not-allowed border-[#E2E8F0] bg-white'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 active:scale-95'
                  : 'bg-white hover:bg-slate-100 border-[#E2E8F0] text-[#0F172A] active:scale-95'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Trang trước</span>
            </button>
            
            <span className={`px-2.5 py-1 font-mono font-bold rounded-lg border text-xs ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                : 'bg-white border-[#E2E8F0] text-[#0F172A]'
            }`}>
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all ${
                currentPage === totalPages
                  ? isDark
                    ? 'opacity-40 cursor-not-allowed border-slate-800'
                    : 'opacity-40 cursor-not-allowed border-[#E2E8F0] bg-white'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 active:scale-95'
                  : 'bg-white hover:bg-slate-100 border-[#E2E8F0] text-[#0F172A] active:scale-95'
              }`}
            >
              <span>Trang sau</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
