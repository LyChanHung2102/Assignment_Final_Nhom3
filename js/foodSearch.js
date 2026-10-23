

const FoodSearchModule = {
  currentCategory: 'all',
  currentSearchQuery: '',
  allFoods: [],
  selectedFood: null,
  activeFactor: 1,
  activeGrams: 0,

  init() {
    this.bindEvents();
    this.loadFoods();
  },

  bindEvents() {
    
    const searchInput = document.getElementById('food-search-input');
    const clearBtn = document.getElementById('btn-clear-food-search');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearchQuery = e.target.value;
        if (clearBtn) clearBtn.style.display = this.currentSearchQuery ? 'flex' : 'none';
        this.loadFoods();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        this.currentSearchQuery = '';
        clearBtn.style.display = 'none';
        this.loadFoods();
      });
    }

    
    document.querySelectorAll('.food-cat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.food-cat-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentCategory = chip.getAttribute('data-cat') || 'all';
        this.loadFoods();
      });
    });

    
    const btnCloseModal = document.getElementById('btn-close-food-detail');
    const modalBackdrop = document.getElementById('modal-food-detail');

    if (btnCloseModal) btnCloseModal.addEventListener('click', () => this.closeDetailModal());
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) this.closeDetailModal();
      });
    }

    const modalBody = document.getElementById('food-detail-modal-body');
    if (modalBody) {
      modalBody.addEventListener('input', (e) => {
        if (e.target.id === 'food-detail-grams') this.setServingGrams(e.target.value);
      });
    }
  },

  async loadFoods() {
    const listEl = document.getElementById('food-cards-grid');
    const countEl = document.getElementById('food-results-count');
    if (!listEl) return;

    if (window.FoodService) {
      const results = await window.FoodService.searchFoods({
        query: this.currentSearchQuery,
        category: this.currentCategory
      });

      this.allFoods = results;
      if (countEl) countEl.textContent = `${results.length} thực phẩm`;
      this.renderFoodCards(results);
    }
  },

  getCategoryLabel(category) {
    const map = {
      'vegetables': { name: 'Rau Củ', class: 'cat-veg' },
      'fruits': { name: 'Trái Cây', class: 'cat-fruit' },
      'meat_fish': { name: 'Thịt Cá & Đạm', class: 'cat-meat' },
      'grains': { name: 'Ngũ Cốc & Khoai', class: 'cat-grain' },
      'dairy': { name: 'Sữa & Chế Phẩm', class: 'cat-dairy' }
    };
    return map[category] || { name: 'Dinh Dưỡng', class: 'cat-grain' };
  },

  renderFoodCards(foods) {
    const listEl = document.getElementById('food-cards-grid');
    if (!listEl) return;

    if (foods.length === 0) {
      listEl.innerHTML = `
        <div class="empty-search-state">
          <div class="empty-search-icon">🔍</div>
          <h3>Không tìm thấy thực phẩm phù hợp</h3>
          <p>Thử tìm kiếm với tên khác hoặc chuyển sang danh mục "Tất cả" để khám phá thêm món ăn.</p>
          <button type="button" class="btn-reset-search" onclick="FoodSearchModule.resetFilters()">
            Xem Tất Cả Thực Phẩm
          </button>
        </div>
      `;
      return;
    }

    const html = foods.map(food => {
      const cat = this.getCategoryLabel(food.category);
      return `
        <div class="food-catalog-card" onclick="FoodSearchModule.openDetailModal('${food.id}')">
          <div class="food-card-top">
            <div class="food-icon-box">${food.icon || '🥗'}</div>
            <span class="food-cat-pill ${cat.class}">${cat.name}</span>
          </div>

          <h3 class="food-card-name">${this.escapeHtml(food.name)}</h3>
          <div class="food-card-serving">${food.serving}</div>

          <div class="food-card-cal-row">
            <span class="food-cal-number">${food.calories}</span>
            <span class="food-cal-unit">KCAL</span>
          </div>

          <!-- 4 Nutrients Breakdown: Protein, Carbs, Fat, Fiber -->
          <div class="food-card-nutrients">
            <div class="nutrient-pill pill-p" title="Chất đạm (Protein)">
              <span class="nutri-label">Đạm</span>
              <strong class="nutri-val">${food.protein}g</strong>
            </div>
            <div class="nutrient-pill pill-c" title="Tinh bột (Carbohydrate)">
              <span class="nutri-label">Carb</span>
              <strong class="nutri-val">${food.carbs}g</strong>
            </div>
            <div class="nutrient-pill pill-f" title="Chất béo (Fat)">
              <span class="nutri-label">Béo</span>
              <strong class="nutri-val">${food.fat}g</strong>
            </div>
            <div class="nutrient-pill pill-fiber" title="Chất xơ (Dietary Fiber)">
              <span class="nutri-label">Xơ</span>
              <strong class="nutri-val">${food.fiber || 0}g</strong>
            </div>
          </div>

          <button type="button" class="btn-card-detail">
            Xem chi tiết & Tính khẩu phần &rarr;
          </button>
        </div>
      `;
    }).join('');

    listEl.innerHTML = html;
  },

  openDetailModal(foodId) {
    if (!window.FoodService) return;
    const food = window.FoodService.getFoodById(foodId);
    if (!food) return;

    this.selectedFood = food;
    this.activeFactor = 1;
    this.activeGrams = Number(food.servingWeightGrams) || 100;

    const modal = document.getElementById('modal-food-detail');
    this.renderModalContent();
    modal?.classList.add('active');
  },

  closeDetailModal() {
    const modal = document.getElementById('modal-food-detail');
    modal?.classList.remove('active');
    this.selectedFood = null;
  },

  setServingFactor(factor) {
    const parsedFactor = Number(factor) || 1;
    const baseGrams = Number(this.selectedFood && this.selectedFood.servingWeightGrams) || 100;
    this.activeFactor = parsedFactor;
    this.activeGrams = Math.round(baseGrams * parsedFactor);
    this.renderModalContent();
  },

  setServingGrams(grams) {
    const parsedGrams = Number(grams);
    if (!this.selectedFood || !Number.isFinite(parsedGrams) || parsedGrams <= 0) return;
    const baseGrams = Number(this.selectedFood.servingWeightGrams) || 100;
    this.activeGrams = parsedGrams;
    this.activeFactor = parsedGrams / baseGrams;
    this.updateServingNutrition();
  },

  updateServingNutrition() {
    if (!this.selectedFood) return;
    const nutrition = window.FoodService.calculateServingNutrition(this.selectedFood, this.activeFactor);
    const values = {
      'food-detail-calories': nutrition.calories,
      'food-detail-protein': `${nutrition.protein}g`,
      'food-detail-carbs': `${nutrition.carbs}g`,
      'food-detail-fat': `${nutrition.fat}g`,
      'food-detail-fiber': `${nutrition.fiber}g`,
      'food-detail-protein-kcal': `${nutrition.protein * 4} kcal`,
      'food-detail-carbs-kcal': `${nutrition.carbs * 4} kcal`,
      'food-detail-fat-kcal': `${nutrition.fat * 9} kcal`,
      'food-detail-portion-label': `${this.activeGrams}g (${this.activeFactor.toFixed(2)}x khẩu phần)`
    };
    Object.entries(values).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
    document.querySelectorAll('#food-detail-modal-body .factor-btn').forEach(button => {
      const factor = Number(button.getAttribute('data-factor'));
      button.classList.toggle('active', Math.abs(this.activeFactor - factor) < 0.001);
    });
  },

  renderModalContent() {
    if (!this.selectedFood) return;
    const food = this.selectedFood;
    const baseGrams = Number(food.servingWeightGrams) || 100;
    if (!this.activeGrams) this.activeGrams = baseGrams;
    const nutrition = window.FoodService.calculateServingNutrition(food, this.activeFactor);
    const cat = this.getCategoryLabel(food.category);

    
    const pKcal = nutrition.protein * 4;
    const cKcal = nutrition.carbs * 4;
    const fKcal = nutrition.fat * 9;
    const totalMacroKcal = pKcal + cKcal + fKcal || 1;

    const pRatio = Math.round((pKcal / totalMacroKcal) * 100);
    const cRatio = Math.round((cKcal / totalMacroKcal) * 100);
    const fRatio = Math.max(0, 100 - pRatio - cRatio);

    const bodyEl = document.getElementById('food-detail-modal-body');
    if (!bodyEl) return;

    bodyEl.innerHTML = `
      <div class="detail-food-header">
        <div class="detail-food-icon">${food.icon || '🥗'}</div>
        <div>
          <span class="food-cat-pill ${cat.class}">${cat.name}</span>
          <h2 class="detail-food-title">${this.escapeHtml(food.name)}</h2>
          <span class="detail-food-tag">${this.escapeHtml(food.tag || '')}</span>
        </div>
      </div>

      ${food.description ? `<p class="detail-food-desc">${this.escapeHtml(food.description)}</p>` : ''}

      <!-- SERVING MULTIPLIER CONTROLLER -->
      <div class="serving-selector-box">
        <div class="serving-label-row">
          <span class="serving-title">Chọn Khẩu Phần Ăn:</span>
          <span class="serving-standard-text">Gốc: ${food.serving}</span>
        </div>
        <label for="food-detail-grams" style="display: block; margin: 10px 0 6px;">Khẩu phần đã ăn (gram)</label>
        <input type="number" id="food-detail-grams" min="1" step="1" value="${this.activeGrams}" style="width: 100%; max-width: 180px;" aria-label="Số gram đã ăn">
        <div class="serving-factor-chips">
          <button type="button" class="factor-btn ${Math.abs(this.activeFactor - 0.5) < 0.001 ? 'active' : ''}" data-factor="0.5" onclick="FoodSearchModule.setServingFactor(0.5)">0.5x (Nửa phần)</button>
          <button type="button" class="factor-btn ${Math.abs(this.activeFactor - 1) < 0.001 ? 'active' : ''}" data-factor="1" onclick="FoodSearchModule.setServingFactor(1)">1x (Chuẩn)</button>
          <button type="button" class="factor-btn ${Math.abs(this.activeFactor - 1.5) < 0.001 ? 'active' : ''}" data-factor="1.5" onclick="FoodSearchModule.setServingFactor(1.5)">1.5x</button>
          <button type="button" class="factor-btn ${Math.abs(this.activeFactor - 2) < 0.001 ? 'active' : ''}" data-factor="2" onclick="FoodSearchModule.setServingFactor(2)">2x (Gấp đôi)</button>
          <button type="button" class="factor-btn ${Math.abs(this.activeFactor - 3) < 0.001 ? 'active' : ''}" data-factor="3" onclick="FoodSearchModule.setServingFactor(3)">3x</button>
        </div>
      </div>

      <!-- DYNAMIC NUTRITION FACTS CARD -->
      <div class="nutrition-facts-card">
        <div class="facts-main-cal">
          <div>
            <div class="facts-cal-num" id="food-detail-calories">${nutrition.calories}</div>
            <div class="facts-cal-label">Kcal năng lượng</div>
          </div>
          <div class="facts-serving-calc">
            <span>Áp dụng: <strong id="food-detail-portion-label">${this.activeGrams}g (${this.activeFactor.toFixed(2)}x khẩu phần)</strong></span>
          </div>
        </div>

        <!-- 4 Grid Values -->
        <div class="facts-macro-grid">
          <div class="macro-cell">
            <span class="macro-cell-name text-sage">Chất Đạm (Protein)</span>
            <div class="macro-cell-val" id="food-detail-protein">${nutrition.protein}g</div>
            <span class="macro-cell-sub" id="food-detail-protein-kcal">${pKcal} kcal</span>
          </div>
          <div class="macro-cell">
            <span class="macro-cell-name text-carbs">Tinh Bột (Carb)</span>
            <div class="macro-cell-val" id="food-detail-carbs">${nutrition.carbs}g</div>
            <span class="macro-cell-sub" id="food-detail-carbs-kcal">${cKcal} kcal</span>
          </div>
          <div class="macro-cell">
            <span class="macro-cell-name text-fat">Chất Béo (Lipid)</span>
            <div class="macro-cell-val" id="food-detail-fat">${nutrition.fat}g</div>
            <span class="macro-cell-sub" id="food-detail-fat-kcal">${fKcal} kcal</span>
          </div>
          <div class="macro-cell">
            <span class="macro-cell-name text-fiber">Chất Xơ (Fiber)</span>
            <div class="macro-cell-val" id="food-detail-fiber">${nutrition.fiber}g</div>
            <span class="macro-cell-sub">Prebiotic</span>
          </div>
        </div>

        <!-- Macro Ratio Distribution Bar -->
        <div class="macro-ratio-section">
          <div class="ratio-label-row">
            <span>Tỷ lệ năng lượng đa lượng</span>
            <span>Đạm ${pRatio}% • Carb ${cRatio}% • Béo ${fRatio}%</span>
          </div>
          <div class="macro-ratio-bar">
            <div class="ratio-segment p" style="width: ${pRatio}%;" title="Đạm: ${pRatio}%"></div>
            <div class="ratio-segment c" style="width: ${cRatio}%;" title="Carb: ${cRatio}%"></div>
            <div class="ratio-segment f" style="width: ${fRatio}%;" title="Béo: ${fRatio}%"></div>
          </div>
        </div>
      </div>

      <div class="nutrition-source-disclaimer">
        ℹ️ <strong>Nguồn dữ liệu tham khảo:</strong> Viện Dinh Dưỡng Quốc Gia Việt Nam & USDA FoodData Central. Dữ liệu mang tính chất định lượng sàng lọc dinh dưỡng thể thao.
      </div>

      <div style="margin-top: 18px; display: flex; gap: 10px;">
        <button type="button" class="auth-submit-btn" style="margin: 0;" onclick="FoodSearchModule.logToDiary()">
          + Ghi Vào Nhật Ký Ăn Uống
        </button>
      </div>
    `;
  },

  logToDiary() {
    if (!this.selectedFood || !window.storageService) return;
    const gramsInput = document.getElementById('food-detail-grams');
    const grams = Number(gramsInput && gramsInput.value);
    if (!Number.isFinite(grams) || grams <= 0) {
      if (window.ToastModule) window.ToastModule.show('Vui lòng nhập khẩu phần lớn hơn 0 gram.', 'flame');
      return;
    }
    const baseGrams = Number(this.selectedFood.servingWeightGrams) || 100;
    this.activeGrams = grams;
    this.activeFactor = grams / baseGrams;
    const nutrition = window.FoodService.calculateServingNutrition(this.selectedFood, this.activeFactor);

    
    const saved = window.storageService.addFoodLog({
      name: this.selectedFood.name,
      foodId: this.selectedFood.id,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      servingQty: this.activeFactor,
      servingGrams: this.activeGrams,
      mealType: 'lunch', 
      date: window.getTodayDateString ? window.getTodayDateString() : new Date().toISOString().split('T')[0]
    });

    if (!saved) {
      if (window.ToastModule) window.ToastModule.show('Không thể lưu món ăn. Vui lòng thử lại.', 'flame');
      return;
    }

    if (window.ToastModule) {
      window.ToastModule.show(`Đã thêm ${this.selectedFood.name} (${nutrition.calories} kcal) vào nhật ký ăn!`, 'emerald');
    }

    this.closeDetailModal();
  },

  resetFilters() {
    const searchInput = document.getElementById('food-search-input');
    if (searchInput) searchInput.value = '';
    this.currentSearchQuery = '';
    this.currentCategory = 'all';

    document.querySelectorAll('.food-cat-chip').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-cat') === 'all');
    });

    this.loadFoods();
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

window.FoodSearchModule = FoodSearchModule;
