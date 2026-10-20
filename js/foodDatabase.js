/**
 * FitVN Tracker - Vietnamese Food Database & Barcode Items
 * Accurate Macro & Calorie data tailored for Vietnamese Fitness Enthusiasts
 */

const VIETNAMESE_FOOD_DATABASE = [
  // --- Món ăn truyền thống Việt Nam ---
  {
    id: 'vn-01',
    name: 'Cơm tấm sườn bì chả',
    serving: '1 đĩa tiêu chuẩn (350g)',
    calories: 765,
    protein: 34.5,
    carbs: 88.0,
    fat: 30.2,
    category: 'vietnamese',
    tag: 'Bữa chính',
    barcode: '893000000001',
    icon: '🍛'
  },
  {
    id: 'vn-02',
    name: 'Phở bò tái nạm',
    serving: '1 tô vừa (500g)',
    calories: 520,
    protein: 32.0,
    carbs: 65.0,
    fat: 14.5,
    category: 'vietnamese',
    tag: 'Bữa chính',
    barcode: '893000000002',
    icon: '🍜'
  },
  {
    id: 'vn-03',
    name: 'Bún bò Huế (bắp bò, giò gân)',
    serving: '1 tô đầy đủ (550g)',
    calories: 620,
    protein: 36.0,
    carbs: 70.0,
    fat: 21.0,
    category: 'vietnamese',
    tag: 'Bữa chính',
    barcode: '893000000003',
    icon: '🍲'
  },
  {
    id: 'vn-04',
    name: 'Bánh mì thịt chả patê',
    serving: '1 ổ vừa (180g)',
    calories: 450,
    protein: 18.5,
    carbs: 52.0,
    fat: 19.0,
    category: 'vietnamese',
    tag: 'Bữa sáng/phụ',
    barcode: '893000000004',
    icon: '🥖'
  },
  {
    id: 'vn-05',
    name: 'Hủ tiếu Nam Vang',
    serving: '1 tô (450g)',
    calories: 480,
    protein: 26.0,
    carbs: 62.0,
    fat: 14.0,
    category: 'vietnamese',
    tag: 'Bữa chính',
    barcode: '893000000005',
    icon: '🍜'
  },
  {
    id: 'vn-06',
    name: 'Cơm gà xối mỡ đùi góc tư',
    serving: '1 đĩa (400g)',
    calories: 820,
    protein: 42.0,
    carbs: 92.0,
    fat: 32.0,
    category: 'vietnamese',
    tag: 'Bữa chính',
    barcode: '893000000006',
    icon: '🍗'
  },

  // --- Thực phẩm Gym Staple (Tăng cơ giảm mỡ chuẩn khoa học) ---
  {
    id: 'gym-01',
    name: 'Ức gà luộc xé phay',
    serving: '150g chín',
    calories: 248,
    protein: 46.5,
    carbs: 0.0,
    fat: 5.4,
    category: 'gym_staple',
    tag: 'High Protein',
    barcode: '893000000010',
    icon: '🍗'
  },
  {
    id: 'gym-02',
    name: 'Khoai lang vàng hấp/luộc',
    serving: '200g (khoảng 1 củ vừa)',
    calories: 172,
    protein: 3.2,
    carbs: 40.2,
    fat: 0.2,
    category: 'gym_staple',
    tag: 'Clean Carb',
    barcode: '893000000011',
    icon: '🍠'
  },
  {
    id: 'gym-03',
    name: 'Trứng gà luộc (2 quả lớn)',
    serving: '2 quả (100g)',
    calories: 143,
    protein: 12.6,
    carbs: 0.8,
    fat: 9.9,
    category: 'gym_staple',
    tag: 'Protein & Fat tốt',
    barcode: '893000000012',
    icon: '🥚'
  },
  {
    id: 'gym-04',
    name: 'Cơm gạo lứt huyết rồng',
    serving: '1 chén (150g)',
    calories: 165,
    protein: 3.8,
    carbs: 35.0,
    fat: 1.2,
    category: 'gym_staple',
    tag: 'Clean Carb',
    barcode: '893000000013',
    icon: '🍚'
  },
  {
    id: 'gym-05',
    name: 'Cá hồi Na Uy áp chảo',
    serving: '150g',
    calories: 312,
    protein: 34.0,
    carbs: 0.0,
    fat: 19.5,
    category: 'gym_staple',
    tag: 'Omega-3',
    barcode: '893000000014',
    icon: '🐟'
  },
  {
    id: 'gym-06',
    name: 'Thịt bò xào súp lơ xanh',
    serving: '1 đĩa vừa (250g)',
    calories: 340,
    protein: 38.0,
    carbs: 9.0,
    fat: 16.0,
    category: 'gym_staple',
    tag: 'High Protein',
    barcode: '893000000015',
    icon: '🥩'
  },
  {
    id: 'gym-07',
    name: 'Chuối tiêu tiêu chuẩn',
    serving: '1 quả vừa (120g)',
    calories: 105,
    protein: 1.3,
    carbs: 27.0,
    fat: 0.3,
    category: 'gym_staple',
    tag: 'Pre-workout',
    barcode: '893000000016',
    icon: '🍌'
  },

  // --- Sản phẩm Barcode siêu thị & Thực phẩm bổ sung Gymer ---
  {
    id: 'bc-01',
    name: 'Whey Gold Standard 100% (Optimum Nutrition)',
    serving: '1 muỗng gạt (30.4g)',
    calories: 120,
    protein: 24.0,
    carbs: 3.0,
    fat: 1.5,
    category: 'supplement',
    tag: 'Whey Isolate',
    barcode: '748927028669',
    brand: 'Optimum Nutrition',
    icon: '🥤'
  },
  {
    id: 'bc-02',
    name: 'Sữa tươi tiệt trùng Vinamilk 100% Ít đường',
    serving: '1 hộp (180ml)',
    calories: 130,
    protein: 5.6,
    carbs: 15.0,
    fat: 5.4,
    category: 'beverage',
    tag: 'Siêu thị VN',
    barcode: '8934673105432',
    brand: 'Vinamilk',
    icon: '🥛'
  },
  {
    id: 'bc-03',
    name: 'Sữa hạt óc chó TH true NUT',
    serving: '1 hộp (180ml)',
    calories: 78,
    protein: 1.8,
    carbs: 9.2,
    fat: 3.8,
    category: 'beverage',
    tag: 'Sữa hạt',
    barcode: '8936077083012',
    brand: 'TH true MILK',
    icon: '🌰'
  },
  {
    id: 'bc-04',
    name: 'Sữa chua Hy Lạp Vinamilk Greek Yoghurt',
    serving: '1 hộp (100g)',
    calories: 95,
    protein: 7.0,
    carbs: 8.5,
    fat: 3.6,
    category: 'snack',
    tag: 'Siêu thị VN',
    barcode: '8934673620980',
    brand: 'Vinamilk',
    icon: '🥣'
  },
  {
    id: 'bc-05',
    name: 'Bánh Protein Bar Play Nutrition Vị Chuối Socola',
    serving: '1 thanh (45g)',
    calories: 175,
    protein: 10.5,
    carbs: 19.0,
    fat: 6.0,
    category: 'supplement',
    tag: 'Gym Snack',
    barcode: '8938521742018',
    brand: 'Play Nutrition',
    icon: '🍫'
  },
  {
    id: 'bc-06',
    name: 'Nước dừa tươi Cocoxim xiêm xanh đóng hộp',
    serving: '1 hộp (330ml)',
    calories: 68,
    protein: 0.7,
    carbs: 15.5,
    fat: 0.2,
    category: 'beverage',
    tag: 'Điện giải tự nhiên',
    barcode: '8936034071540',
    brand: 'Cocoxim',
    icon: '🥥'
  }
];

// Helper to remove Vietnamese accents for fuzzy searching
function removeVietnameseTones(str) {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  str = str.replace(/\u02C6|\u0306|\u031B/g, '');
  return str.trim();
}

// Expose globally
window.VIETNAMESE_FOOD_DATABASE = VIETNAMESE_FOOD_DATABASE;
window.removeVietnameseTones = removeVietnameseTones;
