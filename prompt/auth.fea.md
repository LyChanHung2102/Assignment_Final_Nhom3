# Tài Liệu Đặc Tả Tính Năng: Login & Sign Up (auth.fea.md)

## 1. Mục tiêu
Cung cấp giao diện và luồng xử lý phía frontend cho phép người dùng đăng nhập hoặc đăng ký tài khoản mới trên ứng dụng FitVN Tracker. Khi đăng ký, người dùng khai báo các chỉ số sức khỏe ban đầu (tuổi, giới tính, chiều cao, cân nặng, mục tiêu) để cá nhân hóa toàn bộ trải nghiệm theo dõi sức khỏe và xóa bỏ các dữ liệu hardcode tĩnh ban đầu.

## 2. Đối tượng sử dụng
Người tập gym, người theo dõi chế độ dinh dưỡng và sức khỏe cá nhân muốn lưu trữ và theo dõi các chỉ số thể hình của riêng mình.

## 3. Yêu cầu chức năng
1. **Chuyển đổi linh hoạt giữa Login và Sign Up**:
   - Tab chuyển đổi với hiệu ứng chuyển trang mượt mà.
2. **Form Đăng Nhập (Login)**:
   - Các trường: Email, Mật khẩu.
   - Nút "Đăng Nhập".
   - Liên kết chuyển nhanh sang tab "Đăng Ký".
3. **Form Đăng Ký (Sign Up)**:
   - Thông tin cơ bản: Họ tên, Email, Mật khẩu, Xác nhận mật khẩu.
   - Chỉ số sức khỏe ban đầu:
     - Giới tính (Nam / Nữ / Khác)
     - Tuổi (12 - 100)
     - Chiều cao (cm, 100 - 250)
     - Cân nặng (kg, 30 - 250)
     - Mục tiêu sức khỏe: Duy trì cân nặng (`maintain`), Giảm cân (`cut`), Tăng cân/tăng cơ (`lean_bulk`).
   - Nút "Đăng Ký & Khởi Tạo Hồ Sơ".
4. **Validation & Thông báo lỗi**:
   - Bắt buộc kiểm tra từng trường trực tiếp trước khi submit và khi input thay đổi.
   - Thông báo lỗi hiển thị rõ ràng bên dưới từng trường và alert tổng quan nếu có lỗi chung.
5. **Đồng bộ dữ liệu Frontend**:
   - Lưu thông tin vào `storageService` (`USER_PROFILE`, `fitvn_auth_user`, `fitvn_users_list`).
   - Tự động cập nhật tên và avatar trên toàn bộ trang web (thay thế hardcode).

## 6. Giao diện & Hành vi UI/UX
- Thiết kế theo phong cách Glassmorphism đồng bộ với dự án (sử dụng biến trong `css/variables.css` và `css/glass.css`).
- Màu sắc nhẹ nhàng, hiện đại, mang phong cách thể thao, sức khỏe (health & fitness).
- Responsive hoàn hảo trên Mobile (dưới 480px), Tablet (768px), và Desktop (> 1024px).
- Nút bấm có hiệu ứng hover, focus, active rõ ràng; tuân thủ khả năng truy cập (Accessible forms: `label`, `aria-describedby`, `required`).

## 7. Danh sách file bị ảnh hưởng
- `Page/auth.html`: Tạo mới giao diện Login / Sign Up.
- `css/style.css`: Bổ sung styles cho auth card, tabs, validation state.
- `js/storage.js`: Bổ sung keys và helpers lưu tài khoản, hồ sơ.
- `js/app.js`: Thêm `AuthModule`, đồng bộ avatar/username trên thanh điều hướng chung.
- `index.html`, `Page/food-log.html`, `Page/weight.html`, `Page/settings.html`: Bỏ hardcode tĩnh, kết nối link đăng nhập/đăng xuất.

## 8. Tiêu chí nghiệm thu
- Không có lỗi console.
- Form validate đầy đủ tất cả các trường hợp biên.
- Đăng nhập/đăng ký thành công lưu dữ liệu vào `localStorage` và chuyển về trang chủ hiển thị đúng tên người dùng.
- Responsive không bị vỡ layout trên bất kỳ độ phân giải nào.
