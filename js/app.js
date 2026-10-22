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

  if (document.getElementById('workout-chart-canvas')) {
    WorkoutJournalModule.init();
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

  if (document.getElementById('form-login') || document.getElementById('form-signup')) {
    if (window.AuthModule) window.AuthModule.init();
  }

  if (document.getElementById('food-search-input') || document.getElementById('food-cards-grid')) {
    if (window.FoodSearchModule) window.FoodSearchModule.init();
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
    this.syncUserData();
  },

  syncUserData() {
    if (!window.storageService) return;
    const profile = window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {});
    const authUser = window.storageService.getCurrentUser ? window.storageService.getCurrentUser() : null;
    const activeName = (authUser && authUser.name) ? authUser.name : (profile.name || 'Người dùng FitVN');
    
    // Update user name elements
    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = activeName;
    });

    // Generate avatar initials
    const initials = activeName.trim().split(/\s+/).map(w => w[0]).slice(-2).join('').toUpperCase() || 'VN';
    document.querySelectorAll('.avatar-pill').forEach(el => {
      el.textContent = initials;
      el.setAttribute('title', activeName);
    });

    // Update goal tag
    const goalLabels = {
      'lean_bulk': 'Tăng Cơ (Lean Bulk)',
      'cut': 'Giảm Cân (Cutting)',
      'maintain': 'Duy Trì Thể Lực'
    };
    const activeGoal = (authUser && authUser.fitnessGoal) ? authUser.fitnessGoal : (profile.fitnessGoal || 'maintain');
    document.querySelectorAll('.user-goal-tag').forEach(el => {
      el.textContent = goalLabels[activeGoal] || 'Theo Dõi Sức Khỏe';
    });
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
 * Dashboard Module - Synchronizes Calorie Ring, Deep Macros, Hydration & Quick Feeds
 * Optimized via Option A: Targeted DOM Element Cache & DocumentFragment Batching
 */
