Dưới đây là bản `RULE.md` đã được bổ sung theo đúng format và cấu trúc 13 mục của bạn. Mình giữ nguyên các quy tắc kỹ thuật, cấu trúc thư mục và quy trình làm việc, đồng thời cập nhật mục 3 theo bảng màu Jade & Porcelain, bổ sung font hỗ trợ tiếng Việt và đồng bộ các quy tắc UI với bộ màu mới.

Writing

# RULE.md — FitVN Tracker

## 1\. Công nghệ bắt buộc

- HTML5.
- CSS3.
- Vanilla JavaScript ES6+.
- Web APIs có sẵn trong trình duyệt.

Không sử dụng framework, thư viện UI, thư viện biểu đồ hoặc package bên ngoài.

Không dùng React, Vue, Angular, Bootstrap, Tailwind CSS, jQuery hoặc TypeScript.

Biểu đồ phải được triển khai bằng SVG, Canvas hoặc HTML/CSS thuần.

Không sử dụng công cụ build hoặc bundler nếu chưa được phê duyệt.

## 2\. Cấu trúc thư mục

```
FitVN-Tracker/
├── index.html
├── css/
│   ├── variables.css
│   ├── style.css
│   └── glass.css
├── js/
│   ├── app.js
│   ├── storage.js
│   ├── calculator.js
│   └── chart.js
├── image/
│   ├── assets/
│   └── icons/
├── Page/
│   └── [các trang con nếu cần]
├── prompt/
│   └── [feature-name].fea.md
├── skill.md
├── plan.md
└── rule.md
```

### Quy tắc cấu trúc

- Không tự ý tạo thêm thư mục hoặc thay đổi tên file cốt lõi.
- Nếu cần module hoặc thư mục mới, phải trình bày lý do và chờ duyệt.
- Dùng đường dẫn tương đối phù hợp với vị trí file.
- Tên file dùng chữ thường, kebab-case khi có nhiều từ; giữ nguyên tên các file cốt lõi đã quy định.
- Mỗi feature mới phải có tài liệu trong `prompt/`.
- Không nhúng toàn bộ CSS hoặc JavaScript vào HTML nếu không có lý do được duyệt.
- Nếu cần bổ sung font cục bộ, phải trình bày vị trí lưu trữ và chờ duyệt trước khi tạo thư mục mới.
- Không di chuyển hoặc ghi đè file hiện có khi chưa kiểm tra nội dung.

## 3\. Hệ thống màu sắc

Định nghĩa toàn bộ màu sắc và design tokens trong `css/variables.css`.

Bảng màu thương hiệu được lựa chọn là **Jade & Porcelain — Premium Wellness**.

Định hướng thiết kế:

- Tinh tế, hiện đại, có gu thẩm mỹ riêng.
- Truyền tải cảm giác sức khỏe, khoa học và lối sống lành mạnh.
- Sử dụng xanh jade làm màu thương hiệu chính.
- Sử dụng trắng sứ làm nền giao diện sáng.
- Sử dụng citron làm màu nhấn nhận diện có chọn lọc.
- Không lạm dụng màu neon, gradient, glow hoặc hiệu ứng trang trí.
- Không tự ý thay đổi bảng màu thương hiệu nếu chưa được duyệt.

### 3.1. Bảng màu trong `css/variables.css`

