PLAN.md — FitVN Tracker
1. Tổng quan dự án

Tên dự án: FitVN Tracker

Mục tiêu: Xây dựng website hỗ trợ người dùng theo dõi sức khỏe, cân nặng, BMI, calo, dinh dưỡng và thói quen tập luyện.

Đối tượng sử dụng: Người tập gym, người muốn cải thiện chế độ ăn và người muốn theo dõi các chỉ số sức khỏe cá nhân.

Công nghệ: HTML5, CSS3, Vanilla JavaScript ES6+.

Không sử dụng framework hoặc thư viện bên ngoài.

2. Phạm vi chức năng
Giai đoạn 1 — Core MVP
Dashboard tổng quan.
Hồ sơ sức khỏe cá nhân.
Tính BMI.
Theo dõi lịch sử cân nặng.
Theo dõi lượng calo nạp vào.
Nhật ký ăn uống theo bữa.
Lưu dữ liệu bằng localStorage.
Giai đoạn 2 — Dinh dưỡng và mục tiêu
Tính BMR và TDEE theo công thức được tài liệu hóa.
Theo dõi protein, carbohydrate và chất béo.
Quản lý thực phẩm và khẩu phần.
Lập thực đơn theo ngày.
Thiết lập mục tiêu cân nặng.
Biểu đồ thống kê theo tuần và tháng.
Theo dõi lượng nước uống.
Giai đoạn 3 — Theo dõi sức khỏe nâng cao
Theo dõi vận động.
Nhật ký giấc ngủ.
Nhắc nhở theo lịch.
Xuất báo cáo.
Thư viện món ăn lành mạnh.
Gợi ý dinh dưỡng dựa trên quy tắc.
Trợ lý AI chỉ được xem xét nếu người dùng phê duyệt tích hợp dịch vụ bên ngoài.
3. Kiến trúc ứng dụng
HTML
Sử dụng HTML semantic.
Tách trang thành các file HTML khi cần.
Dùng form có label, validation và thông báo lỗi.
Tổ chức giao diện theo các vùng nội dung rõ ràng.
CSS
css/variables.css: biến thiết kế và màu sắc.
css/style.css: bố cục, typography và component chính.
css/glass.css: hiệu ứng glassmorphism và các lớp hiệu ứng dùng chung.
JavaScript
js/app.js: entry point, điều phối và khởi tạo ứng dụng.
js/storage.js: truy xuất, lưu trữ và quản lý phiên bản dữ liệu.
js/calculator.js: các phép tính sức khỏe và dinh dưỡng.
js/chart.js: biểu đồ SVG hoặc Canvas thuần.

Chỉ bổ sung module khi cần thiết và đã được phê duyệt.

4. Quy tắc lưu trữ dữ liệu

Dữ liệu cục bộ được lưu bằng localStorage khi phù hợp.

Những nguyên tắc cần tuân thủ:

Dữ liệu có cấu trúc và phiên bản schema.
Kiểm tra dữ liệu trước khi ghi và sau khi đọc.
Có giá trị mặc định an toàn.
Xử lý trường hợp localStorage không khả dụng hoặc dữ liệu JSON lỗi.
Không lưu mật khẩu hoặc thông tin nhạy cảm.
Không tuyên bố dữ liệu đã được đồng bộ giữa nhiều thiết bị.
Có cơ chế xuất hoặc sao lưu dữ liệu nếu phạm vi dự án yêu cầu.
5. Mô hình dữ liệu dự kiến
UserProfile
id
name
age
heightCm
weightKg
activityLevel
goal
dietPreferences
WeightEntry
id
date
weightKg
note
FoodEntry
id
date
mealType
foodId
servingSize
calories
protein
carbs
fat
Food
id
name
servingUnit
caloriesPerServing
proteinPerServing
carbsPerServing
fatPerServing
HealthGoal
id
type
targetValue
unit
startDate
endDate
status

Các trường trên là mô hình ban đầu. Cấu trúc cuối cùng phải được duyệt trước khi triển khai và phải giữ tính nhất quán giữa các module.

6. Luồng dữ liệu chính
Luồng BMI

Người dùng nhập chiều cao và cân nặng → kiểm tra dữ liệu → tính BMI → phân loại theo nhóm áp dụng → hiển thị kết quả → lưu lịch sử nếu người dùng yêu cầu.

Công thức:

BMI = cân nặng (kg) / [chiều cao (m)]²

Luồng nhật ký ăn uống

Người dùng chọn món ăn → nhập khẩu phần → tính dinh dưỡng theo khẩu phần → cập nhật tổng theo ngày → render dashboard → lưu dữ liệu.

Luồng theo dõi cân nặng

Người dùng nhập cân nặng → xác thực → tạo bản ghi theo ngày → lưu dữ liệu → cập nhật biểu đồ và tiến độ mục tiêu.

7. Kế hoạch kiểm thử
Kiểm tra dữ liệu đầu vào rỗng, âm, sai định dạng và vượt giới hạn hợp lý.
Kiểm tra các phép tính và đơn vị.
Kiểm tra dữ liệu khi tải lại trang.
Kiểm tra localStorage lỗi hoặc trống.
Kiểm tra thao tác thêm, sửa và xóa.
Kiểm tra responsive trên các kích thước màn hình.
Kiểm tra điều hướng và trạng thái rỗng.
Kiểm tra lỗi JavaScript và tài nguyên trong console.
Kiểm tra khả năng truy cập cơ bản.
8. Nguyên tắc triển khai

Mỗi feature phải có Implementation Plan và được người dùng xác nhận trước khi chỉnh sửa file.

Sau khi được duyệt:

Triển khai đúng phạm vi.
Kiểm tra ảnh hưởng đến module liên quan.
Kiểm thử các trường hợp biên.
Cập nhật file prompt/*.fea.md.
Báo cáo file thay đổi và kết quả thực tế.
9. Tiêu chí hoàn thành dự án
Các chức năng chính hoạt động đúng.
Dữ liệu được xác thực và lưu trữ nhất quán.
Giao diện responsive.
Không có lỗi console chưa được xử lý.
Không sử dụng framework hoặc thư viện ngoài.
Tài liệu feature được cập nhật.
Không tuyên bố chức năng chưa triển khai là đã hoàn thành.
10. Trạng thái dự án

Trạng thái ban đầu: Planning.

Chỉ chuyển trạng thái từng feature sang In Progress, Testing hoặc Done khi có bằng chứng triển khai tương ứng.