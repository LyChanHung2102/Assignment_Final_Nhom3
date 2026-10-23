

const FoodSearchModule = {
  currentCategory: 'all',
  currentSearchQuery: '',
  allFoods: [],
  selectedFood: null,
  activeFactor: 1,

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
    this.activeFactor = Number(factor) || 1;
    this.renderModalContent();
  },

  renderModalContent() {
    if (!this.selectedFood) return;
    const food = this.selectedFood;
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
        <div class="serving-factor-chips">
          <button type="button" class="factor-btn ${this.activeFactor === 0.5 ? 'active' : ''}" onclick="FoodSearchModule.setServingFactor(0.5)">0.5x (Nửa phần)</button>
          <button type="button" class="factor-btn ${this.activeFactor === 1 ? 'active' : ''}" onclick="FoodSearchModule.setServingFactor(1)">1x (Chuẩn)</button>
          <button type="button" class="factor-btn ${this.activeFactor === 1.5 ? 'active' : ''}" onclick="FoodSearchModule.setServingFactor(1.5)">1.5x</button>
          <button type="button" class="factor-btn ${this.activeFactor === 2 ? 'active' : ''}" onclick="FoodSearchModule.setServingFactor(2)">2x (Gấp đôi)</button>
          <button type="button" class="factor-btn ${this.activeFactor === 3 ? 'active' : ''}" onclick="FoodSearchModule.setServingFactor(3)">3x</button>
        </div>
      </div>

      <!-- DYNAMIC NUTRITION FACTS CARD -->
      <div class="nutrition-facts-card">
        <div class="facts-main-cal">
          <div>
            <div class="facts-cal-num">${nutrition.calories}</div>
            <div class="facts-cal-label">Kcal năng lượng</div>
          </div>
          <div class="facts-serving-calc">
            <span>Áp dụng: <strong>${this.activeFactor}x khẩu phần</strong></span>
          </div>
        </div>

        <!-- 4 Grid Values -->
        <div class="facts-macro-grid">
          <div class="macro-cell">
            <span class="macro-cell-name text-sage">Chất Đạm (Protein)</span>
            <div class="macro-cell-val">${nutrition.protein}g</div>
            <span class="macro-cell-sub">${pKcal} kcal</span>
          </div>
          <div class="macro-cell">
            <span class="macro-cell-name text-carbs">Tinh Bột (Carb)</span>
            <div class="macro-cell-val">${nutrition.carbs}g</div>
            <span class="macro-cell-sub">${cKcal} kcal</span>
          </div>
          <div class="macro-cell">
            <span class="macro-cell-name text-fat">Chất Béo (Lipid)</span>
            <div class="macro-cell-val">${nutrition.fat}g</div>
            <span class="macro-cell-sub">${fKcal} kcal</span>
          </div>
          <div class="macro-cell">
            <span class="macro-cell-name text-fiber">Chất Xơ (Fiber)</span>
            <div class="macro-cell-val">${nutrition.fiber}g</div>
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
    const nutrition = window.FoodService.calculateServingNutrition(this.selectedFood, this.activeFactor);

    
    window.storageService.addFoodLog({
      name: `${this.selectedFood.name} (${this.activeFactor}x)`,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      mealType: 'lunch', 
      date: window.getTodayDateString ? window.getTodayDateString() : new Date().toISOString().split('T')[0]
    });

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