```
:root {
  /* Brand */
  --color-primary: #173F35;
  --color-primary-hover: #245747;
  --color-primary-soft: #E5EDE7;
  --color-primary-contrast: #FFFFFF;

  /* Accent — Signature Citron */
  --color-accent: #D2F36B;
  --color-accent-hover: #C1E451;
  --color-accent-soft: #EEF8CD;
  --color-accent-text: #26351D;

  /* Background */
  --color-bg: #F7F6F0;
  --color-surface: #FFFEFA;
  --color-surface-raised: #F0F1E9;
  --color-glass: rgba(255, 254, 250, 0.78);

  /* Text */
  --color-text: #202B28;
  --color-text-secondary: #63756B;
  --color-text-muted: #829087;
  --color-text-inverse: #F7F6F0;

  /* Borders */
  --color-border: #DDE3D9;
  --color-border-strong: #BECBC0;
  --color-border-focus: #397866;

  /* Supporting Brand Colors */
  --color-jade: #173F35;
  --color-sage: #397866;
  --color-citron: #D2F36B;
  --color-porcelain: #F7F6F0;
  --color-ink: #202B28;
  --color-clay: #C47D60;

  /* Status */
  --color-success: #287653;
  --color-success-bg: #E5F2E9;

  --color-warning: #946414;
  --color-warning-bg: #FBF0D5;

  --color-danger: #B83E42;
  --color-danger-bg: #FBE9E7;

  --color-info: #326B82;
  --color-info-bg: #E5F0F4;

  /* BMI Display */
  --color-bmi-underweight: #326B82;
  --color-bmi-normal: #287653;
  --color-bmi-overweight: #946414;
  --color-bmi-obesity: #B83E42;

  /* Nutrition */
  --color-protein: #397866;
  --color-carbs: #D5A64B;
  --color-fat: #C47D60;
  --color-water: #528BA0;
  --color-calories: #173F35;

  /* Charts */
  --color-chart-1: #397866;
  --color-chart-2: #C47D60;
  --color-chart-3: #8B83A8;
  --color-chart-4: #D5A64B;
  --color-chart-5: #528BA0;
  --color-chart-grid: #DDE3D9;
  --color-chart-label: #63756B;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Shadows */
  --shadow-card: 0 4px 20px rgba(23, 63, 53, 0.06);
  --shadow-card-hover: 0 10px 30px rgba(23, 63, 53, 0.10);
  --shadow-dropdown: 0 8px 24px rgba(23, 63, 53, 0.10);
  --shadow-modal: 0 20px 60px rgba(23, 63, 53, 0.18);
  --shadow-focus: 0 0 0 3px rgba(57, 120, 102, 0.20);

  /* Motion */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;

  /* Typography — Vietnamese Support */
  --font-family:
    "Be Vietnam Pro",
    "Noto Sans",
    "Segoe UI",
    Arial,
    sans-serif;

  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Layout */
  --container-max-width: 1440px;
  --sidebar-width: 260px;
  --header-height: 72px;

  /* Z-index */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;
}
```

### 3.2. Quy tắc sử dụng màu

- `--color-primary`: dùng cho nút chính, thành phần điều hướng đang chọn, liên kết quan trọng và các thành phần nhận diện thương hiệu.
- `--color-accent`: dùng cho điểm nhấn, chỉ số nổi bật, tiến độ và một số hành động quan trọng. Không dùng làm màu nền diện rộng.
- `--color-bg`: nền tổng thể của website.
- `--color-surface`: nền card, form, bảng và panel.
- `--color-surface-raised`: vùng nội dung phụ, thành phần nổi hoặc trạng thái hover nhẹ.
- `--color-text`: nội dung chính.
- `--color-text-secondary`: nội dung phụ.
- `--color-text-muted`: metadata, chú thích và nhãn phụ; phải đảm bảo độ tương phản phù hợp.
- `--color-border` và `--color-border-strong`: viền mặc định và viền cần nhấn mạnh.
- `--color-border-focus`: trạng thái focus của thành phần tương tác.
- Các màu trạng thái và BMI phải giữ ý nghĩa nhất quán trên toàn ứng dụng.
- Màu biểu đồ phải nhất quán giữa dashboard, trang chi tiết và báo cáo.
- Không truyền đạt trạng thái chỉ bằng màu sắc; phải có nhãn, biểu tượng hoặc thông tin bổ sung phù hợp.
- Không sử dụng màu nhấn để trang trí nếu không có mục đích rõ ràng.

### 3.3. Quy tắc quản lý màu CSS

- Không sử dụng mã màu rải rác trong các file CSS khi đã có biến tương ứng.
- Nếu cần màu mới, ưu tiên tái sử dụng biến hiện có.
- Nếu chưa có biến phù hợp, phải bổ sung biến có tên ngữ nghĩa trong `variables.css`.
- Không tạo nhiều biến trùng chức năng hoặc trùng ý nghĩa.
- Không thay đổi biến toàn cục chỉ để sửa một thành phần cục bộ nếu có thể giải quyết bằng class riêng.
- Các giá trị màu ngoại lệ chỉ được sử dụng khi thực sự cần thiết, có lý do rõ ràng và được phê duyệt.
- Các giá trị màu nằm trong SVG hoặc Canvas cũng phải được lấy từ hệ thống design tokens khi có thể.
- Không tự ý chuyển sang Dark Mode hoặc thay đổi toàn bộ bảng màu khi chưa được duyệt.

