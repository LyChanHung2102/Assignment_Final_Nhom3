# Đặc Tả Tính Năng: Health Reports & Statistics - Báo Cáo & Thống Kê Sức Khỏe (health-reports.fea.md)

## 1. Mục Tiêu
Cung cấp màn hình chuyên sâu **Health Reports & Statistics (Báo cáo và Thống kê Sức khỏe)** tại `Page/reports.html` giúp người dùng FitVN Tracker:
- Xem báo cáo tổng hợp đa chỉ số sức khỏe (Cân nặng, BMI, Hoạt động tập luyện, Dinh dưỡng) trong bất kỳ khoảng thời gian nào.
- Đánh giá sự thay đổi và hiệu quả rèn luyện qua các giai đoạn thông qua công cụ so sánh trực quan (Period Comparison).
- Tra cứu bảng dữ liệu thống kê tổng hợp có phân trang và gom nhóm theo tuần/ngày.
- Nhận định xu hướng tự động (Data Insights) dựa trên cơ sở dữ liệu thực tế.
- Hỗ trợ in báo cáo (Print-friendly view) và xuất dữ liệu thống kê ra định dạng file CSV chuẩn UTF-8.

## 2. Đối Tượng Sử Dụng
- Người tập gym, người theo dõi sức khỏe dài hạn cần bản báo cáo định kỳ (hàng tuần, hàng tháng hoặc hàng quý) để đánh giá toàn diện tiến trình phát triển thể chất của bản thân.

## 3. Yêu Cầu Chức Năng Chi Tiết

### 3.1. Page Header & Bộ Lọc Nâng Cao
- Tiêu đề: "Báo Cáo & Thống Kê Sức Khỏe".
- Mô tả: "Tổng hợp đa chỉ số, phân tích xu hướng và đánh giá sự thay đổi thể chất theo thời gian".
- Bộ chọn khoảng thời gian: `7 ngày`, `30 ngày`, `3 tháng` (90 ngày), `6 tháng` (180 ngày), `1 năm` (365 ngày), và `Khoảng ngày tùy chỉnh` (Start Date - End Date).
- Bộ chọn loại báo cáo:
  - **Tất cả chỉ số (Tổng hợp toàn diện)**
  - **Chỉ số Cân nặng & BMI**
  - **Nhật ký & Hoạt động Tập luyện**
- Nút tác vụ: **Làm mới dữ liệu** (Refresh), **In báo cáo** (Print) và **Xuất CSV** (Export).

### 3.2. Health Overview Statistics (7 Thẻ KPI Tổng Hợp)
Tự động tính toán theo dữ liệu thực tế trong khoảng thời gian được lọc:
1. **Cân nặng đầu kỳ:** Giá trị đầu tiên ghi nhận trong kỳ (kg).
2. **Cân nặng cuối kỳ:** Giá trị gần nhất trong kỳ (kg).
3. **Mức thay đổi cân nặng:** $\Delta = \text{Cuối} - \text{Đầu}$ kèm tỷ lệ $\%$ và nhãn xu hướng.
4. **BMI cuối kỳ:** Chỉ số khối cơ thể tại mốc cuối kỳ kèm phân loại y tế (Thiếu cân, Bình thường, Thừa cân, Béo phì).
5. **Tổng số buổi tập:** Số buổi tập thể chất đã thực hiện.
6. **Tổng thời lượng tập:** Quy đổi dạng Giờ & Phút (ví dụ: `7h 30m`).
7. **Số ngày tập thực tế:** Số ngày duy nhất có hoạt động rèn luyện (không tính trùng lặp).

### 3.3. Phân Tích Cân Nặng & BMI (Weight & BMI Report Section)
- Đánh giá diễn biến thể trọng, so sánh đối chiếu với giai đoạn trước.
- Biểu đồ đường Canvas thuần: đường cân nặng thực tế, đường BMI, và đường tham chiếu mục tiêu (Target Line nét đứt).
- Quy tắc: không suy diễn tăng cân luôn xấu hay giảm cân luôn tốt; phân loại BMI mang tính tham khảo sàng lọc.

### 3.4. Báo Cáo Hoạt Động Tập Luyện (Workout Report Section)
- Tổng hợp số buổi, tổng thời gian, thời lượng trung bình/buổi, số ngày tập.
- Loại hình tập luyện phổ biến nhất (dựa trên tần suất buổi tập).
- Biểu đồ phân bổ loại hình tập luyện (Gym, Chạy bộ, Đi bộ, Đạp xe, Yoga...) bằng Canvas thuần.
- Biểu đồ thời lượng vận động theo các mốc thời gian.

