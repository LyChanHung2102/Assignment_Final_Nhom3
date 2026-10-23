# FitVN Tracker - Ứng Dụng Quản Lý Sức Khỏe & Dinh Dưỡng Cho Gymer Việt Nam

> **FitVN Tracker** là ứng dụng web quản lý dinh dưỡng, calo và theo dõi thể trọng chuyên sâu dành cho gymer Việt Nam. Ứng dụng được xây dựng theo phong cách **Dark Mode Glassmorphism** sang trọng, hiện đại, sử dụng **100% thuần HTML5, CSS3, và Vanilla JavaScript (ES6+)**, tuyệt đối không phụ thuộc vào bất kỳ framework hoặc thư viện bên ngoài nào.

---

## 🌟 Điểm Sáng Kỹ Thuật & Tính Năng Nổi Bật

### 1. Module 1 & 2: Kho Dữ Liệu Món Ăn Việt Nam & Ghi Chép Thực Phẩm Siêu Tốc
- **Kho món Việt phong phú:** Cơm tấm sườn bì chả, Phở bò tái nạm, Bún bò Huế, Bánh mì thịt patê, Ức gà luộc, Khoai lang vàng, Trứng gà, Cá hồi... với đầy đủ chỉ số Calo, Protein, Carbohydrate, và Fat chuẩn xác.
- **Tìm kiếm tức thì (Fuzzy Search):** Tự động loại bỏ dấu tiếng Việt (`removeVietnameseTones`), lọc danh sách thời gian thực với `Array.filter()`.
- **Thao tác 1-Tap Quick Add:** Chỉ 1 cú chạm `[+]` là nạp ngay món ăn vào bữa tương ứng (Sáng, Trưa, Tối, Phụ).
- **Mô phỏng Barcode Scanner siêu thị:** Khung ngắm hiệu ứng tia Laser quét đỏ neon (`@keyframes laserScan`), tra cứu nhanh các sản phẩm gymer phổ biến (*Whey Gold Standard*, *Sữa tươi Vinamilk ít đường*, *Sữa hạt TH true NUT*, *Protein Bar*...).
- **Lưu trữ vĩnh viễn (LocalStorage):** Dữ liệu được serialize an toàn với `try/catch`, không bị mất khi F5 hoặc đóng trình duyệt.

### 2. Module 3: Theo Dõi Thể Trọng & Biểu Đồ Đường Trung Bình Động 7 Ngày (7DMA)
- **Thuật toán 7-Day Moving Average:** Áp dụng kỹ thuật *Sliding Window* lọc sạch dao động nhiễu nước ($0.5\text{kg} - 2\text{kg}$) do lượng muối và carb nạp vào, giúp gymer an tâm không bị áp lực cân ảo.
- **Canvas Chart Engine thuần 100% ([`js/chart.js`](js/chart.js)):**
  - Tự động scale độ phân giải cao theo `window.devicePixelRatio` cho màn hình Retina/OLED.
  - Vẽ đường dao động ngày nét đứt mảnh và đường cong Bézier 7DMA đổi màu Gradient từ **Neon Cyan $\rightarrow$ Emerald Green** phát sáng (`shadowBlur: 12`).
  - Vùng phủ đổ bóng mờ kính đa tầng dưới đường cong.
  - Tooltip tương tác cảm ứng/chuột theo thời gian thực hiển thị ngày, cân nặng, 7DMA, Body Fat % và ghi chú.
- **Thành phần cơ thể & Số đo 4 nhóm cơ:** Tự động tính BMI, phân tách Khối mỡ / Khối nạc (LBM), theo dõi số đo vòng Ngực, Eo, Bắp tay, Đùi kèm chỉ số tăng giảm $\Delta\text{ cm}$.

