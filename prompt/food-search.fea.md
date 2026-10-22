# Tài Liệu Đặc Tả Tính Năng: Tìm Kiếm & Tra Cứu Thực Phẩm (food-search.fea.md)

## 1. Mục tiêu
Cung cấp công cụ tra cứu bách khoa toàn thư dinh dưỡng cho người dùng FitVN Tracker. Cho phép tìm kiếm thực phẩm theo tên (hỗ trợ tiếng Việt không dấu), lọc theo 5 nhóm danh mục dinh dưỡng thiết yếu (Rau củ, Trái cây, Thịt cá, Ngũ cốc, Sữa & Chế phẩm), tính toán lượng calo và đa vi chất (Protein, Carbs, Fat, Fiber) linh hoạt theo khẩu phần ăn, cùng cửa sổ chi tiết Nutrition Facts khoa học.

## 2. Đối tượng sử dụng
Người tập gym, gymer, người đang theo chế độ ăn kiêng Eat Clean, Keto, Lean Bulk hoặc người quan tâm đến việc kiểm soát năng lượng và thành phần dinh dưỡng nạp vào cơ thể.

## 3. Yêu cầu chức năng
1. **Tìm kiếm theo tên**:
   - Thanh input tìm kiếm trực quan có icon và nút xóa nhanh.
   - Hỗ trợ tìm kiếm tiếng Việt mờ (fuzzy search): "ức gà" = "uc ga", "bò" = "bo"...
2. **Lọc danh mục (Categories Filter)**:
   - Tất cả (All)
   - Rau củ (Vegetables)
   - Trái cây (Fruits)
   - Thịt cá / Hải sản / Trứng (Meat & Fish)
   - Ngũ cốc / Tinh bột (Grains & Carbs)
   - Sữa & Chế phẩm từ sữa (Dairy & Milk)
3. **Hiển thị thẻ thực phẩm (Food Card)**:
   - Tên thực phẩm, icon minh họa sinh động.
   - Badge nhóm danh mục.
   - Khẩu phần chuẩn (g, ml, đĩa, quả, muỗng...).
   - Lượng Calo nổi bật (kcal).
   - 4 chỉ số dinh dưỡng: Protein (g), Carbohydrate (g), Fat (g), Fiber (Chất xơ - g).
4. **Tính toán khẩu phần linh hoạt**:
   - Cho phép chọn nhanh hệ số khẩu phần (0.5x, 1x, 1.5x, 2x, 3x) hoặc nhập số khẩu phần tùy ý.
   - Dữ liệu dinh dưỡng tự động nhân tương ứng theo thời gian thực mà không cần tải lại trang.
5. **Cửa sổ chi tiết (Nutrition Facts Modal)**:
   - Hiển thị bảng giá trị dinh dưỡng chi tiết.
   - Biểu đồ phân bổ tỷ lệ năng lượng từ Đạm/Tinh bột/Chất béo.
   - Ghi chú minh bạch về nguồn tham khảo dữ liệu dinh dưỡng (Viện Dinh Dưỡng Quốc Gia & USDA).
6. **Xử lý trạng thái rỗng**:
   - Khi không tìm thấy kết quả: hiển thị thông điệp và gợi ý từ khóa phù hợp.
7. **Khả năng mở rộng API**:
   - Tổ chức module `foodDatabase.js` theo dạng Service Interface (`searchFoods`, `getFoodById`, `calculateServingNutrition`) sẵn sàng kết nối API ngoài.

## 4. Giao diện & Trải nghiệm UI/UX
- Chuẩn thiết kế **Jade & Porcelain** theo `rule.md`:
  - Nền sứ `#F7F6F0`, thẻ card `#FFFEFA` viền `#DDE3D9`.
  - Màu thương hiệu chính: Xanh Jade `#173F35`, điểm xuyết Xanh Sage `#397866`.
  - Phông chữ Be Vietnam Pro hỗ trợ tiếng Việt sắc nét.
- Responsive đa thiết bị (Desktop, Tablet, Mobile).

## 5. Tiêu chí nghiệm thu
- Tìm kiếm tức thì, không giật lag.
- Lọc danh mục chính xác 100%.
- Tính toán khẩu phần không bao giờ ra `NaN` hay sai lệch.
- Modal chi tiết hiển thị đầy đủ Protein, Carbs, Fat, Fiber và Calo.
- Không có lỗi JavaScript console.