### 3.5. So Sánh Hai Giai Đoạn (Period Comparison)
- Tự động lấy dữ liệu của chu kỳ liền kề tương đương trước đó:
  - 7 ngày qua vs 7 ngày trước đó.
  - 30 ngày qua vs 30 ngày trước đó.
  - Khoảng tùy chỉnh vs chu kỳ trước có cùng số ngày.
- Đối chiếu: Cân nặng ($\Delta$), BMI, Số buổi tập, Thời lượng tập luyện.
- Hiển thị mức chênh lệch tuyệt đối, $\%$ thay đổi và nhận định khách quan.
- Xử lý khi giai đoạn trước chưa có bản ghi: Hiển thị thông báo "Chưa đủ dữ liệu giai đoạn trước để đối chiếu" một cách rõ ràng.

### 3.6. Bảng Dữ Liệu Thống Kê & Phân Trang (Statistics Table)
- Gom nhóm dữ liệu theo Tuần hoặc Ngày.
- Cột: Khoảng thời gian, Cân nặng đầu, Cân nặng cuối, Biến động ($\Delta$), BMI cuối kỳ, Số buổi tập, Thời lượng tập.
- Hỗ trợ phân trang gọn gàng (8 dòng/trang) và đổi chiều sắp xếp.

### 3.7. Data Insights (Nhận Định Dữ Liệu Tự Động)
- Đưa ra nhận xét khách quan dựa trên số liệu thực tế:
  - Tần suất vận động tăng hay giảm so với kỳ trước.
  - Mức độ dao động cân nặng và tình trạng hướng đến mục tiêu thể hình.
  - Khuyến cáo khoa học: không chẩn đoán bệnh tật, không đưa ra lời khuyên y tế thiếu căn cứ.

### 3.8. In Ấn & Xuất File (Print & Export)
- **Chế độ In (@media print):** Giao diện trang in thanh lịch, ẩn thanh điều hướng và các nút tác vụ, tự động đưa thông tin tiêu đề, thời gian xuất và logo thương hiệu.
- **Xuất CSV:** Tạo file `fitvn-health-report.csv` chuẩn UTF-8 kèm BOM, hỗ trợ hiển thị tiếng Việt hoàn hảo trên Excel.

### 3.9. Các Trạng Thái (States)
- **Loading:** Tải và tổng hợp dữ liệu.
- **Empty:** Chưa có bất kỳ dữ liệu nào trong hệ thống.
- **Partial Data:** Chỉ có dữ liệu cân nặng hoặc chỉ có dữ liệu tập luyện $\rightarrow$ hiển thị từng phần an toàn, không crash.
- **No Comparison Data:** Kỳ trước không có dữ liệu để đối chiếu.
- **Success:** Toàn bộ thẻ KPI, biểu đồ và bảng thống kê hiển thị nhất quán.

## 4. UI/UX & Design Tokens
- Bảng màu **Jade & Porcelain** theo quy chuẩn `css/variables.css` và `css/glass.css`.
- Typography chuẩn Google Font `Be Vietnam Pro`.
- Responsive từ màn hình Mobile nhỏ (375px) đến Desktop màn hình lớn (1440px).

## 5. Danh Sách File Bị Ảnh Hưởng
- `prompt/health-reports.fea.md`: Tạo mới tài liệu đặc tả.
- `Page/reports.html`: Tạo mới trang Báo cáo và thống kê sức khỏe.
- `js/calculator.js`: Bổ sung các hàm tổng hợp KPI đa chỉ số và so sánh chu kỳ.
- `js/chart.js`: Bổ sung engine vẽ biểu đồ báo cáo `HealthReportsChartEngine`.
- `js/app.js`: Thêm module `HealthReportsModule` điều phối tương tác, xuất CSV và in ấn.
- `css/style.css`: Thêm kiểu dáng cho report cards, toolbar, datepicker và quy chuẩn `@media print`.
- `index.html` và các trang `Page/*.html`: Thêm tab **Báo Cáo** trên Navigation Bar.

## 6. Tiêu Chí Nghiệm Thu
- Dữ liệu KPI, biểu đồ và bảng số liệu phải nhất quán 100% với dữ liệu từ LocalStorage.
- Bộ lọc 5 khoảng thời gian và bộ lọc tùy chỉnh ngày hoạt động chính xác.
- Tính năng In và Xuất CSV hoạt động thực tế, không có lỗi font tiếng Việt.
- 100% Vanilla JS, không có lỗi console, không dùng thư viện ngoài.