### 3.4. Font chữ hỗ trợ tiếng Việt

Font chính của dự án là **Be Vietnam Pro**.

```
--font-family:
  "Be Vietnam Pro",
  "Noto Sans",
  "Segoe UI",
  Arial,
  sans-serif;
```

Quy tắc:

- Be Vietnam Pro là font ưu tiên cho nội dung tiếng Việt.
- Noto Sans, Segoe UI và Arial là các font dự phòng.
- Không giả định Be Vietnam Pro đã có sẵn trên thiết bị.
- Nếu được phép sử dụng font trực tuyến, có thể nạp Be Vietnam Pro từ Google Fonts.
- Nếu cần hỗ trợ offline, sử dụng font `.woff2` cục bộ và khai báo bằng `@font-face`.
- Không tự ý thêm thư mục hoặc tài nguyên font mới nếu chưa được duyệt.
- Nội dung tiếng Việt phải hiển thị chính xác dấu thanh và ký tự đặc biệt.
- Heading ưu tiên font-weight 600–700; nội dung thường sử dụng 400–500.
- Ưu tiên line-height 1.5 cho nội dung thông thường.

## 4\. Quy tắc thiết kế UI

- Ưu tiên phong cách dashboard sức khỏe hiện đại, rõ ràng, tinh tế và dễ sử dụng.
- Áp dụng concept Jade & Porcelain với xanh jade làm màu chủ đạo, nền trắng sứ và citron làm điểm nhấn.
- Không mặc định sử dụng nền tối. Giao diện mặc định theo hệ màu sáng đã được lựa chọn.
- Nếu bổ sung Dark Mode, phải xây dựng bảng màu riêng và chờ duyệt.
- Các card phải có padding, border và radius nhất quán.
- Hạn chế sử dụng gradient, shadow hoặc hiệu ứng glass quá mức.
- Có trạng thái hover, focus, active và disabled phù hợp.
- Animation ngắn, mượt và không gây cản trở thao tác.
- Tôn trọng `prefers-reduced-motion`.
- Responsive theo mobile-first.
- Không truyền đạt trạng thái chỉ bằng màu sắc.
- Sử dụng semantic HTML và đảm bảo độ tương phản dễ đọc.
- Ưu tiên phân cấp thị giác rõ ràng giữa tiêu đề, chỉ số, nhãn và nội dung mô tả.
- Không sử dụng quá nhiều màu nổi bật trên cùng một màn hình.
- Không hy sinh khả năng đọc để đổi lấy tính thẩm mỹ.

## 5\. Quy tắc CSS

- Đặt biến dùng chung trong `variables.css`.
- Đặt layout, component và responsive trong `style.css`.
- Đặt hiệu ứng glass trong `glass.css`.
- Tránh selector quá dài hoặc phụ thuộc cấu trúc DOM sâu.
- Không lạm dụng `!important`.
- Không đặt style inline trừ trường hợp đặc biệt được phê duyệt.
- Gom media query theo breakpoint nhất quán.
- Không lặp lại các khai báo CSS đã có thể tái sử dụng.
- Dùng class theo ý nghĩa chức năng, ví dụ `.bmi-card`, `.meal-entry`, `.progress-bar`.
- Không sửa style toàn cục để giải quyết một vấn đề cục bộ nếu có thể xử lý bằng class riêng.
- Ưu tiên CSS custom properties thay vì hardcode giá trị thiết kế.
- Đảm bảo các component hoạt động đúng trên màn hình nhỏ, màn hình lớn và thiết bị cảm ứng.
- Kiểm tra trạng thái focus bàn phím và khả năng truy cập trước khi hoàn thiện.

## 6\. Quy tắc JavaScript

