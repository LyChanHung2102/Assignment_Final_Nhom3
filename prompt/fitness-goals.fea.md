# Tài Liệu Đặc Tả Tính Năng: Quản Lý Mục Tiêu Thể Hình (fitness-goals.fea.md)

## 1. Mục tiêu
Cung cấp cho người dùng hệ thống thiết lập, theo dõi và quản lý các mục tiêu thể chất cá nhân (Giảm cân, Tăng cân, Tăng cơ, Giảm mỡ, Duy trì cân nặng). Cho phép người dùng theo dõi tiến độ hoàn thành theo thời gian thực với thanh tiến trình trực quan, cập nhật cân nặng định kỳ và lưu trữ an toàn trong `localStorage`.

## 2. Đối tượng sử dụng
Người tập gym, gymer, người đang trong chế độ ăn kiêng hoặc người muốn duy trì vóc dáng và sức khỏe khoa học.

## 3. Yêu cầu chức năng
1. **CRUD Mục tiêu thể hình**:
   - **Tạo mục tiêu**: Chọn loại mục tiêu, nhập cân nặng bắt đầu, cân nặng mục tiêu, chiều cao, ngày bắt đầu, thời hạn kết thúc (deadline) và ghi chú.
   - **Xem danh sách**: Hiển thị danh sách các mục tiêu với trạng thái `Đang thực hiện` (in_progress), `Hoàn thành` (completed), hoặc `Quá hạn` (overdue).
   - **Chỉnh sửa**: Chỉnh sửa thông số của mục tiêu bất kỳ lúc nào.
   - **Xóa**: Xóa mục tiêu khỏi bộ lưu trữ kèm hộp thoại xác nhận trước khi xóa.
2. **Theo dõi tiến độ trực quan**:
   - Thanh progress bar sinh động theo tỷ lệ hoàn thành (0% - 100%).
   - Hiển thị số kg đã thay đổi, số kg còn lại cần phấn đấu và số ngày còn lại đến hạn.
3. **Cập nhật cân nặng định kỳ**:
   - Modal/Quick-action cho phép người dùng nhập nhanh cân nặng hôm nay để cập nhật tiến độ ngay lập tức, đồng thời đồng bộ vào lịch sử cân nặng chung của website.
4. **Kiểm tra dữ liệu (Validation)**:
   - Cân nặng hợp lệ trong khoảng 30 - 250 kg.
   - Chiều cao hợp lệ trong khoảng 100 - 250 cm.
   - Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.
   - Hiển thị thông báo lỗi cụ thể bên dưới từng input và alert thông báo rõ ràng.

## 4. Giao diện & Trải nghiệm UI/UX
- Thiết kế theo hệ thống bảng màu **Jade & Porcelain — Premium Wellness** được quy định trong `rule.md`:
  - Nền sứ `#F7F6F0`, thẻ card `#FFFEFA` viền `#DDE3D9`.
  - Màu nhấn chính Xanh Jade `#173F35`, điểm xuyết Xanh Sage `#397866` và Citron `#D2F36B`.
  - Typography tiếng Việt chuẩn phông Be Vietnam Pro.
- Responsive đa nền tảng (Desktop, Tablet, Mobile) với thanh điều hướng thích ứng.
- Hoàn toàn bằng HTML5, CSS3 và Vanilla JavaScript ES6+, không sử dụng bất kỳ thư viện hoặc framework bên ngoài nào.

## 5. Mô hình dữ liệu
- Lưu trong `localStorage` với key `fitvn_fitness_goals`.
- Hỗ trợ khởi tạo mục tiêu mẫu phù hợp với hồ sơ ban đầu nếu danh sách đang trống.

## 6. Tiêu chí nghiệm thu
- Tạo, sửa, xóa mục tiêu hoạt động chính xác.
- Tính toán % tiến độ chính xác theo loại mục tiêu.
- Cập nhật cân nặng định kỳ làm thay đổi tiến độ tức thì.
- Dữ liệu được bảo toàn sau khi tải lại trang.
- Không phát sinh lỗi JavaScript console.
