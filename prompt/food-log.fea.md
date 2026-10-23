# Đặc Tả Tính Năng: Nhật Ký Ăn Uống (food-log.fea.md)

## 1. Mục Tiêu
Cung cấp trang **Nhật Ký Ăn Uống** tại `Page/food-log.html` để người dùng FitVN Tracker ghi lại thực phẩm theo từng bữa, theo dõi tổng năng lượng và macro trong ngày, đồng thời xem nhanh cân đối calo theo tuần.

## 2. Đối Tượng Sử Dụng
- Người tập gym cần theo dõi lượng calo và dinh dưỡng thực tế so với mục tiêu cá nhân.
- Người muốn ghi món ăn Việt Nam, thực phẩm bổ sung hoặc món tự chuẩn bị một cách nhanh chóng.

## 3. Yêu Cầu Chức Năng Chi Tiết

### 3.1. Điều Hướng Ngày
- Mặc định mở nhật ký của ngày hiện tại.
- Cho phép chuyển sang ngày trước/ngày sau, chọn ngày trực tiếp trên lịch và quay về hôm nay.
- Hiển thị ngày theo định dạng tiếng Việt, kèm nhãn thích hợp như "Hôm nay", "Hôm qua" hoặc "Ngày mai".
- Khi đổi ngày, tải lại danh sách món, tổng calo và macro tương ứng với ngày được chọn; không ghi nhầm món vào ngày khác.

### 3.2. Tổng Dinh Dưỡng Trong Ngày
- Hiển thị tổng Calo (kcal), Protein (g), Carbohydrate (g) và Fat (g) từ các món đã ghi của ngày.
- Cập nhật tức thời sau khi thêm hoặc xóa món.
- Dữ liệu chỉ lấy từ nhật ký của người dùng hiện tại và ngày đang xem.
- Không có dữ liệu thì hiển thị các tổng bằng 0 và trạng thái trống phù hợp.

### 3.3. Tổng Kết Calo Tuần
- Hiển thị tổng mục tiêu calo, tổng lượng thực tế đã nạp, số ngày ăn lố/đạt mục tiêu và số ngày có ghi nhận trong tuần hiện tại đến ngày hôm nay.
- Hiển thị phần dư hoặc thâm hụt và thông tin điều chỉnh mục tiêu ngày theo dữ liệu lịch sử nếu có.
- Dùng mục tiêu dinh dưỡng trong hồ sơ và các bản ghi calo ngày; không đưa ra nhận định sức khỏe vượt quá dữ liệu.

### 3.4. Danh Sách Bữa Ăn
- Chia nhật ký thành bốn nhóm:
  1. Bữa sáng (`breakfast`)
  2. Bữa trưa (`lunch`)
  3. Bữa tối (`dinner`)
  4. Bữa phụ / Pre-workout (`snack`)
- Mỗi nhóm hiển thị tổng calo của bữa và các món được ghi nhận.
- Mỗi món cần thể hiện tên, khẩu phần, thời điểm ghi, Calo và các macro chính.
- Cho phép xóa món khỏi nhật ký; sau khi xóa phải tính lại tổng bữa, tổng ngày, tổng kết tuần và dữ liệu liên quan trên Dashboard.

### 3.5. Modal Ghi Chép Thực Phẩm
Modal mở từ nút ghi chép nhanh hoặc nút thêm món tại từng bữa. Bữa được chọn và ngày đang xem phải được giữ trong suốt thao tác. Modal gồm ba luồng:

#### Kho món có sẵn
- Tìm món theo tên, hỗ trợ từ khóa tiếng Việt không dấu.
- Lọc theo nhóm món phù hợp: món Việt, thực phẩm phổ biến cho tập luyện, thực phẩm bổ sung và đồ uống.
- Chọn món để xem/chỉnh khẩu phần theo gram; cập nhật trước Calo, Protein, Carb và Fat theo lượng nhập.
- Chỉ lưu khi khẩu phần hợp lệ và lớn hơn 0.
- Thêm món vào đúng bữa/ngày đang chọn, đóng modal và cập nhật giao diện.

#### Tra cứu barcode
- Cho phép nhập mã barcode hoặc chọn sản phẩm có sẵn để tra cứu nhanh.
- Đây là luồng tra cứu/mô phỏng phía client; không tuyên bố đang sử dụng camera hoặc dịch vụ barcode trực tuyến nếu chưa được tích hợp.
- Khi tìm thấy sản phẩm, cho phép ghi món vào bữa hiện hành; khi không tìm thấy, hiển thị thông báo rõ ràng và giữ người dùng ở modal.

#### Tự nhập món ăn
- Các trường: tên món, Protein (g), Carbohydrate (g), Fat (g).
- Tính trước Calo theo công thức `Protein × 4 + Carbohydrate × 4 + Fat × 9`.
- Kiểm tra tên không rỗng và các giá trị dinh dưỡng là số không âm hợp lệ.
- Thêm món tự nhập vào nhật ký của người dùng và đồng bộ tổng ngày.