- Dùng `const` mặc định và `let` khi cần.
- Tên biến/hàm theo camelCase.
- Tên class theo PascalCase nếu cần sử dụng class.
- Dùng `addEventListener`, không viết inline event handler.
- Tách logic tính toán, lưu trữ và render giao diện.
- Tránh biến global không cần thiết.
- Tránh lặp lại logic nghiệp vụ.
- Dùng `map`, `filter`, `reduce` khi phù hợp.
- Hạn chế query DOM lặp lại.
- Sử dụng event delegation khi có lợi.
- Xác thực dữ liệu ở cả bước nhập, xử lý và lưu trữ.
- Không dùng `eval()` hoặc `new Function()`.
- Không chèn dữ liệu chưa kiểm soát qua `innerHTML`.
- Không để `console.log` debug trong bản hoàn thiện.
- Không nuốt lỗi bằng `catch` rỗng.
- Không tuyên bố tính năng đã hoạt động nếu chưa kiểm thử.
- Xử lý các trường hợp dữ liệu rỗng, dữ liệu sai định dạng và lỗi từ Web APIs.

## 7\. Quy tắc module

### `app.js`

- Khởi tạo ứng dụng.
- Thiết lập các event listener chính.
- Điều phối các module.
- Không chứa toàn bộ logic nghiệp vụ.

### `storage.js`

- Cung cấp các hàm lưu, đọc, cập nhật và xóa dữ liệu.
- Chuẩn hóa và kiểm tra dữ liệu trước khi sử dụng.
- Xử lý lỗi đọc/ghi `localStorage`.
- Không phụ thuộc trực tiếp vào cấu trúc HTML.

### `calculator.js`

- Chứa các hàm tính toán thuần khi có thể.
- Kiểm tra đơn vị và dữ liệu đầu vào.
- Trả kết quả nhất quán.
- Không thao tác trực tiếp với DOM.

### `chart.js`

- Vẽ biểu đồ bằng SVG hoặc Canvas thuần.
- Tách dữ liệu biểu đồ khỏi giao diện.
- Xử lý dữ liệu rỗng và kích thước màn hình.
- Đảm bảo nhãn và giá trị có thể đọc được.
- Sử dụng màu từ design tokens của `variables.css` khi có thể.
- Không sử dụng thư viện biểu đồ bên ngoài.

Nếu cần module mới, phải trình bày lý do, phạm vi ảnh hưởng và chờ phê duyệt.

## 8\. Quy tắc tính toán sức khỏe

### BMI

- Công thức: BMI = cân nặng (kg) / chiều cao (m)².
- Chiều cao phải lớn hơn 0.
- Cân nặng phải là số hợp lệ và lớn hơn 0.
- Không tính khi dữ liệu chưa hợp lệ.
- Phân loại BMI phải theo chuẩn được lựa chọn và ghi rõ trong tài liệu feature.
- Không dùng BMI như một chẩn đoán y tế.
- Màu BMI phải sử dụng các biến `--color-bmi-*` đã định nghĩa.

### Calo và dinh dưỡng

- Ghi rõ đơn vị của mỗi giá trị.
- Quy đổi khẩu phần phải nhất quán.
- Không cộng dữ liệu thiếu như thể đó là dữ liệu chính xác.
- Làm rõ giả định của công thức BMR/TDEE.
- Không xem calo ước tính là số đo tuyệt đối.
- Không đưa ra lời khuyên dinh dưỡng có tính chẩn đoán.
- Các nhóm protein, carbohydrate, chất béo và nước phải sử dụng màu biểu đồ nhất quán.

## 9\. Quy tắc dữ liệu

- Dùng ID ổn định cho bản ghi.
- Chuẩn hóa ngày tháng theo một định dạng nhất quán.
- Tách hồ sơ người dùng, lịch sử cân nặng, nhật ký ăn uống và mục tiêu.
- Kiểm tra dữ liệu đọc từ `localStorage`.
- Có cách xử lý dữ liệu cũ khi schema thay đổi.
- Không ghi đè dữ liệu hiện có nếu chưa có phương án migration.
- Xác nhận trước khi xóa dữ liệu quan trọng.
- Không lưu thông tin nhạy cảm hoặc mật khẩu trong `localStorage`.
- Không giả định dữ liệu lưu trên trình duyệt là đã được sao lưu an toàn.
- Xử lý lỗi lưu trữ và thông báo rõ ràng khi không thể lưu dữ liệu.