### 3. Module 4: Dashboard Tổng Quan & Vòng Tròn Calo Phát Sáng
- **Vòng tròn tiến độ Calo SVG (Circular Gauge):** Tính toán toạ độ `stroke-dashoffset` động, đổi màu viền neon rực rỡ, hiển thị số calo còn lại to rõ ở tâm vòng tròn.
- **Phân bổ Macro chuyên sâu:** Tính toán khối lượng gam, phần trăm đạt được và năng lượng sinh ra ($1g\text{ Protein/Carb} = 4\text{kcal}$, $1g\text{ Fat} = 9\text{kcal}$).
- **Hydration Tracker tương tác:** Nạp nước nhanh (+250ml, +500ml, -250ml, Reset) với thanh tiến độ lỏng mờ kính.
- **Tối ưu hóa DOM (Phương án A):** Cache trước các thẻ DOM, cập nhật thuộc tính mục tiêu và gom nhóm danh sách bằng `DocumentFragment`, đảm bảo $60fps$ mượt mà.

---

## 📁 Cấu Trúc Thư Mục Dự Án (Tuân Thủ Quy Định)

```text
d:\Assignment_Final_Nhom3\
├── index.html                   # Trang Chủ (Dashboard): Vòng tròn Calo SVG, Macro, Hydration, 7DMA
├── Page/
│   ├── food-log.html            # Nhật Ký Thực Phẩm: 4 bữa ăn, Modal tìm kiếm món Việt & Quét Barcode
│   ├── weight.html              # Theo Dõi Cân Nặng: Ghi cân, biểu đồ 7DMA, dao động 7 ngày, số đo cơ bắp
│   └── settings.html            # Cài Đặt Cá Nhân: Hồ sơ gymer, Chiều cao, Cân nặng mục tiêu, TDEE
├── css/
│   ├── variables.css            # Hệ màu Dark Obsidian & Neon Accents, spacing scale, blur tokens
│   ├── glass.css                # Hiệu ứng Glassmorphism: backdrop-filter, border phản quang, ambient glow
│   └── style.css                # Mobile-first CSS, Responsive Navigation (Bottom Bar ↔ Sidebar), Card Grids
├── js/
│   ├── foodDatabase.js          # Kho dữ liệu món ăn Việt Nam & Sản phẩm Barcode chuẩn calo/macro
│   ├── calculator.js            # Engine toán học: 7-Day Moving Average, BMI, Body Composition
│   ├── chart.js                 # HTML5 Canvas Chart Engine thuần: Spline Bézier cong mượt, Neon Glow
│   ├── storage.js               # Quản lý LocalStorage an toàn (CRUD thực phẩm, cân nặng, nước uống)
│   └── app.js                   # Module điều phối chính: Dashboard, Navigation, Toast, Settings
├── image/                       # Thư mục lưu trữ assets, media, icons
├── prompt/
│   └── promptkhoitao.md         # Bộ Prompt khởi tạo 4 module chính theo đề bài
└── README.md                    # Tài liệu dự án và nhật ký Vibe Coding
```

---

## 📋 Nhật Ký Prompt Vibe Coding (Prompt Engineering Log)

Theo đúng bảng tiêu chí đánh giá **Rubric Vibe Coding**, dưới đây là bảng tổng hợp các Prompt chuẩn mực đã được lập kế hoạch chi tiết, đánh giá lựa chọn và thực thi xuyên suốt dự án:

