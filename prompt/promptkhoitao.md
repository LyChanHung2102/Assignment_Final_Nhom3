#Các prompt đầu tiên dùng để tạo ra MVP 
Prompt 1: Khởi tạo Cấu trúc & Giao diện Khung sườn (UI/UX & Glassmorphism)Hãy bắt đầu task đầu tiên: Khởi tạo cấu trúc thư mục và giao diện khung sườn (Shell/Layout) cho ứng dụng FitVN Tracker.

1. **Implementation Plan:** Trình bày danh sách file sẽ tạo (index.html, css/style.css, css/glass.css, js/app.js, js/storage.js) và bố cục giao diện.
2. **Options Before Changes:** Đưa ra 2 phương án thiết kế Navigation Bar cho Mobile (Phương án A: Tab bar cố định ở đáy màn hình tối ưu 1 tay; Phương án B: Sidebar trượt bên trái). Khuyên chọn phương án tối ưu nhất cho gymer.
3. **Yêu cầu kỹ thuật:** 
   - Giao diện Dark Mode, phong cách Glassmorphism (backdrop-filter, hiệu ứng mờ kính sang trọng).
   - Bố cục mobile-first, responsive hoàn hảo.
   - Viết sẵn khung HTML cho 4 tab chính: Trang chủ (Dashboard), Nhật ký ăn uống (Food Log), Theo dõi cân nặng (Body Weight), và Cài đặt cá nhân (Settings).

Hãy lập kế hoạch và chờ tôi duyệt trước khi viết code.

Prompt 2: Xây dựng Module Dinh dưỡng & Kho món ăn Việt Nam (Food Logging & Quick Add)
Tiếp tục phát triển Module 1 & 2: Kho dữ liệu món ăn Việt Nam và Ghi chép thực phẩm siêu tốc.

1. **Implementation Plan:** Liệt kê các hàm xử lý trong `js/app.js` và cấu trúc dữ liệu JSON lưu trong `js/storage.js`.
2. **Options Before Changes:** Đưa ra 2 cách xây dựng Kho dữ liệu món ăn mẫu (Cách 1: Hardcode mảng object JS tĩnh trong file riêng; Cách 2: Tải động qua fetch file JSON cục bộ). Đưa ra ưu/nhược điểm.
3. **Yêu cầu tính năng:**
   - Kho dữ liệu có sẵn các món: Cơm tấm sườn bì, Phở bò, Bún bò Huế, Bánh mì thịt, Ức gà luộc, Khoai lang... kèm chỉ số Calo, Protein, Carb, Fat chính xác.
   - Tính năng **Quick Add 1-tap** và tìm kiếm món ăn nhanh theo từ khóa (dùng `Array.filter`).
   - Tính năng **Barcode Scanner giả lập**: Nhập mã barcode hoặc chọn nhanh các sản phẩm whey, sữa hạt phổ biến tại siêu thị Việt Nam để log ngay lập tức.
   - Lưu trữ toàn bộ dữ liệu log trong `localStorage` để dữ liệu không bị mất khi F5.

Hãy trình bày kế hoạch triển khai và phương án trước khi viết code.

Prompt 3: Xây dựng Module Cân nặng & Đường trung bình động 7 ngày (Weight Moving Average & Chart)
Phát triển Module 3: Theo dõi cân nặng, chỉ số cơ thể và biểu đồ đường trung bình động (Weight Moving Average).

1. **Implementation Plan:** Liệt kê logic tính toán toán học cho đường trung bình động 7 ngày và cách render biểu đồ.
2. **Options Before Changes:** Đưa ra 2 lựa chọn thư viện/cách vẽ biểu đồ (Lựa chọn 1: Sử dụng HTML5 Canvas thuần tự code logic vẽ đường line; Lựa chọn 2: Sử dụng thư viện nhẹ nhàng qua CDN như Chart.js). Đánh giá ưu/nhược điểm về độ mượt và điểm số kỹ thuật.
3. **Yêu cầu tính năng:**
   - Form nhập cân nặng hàng ngày + tỷ lệ mỡ (Body Fat %) + ghi chú nhanh.
   - Thuật toán tính **Đường trung bình động 7 ngày** (7-day moving average) để lọc bỏ nhiễu do dao động nước, giúp người dùng không bị áp lực tâm lý.
   - Hiển thị trực quan qua biểu đồ xu hướng và danh sách lịch sử số đo các nhóm cơ (ngực, eo, đùi, bắp tay...).

Hãy trình bày kế hoạch và phương án lựa chọn.

Prompt 4: Hoàn thiện Dashboard Tổng quan, Widget & Kiểm tra tổng thể (Refactoring & Polish)
Hoàn thiện dự án với Module 4: Dashboard tổng quan, Widget tóm tắt calo và tối ưu hóa toàn bộ code.

1. **Implementation Plan:** Liệt kê các thành phần cần tích hợp trên trang Dashboard (vòng tròn tiến độ calo, thanh macro protein/carb/fat, widget tóm tắt nhanh).
2. **Options Before Changes:** Không có nhiều nhánh rẽ, tập trung vào phương án tối ưu DOM render hiệu quả nhất (dùng DocumentFragment hoặc Template literals sạch sẽ).
3. **Yêu cầu kiểm tra & Hoàn thiện:**
   - Kiểm tra toàn bộ code JavaScript, đảm bảo không có lỗi `console.error` hay memory leak.
   - Kiểm tra tính năng Responsive trên các thiết bị di động khác nhau.
   - Viết phần `README.md` chuyên nghiệp giải thích kiến trúc thư mục, danh sách Prompt đã sử dụng (đáp ứng tiêu chí Vibe Coding trong bảng Rubric) và hướng dẫn sử dụng app.

Hãy tổng hợp và hoàn thiện toàn bộ mã nguồn sạch sẽ cho dự án.