## 10\. Quy tắc prompt feature

Tên file feature sử dụng định dạng:

```
prompt/
├── bmi.fea.md
├── weight-tracking.fea.md
├── calorie-tracking.fea.md
├── meal-log.fea.md
├── meal-plan.fea.md
└── [feature-name].fea.md
```

Mỗi file phải có:

- Mục tiêu feature.
- Phạm vi chức năng.
- Yêu cầu UI/UX.
- Mô hình dữ liệu.
- Luồng hoạt động.
- Validation và xử lý lỗi.
- Danh sách file dự kiến ảnh hưởng.
- Tiêu chí nghiệm thu.

Quy tắc:

- Mỗi feature mới phải có prompt tương ứng trước khi triển khai.
- Không tự ý mở rộng phạm vi feature đã được duyệt.
- Prompt phải tuân thủ công nghệ, cấu trúc thư mục và design tokens của dự án.
- Không tạo hoặc sửa file code trước khi Implementation Plan được xác nhận.

## 11\. Quy trình bắt buộc trước và sau khi code

### Trước khi code

1. Đọc các file liên quan.
2. Phân tích yêu cầu và trạng thái hiện tại của dự án.
3. Xác định file cần tạo hoặc sửa.
4. Trình bày Implementation Plan, gồm:
   - Các file bị ảnh hưởng.
   - Hàm, module hoặc logic sẽ thêm/sửa.
   - Luồng dữ liệu.
   - Phương án kiểm thử.
5. Nêu 2–3 phương án nếu có lựa chọn quan trọng, kèm ưu điểm và nhược điểm.
6. Chờ người dùng xác nhận.

Không chỉnh sửa file hoặc viết code triển khai trước khi nhận được xác nhận.

### Sau khi code

1. Kiểm tra cú pháp và hành vi.
2. Kiểm tra dữ liệu đầu vào và trường hợp biên.
3. Kiểm tra responsive.
4. Kiểm tra console.
5. Kiểm tra các feature liên quan.
6. Kiểm tra giao diện, màu sắc, font tiếng Việt và độ tương phản.
7. Cập nhật tài liệu feature.
8. Báo cáo chính xác những gì đã làm và chưa làm.

Không tuyên bố đã chạy kiểm thử nếu chưa thực sự chạy.

## 12\. Quy tắc Git và thay đổi phạm vi

- Không tự ý xóa file.
- Không tự ý cài dependency.
- Không tự ý thay đổi công nghệ.
- Không ghi đè file của người dùng khi chưa xem nội dung.
- Không đưa secret, token hoặc thông tin cá nhân vào mã nguồn.
- Thay đổi ngoài phạm vi phải được đề xuất trước.
- Không tự ý đổi bảng màu, font, cấu trúc thư mục hoặc kiến trúc module đã được duyệt.
- Không tự ý tạo commit, push hoặc thay đổi lịch sử Git nếu chưa được yêu cầu.
- Bảo toàn các thay đổi hiện có của người dùng.

## 13\. Tiêu chí chất lượng cuối cùng

Một feature chỉ được xem là hoàn thành khi:

- Đúng yêu cầu đã được duyệt.
- Giao diện hoạt động trên kích thước màn hình mục tiêu.
- Dữ liệu hợp lệ và được xử lý nhất quán.
- Có xử lý trạng thái rỗng và lỗi cần thiết.
- Không có lỗi console chưa được giải quyết.
- Không làm hỏng chức năng liên quan.
- Tài liệu feature được cập nhật.
- Kết quả kiểm thử được báo cáo trung thực.
- Không sử dụng framework hoặc dependency ngoài phạm vi cho phép.
- Các file CSS sử dụng design tokens thống nhất.
- Giao diện tuân thủ bảng màu Jade & Porcelain đã được duyệt.
- Font tiếng Việt hiển thị chính xác.
- Các trạng thái tương tác và nội dung quan trọng đáp ứng yêu cầu về khả năng truy cập.
- Không có thay đổi ngoài phạm vi chưa được phê duyệt.
