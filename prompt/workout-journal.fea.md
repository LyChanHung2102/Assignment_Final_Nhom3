# Đặc Tả Tính Năng: Workout Journal - Nhật Ký Tập Luyện (workout-journal.fea.md)

## 1. Mục Tiêu
Cung cấp màn hình chuyên sâu **Workout Journal (Nhật ký tập luyện)** tại `Page/workout.html` cho phép người dùng FitVN Tracker:
- Ghi chép, chỉnh sửa và quản lý lịch sử các buổi tập luyện thể chất (Gym, Đi bộ, Chạy bộ, Đạp xe, Yoga, Bơi lội...).
- Theo dõi các thông số cốt lõi: thời lượng tập, cường độ, quãng đường, số bước chân, cảm nhận và ghi chú chi tiết.
- Xem thống kê hoạt động tổng quan: tổng số buổi tập, tổng thời gian, thời lượng trung bình, số ngày tập thực tế.
- Lọc đa tiêu chí (khoảng thời gian, loại hình, cường độ) và tìm kiếm từ khóa linh hoạt.
- Trực quan hóa diễn biến thời lượng tập theo ngày qua biểu đồ Canvas thuần.

## 2. Đối Tượng Sử Dụng
- Người tập gym, người rèn luyện thể thao và người theo dõi sức khỏe muốn lưu giữ nhật ký hoạt động để duy trì kỷ luật và theo dõi sự tiến bộ.

## 3. Yêu Cầu Chức Năng Chi Tiết

### 3.1. Page Header & Bộ Lọc Nhanh
- Tiêu đề: "Nhật Ký Tập Luyện".
- Mô tả: "Ghi lại hoạt động và theo dõi thói quen tập luyện thể chất".
- Nút hành động chính: "+ Thêm Buổi Tập" (mở modal form).
- Bộ lọc khoảng thời gian nhanh: `7 ngày`, `30 ngày`, `3 tháng` (90 ngày), `6 tháng` (180 ngày), `Tất cả`.
- Bộ lọc loại hình tập luyện (Activity Type Dropdown/Pills).

### 3.2. Workout Summary Cards (4 Thẻ Thống Kê)
Tự động tính toán theo các buổi tập nằm trong khoảng thời gian được lọc:
1. **Tổng số buổi tập:** Số lượng buổi tập ghi nhận được trong kỳ.
2. **Tổng thời gian tập:** Quy đổi ra Giờ & Phút (ví dụ: `8h 45m` hoặc `525 phút`).
3. **Thời lượng trung bình:** Phút / buổi tập (ví dụ: `58 phút/buổi`).
4. **Số ngày có tập luyện:** Đếm số ngày duy nhất (unique dates) có phát sinh buổi tập (tránh đếm trùng khi 1 ngày tập 2 buổi).
- Nếu có dữ liệu đi bộ/chạy bộ: hiển thị thêm tổng quãng đường (km) và số bước chân.

### 3.3. Workout Journal List (Danh Sách Buổi Tập)
- Sắp xếp mặc định: Buổi tập mới nhất lên đầu (theo ngày tập và giờ tập giảm dần).
- Thẻ buổi tập trực quan gồm:
  - Icon loại hình (Gym 🏋️‍♂️, Chạy bộ 🏃‍♂️, Đi bộ 🚶‍♂️, Đạp xe 🚴‍♂️, Yoga 🧘‍♀️, Bơi lội 🏊‍♂️, Thể thao ⚽, Khác ⚡).
  - Tên buổi tập, loại hình và nhãn cường độ (Nhẹ, Trung bình, Cao).
  - Ngày tập, giờ bắt đầu - kết thúc, thời lượng (phút).
  - Quãng đường (km) hoặc số bước (nếu có).
  - Cảm nhận sau tập (Tuyệt vời, Khỏe khoắn, Mệt nhẹ, Kiệt sức).
  - Ghi chú vắn tắt.
  - Nút thao tác nhanh: **Xem chi tiết**, **Chỉnh sửa** và **Xóa**.
- Phân trang (Pagination) hoặc tải thêm khi danh sách vượt quá 8 bản ghi.