const DashboardModule = {
  dom: {},
  circumference: 2 * Math.PI * 75, // Radius = 75px, C ≈ 471.24px

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.updateUI();
  },

  cacheDOM() {
    this.dom = {
      circleProgress: document.getElementById('gauge-circle-progress'),
      gaugeRemaining: document.getElementById('gauge-remaining-val'),
      gaugeLabel: document.getElementById('gauge-status-label'),
      statConsumed: document.getElementById('dash-stat-calories'),
      statRemaining: document.getElementById('dash-calories-remaining'),
      statConsumedSub: document.getElementById('dash-calories-consumed'),
      calProgressFill: document.getElementById('dash-calories-progress'),
      calBadge: document.getElementById('dash-calories-badge'),

      // Macros
      proteinText: document.getElementById('dash-macro-protein-text'),
      proteinProgress: document.getElementById('dash-macro-protein-progress'),
      proteinKcal: document.getElementById('dash-macro-protein-kcal'),

      carbText: document.getElementById('dash-macro-carb-text'),
      carbProgress: document.getElementById('dash-macro-carb-progress'),
      carbKcal: document.getElementById('dash-macro-carb-kcal'),

      fatText: document.getElementById('dash-macro-fat-text'),
      fatProgress: document.getElementById('dash-macro-fat-progress'),
      fatKcal: document.getElementById('dash-macro-fat-kcal'),

      // Water Hydration (Dynamic Cups & Circular Gauge)
      waterVal: document.getElementById('dash-water-val'),
      waterUnit: document.getElementById('dash-water-unit'),
      waterSubOz: document.getElementById('dash-water-sub-oz'),
      waterCupsGrid: document.getElementById('dash-water-cups-grid'),
      waterCircleBar: document.getElementById('water-gauge-circle'),
      waterGoalVal: document.getElementById('dash-water-goal-val'),
      waterDropdownPanel: document.getElementById('water-dropdown-panel'),
      btnWaterDots: document.getElementById('btn-water-dots'),
      btnWaterQuickAdd: document.getElementById('btn-water-quick-add'),

      // Weight
      dashWeight: document.getElementById('dash-current-weight'),
      dashWeightBadge: document.getElementById('dash-weight-badge'),

      // Recent foods container
      recentFoodList: document.getElementById('dash-recent-food-list')
    };
  },

  bindEvents() {
    // Water tracking & interactive actions
    document.addEventListener('click', (e) => {
      // 1. Quick add from circular gauge (+)
      if (e.target.closest('#btn-water-quick-add')) {
        this.updateWater(250);
        return;
      }

      // 2. Click on a specific water cup
      const cupItem = e.target.closest('.water-cup-item');
      if (cupItem) {
        const fill = parseInt(cupItem.getAttribute('data-fill'), 10) || 0;
        // If clicking next cup or unfull cup -> Drink 1 cup (+250ml)
        if (fill < 100) {
          this.updateWater(250);
        } else {
          // If clicking an already filled cup -> Undo/reduce 1 cup (-250ml)
          this.updateWater(-250);
        }
        return;
      }

      // 3. Quick action buttons (from dropdown or buttons with data-water-quick or data-water-add)
      const quickBtn = e.target.closest('[data-water-quick]') || e.target.closest('[data-water-add]');
      if (quickBtn) {
        const amount = parseInt(quickBtn.getAttribute('data-water-quick') || quickBtn.getAttribute('data-water-add'), 10);
        if (!isNaN(amount)) {
          this.updateWater(amount);
          if (this.dom.waterDropdownPanel) this.dom.waterDropdownPanel.style.display = 'none';
        }
        return;
      }

      // 4. Toggle dropdown menu dots
      const dotsBtn = e.target.closest('#btn-water-dots');
      if (dotsBtn) {
        if (this.dom.waterDropdownPanel) {
          const isHidden = this.dom.waterDropdownPanel.style.display === 'none' || !this.dom.waterDropdownPanel.style.display;
          this.dom.waterDropdownPanel.style.display = isHidden ? 'block' : 'none';
        }
        return;
      }

      // 5. Reset water today
      const resetBtn = e.target.closest('#btn-water-reset');
      if (resetBtn) {
        window.storageService.resetWater();
        ToastModule.show('Đã đặt lại lượng nước uống hôm nay về 0ml.', 'flame');
        if (this.dom.waterDropdownPanel) this.dom.waterDropdownPanel.style.display = 'none';
        this.renderWater();
        return;
      }

      // 6. Edit daily water target
      const editTargetBtn = e.target.closest('#btn-water-edit-target');
      if (editTargetBtn) {
        if (this.dom.waterDropdownPanel) this.dom.waterDropdownPanel.style.display = 'none';
        const profile = window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {});
        const currentTarget = profile.waterTarget || 3000;
        const input = prompt('Nhập mục tiêu nước uống mỗi ngày của bạn (ml):', currentTarget);
        if (input !== null) {
          const newTarget = parseInt(input, 10);
          if (!isNaN(newTarget) && newTarget >= 500 && newTarget <= 10000) {
            profile.waterTarget = newTarget;
            window.storageService.set(window.STORAGE_KEYS.USER_PROFILE, profile);
            ToastModule.show(`Đã cập nhật mục tiêu nước: ${newTarget.toLocaleString()}ml!`);
            this.renderWater();
          } else if (input.trim() !== '') {
            ToastModule.show('Vui lòng nhập số ml hợp lệ (từ 500 đến 10,000 ml)', 'flame');
          }
        }
        return;
      }

      // 7. Click outside dropdown to close
      if (this.dom.waterDropdownPanel && this.dom.waterDropdownPanel.style.display !== 'none') {
        if (!e.target.closest('.water-menu-wrapper')) {
          this.dom.waterDropdownPanel.style.display = 'none';
        }
      }
    });

    // Keyboard accessibility for Circular Gauge (+)
    if (this.dom.btnWaterQuickAdd) {
      this.dom.btnWaterQuickAdd.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.updateWater(250);
        }
      });
    }
  },

  updateWater(amount) {
    const updated = window.storageService.addWater(amount);
    const sign = amount > 0 ? `+${amount}` : `${amount}`;
    ToastModule.show(`Đã nạp ${sign}ml nước! Hiện tại: ${updated.toLocaleString('vi-VN')}ml`);
    this.renderWater();
  },

  renderWater() {
    const profile = window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {});
    const target = Number(profile.waterTarget) > 0 ? Number(profile.waterTarget) : 3000;
    const current = window.storageService.getWater();
    const percent = Math.min(100, Math.round((current / target) * 100));
    const CUP_CAPACITY_ML = 250;

    // 1. Text display (Amount & fl oz conversion)
    if (this.dom.waterVal) {
      this.dom.waterVal.textContent = current.toLocaleString('vi-VN');
    }
    if (this.dom.waterUnit) {
      this.dom.waterUnit.textContent = 'ml';
    }
    if (this.dom.waterSubOz) {
      // 1 ml = 0.033814 fl oz
      const oz = (current * 0.033814).toFixed(1);
      this.dom.waterSubOz.textContent = `(${oz} fl oz)`;
    }
    if (this.dom.waterGoalVal) {
      const goalOz = (target * 0.033814).toFixed(1);
      this.dom.waterGoalVal.textContent = `${target.toLocaleString('vi-VN')} ml (${goalOz} fl oz)`;
    }

    // 2. Circular Gauge Ring Progress
    if (this.dom.waterCircleBar) {
      const circumference = 113.1; // 2 * PI * 18
      const rawRatio = target > 0 ? (current / target) : 0;
      const progressRatio = Math.min(1, Math.max(0, rawRatio));
      const offset = circumference * (1 - progressRatio);
      this.dom.waterCircleBar.style.strokeDashoffset = `${offset.toFixed(2)}`;

      if (current >= target) {
        this.dom.waterCircleBar.style.stroke = '#10b981'; // Emerald when completed
      } else {
        this.dom.waterCircleBar.style.stroke = '#0ea5e9'; // Vibrant water blue
      }
    }

    // 3. Render Dynamic Water Cups (250ml per cup)
    if (this.dom.waterCupsGrid) {
      // Calculate base cups based on target
      const baseCups = Math.max(1, Math.ceil(target / CUP_CAPACITY_ML));
      // If user exceeded goal, add additional cups dynamically
      const consumedCups = Math.ceil(current / CUP_CAPACITY_ML);
      const totalCupsToRender = Math.max(baseCups, consumedCups);

      const cupsHtml = [];
      let foundNextActionCup = false;

      for (let i = 0; i < totalCupsToRender; i++) {
        const cupStart = i * CUP_CAPACITY_ML;
        const cupEnd = (i + 1) * CUP_CAPACITY_ML;

        let fillPercent = 0;
        if (current >= cupEnd) {
          fillPercent = 100;
        } else if (current > cupStart) {
          fillPercent = Math.round(((current - cupStart) / CUP_CAPACITY_ML) * 100);
        } else {
          fillPercent = 0;
        }

        // The first unfull cup gets the "+" icon and pulse animation
        let isNextCup = false;
        if (!foundNextActionCup && fillPercent < 100) {
          isNextCup = true;
          foundNextActionCup = true;
        }

        cupsHtml.push(this.createCupSvg(i, fillPercent, isNextCup, CUP_CAPACITY_ML));
      }

      this.dom.waterCupsGrid.innerHTML = cupsHtml.join('');
    }
  },

  createCupSvg(cupIndex, fillPercent, isNextCup, cupCapacity) {
    const clipId = `water-cup-clip-${cupIndex}`;
    const cupHeight = 36;
    const cupBottomY = 41.5;
    const fillHeight = Math.max(0, Math.min(cupHeight, (fillPercent / 100) * cupHeight));
    const fillY = cupBottomY - fillHeight;

    let contentInside = '';
    if (isNextCup) {
      contentInside = `<text x="16" y="27" text-anchor="middle" class="cup-plus-icon">+</text>`;
    }

    let statusClass = 'cup-empty';
    if (fillPercent >= 100) {
      statusClass = 'cup-filled';
    } else if (fillPercent > 0) {
      statusClass = 'cup-partial';
    }

    return `
      <div class="water-cup-item ${statusClass} ${isNextCup ? 'cup-next-action' : ''}" 
           data-cup-index="${cupIndex}" 
           data-fill="${fillPercent}"
           role="button"
           tabindex="0"
           aria-label="Cốc ${cupIndex + 1}: ${fillPercent}%"
           title="Cốc ${cupIndex + 1} (${cupCapacity}ml): ${fillPercent >= 100 ? 'Đã uống' : fillPercent > 0 ? `Đã uống ${Math.round((fillPercent / 100) * cupCapacity)}ml` : isNextCup ? 'Bấm để uống (+250ml)' : 'Chưa uống'}">
        <svg class="water-cup-svg" viewBox="0 0 32 46" aria-hidden="true">
          <defs>
            <clipPath id="${clipId}">
              <path d="M 3.5,5 L 7,39 C 7.5,41 9.5,42.5 16,42.5 C 22.5,42.5 24.5,41 25,39 L 28.5,5 Z" />
            </clipPath>
          </defs>

          <!-- Cup body background -->
          <path d="M 3.5,5 L 7,39 C 7.5,41 9.5,42.5 16,42.5 C 22.5,42.5 24.5,41 25,39 L 28.5,5 Z" class="cup-glass-bg" />
          
          <!-- Liquid Level Fill -->
          <g clip-path="url(#${clipId})">
            <rect x="0" y="${fillY.toFixed(1)}" width="32" height="${(fillHeight + 6).toFixed(1)}" class="cup-water-rect" />
            ${fillPercent > 0 && fillPercent < 100 ? `<line x1="2" y1="${fillY.toFixed(1)}" x2="30" y2="${fillY.toFixed(1)}" class="cup-water-surface" />` : ''}
          </g>

          <!-- Glass outline and rim -->
          <path d="M 3.5,5 L 7,39 C 7.5,41 9.5,42.5 16,42.5 C 22.5,42.5 24.5,41 25,39 L 28.5,5 Z" class="cup-glass-stroke" fill="none" />
          <ellipse cx="16" cy="5" rx="12.5" ry="2" class="cup-glass-rim" fill="none" />

          ${contentInside}
        </svg>
      </div>
    `;
  },

  updateUI() {
    const profile = window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {});
    const targetCalories = profile.targetCalories || 2600;
    const targetMacros = profile.macros || { protein: 165, carbs: 325, fat: 72 };

    const todayDate = window.getTodayDateString();
    const dayTotals = window.storageService.calculateDayTotals(todayDate);

    // 1. Calories & SVG Gauge Calculation
    const consumed = Math.round(dayTotals.calories);
    const remaining = targetCalories - consumed;
    const calPercent = Math.min(100, Math.round((consumed / targetCalories) * 100));

    // Update SVG Circular Ring Gauge
    if (this.dom.circleProgress) {
      const ratio = Math.min(1, consumed / targetCalories);
      const offset = this.circumference * (1 - ratio);
      this.dom.circleProgress.style.strokeDasharray = `${this.circumference}`;
      this.dom.circleProgress.style.strokeDashoffset = `${offset}`;
    }

    if (this.dom.gaugeRemaining) {
      this.dom.gaugeRemaining.textContent = Math.abs(remaining).toLocaleString();
    }

    if (this.dom.gaugeLabel) {
      if (remaining > 0) {
        this.dom.gaugeLabel.textContent = 'Calo còn lại';
        this.dom.gaugeLabel.style.color = 'var(--text-muted)';
      } else if (remaining === 0) {
        this.dom.gaugeLabel.textContent = 'Đạt mục tiêu chuẩn!';
        this.dom.gaugeLabel.style.color = 'var(--accent-emerald)';
      } else {
        this.dom.gaugeLabel.textContent = `Thặng dư: +${Math.abs(remaining)} kcal`;
        this.dom.gaugeLabel.style.color = 'var(--accent-flame)';
      }
    }

    // Secondary UI values
    if (this.dom.statConsumed) {
      this.dom.statConsumed.innerHTML = `${consumed.toLocaleString()} <span class="stat-unit">/ ${targetCalories.toLocaleString()} kcal</span>`;
    }
    if (this.dom.statRemaining) {
      this.dom.statRemaining.textContent = `${Math.max(0, remaining).toLocaleString()} kcal`;
    }
    if (this.dom.statConsumedSub) {
      this.dom.statConsumedSub.textContent = `${consumed.toLocaleString()} kcal`;
    }
    if (this.dom.calProgressFill) {
      this.dom.calProgressFill.style.width = `${calPercent}%`;
    }
    if (this.dom.calBadge) {
      this.dom.calBadge.textContent = `Đạt ${calPercent}%`;
    }

    // 2. Macro deep breakdown
    this.renderMacroItem('protein', dayTotals.protein, targetMacros.protein, 4);
    this.renderMacroItem('carb', dayTotals.carbs, targetMacros.carbs, 4);
    this.renderMacroItem('fat', dayTotals.fat, targetMacros.fat, 9);

    // 3. Hydration
    this.renderWater();

    // 4. Weight & 7DMA
    this.renderWeightSnippet(profile);

    // 5. Recent Meals via DocumentFragment Batching
    this.renderRecentMeals(todayDate);
  },

  renderMacroItem(type, actual, target, calMultiplier) {
    const rounded = Math.round(actual);
    const percent = Math.min(100, Math.round((rounded / target) * 100));
    const kcal = rounded * calMultiplier;

    const textEl = this.dom[`${type}Text`];
    const progressEl = this.dom[`${type}Progress`];
    const kcalEl = this.dom[`${type}Kcal`];

    if (textEl) textEl.textContent = `${rounded}g / ${target}g (${percent}%)`;
    if (progressEl) progressEl.style.width = `${percent}%`;
    if (kcalEl) kcalEl.textContent = `${kcal} kcal`;
  },

  renderWeightSnippet(profile) {
    const latest = window.storageService.getLatestWeight();
    if (!latest) return;

    if (this.dom.dashWeight) {
      const targetWeight = profile.targetWeight || 76;
      this.dom.dashWeight.innerHTML = `${latest.weight} <span class="stat-unit">kg (Target: ${targetWeight} kg)</span>`;
    }

    if (this.dom.dashWeightBadge) {
      const logs = window.storageService.getWeightLogs();
      if (logs.length >= 2 && window.HealthCalculator) {
        const maData = window.HealthCalculator.calculateMovingAverage(logs, 7);
        const trend = window.HealthCalculator.calculateWeeklyTrend(maData);
        this.dom.dashWeightBadge.textContent = trend.text;
      }
    }
  },

  /**
   * Render Recent Meals Feed with DocumentFragment (Option A Optimization)
   */
  renderRecentMeals(dateString) {
    if (!this.dom.recentFoodList) return;

    const dayLogs = window.storageService.getFoodLogs(dateString);
    if (dayLogs.length === 0) {
      this.dom.recentFoodList.innerHTML = `
        <div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          Chưa có món ăn nào được nạp hôm nay.
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();
    const recent = dayLogs.slice(0, 3); // Top 3 recent

    recent.forEach(item => {
      const row = document.createElement('div');
      row.className = 'glass-subtle';
      row.style.cssText = 'padding: 0.65rem 0.85rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;';
      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>🍽️</span>
          <div>
            <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary);">${item.name}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">P: ${item.protein}g • C: ${item.carbs}g • F: ${item.fat}g</div>
          </div>
        </div>
        <strong style="color: var(--accent-cyan); font-size: 0.88rem;">${item.calories} kcal</strong>
      `;
      fragment.appendChild(row);
    });

    this.dom.recentFoodList.innerHTML = '';
    this.dom.recentFoodList.appendChild(fragment);
  }
};

