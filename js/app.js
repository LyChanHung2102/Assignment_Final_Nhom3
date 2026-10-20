/**
 * FitVN Tracker - Main Application Controller
 * Handles Navigation, Food Logging, Real-time Search, Barcode Scanner, and Dashboard Sync
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Local Storage
  if (window.storageService) {
    window.storageService.initStorage();
  }

  // 2. Initialize Core Modules
  AppHeaderModule.init();
  NavigationModule.init();
  ToastModule.init();

  // 3. Conditional Page Module Initialization
  if (document.getElementById('dash-stat-calories')) {
    DashboardModule.init();
  }

  if (document.getElementById('modal-food-results') || document.getElementById('meal-items-breakfast')) {
    FoodLogModule.init();
    BarcodeScannerModule.init();
  }

  if (document.getElementById('weight-chart-canvas')) {
    WeightModule.init();
  }

  if (document.getElementById('form-user-settings')) {
    SettingsModule.init();
  }
});

/**
 * Toast Notification Module
 */
const ToastModule = {
  containerEl: null,

  init() {
    this.containerEl = document.getElementById('toast-container');
    if (!this.containerEl) {
      this.containerEl = document.createElement('div');
      this.containerEl.id = 'toast-container';
      document.body.appendChild(this.containerEl);
    }
  },

  show(message, type = 'cyan') {
    if (!this.containerEl) this.init();

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    
    // Choose icon
    const iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `;

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    this.containerEl.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
};

/**
 * Header Module - Updates dynamic title, date badge, and user indicators
 */
const AppHeaderModule = {
  headerTitleEl: null,
  headerDateEl: null,

  init() {
    this.headerTitleEl = document.getElementById('header-title');
    this.headerDateEl = document.getElementById('header-date');
    this.updateCurrentDate();
  },

  updateCurrentDate() {
    if (!this.headerDateEl) return;
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[now.getDay()];
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    this.headerDateEl.textContent = `${dayName}, ${dateFormatted}`;
  },

  setTitle(title) {
    if (this.headerTitleEl) {
      this.headerTitleEl.textContent = title;
    }
  }
};

/**
 * Navigation Module - Multi-page & Tab Navigation Support
 */
const NavigationModule = {
  navLinks: [],

  init() {
    this.navLinks = Array.from(document.querySelectorAll('.nav-link'));
    if (this.navLinks.length === 0) return;

    this.highlightCurrentPage();
  },

  highlightCurrentPage() {
    const currentPath = window.location.pathname.toLowerCase();

    let activeKey = 'dashboard';
    if (currentPath.includes('food-log.html')) {
      activeKey = 'food';
    } else if (currentPath.includes('weight.html')) {
      activeKey = 'weight';
    } else if (currentPath.includes('settings.html')) {
      activeKey = 'settings';
    }

    this.navLinks.forEach((link) => {
      const pageKey = link.getAttribute('data-page') || link.getAttribute('data-tab');
      const isTarget = pageKey === activeKey || pageKey === `tab-${activeKey}`;
      link.classList.toggle('active', isTarget);
      link.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });
  }
};

/**
 * Dashboard Module - Synchronizes Day Totals, Calorie Budgets, and Macro Ratios
 */
const DashboardModule = {
  init() {
    this.updateUI();
  },

  updateUI() {
    const profile = window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {});
    const targetCalories = profile.targetCalories || 2600;
    const targetMacros = profile.macros || { protein: 165, carbs: 325, fat: 72 };

    const todayDate = window.getTodayDateString();
    const dayTotals = window.storageService.calculateDayTotals(todayDate);

    // 1. Calories Calculation
    const consumed = Math.round(dayTotals.calories);
    const remaining = Math.max(0, targetCalories - consumed);
    const calPercent = Math.min(100, Math.round((consumed / targetCalories) * 100));

    // Update Calorie UI Elements
    const statConsumedEl = document.getElementById('dash-stat-calories');
    const statRemainingEl = document.getElementById('dash-calories-remaining');
    const statConsumedSubEl = document.getElementById('dash-calories-consumed');
    const calProgressFillEl = document.getElementById('dash-calories-progress');
    const calBadgeEl = document.getElementById('dash-calories-badge');

    if (statConsumedEl) {
      statConsumedEl.innerHTML = `${consumed.toLocaleString()} <span class="stat-unit">/ ${targetCalories.toLocaleString()} kcal</span>`;
    }
    if (statRemainingEl) {
      statRemainingEl.textContent = `${remaining.toLocaleString()} kcal`;
    }
    if (statConsumedSubEl) {
      statConsumedSubEl.textContent = `${consumed.toLocaleString()} kcal`;
    }
    if (calProgressFillEl) {
      calProgressFillEl.style.width = `${calPercent}%`;
    }
    if (calBadgeEl) {
      calBadgeEl.textContent = `Đạt ${calPercent}%`;
    }

    // 2. Macros Calculation
    this.updateMacroItem('protein', dayTotals.protein, targetMacros.protein);
    this.updateMacroItem('carb', dayTotals.carbs, targetMacros.carbs);
    this.updateMacroItem('fat', dayTotals.fat, targetMacros.fat);
  },

  updateMacroItem(macroType, actualVal, targetVal) {
    const roundedActual = Math.round(actualVal);
    const percent = Math.min(100, Math.round((roundedActual / targetVal) * 100));

    const textEl = document.getElementById(`dash-macro-${macroType}-text`);
    const progressEl = document.getElementById(`dash-macro-${macroType}-progress`);

    if (textEl) {
      textEl.textContent = `${roundedActual}g / ${targetVal}g (${percent}%)`;
    }
    if (progressEl) {
      progressEl.style.width = `${percent}%`;
    }
  }
};

/**
 * Food Log Module - Rapid 1-Tap Entry & Categorized Meal Tracking
 */
const FoodLogModule = {
  activeMealType: 'breakfast',
  activeCategory: 'all',
  currentSearchQuery: '',
  modalBackdropEl: null,
  searchResultsEl: null,
  searchInputEl: null,

  mealNames: {
    breakfast: 'Bữa Sáng (Breakfast)',
    lunch: 'Bữa Trưa (Lunch)',
    dinner: 'Bữa Tối (Dinner)',
    snack: 'Bữa Phụ & Pre-workout'
  },

  init() {
    this.modalBackdropEl = document.getElementById('food-modal-backdrop');
    this.searchResultsEl = document.getElementById('modal-food-results');
    this.searchInputEl = document.getElementById('modal-food-search');

    this.bindEvents();
    this.renderFoodLogs();
  },

  bindEvents() {
    // Open modal buttons from Food Log section
    document.addEventListener('click', (e) => {
      const triggerBtn = e.target.closest('[data-open-food-modal]');
      if (triggerBtn) {
        const meal = triggerBtn.getAttribute('data-meal-type') || 'breakfast';
        this.openModal(meal);
      }
    });

    // Close modal
    const closeBtn = document.getElementById('btn-close-food-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    if (this.modalBackdropEl) {
      this.modalBackdropEl.addEventListener('click', (e) => {
        if (e.target === this.modalBackdropEl) {
          this.closeModal();
        }
      });
    }

    // Modal Tabs (Kho món vs Barcode)
    const modalTabs = document.querySelectorAll('.modal-tab-btn');
    modalTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        modalTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetView = tab.getAttribute('data-view');
        document.getElementById('modal-view-database').style.display = targetView === 'database' ? 'flex' : 'none';
        document.getElementById('modal-view-barcode').style.display = targetView === 'barcode' ? 'flex' : 'none';
      });
    });

    // Realtime Search Input (Fuzzy matching + removeVietnameseTones)
    if (this.searchInputEl) {
      this.searchInputEl.addEventListener('input', (e) => {
        this.currentSearchQuery = e.target.value.trim();
        this.filterAndRenderFoods();
      });
    }

    // Category chips
    const chipBtns = document.querySelectorAll('.chip-btn');
    chipBtns.forEach((chip) => {
      chip.addEventListener('click', () => {
        chipBtns.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeCategory = chip.getAttribute('data-category') || 'all';
        this.filterAndRenderFoods();
      });
    });

    // Delegate 1-Tap Quick Add and Delete clicks
    document.addEventListener('click', (e) => {
      // 1-Tap Add
      const addBtn = e.target.closest('.btn-quick-add');
      if (addBtn) {
        const foodId = addBtn.getAttribute('data-food-id');
        if (foodId) {
          this.quickAdd(foodId);
        }
      }

      // Delete log item
      const deleteBtn = e.target.closest('.btn-delete-log');
      if (deleteBtn) {
        const logId = deleteBtn.getAttribute('data-log-id');
        if (logId) {
          this.deleteLogItem(logId);
        }
      }
    });
  },

  openModal(mealType = 'breakfast') {
    this.activeMealType = mealType;
    const titleEl = document.getElementById('modal-meal-name');
    if (titleEl) {
      titleEl.textContent = `Thêm vào ${this.mealNames[mealType] || 'Bữa ăn'}`;
    }

    if (this.modalBackdropEl) {
      this.modalBackdropEl.classList.add('active');
    }

    // Reset search
    if (this.searchInputEl) {
      this.searchInputEl.value = '';
      this.currentSearchQuery = '';
      setTimeout(() => this.searchInputEl.focus(), 150);
    }

    this.filterAndRenderFoods();
  },

  closeModal() {
    if (this.modalBackdropEl) {
      this.modalBackdropEl.classList.remove('active');
    }
  },

  /**
   * Filter Vietnamese Foods using Array.filter & accent normalization
   */
  filterAndRenderFoods() {
    const allFoods = window.storageService.getAllFoods();
    const queryNormalized = window.removeVietnameseTones ? window.removeVietnameseTones(this.currentSearchQuery) : this.currentSearchQuery.toLowerCase();

    const filtered = allFoods.filter((food) => {
      // Category filter
      if (this.activeCategory !== 'all' && food.category !== this.activeCategory) {
        return false;
      }

      // Search keyword filter
      if (!queryNormalized) return true;

      const nameNormalized = window.removeVietnameseTones ? window.removeVietnameseTones(food.name) : food.name.toLowerCase();
      const tagNormalized = food.tag ? (window.removeVietnameseTones ? window.removeVietnameseTones(food.tag) : food.tag.toLowerCase()) : '';
      const barcode = food.barcode || '';

      return nameNormalized.includes(queryNormalized) || tagNormalized.includes(queryNormalized) || barcode.includes(queryNormalized);
    });

    this.renderSearchResults(filtered);
  },

  /**
   * Render Search Results List
   * @param {Array} foods 
   */
  renderSearchResults(foods) {
    if (!this.searchResultsEl) return;

    if (foods.length === 0) {
      this.searchResultsEl.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
          <div>Không tìm thấy món ăn nào khớp với từ khóa.</div>
          <div style="font-size: 0.8rem; margin-top: 4px;">Thử tìm "phở", "gà", "cơm", hoặc quét Barcode.</div>
        </div>
      `;
      return;
    }

    this.searchResultsEl.innerHTML = foods.map((food) => `
      <div class="food-item-row">
        <div class="food-item-info">
          <div class="food-icon-circle">${food.icon || '🍽️'}</div>
          <div class="food-details">
            <div class="food-name" title="${food.name}">${food.name}</div>
            <div class="food-serving">${food.serving} ${food.tag ? `• <span style="color: var(--accent-cyan);">${food.tag}</span>` : ''}</div>
            <div class="food-macros-line">
              <span style="color: var(--accent-cyan);">P: ${food.protein}g</span>
              <span style="color: #fbbf24;">C: ${food.carbs}g</span>
              <span style="color: var(--accent-flame);">F: ${food.fat}g</span>
            </div>
          </div>
        </div>
        <div class="food-actions">
          <div class="food-calories-badge">
            <div class="food-calories-value">${food.calories}</div>
            <div class="food-calories-unit">kcal</div>
          </div>
          <button type="button" class="btn-quick-add" data-food-id="${food.id}" title="1-Tap Thêm Ngay Vào Bữa Ăn" aria-label="Thêm ${food.name}">
            +
          </button>
        </div>
      </div>
    `).join('');
  },

  /**
   * Quick Add 1-Tap Action
   * @param {string} foodId 
   */
  quickAdd(foodId) {
    const allFoods = window.storageService.getAllFoods();
    const food = allFoods.find(item => item.id === foodId);
    if (!food) return;

    const newLog = window.storageService.addFoodLog({
      mealType: this.activeMealType,
      foodId: food.id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      servingQty: 1
    });

    ToastModule.show(`Đã nạp ${food.name} (${food.calories} kcal) vào ${this.mealNames[this.activeMealType]}!`);
    
    // Close modal & re-render
    this.closeModal();
    this.renderFoodLogs();
    DashboardModule.updateUI();
  },

  /**
   * Delete an existing food log
   * @param {string} logId 
   */
  deleteLogItem(logId) {
    const success = window.storageService.removeFoodLog(logId);
    if (success) {
      ToastModule.show('Đã xóa món ăn khỏi nhật ký.', 'flame');
      this.renderFoodLogs();
      DashboardModule.updateUI();
    }
  },

  /**
   * Render Food Logs across 4 meal boxes in the Food Log tab
   */
  renderFoodLogs() {
    const todayDate = window.getTodayDateString();
    const dayLogs = window.storageService.getFoodLogs(todayDate);

    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    mealTypes.forEach((type) => {
      const containerEl = document.getElementById(`meal-items-${type}`);
      const calBadgeEl = document.getElementById(`meal-calories-${type}`);
      if (!containerEl) return;

      const items = dayLogs.filter(log => log.mealType === type);
      const totalMealCals = items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);

      if (calBadgeEl) {
        calBadgeEl.textContent = `${totalMealCals.toLocaleString()} kcal`;
      }

      if (items.length === 0) {
        containerEl.innerHTML = `
          <div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
            Chưa có món ăn nào được ghi nhận. Nhấn "+ Thêm Món" để nạp ngay!
          </div>
        `;
        return;
      }

      containerEl.innerHTML = items.map((item) => `
        <div class="glass-subtle" style="padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1;">
            <div style="font-size: 1.25rem;">🍽️</div>
            <div style="min-width: 0;">
              <div style="font-weight: 600; font-size: 0.92rem; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                ${item.name}
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
                <span style="color: var(--accent-cyan);">P: ${item.protein}g</span> • 
                <span style="color: #fbbf24;">C: ${item.carbs}g</span> • 
                <span style="color: var(--accent-flame);">F: ${item.fat}g</span> • 
                <span style="color: var(--text-secondary);">${item.time || ''}</span>
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
            <strong style="color: var(--accent-cyan); font-size: 0.92rem;">${item.calories} kcal</strong>
            <button type="button" class="btn-delete-log" data-log-id="${item.id}" title="Xóa món ăn" aria-label="Xóa ${item.name}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `).join('');
    });
  }
};