### 3.6. Lưu Trữ & Mô Hình Dữ Liệu
- Lưu thông qua `storageService`, dùng các khóa nhật ký thực phẩm và tổng calo ngày đã có trong `js/storage.js`.
- Bản ghi thực phẩm gắn với người dùng, ngày, loại bữa, tên/mã món, khẩu phần, thời điểm và Calo/Protein/Carb/Fat.
- Dữ liệu tùy chỉnh phải được lưu bền vững theo cơ chế hiện có; không làm mất nhật ký của người dùng khác khi cập nhật dữ liệu.
- Mọi thao tác thêm/xóa cần cập nhật dữ liệu calo ngày để các trang Dashboard và báo cáo đọc được cùng một nguồn sự thật.

## 4. Giao Diện & Trải Nghiệm Người Dùng
- Tuân thủ bảng màu Jade & Porcelain trong `css/variables.css`, `css/glass.css` và font Be Vietnam Pro.
- Các nút thêm món phải chỉ rõ bữa ăn đích; ngày đang xem cần dễ nhận biết.
- Modal có trạng thái rỗng khi không tìm thấy món, phản hồi thành công/thất bại bằng Toast theo quy ước chung.
- Bố cục danh sách bữa, bộ chọn ngày, modal và form tự nhập phải responsive trên điện thoại, máy tính bảng và desktop.
- Các điều khiển có nhãn dễ hiểu, focus bàn phím nhìn thấy được và trạng thái thông báo có thể được công nghệ hỗ trợ đọc.

## 5. Luồng Dữ Liệu
1. Khởi tạo `FoodLogModule`, chọn ngày hiện tại và tải các bản ghi của người dùng.
2. Tính tổng ngày và tổng calo từng bữa từ nhật ký.
3. Người dùng chọn ngày/bữa, tra cứu món hoặc nhập thông tin món tùy chỉnh.
4. Kiểm tra dữ liệu, lưu bản ghi thông qua `storageService`.
5. Render lại nhật ký và tổng dinh dưỡng; đồng bộ Dashboard.
6. Khi xóa món, cập nhật lại tất cả các tổng và lưu trạng thái mới.

## 6. Trạng Thái & Trường Hợp Biên
- **Ngày chưa có món:** Hiển thị các bữa rỗng và tổng bằng 0.
- **Không tìm thấy món/barcode:** Nêu rõ kết quả không tồn tại, không thêm bản ghi giả.
- **Khẩu phần hoặc macro không hợp lệ:** Không lưu, thông báo lỗi có thể hiểu được.
- **Không có hồ sơ người dùng hiện hành:** Tuân theo luồng kiểm soát truy cập/đăng nhập hiện có; không ghi dữ liệu vô chủ.
- **Ngày quá khứ/tương lai:** Cho phép xem và ghi theo hành vi sản phẩm hiện tại; ngày ghi phải nhất quán giữa giao diện và dữ liệu.
- **Lỗi lưu trữ:** Báo thất bại, không thông báo thành công giả và không bỏ qua lỗi.

## 7. Danh Sách File Liên Quan
- `Page/food-log.html`: Trang nhật ký ngày, danh sách bữa và modal ghi món.
- `js/app.js`: `FoodLogModule`, bộ chọn ngày, render bữa, thêm/xóa món và tổng tuần.
- `js/storage.js`: Đọc/ghi nhật ký thực phẩm, tính tổng ngày và cập nhật tổng calo.
- `js/foodDatabase.js`: Dữ liệu món có sẵn và tính dinh dưỡng theo khẩu phần.
- `css/style.css`, `css/glass.css`: Bố cục nhật ký, bộ chọn ngày, trạng thái bữa và modal.
- `index.html`: Đồng bộ các chỉ số ăn uống trên Dashboard.
- `prompt/food-search.fea.md`: Đặc tả riêng cho trang tra cứu thực phẩm; không thay thế luồng ghi nhật ký này.

## 8. Tiêu Chí Nghiệm Thu
- Chuyển ngày và chọn ngày trên lịch luôn hiển thị đúng nhật ký của ngày đó.
- Thêm món vào đúng bữa và ngày đang chọn; món xuất hiện sau khi lưu và còn tồn tại sau khi tải lại trang.
- Tính khẩu phần, Calo và macro nhất quán với dữ liệu món gốc và công thức năng lượng.
- Thêm hoặc xóa món cập nhật đúng tổng bữa, tổng ngày, tổng tuần và Dashboard.
- Tra cứu theo từ khóa không dấu, lọc danh mục, tra barcode có sẵn và tự nhập món hoạt động độc lập.
- Dữ liệu sai hoặc lỗi lưu trữ không tạo bản ghi sai và không hiển thị thông báo thành công giả.
- Giao diện hoạt động tốt trên màn hình di động và desktop, không phát sinh lỗi JavaScript.
