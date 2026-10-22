# Đặc Tả Tính Năng: Health Tracking Dashboard (health-dashboard.fea.md)

## 1. Mục Tiêu
Cung cấp màn hình tổng quan sức khỏe cá nhân (**Health Dashboard**) chuyên sâu giúp người dùng FitVN Tracker:
- Nắm bắt chỉ số khối cơ thể (BMI) hiện tại cùng phân tích tình trạng thể hình trực quan.
- Theo dõi cân nặng thực tế và sự thay đổi theo thời gian thông qua biểu đồ trực quan.
- Đánh giá tiến độ hoàn thành mục tiêu cân nặng (tăng cân / giảm cân / duy trì).
- Xem tổng hợp các chỉ số sức khỏe liên quan (nước uống, dinh dưỡng tiêu thụ).
- Quản lý các bản ghi nhận sức khỏe gần nhất và ghi nhận nhanh số đo mới.

## 2. Đối Tượng Sử Dụng
- Người tập gym, người muốn cải thiện vóc dáng, giảm mỡ hoặc tăng cơ nạc.
- Người cần theo dõi các chỉ số sinh trắc học cá nhân một cách khoa học, rõ ràng và nhất quán.

## 3. Yêu Cầu Chức Năng Chi Tiết

### 3.1. Header Dashboard
- Tiêu đề trang: "Health Dashboard" hoặc "Tổng Quan Sức Khỏe".
- Hiển thị ngày hiện tại theo thời gian thực (định dạng tiếng Việt: Thứ, Ngày/Tháng/Năm).
- Lời chào cá nhân hóa theo tài khoản/hồ sơ đã đăng nhập (`Gymer FitVN` hoặc tên người dùng trong `USER_PROFILE`).
- Thanh chọn khoảng thời gian xem dữ liệu (Time Filter): `7 ngày`, `30 ngày`, `Tất cả`.

### 3.2. Health Overview Cards (4 Thẻ Chỉ Số Cốt Lõi)
1. **BMI hiện tại:**
   - Giá trị BMI (làm tròn 1 chữ số thập phân).
   - Phân loại trạng thái (Thiếu cân, Bình thường, Thừa cân, Béo phì) kèm badge màu tương ứng.
2. **Cân nặng hiện tại:**
   - Giá trị (kg).
   - Thông tin thay đổi so với lần ghi nhận trước đó (ví dụ: `-0.4 kg so với lần trước`, `+0.2 kg`). Nếu chỉ có 1 bản ghi thì hiển thị "Bản ghi đầu tiên".
3. **Chiều cao:**
   - Giá trị (cm) lấy từ hồ sơ người dùng.
4. **Mục tiêu cân nặng:**
   - Giá trị mục tiêu (kg) và khoảng cách cần đạt.

### 3.3. BMI Analysis (Phân Tích BMI Trực Quan)
- Công thức: $\text{BMI} = \text{Cân nặng (kg)} / [\text{Chiều cao (m)}]^2$.
- Thang đo trực quan (Spectrum Bar) 4 dải màu:
  - Thiếu cân: $< 18.5$ (`--color-bmi-underweight`)
  - Bình thường: $18.5 - 24.9$ (`--color-bmi-normal`)
  - Thừa cân: $25.0 - 29.9$ (`--color-bmi-overweight`)
  - Béo phì: $\ge 30.0$ (`--color-bmi-obesity`)
- Con trỏ chỉ báo vị trí (Indicator/Needle) tương ứng với giá trị BMI thực tế.
- Khuyến cáo y khoa: BMI là chỉ số sàng lọc thể trọng, không thay thế chẩn đoán y khoa chuyên sâu.
- Xử lý khi thiếu thông tin: nếu thiếu cân nặng hoặc chiều cao $\le 0$, hiển thị thông báo chưa đủ dữ liệu.

### 3.4. Weight Tracking Chart (Biểu Đồ Theo Dõi Cân Nặng)
- Biểu đồ HTML5 Canvas thuần (Vanilla JavaScript, 0 thư viện ngoài):
  - Trục X: Ngày ghi nhận (định dạng `DD/MM`).
  - Trục Y: Cân nặng (kg) tự động căn chỉnh khoảng hiển thị tối ưu (min - max).
  - Đường biểu diễn cân nặng thực tế và các điểm tròn dữ liệu (Data points).
  - Đường tham chiếu mục tiêu (Target Reference Line) nét đứt màu xanh ngọc/citron.
  - Bộ lọc khoảng thời gian: 7 ngày gần nhất, 30 ngày gần nhất, hoặc toàn bộ lịch sử.
  - Tương tác hover / chạm: Hiển thị tooltip nổi gồm Ngày, Cân nặng và Body Fat / Ghi chú (nếu có).

