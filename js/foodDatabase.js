

const VIETNAMESE_FOOD_DATABASE = [
  
  {
    id: 'mf-01',
    name: 'Ức gà phi lê luộc / áp chảo',
    serving: '150g chín',
    servingUnit: 'phần 150g',
    servingWeightGrams: 150,
    calories: 248,
    protein: 46.5,
    carbs: 0.0,
    fat: 5.4,
    fiber: 0.0,
    category: 'meat_fish',
    tag: 'Đạm cao ít béo',
    icon: '🍗',
    description: 'Thực phẩm vàng cho người tập gym, giàu leucine hỗ trợ tổng hợp protein cơ bắp tối đa.'
  },
  {
    id: 'mf-02',
    name: 'Thịt bò bắp / thăn áp chảo',
    serving: '150g chín',
    servingUnit: 'phần 150g',
    servingWeightGrams: 150,
    calories: 290,
    protein: 39.0,
    carbs: 0.0,
    fat: 13.5,
    fiber: 0.0,
    category: 'meat_fish',
    tag: 'Giàu Kẽm & Sắt',
    icon: '🥩',
    description: 'Cung cấp creatine tự nhiên, sắt heme và vitamin B12 giúp tăng cường thể lực và sức bền.'
  },
  {
    id: 'mf-03',
    name: 'Cá hồi Na Uy áp chảo',
    serving: '150g',
    servingUnit: 'miếng 150g',
    servingWeightGrams: 150,
    calories: 312,
    protein: 34.0,
    carbs: 0.0,
    fat: 19.5,
    fiber: 0.0,
    category: 'meat_fish',
    tag: 'Giàu Omega-3',
    icon: '🐟',
    description: 'Nguồn chất béo kháng viêm tuyệt vời, bảo vệ tim mạch và phục hồi khớp xương sau tập nặng.'
  },
  {
    id: 'mf-04',
    name: 'Trứng gà luộc tiêu chuẩn',
    serving: '2 quả vừa (100g)',
    servingUnit: '2 quả (100g)',
    servingWeightGrams: 100,
    calories: 143,
    protein: 12.6,
    carbs: 0.8,
    fat: 9.9,
    fiber: 0.0,
    category: 'meat_fish',
    tag: 'Đạm sinh học cao',
    icon: '🥚',
    description: 'Điểm sinh học tuyệt đối, giàu choline nuôi dưỡng tế bào não và màng cơ.'
  },
  {
    id: 'mf-05',
    name: 'Tôm thẻ hấp nước dừa',
    serving: '150g chín',
    servingUnit: 'phần 150g',
    servingWeightGrams: 150,
    calories: 148,
    protein: 32.0,
    carbs: 1.2,
    fat: 1.6,
    fiber: 0.0,
    category: 'meat_fish',
    tag: 'Siêu nạc',
    icon: '🦐',
    description: 'Món ăn hải sản giàu canxi, đạm nạc tinh khiết gần như không chứa chất béo bão hòa.'
  },
  {
    id: 'mf-06',
    name: 'Cá điêu hồng hấp gừng hành',
    serving: '200g phần thịt',
    servingUnit: 'phần 200g',
    servingWeightGrams: 200,
    calories: 210,
    protein: 38.0,
    carbs: 0.5,
    fat: 5.5,
    fiber: 0.0,
    category: 'meat_fish',
    tag: 'Dễ tiêu hóa',
    icon: '🐟',
    description: 'Cá thịt trắng dễ hấp thu, vị thanh ngọt tự nhiên, rất tốt cho bữa trưa và bữa tối.'
  },

  
  {
    id: 'veg-01',
    name: 'Bông cải xanh (Súp lơ xanh) luộc',
    serving: '150g',
    servingUnit: 'chén 150g',
    servingWeightGrams: 150,
    calories: 52,
    protein: 4.2,
    carbs: 9.8,
    fat: 0.6,
    fiber: 3.9,
    category: 'vegetables',
    tag: 'Giàu Sulforaphane',
    icon: '🥦',
    description: 'Vua của các loại rau cho gymer, giàu vitamin C, canxi và hoạt chất chống oxy hóa mạnh mẽ.'
  },
  {
    id: 'veg-02',
    name: 'Rau chân vịt (Cải bó xôi) luộc',
    serving: '150g',
    servingUnit: 'phần 150g',
    servingWeightGrams: 150,
    calories: 35,
    protein: 4.5,
    carbs: 5.4,
    fat: 0.4,
    fiber: 3.6,
    category: 'vegetables',
    tag: 'Giàu Magie & Sắt',
    icon: '🥬',
    description: 'Giàu nitrat tự nhiên giúp cải thiện lưu lượng máu và bơm cơ (muscle pump) hiệu quả.'
  },
  {
    id: 'veg-03',
    name: 'Cà rốt tươi / luộc',
    serving: '100g (1 củ vừa)',
    servingUnit: '1 củ (100g)',
    servingWeightGrams: 100,
    calories: 41,
    protein: 0.9,
    carbs: 9.6,
    fat: 0.2,
    fiber: 2.8,
    category: 'vegetables',
    tag: 'Vitamin A & Beta-carotene',
    icon: '🥕',
    description: 'Bảo vệ thị lực, hỗ trợ hệ miễn dịch và cung cấp chất xơ prebiotic cho đường ruột khỏe mạnh.'
  },
  {
    id: 'veg-04',
    name: 'Dưa chuột (Dưa leo) tươi',
    serving: '150g (1 quả lớn)',
    servingUnit: '1 quả (150g)',
    servingWeightGrams: 150,
    calories: 22,
    protein: 1.0,
    carbs: 4.5,
    fat: 0.2,
    fiber: 1.2,
    category: 'vegetables',
    tag: 'Cấp nước thanh mát',
    icon: '🥒',
    description: 'Chứa 95% là nước, calo cực thấp, là món ăn vặt lý tưởng trong giai đoạn siết mỡ (cutting).'
  },
  {
    id: 'veg-05',
    name: 'Măng tây hấp / xào tỏi',
    serving: '120g',
    servingUnit: 'phần 120g',
    servingWeightGrams: 120,
    calories: 30,
    protein: 2.9,
    carbs: 5.2,
    fat: 0.4,
    fiber: 2.5,
    category: 'vegetables',
    tag: 'Lợi tiểu tự nhiên',
    icon: '🌱',
    description: 'Giàu folate và chất xơ, hỗ trợ cơ thể đào thải lượng nước thừa trước các buổi chụp hình hoặc thi đấu.'
  },

  
  {
    id: 'fr-01',
    name: 'Chuối tiêu chín tự nhiên',
    serving: '1 quả vừa (120g)',
    servingUnit: '1 quả (120g)',
    servingWeightGrams: 120,
    calories: 105,
    protein: 1.3,
    carbs: 27.0,
    fat: 0.3,
    fiber: 3.1,
    category: 'fruits',
    tag: 'Pre-workout hoàn hảo',
    icon: '🍌',
    description: 'Nguồn carb hấp thụ nhanh giàu kali, ngăn ngừa chuột rút và bổ sung glycogen cơ bắp cấp tốc.'
  },
  {
    id: 'fr-02',
    name: 'Táo đỏ Envy / Gala',
    serving: '1 quả vừa (180g)',
    servingUnit: '1 quả (180g)',
    servingWeightGrams: 180,
    calories: 95,
    protein: 0.5,
    carbs: 25.0,
    fat: 0.3,
    fiber: 4.4,
    category: 'fruits',
    tag: 'Giàu chất xơ Pectin',
    icon: '🍎',
    description: 'Pectin làm chậm tốc độ tiêu hóa, tạo cảm giác no lâu và kiểm soát đường huyết ổn định.'
  },
  {
    id: 'fr-03',
    name: 'Bơ sáp Đắk Lắk',
    serving: '100g (nửa quả vừa)',
    servingUnit: '100g',
    servingWeightGrams: 100,
    calories: 160,
    protein: 2.0,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7,
    category: 'fruits',
    tag: 'Chất béo đơn không bão hòa',
    icon: '🥑',
    description: 'Siêu thực phẩm cung cấp nguồn chất béo lành mạnh, giàu kali hơn cả chuối và dồi dào chất xơ.'
  },
  {
    id: 'fr-04',
    name: 'Cam sành vắt / ăn múi',
    serving: '1 quả lớn (200g)',
    servingUnit: '1 quả (200g)',
    servingWeightGrams: 200,
    calories: 86,
    protein: 1.8,
    carbs: 21.0,
    fat: 0.2,
    fiber: 4.2,
    category: 'fruits',
    tag: 'Vitamin C dồi dào',
    icon: '🍊',
    description: 'Thúc đẩy hấp thu sắt, hỗ trợ tổng hợp collagen cho dây chằng và tăng cường hệ miễn dịch.'
  },
  {
    id: 'fr-05',
    name: 'Dưa hấu đỏ',
    serving: '200g miếng',
    servingUnit: '200g',
    servingWeightGrams: 200,
    calories: 60,
    protein: 1.2,
    carbs: 15.0,
    fat: 0.3,
    fiber: 0.8,
    category: 'fruits',
    tag: 'Giàu L-Citrulline',
    icon: '🍉',
    description: 'Chứa hợp chất L-Citrulline tự nhiên giúp giãn nở mạch máu, giảm đau nhức cơ bắp sau khi tập luyện.'
  },

  
  {
    id: 'gr-01',
    name: 'Khoai lang vàng luộc / hấp',
    serving: '1 củ vừa (180g)',
    servingUnit: '1 củ (180g)',
    servingWeightGrams: 180,
    calories: 155,
    protein: 2.9,
    carbs: 36.2,
    fat: 0.2,
    fiber: 4.5,
    category: 'grains',
    tag: 'Tinh bột chậm GI thấp',
    icon: '🍠',
    description: 'Tinh bột phức giải phóng năng lượng từ từ, giàu chất xơ và vitamin nhóm B giúp duy trì sức bền bỉ.'
  },
  {
    id: 'gr-02',
    name: 'Cơm gạo lứt huyết rồng',
    serving: '1 chén vừa (150g)',
    servingUnit: 'chén 150g',
    servingWeightGrams: 150,
    calories: 165,
    protein: 3.8,
    carbs: 35.0,
    fat: 1.2,
    fiber: 2.8,
    category: 'grains',
    tag: 'Eat Clean Staple',
    icon: '🍚',
    description: 'Giữ nguyên lớp cám giàu vitamin B1, magie và chất xơ, giúp chỉ số đường huyết ổn định sau ăn.'
  },
  {
    id: 'gr-03',
    name: 'Yến mạch nguyên hạt cán dẹt (Rolled Oats)',
    serving: '50g khô (nấu ra 1 bát)',
    servingUnit: '50g khô',
    servingWeightGrams: 50,
    calories: 190,
    protein: 6.8,
    carbs: 33.5,
    fat: 3.2,
    fiber: 5.1,
    category: 'grains',
    tag: 'Giàu Beta-Glucan',
    icon: '🥣',
    description: 'Chất xơ hòa tan beta-glucan giúp giảm cholesterol xấu LDL, no lâu và rất tiện lợi cho bữa sáng.'
  },
  {
    id: 'gr-04',
    name: 'Bánh mì ngũ cốc nguyên cám',
    serving: '2 lát (60g)',
    servingUnit: '2 lát (60g)',
    servingWeightGrams: 60,
    calories: 150,
    protein: 6.0,
    carbs: 26.0,
    fat: 2.2,
    fiber: 4.0,
    category: 'grains',
    tag: 'Tiện lợi & Lành mạnh',
    icon: '🍞',
    description: 'Bánh mì làm từ lúa mạch nguyên cám, kết hợp tuyệt vời cùng trứng hoặc bơ đậu phộng.'
  },
  {
    id: 'gr-05',
    name: 'Hạt quinoa (Diêm mạch) nấu chín',
    serving: '1 chén (185g)',
    servingUnit: 'chén 185g',
    servingWeightGrams: 185,
    calories: 222,
    protein: 8.1,
    carbs: 39.4,
    fat: 3.5,
    fiber: 5.2,
    category: 'grains',
    tag: 'Đạm thực vật toàn diện',
    icon: '🌾',
    description: 'Chứa đủ 9 axit amin thiết yếu, không chứa gluten, là nguồn carb giàu đạm số 1 cho người ăn chay.'
  },

  
  {
    id: 'dr-01',
    name: 'Sữa chua Hy Lạp nguyên chất (Greek Yogurt)',
    serving: '1 hộp (150g)',
    servingUnit: 'hộp 150g',
    servingWeightGrams: 150,
    calories: 130,
    protein: 15.0,
    carbs: 5.5,
    fat: 5.0,
    fiber: 0.0,
    category: 'dairy',
    tag: 'Đạm cao & Lợi khuẩn',
    icon: '🥣',
    description: 'Được tách váng sữa tự nhiên, lượng đạm đậm đặc gấp 2-3 lần sữa chua thông thường, giàu men Probiotic.'
  },
  {
    id: 'dr-02',
    name: 'Sữa tươi tiệt trùng Vinamilk 100% Ít đường',
    serving: '1 hộp (180ml)',
    servingUnit: 'hộp 180ml',
    servingWeightGrams: 180,
    calories: 130,
    protein: 5.6,
    carbs: 15.0,
    fat: 5.4,
    fiber: 0.0,
    category: 'dairy',
    tag: 'Giàu Canxi tự nhiên',
    icon: '🥛',
    description: 'Cung cấp canxi và vitamin D3 giúp hệ xương chắc khỏe, bảo vệ khung xương chịu lực nâng tạ.'
  },
  {
    id: 'dr-03',
    name: 'Phô mai tươi Cottage Cheese',
    serving: '100g',
    servingUnit: '100g',
    servingWeightGrams: 100,
    calories: 98,
    protein: 11.0,
    carbs: 3.4,
    fat: 4.3,
    fiber: 0.0,
    category: 'dairy',
    tag: 'Casein hấp thụ chậm',
    icon: '🧀',
    description: 'Nguồn Casein protein lý tưởng dùng trước khi ngủ, giải phóng axit amin nuôi cơ suốt đêm.'
  },
  {
    id: 'dr-04',
    name: 'Sữa hạt óc chó TH true NUT',
    serving: '1 hộp (180ml)',
    servingUnit: 'hộp 180ml',
    servingWeightGrams: 180,
    calories: 78,
    protein: 1.8,
    carbs: 9.2,
    fat: 3.8,
    fiber: 0.9,
    category: 'dairy',
    tag: 'Hạt dinh dưỡng',
    icon: '🌰',
    description: 'Không chứa đường tinh luyện (vị ngọt tự nhiên từ quả chà là), giàu chất béo không bão hòa tốt cho não bộ.'
  },
  {
    id: 'dr-05',
    name: 'Whey Protein Isolate (Gold Standard)',
    serving: '1 muỗng gạt (30.4g)',
    servingUnit: '1 muỗng (30.4g)',
    servingWeightGrams: 30.4,
    calories: 120,
    protein: 24.0,
    carbs: 3.0,
    fat: 1.5,
    fiber: 0.0,
    category: 'dairy',
    tag: 'Hấp thụ siêu nhanh',
    icon: '🥤',
    description: 'Tinh chất đạm whey phân lập tinh khiết, tốc độ hấp thu cực nhanh dùng ngay sau buổi tập kháng lực.'
  }
];


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


