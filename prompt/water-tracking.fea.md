# Feature Prompt: Theo Dõi Lượng Nước Với Biểu Tượng Cốc Nước (Water Hydration Tracker)

## 1. Mục tiêu Feature
Xây dựng thành phần widget theo dõi lượng nước uống hàng ngày trên giao diện Dashboard của ứng dụng FitVN Tracker. Giao diện trực quan hóa lượng nước bằng các biểu tượng cốc nước (mỗi cốc tương đương 250ml), vòng tròn tiến độ (Circular Progress Ring) kèm nút cộng nhanh, và menu tùy chọn tinh tế theo đúng thiết kế mẫu.

## 2. Phạm vi chức năng
- **Hiển thị lượng nước**:
  - Tiêu đề mục "Nước uống" (hoặc Water).
  - Lượng nước đã uống hôm nay hiển thị kích thước lớn (đơn vị ml, kèm phụ trợ oz nếu cần).
  - Hiển thị mục tiêu nước trong ngày (Goal: X ml) đọc trực tiếp từ hồ sơ người dùng (`localStorage`), không hardcode.
- **Biểu tượng cốc nước (Dynamic Cups)**:
  - Mỗi cốc tượng trưng cho dung tích `250 ml`.
  - Tổng số cốc cần uống được tính toán động dựa vào mục tiêu: `Math.ceil(waterTarget / 250)`.
  - Trạng thái từng cốc:
    - **Cốc đầy (Filled)**: Mực nước 100%, màu xanh ngọc bích nước biển mát mắt.
    - **Cốc dở dang (Partial)**: Thể hiện đúng mức nước thực tế theo tỷ lệ phần trăm dư (ví dụ 100ml / 250ml = 40%).
    - **Cốc kế tiếp có icon `+` (Next Cup)**: Mờ nhẹ kèm dấu `+` để người dùng chạm vào là hoàn thành ngay cốc đó (+250ml).
    - **Cốc chưa uống (Empty)**: Viền cốc trong suốt tinh tế.
    - **Cốc vượt mục tiêu (Overflow)**: Khi uống vượt mục tiêu, tự động bổ sung thêm cốc mới với hiệu ứng hoàn thành xuất sắc.
- **Vòng tròn tiến độ & Nút cộng nhanh (+)**:
  - Vòng tròn SVG hiển thị phần trăm hoàn thành chỉ tiêu nước trong ngày.
  - Nút tròn ở tâm chứa dấu `+`, cho phép chạm 1 lần để tăng nhanh 250ml (1 cốc).
- **Tùy chọn nhanh (...)**:
  - Menu 3 chấm ở góc dưới cho phép người dùng:
    - Đặt lại lượng nước hôm nay về 0ml.
    - Tùy chỉnh nhanh mục tiêu nước (2,000ml / 2,500ml / 3,000ml / Tự nhập).

## 3. Yêu cầu UI/UX
- Phong cách Glassmorphism hài hòa với giao diện FitVN Tracker hiện tại.
- Responsive hoàn hảo trên mobile, tablet và desktop.
- Hiệu ứng chuyển động mượt mà khi tăng/giảm nước (smooth water fill transition).
- Tương tác chạm thân thiện (Mobile Touch Friendly).

## 4. Mô hình dữ liệu
- Lưu trữ trong `localStorage` qua `storageService`:
  - `STORAGE_KEYS.WATER_LOGS`: `{ 'YYYY-MM-DD': amountInMl }`
  - `STORAGE_KEYS.USER_PROFILE`: `{ waterTarget: 3000, ... }`
- Hằng số cấu hình:
  - `CUP_CAPACITY_ML = 250`
  - Không hardcode các giá trị hiển thị hay số lượng cốc.

## 5. Luồng hoạt động
1. Khi tải trang, `DashboardModule.renderWater()` đọc `waterTarget` và `currentWater`.
2. Tính toán tỷ lệ phần trăm và số lượng cốc tương ứng.
3. Render danh sách các cốc nước SVG vào vùng chứa `#dash-water-cups-grid`.
4. Người dùng bấm vào nút `+` ở vòng tròn tiến độ hoặc bấm vào cốc nước:
   - Gọi `storageService.addWater(250)`.
   - Cập nhật số liệu hiển thị và re-render giao diện các cốc với hiệu ứng mượt.
   - Hiển thị Toast thông báo ngắn gọn.
5. Người dùng bấm menu `...` -> Chọn Đặt lại -> Đưa về 0ml.

## 6. Validation & Xử lý lỗi
- Lượng nước không được âm (`Math.max(0, current + amount)`).
- Mục tiêu nước luôn là số dương lớn hơn 0 (mặc định 2,500ml nếu chưa có).
- Xử lý mượt mà khi mục tiêu không chia hết cho 250ml.

## 7. Danh sách file bị ảnh hưởng
- `prompt/water-tracking.fea.md` (Tạo mới tài liệu)
- `index.html` (Cập nhật card widget Water)
- `css/style.css` (Thêm class CSS cho cốc nước, circular gauge button, menu)
- `js/app.js` (Nâng cấp DashboardModule xử lý render cốc nước và tương tác)
- `js/storage.js` (Tối ưu hóa các phương thức đọc/ghi)

## 8. Tiêu chí nghiệm thu
- Giao diện khớp với ảnh mẫu đính kèm.
- Mỗi cốc hiển thị và tính toán đúng 250ml.
- Không hardcode giá trị mục tiêu hay số cốc.
- Chạy mượt mà, không có lỗi console, hỗ trợ responsive tốt.
