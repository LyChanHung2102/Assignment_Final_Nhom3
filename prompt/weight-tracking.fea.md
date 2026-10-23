# Đặc Tả Tính Năng: Theo Dõi Cân Nặng & Thành Phần Cơ Thể (weight-tracking.fea.md)

## 1. Mục Tiêu
Cung cấp trang **Theo Dõi Cân Nặng** tại `Page/weight.html` để người dùng FitVN Tracker ghi nhận cân nặng và số đo cơ thể, theo dõi xu hướng cân nặng qua đường trung bình động 7 ngày (7DMA), và xem lại các lần đo gần nhất.

## 2. Đối Tượng Sử Dụng
- Người tập thể hình muốn theo dõi tiến triển cân nặng và thành phần cơ thể theo thời gian.
- Người đang tăng cơ, giảm mỡ hoặc duy trì cân nặng cần dữ liệu lịch sử để đánh giá xu hướng thay vì chỉ nhìn một lần cân riêng lẻ.

## 3. Yêu Cầu Chức Năng Chi Tiết

### 3.1. Ghi Nhận Cân Nặng & Số Đo
- Nút "Ghi Cân Nặng Hôm Nay" mở modal ghi nhận thể trọng.
- Trường dữ liệu:
  - Ngày ghi nhận (`date`), mặc định hôm nay và không cho chọn ngày trong tương lai.
  - Cân nặng kg (bắt buộc, phải là số hữu hạn lớn hơn 0).
  - Tỷ lệ mỡ cơ thể phần trăm (tùy chọn).
  - Ghi chú (tùy chọn).
  - Số đo tùy chọn tính bằng cm: vòng ngực, vòng eo, bắp tay và vòng đùi.
- Có thể nhập nhiều lần trong cùng ngày nếu luồng lưu trữ hiện có cho phép; mỗi bản ghi phải giữ đúng ngày và không làm mất lịch sử khác.
- Khi mở modal, có thể gợi ý cân nặng và tỷ lệ mỡ từ bản ghi gần nhất; giá trị gợi ý không được ghi đè dữ liệu cho tới khi người dùng lưu.
- Nếu lưu thất bại, giữ dữ liệu người dùng đã nhập và hiển thị lỗi rõ ràng.

### 3.2. Thẻ Chỉ Số Tổng Quan
Từ bản ghi mới nhất và hồ sơ người dùng, hiển thị:
1. **Cân nặng hiện tại:** Giá trị gần nhất và khoảng cách so với cân nặng mục tiêu nếu có.
2. **Trung bình động 7 ngày:** Giá trị trung bình và nhận định xu hướng khi đủ dữ liệu.
3. **BMI:** Tính từ cân nặng và chiều cao hồ sơ; phân loại theo ngưỡng BMI đã dùng trong ứng dụng. Nếu thiếu chiều cao hoặc cân nặng hợp lệ, thể hiện trạng thái chưa đủ dữ liệu.
4. **Tỷ lệ mỡ:** Hiển thị khi bản ghi có thông tin body fat; khi đủ dữ liệu có thể trình bày khối mỡ và khối nạc ước tính.
- Không hardcode mục tiêu hay chiều cao thay cho hồ sơ người dùng.
- BMI và thành phần cơ thể chỉ là chỉ số tham khảo, không phải chẩn đoán y tế.

### 3.3. Dao Động Cân Nặng Trong 7 Ngày
- Lọc các bản ghi từ 7 ngày gần nhất tính tới hôm nay.
- Khi có ít nhất hai bản ghi, hiển thị khoảng dao động `cao nhất - thấp nhất`, giá trị thấp/cao, số lần ghi nhận và thay đổi từ lần đầu đến lần gần nhất trong cửa sổ.
- Khi không đủ hai bản ghi, hiển thị hướng dẫn phù hợp thay vì tính hoặc hiển thị kết quả sai.

### 3.4. Biểu Đồ Xu Hướng & 7DMA
- Render bằng Canvas thuần thông qua chart engine của dự án.
- Hiển thị cân nặng thực tế cùng đường trung bình động 7 ngày; dữ liệu được sắp theo ngày tăng dần trước khi tính và vẽ.
- Cửa sổ 7DMA là tối đa 7 bản ghi liên tiếp gần nhất tại mỗi điểm; nếu lịch sử chưa đủ 7 bản ghi, dùng các bản ghi hiện có trong cửa sổ.
- Tooltip khi tương tác hiển thị ngày, cân nặng thực tế, giá trị 7DMA và body fat/ghi chú nếu có.
- Tự điều chỉnh độ phân giải Canvas theo kích thước vùng vẽ và `devicePixelRatio`; biểu đồ cập nhật khi dữ liệu thay đổi hoặc kích thước màn hình đổi.
- Trường hợp không có dữ liệu phải có trạng thái trống thân thiện và không làm lỗi trang.

### 3.5. Số Đo Các Nhóm Cơ
- Hiển thị số đo gần nhất có sẵn của vòng ngực, eo, bắp tay và đùi.
- Nếu có lần đo trước cho cùng nhóm cơ, trình bày chênh lệch cm; không so sánh với trường dữ liệu trống.
- Khi chưa ghi số đo, hiển thị trạng thái hướng dẫn người dùng ghi nhận trong modal.

