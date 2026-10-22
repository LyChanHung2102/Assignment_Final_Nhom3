# Đặc Tả Tính Năng: Health Progress Charts (progress-charts.fea.md)

## 1. Mục Tiêu
Cung cấp màn hình chuyên sâu **Health Progress Charts (Biểu đồ tiến trình sức khỏe)** tại `Page/progress-charts.html` giúp người dùng:
- Phân tích xu hướng biến thiên của cân nặng và chỉ số khối cơ thể (BMI) theo các chu kỳ thời gian khác nhau (7 ngày, 30 ngày, 3 tháng, 6 tháng, 1 năm, toàn bộ thời gian).
- Đánh giá mức độ thay đổi tuyệt đối và phần trăm thay đổi trong kỳ được chọn.
- So sánh tiến trình giữa hai giai đoạn liền kề (Period Comparison) để nhận diện xu hướng thể chất một cách khách quan.
- Đối chiếu tiến độ hoàn thành mục tiêu cân nặng (tăng cân / giảm cân / duy trì).
- Tra cứu bảng dữ liệu lịch sử chi tiết có phân trang và nhận định dữ liệu tự động (Data Insights).

## 2. Đối Tượng Sử Dụng
- Người tập gym, người quản lý cân nặng và theo dõi sức khỏe dài hạn cần góc nhìn phân tích lịch sử sâu rộng thay vì chỉ xem tóm tắt trong ngày.

## 3. Yêu Cầu Chức Năng Chi Tiết

### 3.1. Header & Bộ Lọc Nâng Cao
- Tiêu đề: "Biểu Đồ Tiến Trình".
- Mô tả: "Theo dõi sự thay đổi và tiến trình sức khỏe theo thời gian".
- Bộ chọn khoảng thời gian: `7 ngày`, `30 ngày`, `3 tháng` (90 ngày), `6 tháng` (180 ngày), `1 năm` (365 ngày), `Toàn bộ`.
- Bộ lọc chỉ số (Metric Switcher):
  - **Cân nặng (kg)**
  - **Chỉ số BMI (kg/m²)**
- Hiển thị ngày bắt đầu và kết thúc của khoảng thời gian đang lọc (Ví dụ: `Từ 01/10/2026 đến 20/10/2026`).

### 3.2. Progress Summary Cards (5 Thẻ Thống Kê)
Tự động tính toán theo chỉ số và khoảng thời gian đang chọn:
1. **Giá trị đầu kỳ:** Bản ghi đầu tiên trong khoảng thời gian.
2. **Giá trị cuối kỳ:** Bản ghi gần nhất trong khoảng thời gian.
3. **Mức thay đổi tuyệt đối:** $\Delta = \text{End} - \text{Start}$.
4. **Phần trăm thay đổi:** $\% = \frac{\Delta}{\text{Start}} \times 100\%$.
5. **Xu hướng:** Tăng, Giảm, hoặc Duy trì ổn định kèm badge màu trực quan.

### 3.3. Main Progress Chart (Biểu Đồ Canvas Đa Chỉ Số)
- HTML5 Canvas thuần (Vanilla JavaScript, không thư viện ngoài).
- **Chế độ Cân nặng:**
  - Trục X: Ngày ghi nhận (DD/MM).
  - Trục Y: Cân nặng (kg).
  - Đường biểu diễn cân nặng thực tế kèm gradient nền mượt mà.
  - Các điểm dữ liệu tròn; làm nổi bật điểm đầu kỳ và cuối kỳ.
  - Đường tham chiếu mục tiêu nét đứt (Target Reference Line) nếu người dùng đã đặt mục tiêu.
  - Floating Tooltip khi hover/chạm: Ngày, Cân nặng, độ lệch so với mục tiêu, ghi chú.
- **Chế độ BMI:**
  - Trục X: Ngày ghi nhận.
  - Trục Y: Chỉ số BMI.
  - Đường xu hướng BMI qua các mốc thời gian.
  - Đường tham chiếu chuẩn y tế cho người trưởng thành: Ngưỡng 18.5 (Thiếu cân), 25.0 (Thừa cân), 30.0 (Béo phì).
  - Chú giải rõ ràng: BMI là chỉ số sàng lọc tham khảo, không phải chẩn đoán y tế.