/**
 * Barcode Scanner Simulator Module
 */
const BarcodeScannerModule = {
  barcodeInputEl: null,
  scanResultBoxEl: null,

  init() {
    this.barcodeInputEl = document.getElementById('barcode-manual-input');
    this.scanResultBoxEl = document.getElementById('barcode-scan-result');

    this.bindEvents();
    this.renderPresetPills();
  },

  bindEvents() {
    // Manual Barcode Input Trigger
    const btnScanManual = document.getElementById('btn-scan-barcode');
    if (btnScanManual && this.barcodeInputEl) {
      btnScanManual.addEventListener('click', () => {
        this.processBarcode(this.barcodeInputEl.value);
      });

      this.barcodeInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.processBarcode(this.barcodeInputEl.value);
        }
      });
    }

    // Barcode Presets Quick Click
    document.addEventListener('click', (e) => {
      const presetCard = e.target.closest('[data-scan-barcode]');
      if (presetCard) {
        const barcode = presetCard.getAttribute('data-scan-barcode');
        if (barcode) {
          if (this.barcodeInputEl) this.barcodeInputEl.value = barcode;
          this.processBarcode(barcode);
        }
      }
    });
  },

  /**
   * Render Quick Barcode Cards for popular supermarket items
   */
  renderPresetPills() {
    const container = document.getElementById('barcode-preset-list');
    if (!container) return;

    const barcodeItems = (window.VIETNAMESE_FOOD_DATABASE || []).filter(item => item.barcode && (item.category === 'supplement' || item.category === 'beverage' || item.category === 'snack'));

    container.innerHTML = barcodeItems.map(item => `
      <div class="barcode-preset-card" data-scan-barcode="${item.barcode}" title="Click để quét barcode mẫu">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.2rem;">${item.icon || '📦'}</span>
          <div>
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary);">${item.name}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Mã: ${item.barcode} • ${item.serving}</div>
          </div>
        </div>
        <span class="glass-badge glass-badge-cyan">${item.calories} kcal</span>
      </div>
    `).join('');
  },

  /**
   * Process and simulate scanning barcode
   * @param {string} barcode 
   */
  processBarcode(barcode) {
    if (!barcode || !barcode.trim()) {
      ToastModule.show('Vui lòng nhập hoặc chọn mã Barcode để quét!', 'flame');
      return;
    }

    const cleanBarcode = barcode.trim();
    const food = window.storageService.findFoodByBarcode(cleanBarcode);

    if (!food) {
      ToastModule.show(`Không tìm thấy sản phẩm với mã [${cleanBarcode}]`, 'flame');
      if (this.scanResultBoxEl) {
        this.scanResultBoxEl.innerHTML = `
          <div style="padding: 1rem; text-align: center; color: var(--accent-flame); font-size: 0.85rem;">
            ❌ Không tìm thấy thông tin cho mã barcode <code>${cleanBarcode}</code>.
          </div>
        `;
      }
      return;
    }

    // Display found product preview with immediate 1-Tap Add
    if (this.scanResultBoxEl) {
      this.scanResultBoxEl.innerHTML = `
        <div class="food-item-row" style="background: rgba(0, 240, 255, 0.08); border-color: var(--accent-cyan); margin-top: 8px;">
          <div class="food-item-info">
            <div class="food-icon-circle">${food.icon || '📦'}</div>
            <div class="food-details">
              <div class="food-name" style="color: var(--accent-cyan);">${food.name}</div>
              <div class="food-serving">${food.serving} • Mã: ${food.barcode}</div>
              <div class="food-macros-line">
                <span style="color: var(--accent-cyan);">P: ${food.protein}g</span>
                <span style="color: #fbbf24;">C: ${food.carbs}g</span>
                <span style="color: var(--accent-flame);">F: ${food.fat}g</span>
              </div>
            </div>
          </div>
          <div class="food-actions">
            <div class="food-calories-badge">
              <div class="food-calories-value">${food.calories}</div>
              <div class="food-calories-unit">kcal</div>
            </div>
            <button type="button" class="btn-quick-add" data-food-id="${food.id}" title="Nạp ngay món này">
              +
            </button>
          </div>
        </div>
      `;
    }

    ToastModule.show(`Quét thành công: ${food.name}! Bấm [+] để nạp.`);
  }
};

