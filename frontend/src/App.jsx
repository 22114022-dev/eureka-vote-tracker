import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HeroKpiCards from './components/HeroKpiCards';
import VoteShareDonut from './components/VoteShareDonut';
import Top5BarChart from './components/Top5BarChart';
import HeadToHeadRadar from './components/HeadToHeadRadar';
import LeaderboardTable from './components/LeaderboardTable';
import TeamPickerModal from './components/TeamPickerModal';
import FieldSwitch from './components/FieldSwitch';
import { FIELDS, DEFAULT_FIELD, NEUTRAL_TEAM } from './fields';

const PORTAL_BASE = 'https://binhchon.khoahoctre.com.vn/c/eureka-2026';
import { AlertTriangle, Bell, BellOff, Sprout } from 'lucide-react';

function loadTeam(fieldKey) {
  const fallback = FIELDS[fieldKey].defaultTeam;
  try {
    // KHNN kept the pre-multi-field key, so existing viewers keep their choice
    return (
      localStorage.getItem(`eureka_team_${fieldKey}`) ||
      (fieldKey === 'KHNN' ? localStorage.getItem('eureka_team') : null) ||
      fallback
    );
  } catch {
    return fallback;
  }
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('eureka_theme') || 'dark';
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('eureka_sidebar') === 'collapsed';
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isTeamPickerOpen, setIsTeamPickerOpen] = useState(false);
  // Field (lĩnh vực) and home team are chosen per viewer and remembered in this browser
  const [fieldKey, setFieldKey] = useState(() => {
    try {
      const saved = localStorage.getItem('eureka_field');
      return FIELDS[saved] ? saved : DEFAULT_FIELD;
    } catch {
      return DEFAULT_FIELD;
    }
  });
  const field = FIELDS[fieldKey];
  const DEFAULT_TEAM = field.defaultTeam;
  const [team, setTeam] = useState(() => loadTeam(fieldKey));
  const neutral = team === NEUTRAL_TEAM;
  // Ignore responses that arrive after the viewer switched to another field
  const fieldRef = useRef(fieldKey);
  fieldRef.current = fieldKey;
  const [soundAlertEnabled, setSoundAlertEnabled] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Audio alert beep
  const playAlertSound = useCallback(() => {
    if (!soundAlertEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio playback not allowed:", e);
    }
  }, [soundAlertEnabled]);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const requestedField = fieldKey;
      const query = `?field=${requestedField}&team=${encodeURIComponent(team)}`;
      const endpoint = (isManual ? '/api/refresh' : '/api/leaderboard') + query;
      const method = isManual ? 'POST' : 'GET';
      const res = await fetch(endpoint, { method });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      const data = isManual ? json.data : json;
      if (fieldRef.current !== requestedField) return;
      if (!data.targetProject) throw new Error('Dữ liệu lĩnh vực chưa sẵn sàng');
      setDashboardData(data);
      setCountdown(data.nextScrapeIn || 60);
      setErrorMsg('');

      // Play alert sound if gap is close (< 50)
      if (data.gapTracker?.isClose && data.gapTracker?.isAhead && !data.neutral) {
        playAlertSound();
      }
    } catch (err) {
      console.error("Fetch error:", err);
      if (fieldRef.current === fieldKey) {
        setErrorMsg("Không thể kết nối đến máy chủ backend. Vui lòng kiểm tra cổng 5000.");
      }
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, [playAlertSound, team, fieldKey]);

  // Initial load
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Refresh vote history whenever the dashboard data changes
  const lastUpdated = dashboardData?.lastUpdated;
  useEffect(() => {
    if (!lastUpdated) return;
    const requestedField = fieldKey;
    fetch(`/api/history?field=${requestedField}&team=${encodeURIComponent(team)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((json) => {
        if (fieldRef.current === requestedField) setHistory(json.history || []);
      })
      .catch((err) => console.error('History fetch error:', err));
  }, [lastUpdated, team, fieldKey]);

  // Expose the sticky header height so the pinned KPI row can sit right below it
  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;
    const sync = () =>
      document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // Height of the pinned KPI row, so anchored sections land just below it
  const hasData = !!dashboardData;
  useEffect(() => {
    const kpi = document.getElementById('tong-quan');
    if (!kpi) return;
    const sync = () =>
      document.documentElement.style.setProperty('--kpi-h', `${kpi.offsetHeight}px`);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(kpi);
    return () => observer.disconnect();
  }, [hasData]);

  useEffect(() => {
    document.title = `Euréka 2026 — Bảng Xếp Hạng Bình Chọn ${field.name} (Real-Time Tracker)`;
  }, [field.name]);

  // Sync theme class to html/document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // 1-second countdown timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchDashboard(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchDashboard]);

  const handleSelectField = (key) => {
    if (key === fieldKey) return;
    setFieldKey(key);
    setTeam(loadTeam(key));
    // Drop the other field's data so it never shows under the new field's name
    setDashboardData(null);
    setHistory([]);
    setErrorMsg('');
    setLoading(true);
    try {
      localStorage.setItem('eureka_field', key);
    } catch {
      // storage unavailable: the choice only lasts for this visit
    }
  };

  const handleSelectTeam = (code) => {
    setTeam(code);
    try {
      localStorage.setItem(`eureka_team_${fieldKey}`, code);
    } catch {
      // storage unavailable: the choice only lasts for this visit
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('eureka_theme', nextTheme);
  };

  // Show / hide the desktop sidebar
  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('eureka_sidebar', next ? 'collapsed' : 'open');
  };

  const isDark = theme === 'dark';
  // The portal link opens the home team's voting page (seed data has no entry id)
  const targetId = dashboardData?.targetProject?.id;
  const portalUrl = `${PORTAL_BASE}/${field.portalSlug}`;
  const voteUrl = targetId ? `${portalUrl}/${targetId}` : portalUrl;

  return (
    <div className={`min-h-screen transition-colors duration-200 font-sans ${
      isDark ? 'text-slate-100' : 'text-[#0F172A]'
    }`}>
      <Sidebar
        countdown={countdown}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchDashboard(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenTeamPicker={() => setIsTeamPickerOpen(true)}
        voteUrl={voteUrl}
        ready={!!dashboardData}
        collapsed={sidebarCollapsed}
        onCollapse={toggleSidebar}
      />

      <div className={`transition-[padding] duration-300 ${sidebarCollapsed ? '' : 'lg:pl-64'}`}>
      {/* Top Banner Alert when gap is under 50 */}
      {dashboardData?.gapTracker?.isClose && dashboardData?.gapTracker?.isAhead && !dashboardData?.neutral && (
        <div className={`py-2.5 px-4 text-xs font-semibold flex items-center justify-between transition-colors border-b shadow-sm ${
          dashboardData.gapTracker.alertLevel === 'danger'
            ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
            : isDark
            ? 'bg-amber-500 text-slate-950 border-amber-600'
            : 'bg-amber-500 text-slate-950 border-amber-600'
        }`}>
          <div className="w-full max-w-[96%] 2xl:max-w-[1860px] mx-auto flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>CẢNH BÁO BÌNH CHỌN:</strong> Đối thủ <strong>{dashboardData.gapTracker.nearestCompetitor?.code}</strong> đang bám đuổi rất sát! Cách biệt hiện tại chỉ còn <strong>{dashboardData.gapTracker.gap} phiếu</strong>.
              </span>
            </div>
            
            <button
              onClick={() => setSoundAlertEnabled(!soundAlertEnabled)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold bg-black/15 hover:bg-black/25 text-inherit transition-colors shrink-0"
            >
              {soundAlertEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
              <span>{soundAlertEnabled ? 'Chuông: BẬT' : 'Bật âm báo'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <Header
        countdown={countdown}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchDashboard(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenTeamPicker={() => setIsTeamPickerOpen(true)}
        teamCode={dashboardData?.targetProject?.code || team}
        neutral={neutral}
        fieldKey={fieldKey}
        fieldName={field.name}
        gapTracker={dashboardData?.gapTracker}
        lastUpdated={dashboardData?.lastUpdated}
        votingEnd={dashboardData?.votingEnd}
        voteUrl={voteUrl}
        sidebarCollapsed={sidebarCollapsed}
        onExpandSidebar={toggleSidebar}
      />

      {/* Main Content Area */}
      <main className="w-full max-w-[96%] 2xl:max-w-[1860px] mx-auto px-3 sm:px-5 lg:px-6 py-6 lg:py-7">
        
        {/* Error notification if backend is offline */}
        {errorMsg && (
          <div className={`mb-6 p-4 rounded-xl border text-xs flex items-center justify-between ${
            isDark
              ? 'bg-red-500/15 border-red-500/40 text-red-300'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <span className="font-medium">{errorMsg}</span>
            <button
              onClick={() => fetchDashboard(true)}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        <FieldSwitch fieldKey={fieldKey} onSelect={handleSelectField} theme={theme} />

        {/* Loading Skeleton or Main Dashboard */}
        {loading && !dashboardData ? (
          <div className="py-32 text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#9333ea] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className={`text-base font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Đang kết nối cổng dữ liệu thời gian thực Euréka 2026...
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Đồng bộ {field.pages} trang bình chọn lĩnh vực {field.name}
            </p>
          </div>
        ) : (
          <>
            {/* 1. Hero KPI Cards */}
            <section
              id="tong-quan"
              className={`xl:sticky xl:top-[var(--header-h,76px)] z-30 -mx-3 sm:-mx-5 lg:-mx-6 px-3 sm:px-5 lg:px-6 pt-3 backdrop-blur-xl ${
                isDark ? 'bg-[#14152b]/90' : 'bg-slate-50/90'
              }`}
            >
              <HeroKpiCards
                targetProject={dashboardData?.targetProject}
                gapTracker={dashboardData?.gapTracker}
                velocity={dashboardData?.velocity}
                overview={dashboardData?.overview}
                theme={theme}
                neutral={neutral}
              />
            </section>

            {/* Race trend + vote share */}
            {/* 2. Main Visualization Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6 mb-6 items-stretch">
              {/* Left Column: Horizontal Bar Chart - Top 5 */}
              <div id="bieu-do" className="xl:col-span-7 flex flex-col scroll-anchor">
                <Top5BarChart
                  top5={dashboardData?.top5}
                  theme={theme}
                  lastUpdated={dashboardData?.lastUpdated}
                  history={history}
                  teamCode={dashboardData?.targetProject?.code}
                  neutral={neutral}
                />
              </div>

              {/* Right Column: Head-to-Head Battle & Chasing Pack */}
              <div id="so-keo" className="hidden md:flex xl:col-span-5 flex-col scroll-anchor">
                <HeadToHeadRadar
                  headToHead={dashboardData?.headToHead}
                  chasingPack={dashboardData?.chasingPack}
                  gapTracker={dashboardData?.gapTracker}
                  theme={theme}
                />
              </div>
            </div>

            {/* Vote share */}
            <section id="dien-bien" className="mb-6 scroll-anchor">
              <VoteShareDonut projects={dashboardData?.projects} theme={theme} />
            </section>

            {/* 3. Detailed Leaderboard Table */}
            <section id="bang-xep-hang" className="scroll-anchor">
              <LeaderboardTable
                key={fieldKey}
                pages={field.pages}
                fieldKey={fieldKey}
                projects={dashboardData?.projects}
                targetProject={dashboardData?.targetProject}
                theme={theme}
              />
            </section>
          </>
        )}

      </main>

      {/* Home team picker */}
      <TeamPickerModal
        isOpen={isTeamPickerOpen}
        onClose={() => setIsTeamPickerOpen(false)}
        projects={dashboardData?.projects}
        team={neutral ? NEUTRAL_TEAM : dashboardData?.targetProject?.code || team}
        defaultTeam={DEFAULT_TEAM}
        key={fieldKey}
        onSelect={handleSelectTeam}
        theme={theme}
      />

      {/* Footer */}
      <footer className={`border-t py-6 mt-12 text-xs transition-colors ${
        isDark
          ? 'bg-slate-900/60 border-slate-800 text-slate-400'
          : 'bg-white border-[#E2E8F0] text-[#64748B]'
      }`}>
        <div className="w-full max-w-[96%] 2xl:max-w-[1860px] mx-auto px-3 sm:px-5 lg:px-6 flex items-center justify-center gap-2 text-center">
          <Sprout className="w-4 h-4 text-[#9333ea] shrink-0" />
          <span>
            <strong className={isDark ? 'text-slate-200' : 'text-[#0F172A]'}>Euréka 2026 Live Vote Tracker</strong> — Chuyên đề {field.name}
          </span>
        </div>
      </footer>
      </div>

    </div>
  );
}