### 3.6. Lịch Sử Đo
- Hiển thị tối đa 8 bản ghi gần nhất theo thứ tự mới nhất trước.
- Mỗi dòng gồm ngày, cân nặng, 7DMA và thông tin body fat/ghi chú nếu có.
- Cho phép xóa một bản ghi cụ thể sau thao tác người dùng; cập nhật lại biểu đồ, chỉ số, số đo, lịch sử và Dashboard sau khi xóa thành công.
- Nếu lịch sử rỗng, hiển thị trạng thái hướng dẫn ghi nhận lần đầu.

### 3.7. Lưu Trữ & Đồng Bộ
- Dùng `storageService` và khóa nhật ký cân nặng hiện có (`WEIGHT_LOGS`).
- Mỗi bản ghi gắn với người dùng hiện tại và giữ các trường ngày, cân nặng, body fat, ghi chú, số đo.
- Không để dữ liệu một tài khoản hiển thị hoặc bị xóa khi chuyển sang tài khoản khác.
- Sau khi thêm/xóa thành công, cập nhật trang cân nặng và các chỉ số liên quan trên Dashboard.

## 4. Giao Diện & Trải Nghiệm Người Dùng
- Tuân thủ thiết kế Jade & Porcelain, các biến CSS và font Be Vietnam Pro của ứng dụng.
- Làm rõ cân nặng thực tế và 7DMA là hai dữ liệu khác nhau bằng chú giải biểu đồ.
- Modal có nhãn gắn với input, bố cục dễ thao tác trên thiết bị cảm ứng và cuộn được trên màn hình thấp.
- Thông báo lưu/xóa thành công chỉ hiện khi thao tác thực sự thành công; lỗi cần được nêu rõ.
- Hỗ trợ bàn phím, focus nhìn thấy được, nhãn accessible và responsive trên mobile/tablet/desktop.

## 5. Luồng Dữ Liệu
1. Khởi tạo `WeightModule`, tải các bản ghi của người dùng hiện tại và thiết lập chart engine.
2. Sắp xếp lịch sử theo ngày, tính 7DMA, BMI, thành phần cơ thể và dao động tuần khi đủ dữ liệu.
3. Render các thẻ chỉ số, biểu đồ, số đo và 8 bản ghi gần nhất.
4. Khi lưu bản ghi, kiểm tra cân nặng và ngày, lưu qua `storageService`, rồi render lại trang và đồng bộ Dashboard.
5. Khi xóa bản ghi, xóa đúng ID của người dùng hiện hành; chỉ khi thành công mới render lại dữ liệu.

## 6. Trạng Thái & Trường Hợp Biên
- **Chưa có bản ghi:** Thẻ, biểu đồ, số đo và lịch sử hiển thị trạng thái chưa có dữ liệu; không giả lập cân nặng mặc định.
- **Chỉ có một bản ghi:** Có thể hiển thị giá trị cân nặng/7DMA nhưng không đưa ra kết luận biến động tuần thiếu căn cứ.
- **Thiếu chiều cao:** BMI ghi rõ chưa đủ dữ liệu.
- **Thiếu body fat:** Không tính khối mỡ/khối nạc và không hiển thị số giả.
- **Ngày tương lai hoặc cân nặng không hợp lệ:** Không lưu và thông báo cho người dùng.
- **Xóa hoặc lưu thất bại:** Giữ trạng thái giao diện nhất quán, thông báo lỗi và không báo thành công giả.
- **Không có bản ghi cho một số đo:** Hiển thị trạng thái chưa ghi nhận; không hiển thị `NaN`, `Infinity` hoặc chênh lệch sai.

## 7. Danh Sách File Liên Quan
- `Page/weight.html`: Thẻ chỉ số, Canvas, số đo, lịch sử và modal ghi nhận.
- `js/app.js`: `WeightModule` điều phối form, tính toán hiển thị và thao tác xóa.
- `js/calculator.js`: Tính BMI, 7DMA, xu hướng và thành phần cơ thể.
- `js/chart.js`: Canvas chart engine cho cân nặng và tooltip.
- `js/storage.js`: Đọc/ghi/xóa nhật ký cân nặng và phân tách dữ liệu theo người dùng.
- `css/style.css`, `css/glass.css`: Kiểu dáng thẻ, biểu đồ, lịch sử và modal.
- `Page/health-dashboard.html`, `index.html`: Đồng bộ dữ liệu cân nặng/BMI ở các trang tổng quan.
- `prompt/health-dashboard.fea.md`, `prompt/progress-charts.fea.md`: Đặc tả các trang tổng quan/phân tích; không thay thế trang ghi nhận cân nặng này.

## 8. Tiêu Chí Nghiệm Thu
- Ghi cân nặng hợp lệ lưu đúng ngày/tài khoản và tồn tại sau khi tải lại trang.
- Không lưu cân nặng không dương hoặc ngày trong tương lai.
- Giá trị 7DMA đúng với tối đa 7 bản ghi đã ghi nhận gần nhất, kể cả khi chưa đủ 7 bản ghi.
- BMI, body fat, khối mỡ/khối nạc và chênh lệch số đo chỉ hiển thị khi đủ dữ liệu đầu vào.
- Biểu đồ và tooltip nhất quán với lịch sử; thêm/xóa cập nhật đầy đủ các thành phần và Dashboard.
- Lịch sử hiển thị tối đa 8 lần đo mới nhất theo thứ tự giảm dần.
- Giao diện không vỡ trên mobile/desktop và không phát sinh lỗi JavaScript.