### 3.4. Form Thêm & Chỉnh Sửa Buổi Tập (Modal Tái Sử Dụng)
Hỗ trợ cả 2 chế độ tạo mới (`mode = create`) và cập nhật (`mode = edit`):
- **Trường bắt buộc:**
  - Tên buổi tập (`title`): Không được để trống.
  - Loại hình tập luyện (`activityType`): Chọn từ danh mục chuẩn.
  - Ngày tập (`workoutDate`): Định dạng `YYYY-MM-DD`, mặc định ngày hôm nay.
  - Thời lượng (`durationMinutes`): Phải là số dương $> 0$ và $\le 720$ phút (12 giờ).
- **Trường tùy chọn:**
  - Giờ bắt đầu (`startTime`) & Giờ kết thúc (`endTime`): Kiểm tra tính hợp lệ nếu nhập cả hai.
  - Cường độ (`intensity`): Nhẹ (`low`), Trung bình (`medium`), Cao (`high`).
  - Quãng đường (`distanceKm`): $\ge 0$.
  - Số bước chân (`steps`): $\ge 0$, số nguyên.
  - Cảm nhận (`feeling`): Tuyệt vời (`great`), Khỏe khoắn (`good`), Mệt nhẹ (`tired`), Kiệt sức (`exhausted`).
  - Ghi chú (`notes`): Tối đa 500 ký tự.
- **Validation trực quan:** Hiển thị thông báo lỗi dưới từng input, không đóng modal khi validation thất bại, giữ nguyên dữ liệu đã nhập.

### 3.5. Workout Detail Modal
- Hiển thị đầy đủ thông số buổi tập với layout sắc nét.
- Nút bấm trực tiếp: Chỉnh sửa buổi tập này / Xóa buổi tập.
- Hộp thoại xác nhận trước khi xóa (Confirm dialog an toàn).

### 3.6. Workout Statistics Chart
- Biểu đồ HTML5 Canvas thuần (Vanilla JS, 0 thư viện ngoài):
  - Biểu diễn thời lượng tập luyện (phút) theo từng ngày trong khoảng thời gian được chọn.
  - Tooltip khi hover/chạm hiển thị ngày và tổng số phút tập.
  - Trục X: Ngày; Trục Y: Phút tập.

### 3.7. Các Trạng Thái (States)
- **Loading:** Tải dữ liệu từ LocalStorage.
- **Empty:** Chưa có buổi tập nào được ghi chép.
- **Empty Filtered Result:** Không tìm thấy buổi tập nào khớp với bộ lọc/từ khóa tìm kiếm (kèm nút xóa bộ lọc).
- **Submitting:** Vô hiệu hóa nút lưu khi đang xử lý để ngăn submit nhiều lần.
- **Success:** Toast thông báo tạo/cập nhật/xóa thành công.

## 4. UI/UX & Design Tokens
- Bảng màu **Jade & Porcelain** theo quy chuẩn `css/variables.css` và `css/glass.css`.
- Typography chuẩn Google Font `Be Vietnam Pro`.
- Responsive từ màn hình Mobile nhỏ (375px) đến Desktop màn hình lớn (1440px).

## 5. Danh Sách File Bị Ảnh Hưởng
- `prompt/workout-journal.fea.md`: Tạo mới tài liệu đặc tả.
- `Page/workout.html`: Tạo mới trang Nhật ký tập luyện.
- `js/storage.js`: Thêm `STORAGE_KEYS.WORKOUT_LOGS` và các hàm CRUD lưu trữ.
- `js/calculator.js`: Bổ sung các hàm thống kê buổi tập, tổng thời gian, đếm số ngày tập duy nhất.
- `js/chart.js`: Bổ sung engine vẽ biểu đồ cột/đường thời lượng tập Canvas thuần.
- `js/app.js`: Thêm module `WorkoutJournalModule`.
- `css/style.css`: Thêm styling cho thẻ buổi tập, modal, intensity badge và filters.
- `index.html` và các trang `Page/*.html`: Thêm tab **Tập Luyện** trên Navigation Bar.

## 6. Tiêu Chí Nghiệm Thu
- Thao tác Thêm, Sửa, Xóa buổi tập hoạt động trơn tru và lưu trữ bền vững trong LocalStorage.
- Thống kê 4 thẻ (Buổi tập, Tổng thời gian, Trung bình, Số ngày) tính toán chuẩn xác 100%.
- Bộ lọc và tìm kiếm từ khóa hoạt động mượt mà theo thời gian thực.
- Biểu đồ thời lượng vẽ chuẩn xác theo ngày thực tế.
- 100% Vanilla JS, không có lỗi console, không dùng thư viện ngoài.
