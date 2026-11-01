# 🌾 Euréka 2026 — KHNN Live Vote Tracker (Official REST API Integration)
> Hệ thống web real-time chuyên dụng theo dõi bảng xếp hạng bình chọn Khoa học Nông nghiệp (`categoryId=6`) tại Giải thưởng Euréka 2026, kết nối trực tiếp đến hệ thống cổng bình chọn chính thức để giám sát và cảnh báo bảo vệ vị thế dẫn đầu của đề tài **KHNN2026-002**.

---

## ⚡ Cổng Dữ Liệu Chính Thức (Official Real-Time REST API)

Thay vì cào trang web HTML nặng nề (Playwright/Selenium), backend kết nối trực tiếp đến 3 endpoint REST API chính thức của Euréka với cơ chế đa luồng song song:
- **Trang 1:** `https://binhchon.khoahoctre.com.vn/api/c/eureka-2026/entries?categoryId=6&page=1&pageSize=24`
- **Trang 2:** `https://binhchon.khoahoctre.com.vn/api/c/eureka-2026/entries?categoryId=6&page=2&pageSize=24`
- **Trang 3:** `https://binhchon.khoahoctre.com.vn/api/c/eureka-2026/entries?categoryId=6&page=3&pageSize=24`

Backend sử dụng `concurrent.futures.ThreadPoolExecutor(max_workers=3)` kết hợp session connection pooling để kéo toàn bộ 63 đề tài trên 3 trang đồng thời chỉ trong **< 300 - 600ms**, chuẩn hóa JSON schema và tính toán các chỉ số phái sinh (thứ hạng, độ lệch, tốc độ tăng trưởng, cảnh báo nguy cấp).

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

- **Frontend:** React 19 + Vite + TailwindCSS v4 + Chart.js (`react-chartjs-2`) + Lucide Icons.
- **Backend (CORS Proxy & Aggregator):** Python 3 + Flask + Flask-CORS + `ThreadPoolExecutor` + `requests` + `APScheduler` (Background scheduler quét định kỳ 60s) + Upstash Redis cache (tự động chuyển sang In-Memory Cache an toàn khi không có Redis).
- **Typography:** `Segoe UI`, system-ui, sans-serif (hỗ trợ hoàn hảo bảng mã tiếng Việt UTF-8).
- **Design System & Bảng màu:**
  - Chế độ **Dark / Light Mode Toggle** (Mặc định Dark Mode phong cách Trung tâm Giám sát Live Ops `#0F172A`).
  - Màu nhận diện đề tài nhà `KHNN2026-002`: `#00712D` (Deep Forest Green) & `#6BBD3F` (Vibrant Leaf Green).
  - Màu cảnh báo khoảng cách nguy hiểm (< 50 phiếu): Hổ phách `#F59E0B` & Đỏ `#EF4444` hiệu ứng nhấp nháy (pulsing alert).
  - Màu đối thủ cạnh tranh: Xanh lam / Slate trung tính (`#3B82F6` / `#475569`) giúp `KHNN2026-002` luôn nổi bật nhất trên biểu đồ.

---

## 🌟 Tính Năng Nổi Bật

1. **Header Bar Giám Sát Thời Gian Thực:**
   - Huy hiệu `Official API Live` + hiển thị thời gian phản hồi API tính bằng mili-giây (⚡ `~300ms`).
   - Đèn trạng thái radar xanh nhấp nháy + thông báo "Cập nhật tự động mỗi 60s".
   - Bộ đếm ngược Countdown 60s trực quan tự động kích hoạt chu kỳ quét mới.
   - Nút **"Làm mới ngay" (Manual Refresh)** để gọi ngay lập tức 3 luồng API đồng thời.
   - Nút chuyển đổi giao diện **Sáng / Tối (Dark / Light Theme)**.
   - Nút mở bảng điều khiển **"Thử nghiệm" (Live Simulation Modal)** để test kịch bản bám đuổi và kiểm tra hệ thống cảnh báo.
   - Link trực tiếp tới cổng bình chọn gốc `https://binhchon.khoahoctre.com.vn/c/eureka-2026/KHNN`.

2. **Bộ 4 Hero KPI Cards:**
   - **Card 1 (Vị trí hiện tại):** Hạng **#1** với số phiếu thực tế, vương miện vàng và huy hiệu đề tài AI vườn ươm.
   - **Card 2 (Khoảng cách an toàn - Gap Tracker):** Tính toán động `Votes(KHNN2026-002) - Votes(Đối thủ gần nhất)`. Kèm huy hiệu nhấp nháy **"Đang bám đuổi rất sát!"** (nếu gap < 50 phiếu) và thanh đo an toàn (`<25` nguy cấp đỏ, `<50` cảnh báo hổ phách, `≥50` an toàn).
   - **Card 3 (Tốc độ tăng trưởng - Vote Velocity):** Đo lường số phiếu tăng thêm trong 5 phút và chu kỳ quét gần nhất (`+X phiếu / 5 phút`).
   - **Card 4 (Tổng quan toàn ngành):** Thống kê tổng 63 đề tài trên 3 trang (`categoryId=6`), tổng số phiếu toàn ngành, tỷ trọng phiếu của KHNN2026-002.

3. **Khu Vực Trực Quan Hóa Chính (2 Cột Desktop):**
   - **Cột Trái (Biểu đồ ngang Top 5):** Biểu đồ cột ngang Chart.js trực quan hóa 5 đề tài dẫn đầu. Riêng `KHNN2026-002` được phủ dải màu xanh lá cây đặc trưng `#6BBD3F`, viền xanh đậm `#00712D` và ngôi sao nổi bật.
   - **Cột Phải (So Kèo Trực Diện & Nhóm Bám Đuổi):**
     - Thanh Tug-of-War đối đầu 1-1 giữa `#1 KHNN2026-002` và `#2 KHNN2026-054` hiển thị tỷ lệ % thị phần phiếu.
     - Radar cảnh báo sớm Top 6 - Top 8 (`KHNN2026-058`, `KHNN2026-052`, `KHNN2026-016`) kèm khoảng cách cần rút ngắn để lọt vào Top 5.

4. **Bảng Xếp Hạng Chi Tiết Toàn Bộ 63 Đề Tài:**
   - Đầy đủ các cột: `Hạng`, `Mã đề tài`, `Tên đề tài`, `Nhóm tác giả`, `Trang`, `Lượt bình chọn`, `Chênh lệch với Top 1`, `Biến động`.
   - Hàng của `KHNN2026-002` được làm nổi bật với viền xanh, nền phát sáng nhẹ và huy hiệu **"Đề tài của bạn ⭐"**.
   - Tìm kiếm nhanh tức thì theo mã đề tài, tên công trình hoặc tên thành viên nhóm tác giả.
   - Bộ lọc theo Trang (Tất cả, Top 5, Trang 1, Trang 2, Trang 3).
   - Sắp xếp tăng/giảm theo từng cột.
   - Nút **Xuất file Excel/CSV** để báo cáo tiến độ cho giảng viên hướng dẫn hoặc lưu trữ.

---

## 🛠️ Hướng Dẫn Khởi Chạy

### Cách 1: Chạy Server Trọn Gói (Khuyến nghị)
```bash
# Di chuyển vào thư mục dự án
cd d:\MSI\Eureka

# Khởi chạy server Flask (cổng 5000)
python backend/app.py
```
👉 Mở trình duyệt tại: **`http://localhost:5000`**

### Cách 2: Khởi Chạy 1-Click
Nhấp đúp chuột vào file:
👉 **[`start.bat`](file:///d:/MSI/Eureka/start.bat)**