/**
 * Food Log Module - Rapid 1-Tap Entry & Categorized Meal Tracking
 */
const FoodLogModule = {
  activeMealType: 'breakfast',
  activeCategory: 'all',
  currentSearchQuery: '',
  selectedDate: null,
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

    // Default to today (YYYY-MM-DD)
    this.selectedDate = window.getTodayDateString ? window.getTodayDateString() : new Date().toISOString().split('T')[0];

    this.bindEvents();
    this.bindDateEvents();
    this.updateDateUI();
    this.renderFoodLogs();
  },

  bindDateEvents() {
    const btnPrev = document.getElementById('btn-prev-day');
    const btnNext = document.getElementById('btn-next-day');
    const btnToday = document.getElementById('btn-jump-today');
    const inputDate = document.getElementById('input-food-log-date');

    if (btnPrev) {
      btnPrev.addEventListener('click', () => this.changeDate(-1));
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => this.changeDate(1));
    }

    if (btnToday) {
      btnToday.addEventListener('click', () => this.setDate(window.getTodayDateString()));
    }

    if (inputDate) {
      inputDate.addEventListener('change', (e) => {
        if (e.target.value) {
          this.setDate(e.target.value);
        }
      });
    }
  },

  changeDate(offsetDays) {
    const [y, m, d] = (this.selectedDate || window.getTodayDateString()).split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + offsetDays);
    const ny = dt.getFullYear();
    const nm = String(dt.getMonth() + 1).padStart(2, '0');
    const nd = String(dt.getDate()).padStart(2, '0');
    this.setDate(`${ny}-${nm}-${nd}`);
  },

  setDate(newDateStr) {
    if (!newDateStr) return;
    this.selectedDate = newDateStr;
    this.updateDateUI();
    this.renderFoodLogs();
  },

  formatDateVN(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const dt = new Date(year, month - 1, day);
    const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = daysOfWeek[dt.getDay()];
    return `${dayName}, ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  },

  updateDateUI() {
    const curDateStr = this.selectedDate || window.getTodayDateString();
    const todayStr = window.getTodayDateString();

    const dateTextEl = document.getElementById('food-log-current-date-text');
    const todayBadgeEl = document.getElementById('food-log-today-badge');
    const inputDateEl = document.getElementById('input-food-log-date');
    const headerDateEl = document.getElementById('header-date');

    if (dateTextEl) {
      dateTextEl.textContent = this.formatDateVN(curDateStr);
    }

    if (inputDateEl) {
      inputDateEl.value = curDateStr;
    }

    if (todayBadgeEl) {
      if (curDateStr === todayStr) {
        todayBadgeEl.style.display = 'inline-flex';
        todayBadgeEl.textContent = 'Hôm nay';
        todayBadgeEl.className = 'glass-badge glass-badge-emerald';
      } else {
        const [cy, cm, cd] = curDateStr.split('-').map(Number);
        const [ty, tm, td] = todayStr.split('-').map(Number);
        const curDt = new Date(cy, cm - 1, cd);
        const todayDt = new Date(ty, tm - 1, td);
        const diffDays = Math.round((curDt - todayDt) / (1000 * 60 * 60 * 24));

        if (diffDays === -1) {
          todayBadgeEl.style.display = 'inline-flex';
          todayBadgeEl.textContent = 'Hôm qua';
          todayBadgeEl.className = 'glass-badge';
        } else if (diffDays === 1) {
          todayBadgeEl.style.display = 'inline-flex';
          todayBadgeEl.textContent = 'Ngày mai';
          todayBadgeEl.className = 'glass-badge';
        } else {
          todayBadgeEl.style.display = 'none';
        }
      }
    }

    // Synchronize header date badge
    if (headerDateEl) {
      headerDateEl.textContent = this.formatDateVN(curDateStr);
    }
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
    const dateFormatted = this.formatDateVN(this.selectedDate || window.getTodayDateString());
    if (titleEl) {
      titleEl.textContent = `Thêm vào ${this.mealNames[mealType] || 'Bữa ăn'} • ${dateFormatted}`;
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
      return nameNormalized.includes(queryNormalized);
    });

    if (!this.searchResultsEl) return;

    if (filtered.length === 0) {
      this.searchResultsEl.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
          Không tìm thấy món ăn phù hợp với từ khóa "<strong>${this.currentSearchQuery}</strong>"
        </div>
      `;
      return;
    }

    this.searchResultsEl.innerHTML = filtered.map((food) => `
      <div class="food-item-row">
        <div class="food-item-info">
          <div class="food-icon-circle">${food.icon || '🍽️'}</div>
          <div class="food-details">
            <div class="food-name">${food.name}</div>
            <div class="food-serving">${food.serving}</div>
            <div class="food-macros-line">
              <span style="color: var(--color-primary, #173F35); font-weight: 600;">P: ${food.protein}g</span>
              <span style="color: #d97706; font-weight: 600;">C: ${food.carbs}g</span>
              <span style="color: var(--color-danger, #D9534F); font-weight: 600;">F: ${food.fat}g</span>
            </div>
          </div>
        </div>
        <div class="food-actions">
          <div class="food-calories-badge">
            <div class="food-calories-value">${food.calories}</div>
            <div class="food-calories-unit">kcal</div>
          </div>
          <button type="button" class="btn-quick-add" data-food-id="${food.id}" title="Nạp nhanh món này vào nhật ký">
            +
          </button>
        </div>
      </div>
    `).join('');
  },

  /**
   * 1-Tap Quick Add a food item into the active meal of the selected date
   * @param {string} foodId 
   */
  quickAdd(foodId) {
    const allFoods = window.storageService.getAllFoods();
    const food = allFoods.find(item => item.id === foodId);
    if (!food) return;

    const targetDate = this.selectedDate || window.getTodayDateString();

    const newLog = window.storageService.addFoodLog({
      mealType: this.activeMealType,
      foodId: food.id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      servingQty: 1,
      date: targetDate
    });

    const dateFormatted = this.formatDateVN(targetDate);
    ToastModule.show(`Đã nạp ${food.name} (${food.calories} kcal) vào ${this.mealNames[this.activeMealType]} (${dateFormatted})!`);
    
    // Close modal & re-render
    this.closeModal();
    this.renderFoodLogs();
    if (window.DashboardModule && typeof window.DashboardModule.updateUI === 'function') {
      window.DashboardModule.updateUI();
    }
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
      if (window.DashboardModule && typeof window.DashboardModule.updateUI === 'function') {
        window.DashboardModule.updateUI();
      }
    }
  },

  /**
   * Render Food Logs across 4 meal boxes for the currently selected date
   */
  renderFoodLogs() {
    const targetDate = this.selectedDate || window.getTodayDateString();
    const dayLogs = window.storageService.getFoodLogs(targetDate);

    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    let dayTotalCalories = 0;

    mealTypes.forEach((type) => {
      const containerEl = document.getElementById(`meal-items-${type}`);
      const calBadgeEl = document.getElementById(`meal-calories-${type}`);
      if (!containerEl) return;

      const items = dayLogs.filter(log => log.mealType === type);
      const totalMealCals = items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
      dayTotalCalories += totalMealCals;

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
                <span style="color: var(--color-primary, #173F35); font-weight: 600;">P: ${item.protein}g</span> • 
                <span style="color: #d97706; font-weight: 600;">C: ${item.carbs}g</span> • 
                <span style="color: var(--color-danger, #D9534F); font-weight: 600;">F: ${item.fat}g</span> • 
                <span style="color: var(--text-secondary);">${item.time || ''}</span>
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
            <strong style="color: var(--color-primary, #173F35); font-size: 0.95rem;">${item.calories} kcal</strong>
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

    // Update Day Total Summary
    const dayTotalEl = document.getElementById('food-log-day-total-cals');
    if (dayTotalEl) {
      dayTotalEl.textContent = `${dayTotalCalories.toLocaleString()} kcal`;
    }
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
        <div class="food-item-row" style="background: var(--color-primary-soft, #E5EDE7); border-color: var(--accent-cyan); margin-top: 8px;">
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
              <strong style="color: var(--color-primary, #173F35); font-size: 1rem;">${item.rawWeight} kg</strong>
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
  pendingImportData: null,
  goalLabels: {
    lean_bulk: 'Tăng Cơ (Lean Bulk)',
    cut: 'Cắt Nét (Cutting)',
    maintain: 'Duy Trì (Maintain)'
  },

  init() {
    this.formEl = document.getElementById('form-user-settings');
    this.loadProfile();
    this.bindEvents();
    this.bindBackupEvents();
  },

  loadProfile() {
    const profile = window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {});

    const nameInput = document.getElementById('setting-name');
    const genderSelect = document.getElementById('setting-gender');
    const ageInput = document.getElementById('setting-age');
    const heightInput = document.getElementById('setting-height');
    const currentWeightInput = document.getElementById('setting-current-weight');
    const targetWeightInput = document.getElementById('setting-target-weight');
    const goalSelect = document.getElementById('setting-goal');
    const caloriesInput = document.getElementById('setting-calories');
    const proteinInput = document.getElementById('setting-protein');
    const carbsInput = document.getElementById('setting-carbs');
    const fatInput = document.getElementById('setting-fat');
    const waterInput = document.getElementById('setting-water');

    if (nameInput && profile.name) nameInput.value = profile.name;
    if (genderSelect && profile.gender) genderSelect.value = profile.gender;
    if (ageInput && profile.age) ageInput.value = profile.age;
    if (heightInput && profile.height) heightInput.value = profile.height;
    if (currentWeightInput && profile.currentWeight) currentWeightInput.value = profile.currentWeight;
    if (targetWeightInput && profile.targetWeight) targetWeightInput.value = profile.targetWeight;
    if (goalSelect && profile.fitnessGoal) goalSelect.value = profile.fitnessGoal;
    if (caloriesInput && profile.targetCalories) caloriesInput.value = profile.targetCalories;

    if (profile.macros) {
      if (proteinInput && profile.macros.protein) proteinInput.value = profile.macros.protein;
      if (carbsInput && profile.macros.carbs) carbsInput.value = profile.macros.carbs;
      if (fatInput && profile.macros.fat) fatInput.value = profile.macros.fat;
    }
    if (waterInput && profile.waterTarget) waterInput.value = profile.waterTarget;

    // Update avatar and labels in sidebar / header if present
    this.updateUserLabels(profile);
  },

  updateUserLabels(profile) {
    if (!profile) return;
    const nameSnippets = document.querySelectorAll('.user-name');
    nameSnippets.forEach(el => {
      if (profile.name) el.textContent = profile.name;
    });

    const goalSnippets = document.querySelectorAll('.user-goal-tag');
    goalSnippets.forEach(el => {
      if (profile.fitnessGoal && this.goalLabels[profile.fitnessGoal]) {
        el.textContent = this.goalLabels[profile.fitnessGoal];
      }
    });

    const avatarSnippets = document.querySelectorAll('.avatar-pill');
    if (profile.name) {
      const initials = profile.name
        .split(' ')
        .filter(Boolean)
        .map(w => w[0].toUpperCase())
        .slice(0, 2)
        .join('');
      if (initials) {
        avatarSnippets.forEach(el => el.textContent = initials);
      }
    }
  },

  bindEvents() {
    if (!this.formEl) return;

    this.formEl.addEventListener('submit', (e) => {
      e.preventDefault();

      const profile = window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {});

      const nameVal = document.getElementById('setting-name')?.value.trim();
      const genderVal = document.getElementById('setting-gender')?.value;
      const ageVal = parseInt(document.getElementById('setting-age')?.value, 10);
      const heightVal = parseFloat(document.getElementById('setting-height')?.value);
      const currentWeightVal = parseFloat(document.getElementById('setting-current-weight')?.value);
      const targetWeightVal = parseFloat(document.getElementById('setting-target-weight')?.value);
      const caloriesVal = parseInt(document.getElementById('setting-calories')?.value, 10);
      const goalVal = document.getElementById('setting-goal')?.value;

      const proteinVal = parseInt(document.getElementById('setting-protein')?.value, 10);
      const carbsVal = parseInt(document.getElementById('setting-carbs')?.value, 10);
      const fatVal = parseInt(document.getElementById('setting-fat')?.value, 10);
      const waterVal = parseInt(document.getElementById('setting-water')?.value, 10);

      if (nameVal) profile.name = nameVal;
      if (genderVal) profile.gender = genderVal;
      if (!isNaN(ageVal) && ageVal > 0) profile.age = ageVal;
      if (!isNaN(heightVal) && heightVal > 0) profile.height = heightVal;
      if (!isNaN(currentWeightVal) && currentWeightVal > 0) profile.currentWeight = currentWeightVal;
      if (!isNaN(targetWeightVal) && targetWeightVal > 0) profile.targetWeight = targetWeightVal;
      if (!isNaN(caloriesVal) && caloriesVal > 0) profile.targetCalories = caloriesVal;
      if (goalVal) profile.fitnessGoal = goalVal;

      if (!profile.macros) profile.macros = {};
      if (!isNaN(proteinVal) && proteinVal >= 0) profile.macros.protein = proteinVal;
      if (!isNaN(carbsVal) && carbsVal >= 0) profile.macros.carbs = carbsVal;
      if (!isNaN(fatVal) && fatVal >= 0) profile.macros.fat = fatVal;

      if (!isNaN(waterVal) && waterVal >= 0) profile.waterTarget = waterVal;

      // Persist to local storage
      window.storageService.set(window.STORAGE_KEYS.USER_PROFILE, profile);
      this.updateUserLabels(profile);

      ToastModule.show('Đã lưu thành công hồ sơ cá nhân và mục tiêu thể hình!');
    });
  },

  bindBackupEvents() {
    // 1. Export Backup JSON
    const btnExport = document.getElementById('btn-export-backup');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        try {
          const jsonString = window.storageService.exportBackupData();
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
          const filename = `fitvn_backup_${timestamp}.json`;

          const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          ToastModule.show('Đã xuất file sao lưu thành công!');
        } catch (err) {
          ToastModule.show('Không thể xuất file sao lưu: ' + err.message, 'flame');
        }
      });
    }

    // 2. Import Trigger & File Input
    const btnTriggerImport = document.getElementById('btn-trigger-import');
    const inputBackupFile = document.getElementById('input-backup-file');
    const modalImport = document.getElementById('modal-confirm-import');
    const importFileNameEl = document.getElementById('import-file-name');
    const btnConfirmOverwrite = document.getElementById('btn-confirm-import-overwrite');
    const btnConfirmMerge = document.getElementById('btn-confirm-import-merge');
    const btnCancelImport = document.getElementById('btn-cancel-import');

    if (btnTriggerImport && inputBackupFile) {
      btnTriggerImport.addEventListener('click', () => {
        inputBackupFile.value = '';
        inputBackupFile.click();
      });
    }

    if (inputBackupFile) {
      inputBackupFile.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (readEvent) => {
          try {
            const parsed = JSON.parse(readEvent.target.result);
            const validation = window.storageService.validateBackupData(parsed);

            if (!validation.valid) {
              ToastModule.show(validation.message, 'flame');
              return;
            }

            this.pendingImportData = parsed;
            if (importFileNameEl) {
              importFileNameEl.textContent = file.name;
            }
            if (modalImport) {
              modalImport.classList.add('active');
            }
          } catch (err) {
            ToastModule.show('File được chọn không đúng định dạng JSON hợp lệ.', 'flame');
          }
        };

        reader.onerror = () => {
          ToastModule.show('Lỗi khi đọc file sao lưu từ máy tính.', 'flame');
        };

        reader.readAsText(file);
      });
    }

    // Modal Import Actions
    const closeImportModal = () => {
      if (modalImport) modalImport.classList.remove('active');
      this.pendingImportData = null;
    };

    if (btnCancelImport) {
      btnCancelImport.addEventListener('click', closeImportModal);
    }

    if (modalImport) {
      modalImport.addEventListener('click', (e) => {
        if (e.target === modalImport) closeImportModal();
      });
    }

    if (btnConfirmOverwrite) {
      btnConfirmOverwrite.addEventListener('click', () => {
        if (!this.pendingImportData) return;
        const result = window.storageService.importBackupData(this.pendingImportData, false);
        closeImportModal();
        if (result.success) {
          this.loadProfile();
          ToastModule.show('Khôi phục toàn bộ dữ liệu thành công!');
        } else {
          ToastModule.show(result.message || 'Lỗi khi khôi phục dữ liệu.', 'flame');
        }
      });
    }

    if (btnConfirmMerge) {
      btnConfirmMerge.addEventListener('click', () => {
        if (!this.pendingImportData) return;
        const result = window.storageService.importBackupData(this.pendingImportData, true);
        closeImportModal();
        if (result.success) {
          this.loadProfile();
          ToastModule.show('Đã gộp thêm dữ liệu sao lưu thành công!');
        } else {
          ToastModule.show(result.message || 'Lỗi khi gộp dữ liệu.', 'flame');
        }
      });
    }

    // 3. Factory Reset Modal & Action
    const btnResetData = document.getElementById('btn-reset-data');
    const modalReset = document.getElementById('modal-confirm-reset');
    const btnCancelReset = document.getElementById('btn-cancel-reset');
    const btnConfirmReset = document.getElementById('btn-confirm-reset');

    if (btnResetData && modalReset) {
      btnResetData.addEventListener('click', () => {
        modalReset.classList.add('active');
      });
    }

    const closeResetModal = () => {
      if (modalReset) modalReset.classList.remove('active');
    };

    if (btnCancelReset) {
      btnCancelReset.addEventListener('click', closeResetModal);
    }

    if (modalReset) {
      modalReset.addEventListener('click', (e) => {
        if (e.target === modalReset) closeResetModal();
      });
    }

    if (btnConfirmReset) {
      btnConfirmReset.addEventListener('click', () => {
        const result = window.storageService.resetToDefaultData();
        closeResetModal();
        if (result.success) {
          this.loadProfile();
          ToastModule.show('Đã khôi phục toàn bộ dữ liệu mẫu ban đầu!', 'flame');
        } else {
          ToastModule.show(result.message || 'Lỗi khi khôi phục cài đặt gốc.', 'flame');
        }
      });
    }
  }
};