### 3.5. Health Metrics Bổ Sung
- Tích hợp các chỉ số thuộc phạm vi hiện có của FitVN Tracker:
  - **Lượng nước uống hôm nay:** ml đã uống / mục tiêu ml, thanh tiến độ nước.
  - **Dinh dưỡng hôm nay:** Calo nạp, Protein, Carbs, Fat từ nhật ký bữa ăn.

### 3.6. Goal Progress (Tiến Độ Đạt Mục Tiêu)
- Hiển thị 3 mốc: Cân nặng ban đầu $\rightarrow$ Cân nặng hiện tại $\rightarrow$ Cân nặng mục tiêu.
- Tính toán phần trăm tiến độ (% Goal Achieved):
  - Hỗ trợ cả 2 chiều: Giảm cân (Cut) và Tăng cân (Lean Bulk).
  - Xử lý trường hợp mục tiêu bằng cân nặng ban đầu: Đạt 100%.
  - Xử lý trường hợp đã vượt mục tiêu: Đạt 100% kèm badge "Đã hoàn thành xuất sắc mục tiêu".
- Khoảng chênh lệch còn lại so với mục tiêu (kg).

### 3.7. Recent Health Records (Bản Ghi Gần Nhất)
- Bảng hiển thị danh sách 5-10 lần ghi nhận cân nặng mới nhất:
  - Cột: Ngày ghi nhận, Cân nặng (kg), BMI tại thời điểm đó, Ghi chú, Hành động (xem/xóa).
- Nút bấm "Ghi Nhận Cân Nặng Mới" mở modal thêm nhanh bản ghi trực tiếp trên trang.

### 3.8. Các Trạng Thái Giao Diện (States)
- **Loading:** Hiển thị khung skeleton / spinner mượt mà trong lúc tải dữ liệu từ `localStorage`.
- **Incomplete Profile:** Khi hồ sơ chưa nhập chiều cao hoặc cân nặng $\rightarrow$ hiển thị thẻ cảnh báo thân thiện kèm nút chuyển sang Cài đặt hồ sơ.
- **Empty State:** Khi chưa có bản ghi cân nặng nào $\rightarrow$ hướng dẫn người dùng nhấn nút thêm bản ghi đầu tiên.
- **Success:** Toàn bộ biểu đồ, thẻ chỉ số và phân tích hiển thị đầy đủ, chính xác.

## 4. UI/UX & Design Tokens
- Tuân thủ bảng màu **Jade & Porcelain** quy định trong `css/variables.css` và `css/glass.css`.
- Typography chuẩn Tiếng Việt với Google Font `Be Vietnam Pro`.
- Responsive 100%: Tối ưu từ Mobile (375px), Tablet (768px) đến Desktop màn hình lớn (> 1200px).
- Accessibility: Có đầy đủ nhãn `aria-label`, hỗ trợ điều hướng bàn phím.

## 5. Danh Sách File Bị Ảnh Hưởng & Tạo Mới
- `Page/health-dashboard.html`: Trang giao diện Dashboard mới.
- `js/calculator.js`: Cập nhật hàm phân loại BMI và hàm tính tiến độ mục tiêu cân nặng.
- `js/chart.js`: Bổ sung module biểu đồ sức khỏe Canvas thuần hỗ trợ Target Line & Time Filter.
- `js/app.js`: Thêm `HealthDashboardModule` điều phối tương tác và luồng dữ liệu.
- `css/style.css`: Thêm kiểu dáng cho thanh đo BMI, thẻ tiến độ mục tiêu, bảng lịch sử và bộ lọc thời gian.
- `index.html`, `Page/food-log.html`, `Page/food-search.html`, `Page/weight.html`, `Page/settings.html`: Bổ sung liên kết điều hướng đồng bộ.

## 6. Tiêu Chí Nghiệm Thu
- Tính toán BMI và tiến độ mục tiêu chính xác 100% trong mọi kịch bản dữ liệu.
- Biểu đồ Canvas vẽ mượt mà, tooltip chính xác, phản hồi tức thì với bộ lọc thời gian.
- Không phát sinh lỗi console, không dùng thư viện ngoài.
- Dữ liệu lưu trữ và cập nhật an toàn qua `storageService`.