/**
 * Weight & Body Metrics Module
 * Handles 7-Day Moving Average, Body Fat, BMI, and Muscle Group Measurements
 */
const WeightModule = {
  modalBackdropEl: null,
  formEl: null,

  init() {
    this.modalBackdropEl = document.getElementById('weight-modal-backdrop');
    this.formEl = document.getElementById('form-log-weight');

    if (window.CanvasChartEngine) {
      window.CanvasChartEngine.init('weight-chart-canvas', 'weight-chart-tooltip');
    }

    this.bindEvents();
    this.render();
  },

  bindEvents() {
    // Open Weight Modal
    const btnOpenModal = document.getElementById('btn-add-weight');
    if (btnOpenModal) {
      btnOpenModal.addEventListener('click', () => this.openModal());
    }

    // Close Modal
    const btnClose = document.getElementById('btn-close-weight-modal');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.closeModal());
    }

    if (this.modalBackdropEl) {
      this.modalBackdropEl.addEventListener('click', (e) => {
        if (e.target === this.modalBackdropEl) {
          this.closeModal();
        }
      });
    }

    // Form Submit
    if (this.formEl) {
      this.formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitForm();
      });
    }

    // Delete weight entry delegation
    document.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.btn-delete-weight');
      if (delBtn) {
        const id = delBtn.getAttribute('data-weight-id');
        if (id) {
          this.deleteLog(id);
        }
      }
    });
  },

  openModal() {
    if (!this.modalBackdropEl) return;

    // Set today's date
    const dateInput = document.getElementById('input-weight-date');
    if (dateInput) {
      dateInput.value = window.getTodayDateString();
    }

    // Pre-fill latest weight as helper
    const latest = window.storageService.getLatestWeight();
    const weightInput = document.getElementById('input-weight-val');
    const bfInput = document.getElementById('input-bodyfat-val');

    if (weightInput && latest) {
      weightInput.value = latest.weight;
    }
    if (bfInput && latest && latest.bodyFat) {
      bfInput.value = latest.bodyFat;
    }

    this.modalBackdropEl.classList.add('active');
  },

  closeModal() {
    if (this.modalBackdropEl) {
      this.modalBackdropEl.classList.remove('active');
    }
  },

  submitForm() {
    const dateInput = document.getElementById('input-weight-date');
    const weightInput = document.getElementById('input-weight-val');
    const bfInput = document.getElementById('input-bodyfat-val');
    const noteInput = document.getElementById('input-weight-note');

    // Muscle measurements
    const chestInput = document.getElementById('input-measure-chest');
    const waistInput = document.getElementById('input-measure-waist');
    const armInput = document.getElementById('input-measure-arm');
    const thighInput = document.getElementById('input-measure-thigh');

    const weightVal = parseFloat(weightInput.value);
    if (isNaN(weightVal) || weightVal <= 0) {
      ToastModule.show('Vui lòng nhập cân nặng hợp lệ!', 'flame');
      return;
    }

    const measurements = {};
    if (chestInput && chestInput.value) measurements.chest = parseFloat(chestInput.value);
    if (waistInput && waistInput.value) measurements.waist = parseFloat(waistInput.value);
    if (armInput && armInput.value) measurements.arm = parseFloat(armInput.value);
    if (thighInput && thighInput.value) measurements.thigh = parseFloat(thighInput.value);

    const saved = window.storageService.addWeightLog({
      date: dateInput.value || window.getTodayDateString(),
      weight: weightVal,
      bodyFat: bfInput.value ? parseFloat(bfInput.value) : null,
      note: noteInput.value.trim(),
      measurements: Object.keys(measurements).length > 0 ? measurements : null
    });

    ToastModule.show(`Đã lưu thể trọng: ${saved.weight} kg!`);
    this.closeModal();
    this.render();
    DashboardModule.updateUI();
  },

  deleteLog(logId) {
    const success = window.storageService.removeWeightLog(logId);
    if (success) {
      ToastModule.show('Đã xóa dữ liệu đo thể trọng.', 'flame');
      this.render();
      DashboardModule.updateUI();
    }
  },

  render() {
    const logs = window.storageService.getWeightLogs();
    const profile = window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {});

    if (logs.length === 0) return;

    // 1. Calculate 7-Day Moving Average
    const maData = window.HealthCalculator.calculateMovingAverage(logs, 7);

    // 2. Render HTML5 Canvas Chart
    if (window.CanvasChartEngine) {
      window.CanvasChartEngine.render(maData);
    }

    // 3. Render Top Cards (Current, 7DMA, BMI, Body Fat)
    const latest = maData[maData.length - 1];
    const targetWeight = profile.targetWeight || 76.0;
    const height = profile.height || 175;

    // Current Weight Card
    const curWeightEl = document.getElementById('weight-current-val');
    const curTargetDiffEl = document.getElementById('weight-target-diff');
    if (curWeightEl) {
      curWeightEl.innerHTML = `${latest.rawWeight} <span class="stat-unit">kg</span>`;
    }
    if (curTargetDiffEl) {
      const diff = parseFloat((targetWeight - latest.rawWeight).toFixed(1));
      const text = diff > 0 ? `Còn thiếu <strong>${diff} kg</strong> để đạt mục tiêu` : `Đã vượt mục tiêu <strong>${Math.abs(diff)} kg</strong>`;
      curTargetDiffEl.innerHTML = text;
    }

    // 7-Day Moving Average Card
    const maValEl = document.getElementById('weight-7dma-val');
    const maTrendBadgeEl = document.getElementById('weight-7dma-trend');
    if (maValEl) {
      maValEl.innerHTML = `${latest.movingAverage} <span class="stat-unit">kg</span>`;
    }
    if (maTrendBadgeEl) {
      const trend = window.HealthCalculator.calculateWeeklyTrend(maData);
      maTrendBadgeEl.textContent = trend.text;
    }

    // BMI Card
    const bmiResult = window.HealthCalculator.calculateBMI(latest.rawWeight, height);
    const bmiValEl = document.getElementById('weight-bmi-val');
    const bmiBadgeEl = document.getElementById('weight-bmi-badge');
    if (bmiValEl) {
      bmiValEl.innerHTML = `${bmiResult.bmi} <span class="stat-unit">kg/m²</span>`;
    }
    if (bmiBadgeEl) {
      bmiBadgeEl.textContent = bmiResult.category;
      bmiBadgeEl.className = `glass-badge ${bmiResult.colorClass}`;
    }

    // Body Fat & Composition
    const bfValEl = document.getElementById('weight-bodyfat-val');
    const fatMassEl = document.getElementById('weight-fatmass-val');
    const leanMassEl = document.getElementById('weight-leanmass-val');

    if (latest.bodyFat) {
      if (bfValEl) bfValEl.innerHTML = `${latest.bodyFat} <span class="stat-unit">%</span>`;
      const comp = window.HealthCalculator.calculateBodyComposition(latest.rawWeight, latest.bodyFat);
      if (fatMassEl) fatMassEl.textContent = `${comp.fatMass} kg`;
      if (leanMassEl) leanMassEl.textContent = `${comp.leanMass} kg`;
    } else {
      if (bfValEl) bfValEl.innerHTML = `-- <span class="stat-unit">%</span>`;
    }

    // 4. Render Muscle Group Measurements
    this.renderMeasurements(logs);

    // 5. Render History List
    this.renderHistory(logs, maData);
  },

  renderMeasurements(logs) {
    const container = document.getElementById('measurements-grid');
    if (!container) return;

    // Find entries with measurements
    const withMeasurements = logs.filter(l => l.measurements && Object.keys(l.measurements).length > 0);
    if (withMeasurements.length === 0) return;

    const latest = withMeasurements[withMeasurements.length - 1].measurements;
    const previous = withMeasurements.length > 1 ? withMeasurements[withMeasurements.length - 2].measurements : null;

    const groups = [
      { key: 'chest', label: 'Vòng Ngực', icon: '🎽' },
      { key: 'waist', label: 'Vòng Eo', icon: '📏' },
      { key: 'arm', label: 'Bắp Tay', icon: '💪' },
      { key: 'thigh', label: 'Vòng Đùi', icon: '🦵' }
    ];

    container.innerHTML = groups.map(g => {
      const val = latest[g.key] || '--';
      let deltaHtml = '<span class="measurement-delta delta-neutral">Mới bắt đầu</span>';

      if (previous && previous[g.key] && latest[g.key]) {
        const diff = parseFloat((latest[g.key] - previous[g.key]).toFixed(1));
        if (diff > 0) {
          deltaHtml = `<span class="measurement-delta delta-pos">+${diff} cm</span>`;
        } else if (diff < 0) {
          deltaHtml = `<span class="measurement-delta delta-neg">${diff} cm</span>`;
        } else {
          deltaHtml = '<span class="measurement-delta delta-neutral">Không đổi</span>';
        }
      }

      return `
        <div class="measurement-pill">
          <div class="measurement-group-name">
            <span>${g.icon}</span>
            <span>${g.label}</span>
          </div>
          <div class="measurement-value-line">
            <span class="measurement-current">${val}</span>
            <span class="measurement-unit">cm</span>
          </div>
          <div>${deltaHtml}</div>
        </div>
      `;
    }).join('');
  },

  renderHistory(logs, maData) {
    const container = document.getElementById('weight-history-list');
    if (!container) return;

    // Show reverse chronological order (latest first)
    const reversed = [...maData].reverse().slice(0, 8);

    container.innerHTML = reversed.map((item) => {
      const bfText = item.bodyFat ? `• ${item.bodyFat}% Fat` : '';
      const noteText = item.note ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">"${item.note}"</div>` : '';

      return `
        <div class="glass-subtle" style="padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700; color: var(--text-primary); font-size: 0.9rem;">${item.date}</span>
              <span class="glass-badge glass-badge-cyan" style="font-size: 0.7rem;">7DMA: ${item.movingAverage} kg</span>
            </div>
            ${noteText}
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="text-align: right;">
              <strong style="color: #00f0ff; font-size: 1rem;">${item.rawWeight} kg</strong>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${bfText}</div>
            </div>
            <button type="button" class="btn-delete-weight btn-delete-log" data-weight-id="${item.id}" title="Xóa bản ghi" aria-label="Xóa ${item.date}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
};

window.ToastModule = ToastModule;
window.FoodLogModule = FoodLogModule;
window.BarcodeScannerModule = BarcodeScannerModule;
window.DashboardModule = DashboardModule;
window.WeightModule = WeightModule;

/**
 * Settings Module - Manage Gym Profile & Nutrition Targets
 */
const SettingsModule = {
  formEl: null,

  init() {
    this.formEl = document.getElementById('form-user-settings');
    this.loadProfile();
    this.bindEvents();
  },

  loadProfile() {
    const profile = window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {});

    const nameInput = document.getElementById('setting-name');
    const ageInput = document.getElementById('setting-age');
    const heightInput = document.getElementById('setting-height');
    const targetWeightInput = document.getElementById('setting-target-weight');
    const caloriesInput = document.getElementById('setting-calories');
    const goalSelect = document.getElementById('setting-goal');

    if (nameInput && profile.name) nameInput.value = profile.name;
    if (ageInput && profile.age) ageInput.value = profile.age;
    if (heightInput && profile.height) heightInput.value = profile.height;
    if (targetWeightInput && profile.targetWeight) targetWeightInput.value = profile.targetWeight;
    if (caloriesInput && profile.targetCalories) caloriesInput.value = profile.targetCalories;
    if (goalSelect && profile.fitnessGoal) goalSelect.value = profile.fitnessGoal;
  },

  bindEvents() {
    if (!this.formEl) return;

    this.formEl.addEventListener('submit', (e) => {
      e.preventDefault();

      const profile = window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {});

      const nameVal = document.getElementById('setting-name')?.value.trim();
      const ageVal = parseInt(document.getElementById('setting-age')?.value, 10);
      const heightVal = parseFloat(document.getElementById('setting-height')?.value);
      const targetWeightVal = parseFloat(document.getElementById('setting-target-weight')?.value);
      const caloriesVal = parseInt(document.getElementById('setting-calories')?.value, 10);
      const goalVal = document.getElementById('setting-goal')?.value;

      if (nameVal) profile.name = nameVal;
      if (!isNaN(ageVal)) profile.age = ageVal;
      if (!isNaN(heightVal)) profile.height = heightVal;
      if (!isNaN(targetWeightVal)) profile.targetWeight = targetWeightVal;
      if (!isNaN(caloriesVal)) profile.targetCalories = caloriesVal;
      if (goalVal) profile.fitnessGoal = goalVal;

      window.storageService.set(window.STORAGE_KEYS.USER_PROFILE, profile);
      ToastModule.show('Đã lưu thông tin hồ sơ & mục tiêu dinh dưỡng!');

      // Update snippet on sidebar if present
      const nameSnippet = document.querySelector('.user-name');
      if (nameSnippet && profile.name) nameSnippet.textContent = profile.name;
    });
  }
};

window.SettingsModule = SettingsModule;