### 3.4. Period Comparison (So Sánh Hai Giai Đoạn Liền Kề)
- So sánh chu kỳ hiện tại với chu kỳ tương ứng liền trước:
  - 7 ngày qua vs 7 ngày trước đó.
  - 30 ngày qua vs 30 ngày trước đó.
  - 3 tháng qua vs 3 tháng trước đó.
- Hiển thị: Giá trị trung bình/cuối kỳ của 2 giai đoạn, mức chênh lệch ($\Delta$), phần trăm thay đổi và nhận xét xu hướng.
- Xử lý khi giai đoạn trước không có bản ghi: Hiển thị trạng thái "Chưa đủ dữ liệu kỳ trước để đối chiếu".

### 3.5. Goal Progress (Đánh Giá Mục Tiêu)
- Cân nặng ban đầu, Cân nặng hiện tại, Cân nặng mục tiêu.
- Khoảng cách còn lại (kg) và % hoàn thành mục tiêu.
- Xử lý chính xác cả 2 chiều: Giảm cân (`cut`), Tăng cân (`lean_bulk`) và Duy trì (`maintain`).
- Trạng thái: Chưa bắt đầu, Đang tiến triển, Đã đạt mục tiêu.

### 3.6. Historical Data Table (Bảng Lịch Sử Có Phân Trang)
- Cột: Ngày ghi nhận, Cân nặng (kg), BMI, Thay đổi so với bản ghi trước, Ghi chú.
- Lọc theo khoảng thời gian đang chọn.
- Hỗ trợ đổi thứ tự sắp xếp (Mới nhất trước / Cũ nhất trước).
- Phân trang gọn gàng (Pagination 8 dòng/trang).

### 3.7. Data Insights (Nhận Xét Dữ Liệu Tự Động)
- Tổng hợp các kết luận từ số liệu:
  - Tốc độ thay đổi trung bình theo tuần/tháng.
  - Độ biến thiên lớn nhất / nhỏ nhất trong kỳ.
  - Tình trạng bám sát mục tiêu.
  - Cảnh báo khoa học: không kết luận tăng/giảm là tốt hay xấu khi chưa xét theo mục tiêu cá nhân.

### 3.8. Các Trạng Thái (States)
- **Loading:** Tải dữ liệu từ LocalStorage.
- **Empty:** Chưa có bản ghi cân nặng nào trong hệ thống.
- **No data in selected range:** Khoảng thời gian đã chọn không có bản ghi (ví dụ người dùng mới dùng 3 ngày nhưng chọn xem 1 năm).
- **Insufficient data:** Chỉ có 1 bản ghi (không đủ để tính biến thiên và so sánh kỳ).
- **Success:** Toàn bộ biểu đồ và thẻ thống kê hiển thị chuẩn xác.

## 4. UI/UX & Design Tokens
- Bảng màu **Jade & Porcelain** theo quy chuẩn `css/variables.css` và `css/glass.css`.
- Typography Google Font `Be Vietnam Pro` hỗ trợ tiếng Việt hoàn hảo.
- Responsive từ màn hình Mobile nhỏ (375px) đến Desktop màn hình lớn (1440px).

## 5. Danh Sách File Bị Ảnh Hưởng
- `prompt/progress-charts.fea.md`: Tạo mới tài liệu đặc tả.
- `Page/progress-charts.html`: Tạo mới trang giao diện chính.
- `js/calculator.js`: Bổ sung các hàm tính toán biến thiên kỳ và so sánh giai đoạn.
- `js/chart.js`: Bổ sung engine vẽ biểu đồ tiến trình `ProgressChartEngine`.
- `js/app.js`: Bổ sung module `ProgressChartsModule`.
- `css/style.css`: Thêm kiểu dáng cho các component mới.
- `index.html` và các file `Page/*.html`: Thêm liên kết trên Navigation Bar.

## 6. Tiêu Chí Nghiệm Thu
- Chuyển đổi qua lại giữa Cân nặng và BMI hoạt động mượt mà, đúng trục và đơn vị.
- Bộ lọc 6 mốc thời gian lọc chính xác theo ngày ghi nhận.
- So sánh 2 giai đoạn tính toán chính xác, không crash khi thiếu dữ liệu kỳ trước.
- Không có lỗi console JavaScript, 100% Vanilla JS không dùng thư viện ngoài.