window.SettingsModule = SettingsModule;

/**
 * WorkoutJournalModule - Controller for Workout Journal Feature
 * Handles Workout CRUD, Filtering by Range/Type/Intensity, Search,
 * Form Validations, Details Modal, Confirm Delete, Pagination and Duration Chart.
 */
const WorkoutJournalModule = {
  dom: {},
  currentRange: '30d', // '7d' | '30d' | '90d' | '180d' | 'all'
  currentType: 'all',
  currentIntensity: 'all',
  searchQuery: '',
  currentPage: 1,
  pageSize: 8,
  cachedAllWorkouts: [],
  cachedFilteredWorkouts: [],
  selectedWorkout: null,
  pendingDeleteId: null,

  // Activity metadata definition for unified UI
  ACTIVITY_TYPES: {
    gym: { label: 'Tập Gym', icon: '🏋️‍♂️' },
    running: { label: 'Chạy bộ', icon: '🏃‍♂️' },
    walking: { label: 'Đi bộ', icon: '🚶‍♂️' },
    cycling: { label: 'Đạp xe', icon: '🚴‍♂️' },
    strength: { label: 'Tập sức mạnh', icon: '💪' },
    yoga: { label: 'Yoga', icon: '🧘‍♀️' },
    swimming: { label: 'Bơi lội', icon: '🏊‍♂️' },
    sports: { label: 'Thể thao', icon: '⚽' },
    other: { label: 'Khác', icon: '⚡' }
  },

  FEELING_LABELS: {
    great: '🔥 Tuyệt vời, tràn đầy năng lượng',
    good: '👍 Khỏe khoắn, đạt chỉ tiêu',
    tired: '🥱 Hơi mệt, căng cơ tốt',
    exhausted: '😵 Kiệt sức, cần nghỉ ngơi'
  },

  INTENSITY_LABELS: {
    low: { label: 'Nhẹ nhàng', badgeClass: 'badge-intensity-low' },
    medium: { label: 'Vừa phải', badgeClass: 'badge-intensity-medium' },
    high: { label: 'Cường độ cao', badgeClass: 'badge-intensity-high' }
  },

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.loadDataAndRender();
  },

  cacheDOM() {
    this.dom = {
      // Summary cards
      statSessions: document.getElementById('wo-stat-sessions'),
      statDuration: document.getElementById('wo-stat-duration'),
      statAvg: document.getElementById('wo-stat-avg'),
      statDays: document.getElementById('wo-stat-days'),
      statDistanceExtra: document.getElementById('wo-stat-distance-extra'),
      rangeDatesText: document.getElementById('wo-range-dates-text'),

      // Time range pills
      rangeButtons: document.querySelectorAll('[data-workout-range]'),

      // Search and Filter controls
      searchInput: document.getElementById('wo-search-input'),
      filterType: document.getElementById('wo-filter-type'),
      filterIntensity: document.getElementById('wo-filter-intensity'),
      btnResetFilters: document.getElementById('btn-reset-filters'),

      // List & States
      listContainer: document.getElementById('wo-list-container'),
      emptyState: document.getElementById('wo-empty-state'),
      emptyFilterState: document.getElementById('wo-empty-filter-state'),
      btnClearEmptyFilter: document.getElementById('btn-clear-empty-filter'),

      // Pagination
      pageInfo: document.getElementById('wo-page-info'),
      btnPagePrev: document.getElementById('wo-btn-page-prev'),
      btnPageNext: document.getElementById('wo-btn-page-next'),

      // Create / Edit Modal
      btnOpenCreate: document.getElementById('btn-open-create-workout'),
      modalForm: document.getElementById('wo-modal-form'),
      modalFormClose: document.getElementById('wo-modal-form-close'),
      modalFormCancel: document.getElementById('wo-modal-form-cancel'),
      modalFormTitle: document.getElementById('wo-modal-form-title'),
      formEntry: document.getElementById('form-workout-entry'),
      btnSubmitForm: document.getElementById('wo-btn-submit-form'),

      // Form inputs
      inputId: document.getElementById('wo-input-id'),
      inputTitle: document.getElementById('wo-input-title'),
      inputType: document.getElementById('wo-input-type'),
      inputIntensity: document.getElementById('wo-input-intensity'),
      inputDate: document.getElementById('wo-input-date'),
      inputDuration: document.getElementById('wo-input-duration'),
      inputStartTime: document.getElementById('wo-input-start-time'),
      inputEndTime: document.getElementById('wo-input-end-time'),
      inputDistance: document.getElementById('wo-input-distance'),
      inputSteps: document.getElementById('wo-input-steps'),
      inputFeeling: document.getElementById('wo-input-feeling'),
      inputNotes: document.getElementById('wo-input-notes'),

      // Detail Modal
      modalDetail: document.getElementById('wo-modal-detail'),
      modalDetailClose: document.getElementById('wo-modal-detail-close'),
      detailBtnClose: document.getElementById('wo-detail-btn-close'),
      detailBtnEdit: document.getElementById('wo-detail-btn-edit'),
      detailBtnDelete: document.getElementById('wo-detail-btn-delete'),
      detailTitle: document.getElementById('wo-detail-title'),
      detailSubtitle: document.getElementById('wo-detail-subtitle'),
      detailContent: document.getElementById('wo-detail-content'),

      // Confirm Delete Modal
      modalDelete: document.getElementById('wo-modal-confirm-delete'),
      btnCancelDelete: document.getElementById('wo-btn-cancel-delete'),
      btnConfirmDelete: document.getElementById('wo-btn-confirm-delete'),
      deleteMsg: document.getElementById('wo-confirm-delete-msg')
    };
  },

  bindEvents() {
    // 1. Time range pills
    if (this.dom.rangeButtons) {
      this.dom.rangeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.dom.rangeButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentRange = btn.getAttribute('data-workout-range') || '30d';
          this.currentPage = 1;
          this.filterDataAndRender();
        });
      });
    }

    // 2. Search input
    if (this.dom.searchInput) {
      let debounceTimer = null;
      this.dom.searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.searchQuery = e.target.value.trim().toLowerCase();
          this.currentPage = 1;
          this.filterDataAndRender();
        }, 250);
      });
    }

    // 3. Filters dropdowns
    if (this.dom.filterType) {
      this.dom.filterType.addEventListener('change', (e) => {
        this.currentType = e.target.value;
        this.currentPage = 1;
        this.filterDataAndRender();
      });
    }

    if (this.dom.filterIntensity) {
      this.dom.filterIntensity.addEventListener('change', (e) => {
        this.currentIntensity = e.target.value;
        this.currentPage = 1;
        this.filterDataAndRender();
      });
    }

    // 4. Reset Filters
    const resetFn = () => {
      this.searchQuery = '';
      this.currentType = 'all';
      this.currentIntensity = 'all';
      if (this.dom.searchInput) this.dom.searchInput.value = '';
      if (this.dom.filterType) this.dom.filterType.value = 'all';
      if (this.dom.filterIntensity) this.dom.filterIntensity.value = 'all';
      this.currentPage = 1;
      this.filterDataAndRender();
    };

    if (this.dom.btnResetFilters) this.dom.btnResetFilters.addEventListener('click', resetFn);
    if (this.dom.btnClearEmptyFilter) this.dom.btnClearEmptyFilter.addEventListener('click', resetFn);

    // 5. Open Create Modal
    if (this.dom.btnOpenCreate) {
      this.dom.btnOpenCreate.addEventListener('click', () => {
        this.openCreateForm();
      });
    }

    // 6. Close Modal Form
    if (this.dom.modalFormClose) this.dom.modalFormClose.addEventListener('click', () => this.closeFormModal());
    if (this.dom.modalFormCancel) this.dom.modalFormCancel.addEventListener('click', () => this.closeFormModal());
    if (this.dom.modalForm) {
      this.dom.modalForm.addEventListener('click', (e) => {
        if (e.target === this.dom.modalForm) this.closeFormModal();
      });
    }

    // 7. Form Submit (Create / Edit)
    if (this.dom.formEntry) {
      this.dom.formEntry.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }

    // 8. Detail Modal Handlers
    if (this.dom.modalDetailClose) this.dom.modalDetailClose.addEventListener('click', () => this.closeDetailModal());
    if (this.dom.detailBtnClose) this.dom.detailBtnClose.addEventListener('click', () => this.closeDetailModal());
    if (this.dom.modalDetail) {
      this.dom.modalDetail.addEventListener('click', (e) => {
        if (e.target === this.dom.modalDetail) this.closeDetailModal();
      });
    }

    if (this.dom.detailBtnEdit) {
      this.dom.detailBtnEdit.addEventListener('click', () => {
        const item = this.selectedWorkout;
        this.closeDetailModal();
        if (item) this.openEditForm(item);
      });
    }

    if (this.dom.detailBtnDelete) {
      this.dom.detailBtnDelete.addEventListener('click', () => {
        const item = this.selectedWorkout;
        this.closeDetailModal();
        if (item) this.promptDelete(item.id, item.title);
      });
    }

    // 9. Confirm Delete Modal
    if (this.dom.btnCancelDelete) this.dom.btnCancelDelete.addEventListener('click', () => this.closeDeleteModal());
    if (this.dom.btnConfirmDelete) {
      this.dom.btnConfirmDelete.addEventListener('click', () => {
        if (this.pendingDeleteId) {
          const success = window.storageService.deleteWorkoutLog(this.pendingDeleteId);
          if (success) {
            ToastModule.show('Đã xóa buổi tập thành công.', 'emerald');
            this.closeDeleteModal();
            this.loadDataAndRender();
          } else {
            ToastModule.show('Không thể xóa buổi tập.', 'flame');
          }
        }
      });
    }

    // 10. Pagination handlers
    if (this.dom.btnPagePrev) {
      this.dom.btnPagePrev.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderList();
        }
      });
    }

    if (this.dom.btnPageNext) {
      this.dom.btnPageNext.addEventListener('click', () => {
        const totalPages = Math.ceil(this.cachedFilteredWorkouts.length / this.pageSize) || 1;
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderList();
        }
      });
    }
  },

  loadDataAndRender() {
    this.cachedAllWorkouts = window.storageService ? window.storageService.getWorkoutLogs() : [];
    
    // Initialize Canvas Chart
    if (window.WorkoutChartEngine) {
      WorkoutChartEngine.init('workout-chart-canvas', 'workout-chart-tooltip');
    }

    this.filterDataAndRender();
  },

  filterDataAndRender() {
    const all = this.cachedAllWorkouts;

    if (all.length === 0) {
      this.cachedFilteredWorkouts = [];
      this.renderSummary();
      this.renderChart();
      this.renderList();
      return;
    }

    // 1. Filter by Time Range
    let daysCutoff = null;
    if (this.currentRange === '7d') daysCutoff = 7;
    else if (this.currentRange === '30d') daysCutoff = 30;
    else if (this.currentRange === '90d') daysCutoff = 90;
    else if (this.currentRange === '180d') daysCutoff = 180;

    let filtered = [...all];
    if (daysCutoff !== null) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysCutoff);
      filtered = filtered.filter(item => new Date(item.workoutDate) >= cutoff);
    }

    // 2. Filter by Activity Type
    if (this.currentType !== 'all') {
      filtered = filtered.filter(item => item.activityType === this.currentType);
    }

    // 3. Filter by Intensity
    if (this.currentIntensity !== 'all') {
      filtered = filtered.filter(item => item.intensity === this.currentIntensity);
    }

    // 4. Search query
    if (this.searchQuery) {
      filtered = filtered.filter(item => {
        const t = (item.title || '').toLowerCase();
        const n = (item.notes || '').toLowerCase();
        return t.includes(this.searchQuery) || n.includes(this.searchQuery);
      });
    }

    // Sort newest first
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.workoutDate}T${a.startTime || '00:00'}`);
      const dateB = new Date(`${b.workoutDate}T${b.startTime || '00:00'}`);
      return dateB - dateA;
    });

    this.cachedFilteredWorkouts = filtered;

    this.renderRangeBadge();
    this.renderSummary();
    this.renderChart();
    this.renderList();
  },

  renderRangeBadge() {
    if (!this.dom.rangeDatesText) return;
    const count = this.cachedFilteredWorkouts.length;
    let label = 'Tất cả thời gian';
    if (this.currentRange === '7d') label = '7 ngày qua';
    else if (this.currentRange === '30d') label = '30 ngày qua';
    else if (this.currentRange === '90d') label = '3 tháng qua';
    else if (this.currentRange === '180d') label = '6 tháng qua';

    this.dom.rangeDatesText.textContent = `${label} (${count} buổi tập)`;
  },

  renderSummary() {
    if (!window.HealthCalculator) return;
    const summary = window.HealthCalculator.calculateWorkoutSummary(this.cachedFilteredWorkouts);

    if (this.dom.statSessions) {
      this.dom.statSessions.innerHTML = `${summary.totalSessions} <span class="stat-unit">buổi</span>`;
    }
    if (this.dom.statDuration) {
      this.dom.statDuration.innerHTML = `${summary.formattedDuration}`;
    }
    if (this.dom.statAvg) {
      this.dom.statAvg.innerHTML = `${summary.avgDurationMinutes} <span class="stat-unit">phút/buổi</span>`;
    }
    if (this.dom.statDays) {
      this.dom.statDays.innerHTML = `${summary.activeDaysCount} <span class="stat-unit">ngày</span>`;
    }

    if (this.dom.statDistanceExtra) {
      if (summary.totalDistanceKm > 0) {
        this.dom.statDistanceExtra.textContent = `Tổng quãng đường: ${summary.totalDistanceKm} km`;
      } else {
        this.dom.statDistanceExtra.textContent = 'Ngày có phát sinh bài tập';
      }
    }
  },

  renderChart() {
    if (!window.WorkoutChartEngine || !window.HealthCalculator) return;
    const grouped = window.HealthCalculator.groupWorkoutsByDate(this.cachedFilteredWorkouts);
    WorkoutChartEngine.render(grouped);
  },

  renderList() {
    const list = this.cachedFilteredWorkouts;
    const container = this.dom.listContainer;
    if (!container) return;

    if (this.cachedAllWorkouts.length === 0) {
      container.innerHTML = '';
      if (this.dom.emptyState) this.dom.emptyState.style.display = 'block';
      if (this.dom.emptyFilterState) this.dom.emptyFilterState.style.display = 'none';
      this.updatePaginationUI(0, 0);
      return;
    }

    if (list.length === 0) {
      container.innerHTML = '';
      if (this.dom.emptyState) this.dom.emptyState.style.display = 'none';
      if (this.dom.emptyFilterState) this.dom.emptyFilterState.style.display = 'block';
      this.updatePaginationUI(0, 0);
      return;
    }

    if (this.dom.emptyState) this.dom.emptyState.style.display = 'none';
    if (this.dom.emptyFilterState) this.dom.emptyFilterState.style.display = 'none';

    // Pagination slice
    const totalPages = Math.ceil(list.length / this.pageSize) || 1;
    this.currentPage = Math.min(this.currentPage, totalPages);
    const startIdx = (this.currentPage - 1) * this.pageSize;
    const pageItems = list.slice(startIdx, startIdx + this.pageSize);

    const itemsHtml = pageItems.map(item => this.createWorkoutCardHtml(item));
    container.innerHTML = itemsHtml.join('');

    // Attach dynamic click events to buttons on each card
    container.querySelectorAll('.btn-view-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.openDetailModal(id);
      });
    });

    container.querySelectorAll('.btn-edit-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const item = this.cachedAllWorkouts.find(w => w.id === id);
        if (item) this.openEditForm(item);
      });
    });

    container.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const item = this.cachedAllWorkouts.find(w => w.id === id);
        this.promptDelete(id, item ? item.title : 'Buổi tập này');
      });
    });

    this.updatePaginationUI(this.currentPage, totalPages);
  },

  createWorkoutCardHtml(item) {
    const actMeta = this.ACTIVITY_TYPES[item.activityType] || { label: 'Khác', icon: '⚡' };
    const intMeta = this.INTENSITY_LABELS[item.intensity] || { label: 'Vừa phải', badgeClass: 'badge-intensity-medium' };

    // Format date DD/MM/YYYY
    const p = (item.workoutDate || '').split('-');
    const dateFormatted = p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : item.workoutDate;

    // Time string
    let timeRangeStr = '';
    if (item.startTime && item.endTime) {
      timeRangeStr = ` • ⏰ ${item.startTime} - ${item.endTime}`;
    } else if (item.startTime) {
      timeRangeStr = ` • ⏰ ${item.startTime}`;
    }

    let extraStatsHtml = '';
    if (item.distanceKm && item.distanceKm > 0) {
      extraStatsHtml += `
        <span class="workout-stat-pill">
          <span>📍 Quãng đường:</span> <strong>${item.distanceKm} km</strong>
        </span>
      `;
    }
    if (item.steps && item.steps > 0) {
      extraStatsHtml += `
        <span class="workout-stat-pill">
          <span>👟 Số bước:</span> <strong>${item.steps.toLocaleString()}</strong>
        </span>
      `;
    }

    const noteSnippet = item.notes 
      ? `<div style="font-size: 0.78rem; color: var(--color-text-secondary); margin-top: 4px; font-style: italic; max-width: 580px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
           "${item.notes}"
         </div>`
      : '';

    return `
      <div class="workout-item-card" data-id="${item.id}">
        <div class="workout-item-top">
          <div class="workout-item-main">
            <div class="workout-type-icon-pill" title="${actMeta.label}">
              ${actMeta.icon}
            </div>
            <div class="workout-item-titles">
              <div class="workout-item-title">${item.title}</div>
              <div class="workout-item-meta">
                <span style="font-weight: 600; color: var(--color-primary);">${actMeta.label}</span>
                <span>• 📅 ${dateFormatted}${timeRangeStr}</span>
                <span class="glass-badge ${intMeta.badgeClass}" style="padding: 2px 8px; font-size: 0.7rem;">${intMeta.label}</span>
              </div>
            </div>
          </div>

          <div class="workout-item-actions">
            <button type="button" class="btn-workout-action btn-view-detail" data-id="${item.id}" title="Xem chi tiết">
              Chi tiết
            </button>
            <button type="button" class="btn-workout-action btn-edit-item" data-id="${item.id}" title="Chỉnh sửa">
              Sửa
            </button>
            <button type="button" class="btn-workout-action text-danger btn-delete-item" data-id="${item.id}" title="Xóa">
              Xóa
            </button>
          </div>
        </div>

        <div class="workout-item-stats-strip">
          <span class="workout-stat-pill">
            <span>⏱️ Thời lượng:</span> <strong>${item.durationMinutes} phút</strong>
          </span>
          ${extraStatsHtml}
          ${item.feeling ? `<span class="workout-stat-pill" style="margin-left: auto;">${this.FEELING_LABELS[item.feeling] || ''}</span>` : ''}
        </div>

        ${noteSnippet}
      </div>
    `;
  },

  updatePaginationUI(current, total) {
    if (this.dom.pageInfo) {
      this.dom.pageInfo.textContent = total > 0 ? `Trang ${current} / ${total} (${this.cachedFilteredWorkouts.length} bản ghi)` : 'Trang 0 / 0';
    }
    if (this.dom.btnPagePrev) this.dom.btnPagePrev.disabled = current <= 1;
    if (this.dom.btnPageNext) this.dom.btnPageNext.disabled = current >= total;
  },

  // MODAL FORM (CREATE & EDIT)
  openCreateForm() {
    if (!this.dom.modalForm) return;
    this.clearValidationErrors();

    if (this.dom.modalFormTitle) this.dom.modalFormTitle.textContent = 'Ghi Nhận Buổi Tập Mới';
    if (this.dom.btnSubmitForm) this.dom.btnSubmitForm.textContent = 'Lưu Buổi Tập';

    this.dom.inputId.value = '';
    this.dom.inputTitle.value = '';
    this.dom.inputType.value = 'gym';
    this.dom.inputIntensity.value = 'medium';
    this.dom.inputDate.value = window.getTodayDateString ? window.getTodayDateString() : new Date().toISOString().split('T')[0];
    this.dom.inputDuration.value = '60';
    this.dom.inputStartTime.value = '';
    this.dom.inputEndTime.value = '';
    this.dom.inputDistance.value = '';
    this.dom.inputSteps.value = '';
    this.dom.inputFeeling.value = 'good';
    this.dom.inputNotes.value = '';

    this.dom.modalForm.style.display = 'flex';
  },

  openEditForm(item) {
    if (!this.dom.modalForm || !item) return;
    this.clearValidationErrors();

    if (this.dom.modalFormTitle) this.dom.modalFormTitle.textContent = 'Chỉnh Sửa Buổi Tập';
    if (this.dom.btnSubmitForm) this.dom.btnSubmitForm.textContent = 'Cập Nhật Buổi Tập';

    this.dom.inputId.value = item.id;
    this.dom.inputTitle.value = item.title || '';
    this.dom.inputType.value = item.activityType || 'gym';
    this.dom.inputIntensity.value = item.intensity || 'medium';
    this.dom.inputDate.value = item.workoutDate || (window.getTodayDateString ? window.getTodayDateString() : '');
    this.dom.inputDuration.value = item.durationMinutes || 30;
    this.dom.inputStartTime.value = item.startTime || '';
    this.dom.inputEndTime.value = item.endTime || '';
    this.dom.inputDistance.value = item.distanceKm !== null ? item.distanceKm : '';
    this.dom.inputSteps.value = item.steps !== null ? item.steps : '';
    this.dom.inputFeeling.value = item.feeling || 'good';
    this.dom.inputNotes.value = item.notes || '';

    this.dom.modalForm.style.display = 'flex';
  },

  closeFormModal() {
    if (this.dom.modalForm) {
      this.dom.modalForm.style.display = 'none';
    }
  },

  clearValidationErrors() {
    const inputs = [
      this.dom.inputTitle, this.dom.inputDate, this.dom.inputDuration,
      this.dom.inputEndTime, this.dom.inputDistance, this.dom.inputSteps
    ];
    inputs.forEach(input => {
      if (input) input.classList.remove('is-invalid');
    });
  },

  handleFormSubmit() {
    this.clearValidationErrors();

    const id = this.dom.inputId.value;
    const title = this.dom.inputTitle.value.trim();
    const activityType = this.dom.inputType.value;
    const intensity = this.dom.inputIntensity.value;
    const workoutDate = this.dom.inputDate.value;
    const duration = parseInt(this.dom.inputDuration.value, 10);
    const startTime = this.dom.inputStartTime.value;
    const endTime = this.dom.inputEndTime.value;
    const distanceVal = this.dom.inputDistance.value.trim();
    const stepsVal = this.dom.inputSteps.value.trim();
    const feeling = this.dom.inputFeeling.value;
    const notes = this.dom.inputNotes.value.trim();

    let isValid = true;

    // Validate title
    if (!title) {
      this.dom.inputTitle.classList.add('is-invalid');
      isValid = false;
    }

    // Validate date
    if (!workoutDate) {
      this.dom.inputDate.classList.add('is-invalid');
      isValid = false;
    }

    // Validate duration
    if (isNaN(duration) || duration <= 0 || duration > 720) {
      this.dom.inputDuration.classList.add('is-invalid');
      isValid = false;
    }

    // Validate times if both provided
    if (startTime && endTime) {
      if (endTime <= startTime) {
        this.dom.inputEndTime.classList.add('is-invalid');
        isValid = false;
      }
    }

    // Validate distance
    let distanceKm = null;
    if (distanceVal !== '') {
      distanceKm = parseFloat(distanceVal);
      if (isNaN(distanceKm) || distanceKm < 0) {
        this.dom.inputDistance.classList.add('is-invalid');
        isValid = false;
      }
    }

    // Validate steps
    let steps = null;
    if (stepsVal !== '') {
      steps = parseInt(stepsVal, 10);
      if (isNaN(steps) || steps < 0) {
        this.dom.inputSteps.classList.add('is-invalid');
        isValid = false;
      }
    }

    if (!isValid) return;

    const workoutData = {
      title,
      activityType,
      intensity,
      workoutDate,
      durationMinutes: duration,
      startTime,
      endTime,
      distanceKm,
      steps,
      feeling,
      notes
    };

    // Submitting state
    if (this.dom.btnSubmitForm) this.dom.btnSubmitForm.disabled = true;

    try {
      if (id) {
        // Edit mode
        window.storageService.updateWorkoutLog(id, workoutData);
        ToastModule.show(`Đã cập nhật buổi tập "${title}"!`, 'emerald');
      } else {
        // Create mode
        window.storageService.addWorkoutLog(workoutData);
        ToastModule.show(`Đã thêm buổi tập mới "${title}"!`, 'emerald');
      }

      this.closeFormModal();
      this.loadDataAndRender();
    } catch (err) {
      console.error(err);
      ToastModule.show('Có lỗi xảy ra khi lưu trữ dữ liệu.', 'flame');
    } finally {
      if (this.dom.btnSubmitForm) this.dom.btnSubmitForm.disabled = false;
    }
  },

  // DETAILS MODAL
  openDetailModal(id) {
    const item = this.cachedAllWorkouts.find(w => w.id === id);
    if (!item || !this.dom.modalDetail) return;
    this.selectedWorkout = item;

    const actMeta = this.ACTIVITY_TYPES[item.activityType] || { label: 'Khác', icon: '⚡' };
    const intMeta = this.INTENSITY_LABELS[item.intensity] || { label: 'Vừa phải', badgeClass: 'badge-intensity-medium' };

    if (this.dom.detailTitle) this.dom.detailTitle.textContent = `${actMeta.icon} ${item.title}`;
    if (this.dom.detailSubtitle) this.dom.detailSubtitle.textContent = `${actMeta.label} • Ngày ${item.workoutDate}`;

    if (this.dom.detailContent) {
      this.dom.detailContent.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: var(--color-surface-raised); padding: 12px; border-radius: 8px;">
          <div>
            <span style="font-size: 0.75rem; color: var(--color-text-muted);">Loại hình:</span>
            <div style="font-weight: 600;">${actMeta.label}</div>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--color-text-muted);">Cường độ:</span>
            <div><span class="glass-badge ${intMeta.badgeClass}">${intMeta.label}</span></div>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--color-text-muted);">Thời lượng:</span>
            <div style="font-weight: 700; color: var(--color-primary);">${item.durationMinutes} phút</div>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--color-text-muted);">Thời gian:</span>
            <div style="font-weight: 500;">${item.startTime || '--'} ${item.endTime ? '→ ' + item.endTime : ''}</div>
          </div>
          ${item.distanceKm ? `<div><span style="font-size: 0.75rem; color: var(--color-text-muted);">Quãng đường:</span><div style="font-weight: 600;">${item.distanceKm} km</div></div>` : ''}
          ${item.steps ? `<div><span style="font-size: 0.75rem; color: var(--color-text-muted);">Số bước:</span><div style="font-weight: 600;">${item.steps.toLocaleString()}</div></div>` : ''}
        </div>

        <div>
          <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block; margin-bottom: 2px;">Cảm nhận:</span>
          <div style="font-weight: 500;">${this.FEELING_LABELS[item.feeling] || 'Bình thường'}</div>
        </div>

        <div>
          <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block; margin-bottom: 2px;">Ghi chú chi tiết:</span>
          <div style="background: var(--color-surface); border: 1px solid var(--color-border); padding: 10px; border-radius: 8px; line-height: 1.5; font-size: 0.84rem;">
            ${item.notes ? item.notes : '<span style="color: var(--color-text-muted); font-style: italic;">Không có ghi chú.</span>'}
          </div>
        </div>
      `;
    }

    this.dom.modalDetail.style.display = 'flex';
  },

  closeDetailModal() {
    if (this.dom.modalDetail) {
      this.dom.modalDetail.style.display = 'none';
    }
  },

  // CONFIRM DELETE
  promptDelete(id, title) {
    this.pendingDeleteId = id;
    if (this.dom.deleteMsg) {
      this.dom.deleteMsg.innerHTML = `Bạn có chắc chắn muốn xóa buổi tập <strong>"${title}"</strong>? Thao tác này không thể hoàn tác.`;
    }
    if (this.dom.modalDelete) {
      this.dom.modalDelete.style.display = 'flex';
    }
  },

  closeDeleteModal() {
    this.pendingDeleteId = null;
    if (this.dom.modalDelete) {
      this.dom.modalDelete.style.display = 'none';
    }
  }
};

window.WorkoutJournalModule = WorkoutJournalModule;