| Module | Prompt Yêu Cầu Cốt Lõi | Kế Hoạch Triển Khai (Implementation Plan) & Quyết Định Kỹ Thuật | Kết Quả Đạt Được |
| :--- | :--- | :--- | :--- |
| **Setup & Core UI** | `"Xây dựng bộ khung giao diện Dark Mode Glassmorphism, Responsive Mobile-First với 4 tab chính"` | **Lựa chọn:** Đề xuất 3 phương án Navigation $\rightarrow$ Chọn **Phương án C (Hybrid)**: Bottom Navigation Bar trên mobile (<768px) và Side Navigation Rail trên desktop ($\ge$768px). | Cấu trúc CSS Variables, Glassmorphism backdrop-blur, viền phản quang, không dùng CSS framework. |
| **Module 1 & 2** | `"Kho dữ liệu món ăn Việt Nam, tìm kiếm tức thì, Quick Add 1-Tap và Barcode Scanner giả lập"` | **Lựa chọn:** Cách 1 (Mảng Object JS tĩnh kèm cache LocalStorage) thay vì fetch JSON để tránh hoàn toàn lỗi chặn CORS khi mở file `file:///` offline. | Tìm kiếm không dấu cực nhanh (`Array.filter`), nạp 1 chạm `[+]`, khung ngắm quét laser barcode neon. |
| **Module 3** | `"Theo dõi thể trọng, thuật toán đường trung bình động 7 ngày (7DMA) và biểu đồ xu hướng"` | **Lựa chọn:** Lựa chọn 1 (HTML5 Canvas thuần tự code logic trong `js/chart.js`) thay vì Chart.js để đạt điểm kỹ thuật tối đa và vẽ đường Neon Glow mượt mà. | Thuật toán Sliding Window lọc nhiễu nước; biểu đồ Canvas đa tầng với tooltip tương tác; bảng số đo 4 nhóm cơ bắp. |
| **Multi-page Architecture** | `"Tách các tab thành các trang HTML riêng biệt vào thư mục Page/"` | **Lựa chọn:** Phương án 1: `index.html` tại root đóng vai trò Trang Chủ, 3 trang con độc lập trong `Page/`, dùng chung LocalStorage. | Tách thành công `food-log.html`, `weight.html`, `settings.html`, link tương đối chuẩn, active link viền neon. |
| **Module 4 & Optimization** | `"Dashboard tổng quan, vòng tròn tiến độ calo SVG, widget nước uống và tối ưu hóa toàn bộ code"` | **Lựa chọn:** Phương án A: Targeted Element Cache và `DocumentFragment` batch DOM updates để tránh reflow/repaint, triệt tiêu memory leak. | Vòng tròn Calo SVG phát sáng, Macro phân bổ kcal, Hydration tracker (+250ml/-250ml/Reset), code sạch 0 lỗi console. |

---

## 🚀 Hướng Dẫn Cài Đặt & Trải Nghiệm Ứng Dụng

Ứng dụng được thiết kế theo kiến trúc **Zero-Dependency (Không phụ thuộc thư viện ngoài)**, hoàn toàn tương thích và chạy mượt mà ngay cả khi không có kết nối Internet:

### Cách 1: Chạy trực tiếp (Không cần cài đặt)
1. Tải hoặc giải nén thư mục dự án `Assignment_Final_Nhom3`.
2. Click đúp chuột trực tiếp vào file [`index.html`](index.html) để mở trên bất kỳ trình duyệt hiện đại nào (Chrome, Edge, Safari, Firefox).
3. Trải nghiệm tức thì mọi tính năng mà không bị lỗi CORS!

### Cách 2: Chạy qua Live Server (Khuyên dùng cho lập trình viên)
1. Mở thư mục dự án bằng VS Code hoặc Antigravity.
2. Cài extension **Live Server** (nếu dùng VS Code).
3. Click chuột phải vào [`index.html`](index.html) và chọn **"Open with Live Server"**.

---

## 📱 Khả Năng Tương Thích & Responsive

- **Màn hình Mobile (360px - 767px):** Thanh Bottom Navigation Bar cố định ở đáy ngón cái (Thumb Zone), các thẻ Card xếp dọc, bảng số đo cơ bắp co giãn linh hoạt.
- **Màn hình Tablet (768px - 1023px):** Tự động chuyển thành thanh Sidebar bên trái, lưới thẻ hiển thị 2 cột cân đối.
- **Màn hình Desktop / Laptop ($\ge$ 1024px):** Sidebar mở rộng đầy đủ logo và thông tin gymer, lưới Dashboard hiển thị 3 - 4 cột tối ưu diện tích màn hình lớn.

---

*Dự án FitVN Tracker - Bài tập lớn phát triển ứng dụng Frontend chuẩn Vibe Coding.*
