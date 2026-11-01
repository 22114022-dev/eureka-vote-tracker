import React, { useState } from 'react';
import { X, RotateCcw, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function SimulateModal({
  isOpen,
  onClose,
  targetProject,
  runnerUp,
  onSimulateVote,
  onResetData,
  theme
}) {
  const isDark = theme === 'dark';
  const [customCode, setCustomCode] = useState('KHNN2026-054');
  const [customAmount, setCustomAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  if (!isOpen) return null;

  const handleQuickAdd = async (code, amount) => {
    setLoading(true);
    setMsg('');
    const res = await onSimulateVote(code, amount);
    setLoading(false);
    if (res?.success) {
      setMsg(`✅ ${res.message}`);
    } else {
      setMsg(`❌ Lỗi khi thực hiện.`);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customCode || !customAmount) return;
    setLoading(true);
    setMsg('');
    const res = await onSimulateVote(customCode, parseInt(customAmount, 10));
    setLoading(false);
    if (res?.success) {
      setMsg(`✅ ${res.message}`);
    }
  };

  const handleReset = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đặt lại toàn bộ số phiếu về dữ liệu ban đầu?")) {
      setLoading(true);
      await onResetData();
      setLoading(false);
      setMsg('✅ Đã khôi phục dữ liệu ban đầu!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all ${
        isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-[#E2E8F0] text-[#0F172A]'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between pb-3 mb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-[#E2E8F0]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isDark
                ? 'bg-teal-500/15 text-[#e879f9] border-teal-500/30'
                : 'bg-teal-50 text-[#9333ea] border-teal-200'
            }`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Thử Nghiệm Biến Động Số Phiếu (Live Simulation)</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                Kiểm tra cơ chế cảnh báo khoảng cách an toàn & tốc độ bình chọn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {msg && (
          <div className={`mb-4 p-2.5 rounded-lg text-xs font-semibold border ${
            isDark
              ? 'bg-teal-500/15 border-teal-500/30 text-teal-300'
              : 'bg-teal-50 border-teal-200 text-[#9333ea]'
          }`}>
            {msg}
          </div>
        )}

        {/* Quick Test Scenarios */}
        <div className="space-y-3 mb-5">
          <label className={`text-xs font-bold uppercase tracking-wider block ${
            isDark ? 'text-slate-400' : 'text-[#64748B]'
          }`}>
            Kịch Bản Thử Nghiệm Nhanh
          </label>

          {/* Test 1: Add +10 to runner-up */}
          <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
            isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-[#E2E8F0]'
          }`}>
            <div>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${
                isDark ? 'text-amber-400' : 'text-amber-700'
              }`}>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Kịch bản: Đối thủ bám sát nguy hiểm</span>
              </div>
              <p className={`text-[12px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                Tăng <strong className={isDark ? 'text-white' : 'text-[#0F172A]'}>+10 phiếu</strong> cho KHNN2026-054 (thu hẹp khoảng cách xuống dưới 20 phiếu).
              </p>
            </div>
            <button
              onClick={() => handleQuickAdd('KHNN2026-054', 10)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border shrink-0 transition-colors ${
                isDark
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300'
              }`}
            >
              +10 Phiếu Top 2
            </button>
          </div>

          {/* Test 2: Add +30 to KHNN2026-002 */}
          <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
            isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-[#E2E8F0]'
          }`}>
            <div>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${
                isDark ? 'text-teal-400' : 'text-[#9333ea]'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Kịch bản: Nới rộng khoảng cách an toàn</span>
              </div>
              <p className={`text-[12px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                Tăng <strong className={isDark ? 'text-white' : 'text-[#0F172A]'}>+30 phiếu</strong> cho đề tài nhà KHNN2026-002 (vượt ngưỡng an toàn 50+ phiếu).
              </p>
            </div>
            <button
              onClick={() => handleQuickAdd('KHNN2026-002', 30)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#9333ea] hover:bg-[#7e22ce] text-white shrink-0 transition-colors shadow-sm"
            >
              +30 Phiếu KHNN-002
            </button>
          </div>
        </div>

        {/* Custom Input */}
        <form onSubmit={handleCustomSubmit} className="mb-5">
          <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${
            isDark ? 'text-slate-400' : 'text-[#64748B]'
          }`}>
            Tùy Chỉnh Số Phiếu Bất Kỳ
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Mã đề tài (e.g. KHNN2026-002)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs border outline-none font-mono ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-white border-[#E2E8F0] text-[#0F172A] placeholder-slate-400 focus:border-[#9333ea]'
              }`}
            />
            <input
              type="number"
              min="1"
              max="500"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className={`w-20 px-3 py-2 rounded-lg text-xs border outline-none font-mono ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-[#E2E8F0] text-[#0F172A] focus:border-[#9333ea]'
              }`}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Cộng phiếu
            </button>
          </div>
        </form>

        {/* Reset button & Close */}
        <div className={`pt-3 border-t flex items-center justify-between ${
          isDark ? 'border-slate-800' : 'border-[#E2E8F0]'
        }`}>
          <button
            onClick={handleReset}
            disabled={loading}
            className={`flex items-center gap-1.5 text-xs transition-colors font-medium ${
              isDark ? 'text-red-400 hover:text-red-300' : 'text-rose-600 hover:text-rose-700'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục dữ liệu ban đầu</span>
          </button>

          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200 border-[#E2E8F0] text-[#0F172A]'
            }`}
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