const FoodService = {
  
  async searchFoods({ query = '', category = 'all' } = {}) {
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const cleanQuery = removeVietnameseTones(query.trim());
        const results = VIETNAMESE_FOOD_DATABASE.filter(food => {
          
          const matchCategory = (category === 'all') || (food.category === category);
          if (!matchCategory) return false;

          
          if (!cleanQuery) return true;
          const cleanName = removeVietnameseTones(food.name);
          const cleanTag = removeVietnameseTones(food.tag || '');
          return cleanName.includes(cleanQuery) || cleanTag.includes(cleanQuery);
        });

        resolve(results);
      }, 50); 
    });
  },

  
  getFoodById(foodId) {
    return VIETNAMESE_FOOD_DATABASE.find(f => f.id === foodId) || null;
  },

  
  calculateServingNutrition(food, factor = 1) {
    const multiplier = Math.max(0.1, Number(factor) || 1);
    return {
      calories: Math.round(food.calories * multiplier),
      protein: parseFloat((food.protein * multiplier).toFixed(1)),
      carbs: parseFloat((food.carbs * multiplier).toFixed(1)),
      fat: parseFloat((food.fat * multiplier).toFixed(1)),
      fiber: parseFloat((food.fiber * multiplier).toFixed(1)),
      factor: multiplier
    };
  }
};


window.VIETNAMESE_FOOD_DATABASE = VIETNAMESE_FOOD_DATABASE;
window.removeVietnameseTones = removeVietnameseTones;
window.FoodService = FoodService;
