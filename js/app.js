const AuthGuard = {
  checkAccess() {
    const pathname = window.location.pathname.toLowerCase();
    const isAuthPage = pathname.includes("auth.html");
    const isSubdir = pathname.includes("/page/");
    const authPath = isSubdir ? "auth.html" : "Page/auth.html";
    const homePath = isSubdir ? "../index.html" : "index.html";
    const hasSession = window.storageService && window.storageService.hasActiveSession();

    if (!hasSession && !isAuthPage) {
      try {
        const currentRel = window.location.pathname + window.location.search;
        sessionStorage.setItem("fitvn_redirect_url", currentRel);
      } catch (e) {}
      window.location.replace(authPath);
      return false;
    }

    if (hasSession && isAuthPage) {
      window.location.replace(homePath);
      return false;
    }
    return true;
  }
};
window.AuthGuard = AuthGuard;



document.addEventListener('DOMContentLoaded', () => {
  if (window.storageService) {
    window.storageService.initStorage();
  }
  if (window.AuthGuard && !window.AuthGuard.checkAccess()) {
    return;
  }

  // Only initialize AppHeaderModule if not on auth page
  const isAuthPage = window.location.pathname.toLowerCase().includes('auth.html');
  if (!isAuthPage) {
    AppHeaderModule.init();
  }
  NavigationModule.init();
  ToastModule.init();

  
  if (document.getElementById('dash-stat-calories')) {
    DashboardModule.init();
  }

  if (document.getElementById('report-weight-canvas')) {
    HealthReportsModule.init();
  }
  if (document.getElementById('workout-chart-canvas')) {
    WorkoutJournalModule.init();
  }
  if (document.getElementById('progress-chart-canvas')) {
    ProgressChartsModule.init();
  }
  if (document.getElementById('health-weight-canvas')) {
    HealthDashboardModule.init();
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

  // Initialize OnboardingModule
  if (window.OnboardingModule) {
    window.OnboardingModule.init();
  }
});


const ToastModule = {
  containerEl: null,


  bindLogoutEvents() {
    document.querySelectorAll('.btn-logout-trigger, [data-action="logout"], #btn-logout-settings').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?')) {
          window.storageService.logoutUser();
          const isSubdir = window.location.pathname.toLowerCase().includes('/page/');
          window.location.replace(isSubdir ? 'auth.html' : 'Page/auth.html');
        }
      });
    });
  },
  init() {
    this.containerEl = document.getElementById('toast-container');
    if (!this.containerEl) {
      this.containerEl = document.createElement('div');
      this.containerEl.id = 'toast-container';
      document.body.appendChild(this.containerEl);
    }
    this.bindLogoutEvents();
  },

  show(message, type = 'cyan') {
    if (!this.containerEl) this.init();

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    
    
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
    const profile = (window.storageService && window.storageService.getUserProfile) ? window.storageService.getUserProfile() : {};
    const authUser = window.storageService.getCurrentUser ? window.storageService.getCurrentUser() : null;
    const activeName = (authUser && authUser.name) ? authUser.name : (profile.name || 'Người dùng FitVN');
    
    
    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = activeName;
    });

    
    const initials = activeName.trim().split(/\s+/).map(w => w[0]).slice(-2).join('').toUpperCase() || 'VN';
    document.querySelectorAll('.avatar-pill').forEach(el => {
      el.textContent = initials;
      el.setAttribute('title', activeName);
    });

    
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
    if (currentPath.includes('progress-charts.html')) {
      activeKey = 'progress-charts';
    } else if (currentPath.includes('health-dashboard.html')) {
      activeKey = 'health-dashboard';
    } else if (currentPath.includes('workout.html')) {
      activeKey = 'workout';
    } else if (currentPath.includes('reports.html')) {
      activeKey = 'reports';
    } else if (currentPath.includes('weight.html')) {
      activeKey = 'weight';
    } else if (currentPath.includes('food-log.html')) {
      activeKey = 'food';
    } else if (currentPath.includes('food-search.html')) {
      activeKey = 'food-search';
    } else if (currentPath.includes('settings.html')) {
      activeKey = 'settings';
    } else if (currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '') {
      activeKey = 'dashboard';
    }

    this.navLinks.forEach((link) => {
      const pageKey = link.getAttribute('data-page') || link.getAttribute('data-tab');
      const isTarget = pageKey === activeKey || pageKey === `tab-${activeKey}`;
      link.classList.toggle('active', isTarget);
      link.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });
  }
};


const DashboardModule = {
  dom: {},
  circumference: 2 * Math.PI * 75, 

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
      calorieCompensation: document.getElementById('dash-calorie-compensation'),
      calorieDemoSurplus: document.getElementById('calorie-demo-surplus'),
      calorieDemoButton: document.getElementById('btn-simulate-calorie-tomorrow'),
      calorieDemoResult: document.getElementById('calorie-demo-result'),
      statRemaining: document.getElementById('dash-calories-remaining'),
      statConsumedSub: document.getElementById('dash-calories-consumed'),
      calProgressFill: document.getElementById('dash-calories-progress'),
      calBadge: document.getElementById('dash-calories-badge'),

      
      proteinText: document.getElementById('dash-macro-protein-text'),
      proteinProgress: document.getElementById('dash-macro-protein-progress'),
      proteinKcal: document.getElementById('dash-macro-protein-kcal'),

      carbText: document.getElementById('dash-macro-carb-text'),
      carbProgress: document.getElementById('dash-macro-carb-progress'),
      carbKcal: document.getElementById('dash-macro-carb-kcal'),

      fatText: document.getElementById('dash-macro-fat-text'),
      fatProgress: document.getElementById('dash-macro-fat-progress'),
      fatKcal: document.getElementById('dash-macro-fat-kcal'),

      
      waterVal: document.getElementById('dash-water-val'),
      waterUnit: document.getElementById('dash-water-unit'),
      waterSubOz: document.getElementById('dash-water-sub-oz'),
      waterCupsGrid: document.getElementById('dash-water-cups-grid'),
      waterCircleBar: document.getElementById('water-gauge-circle'),
      waterGoalVal: document.getElementById('dash-water-goal-val'),
      waterDropdownPanel: document.getElementById('water-dropdown-panel'),
      btnWaterDots: document.getElementById('btn-water-dots'),
      btnWaterQuickAdd: document.getElementById('btn-water-quick-add'),

      
      dashWeight: document.getElementById('dash-current-weight'),
      dashWeightBadge: document.getElementById('dash-weight-badge'),

      
      recentFoodList: document.getElementById('dash-recent-food-list')
    };
  },

  bindEvents() {
    if (this.dom.calorieDemoButton) {
      this.dom.calorieDemoButton.addEventListener('click', () => this.simulateTomorrowCalorieTarget());
    }

    
    document.addEventListener('click', (e) => {
      
      if (e.target.closest('#btn-water-quick-add')) {
        this.updateWater(250);
        return;
      }

      
      const cupItem = e.target.closest('.water-cup-item');
      if (cupItem) {
        const fill = parseInt(cupItem.getAttribute('data-fill'), 10) || 0;
        
        if (fill < 100) {
          this.updateWater(250);
        } else {
          
          this.updateWater(-250);
        }
        return;
      }

      
      const quickBtn = e.target.closest('[data-water-quick]') || e.target.closest('[data-water-add]');
      if (quickBtn) {
        const amount = parseInt(quickBtn.getAttribute('data-water-quick') || quickBtn.getAttribute('data-water-add'), 10);
        if (!isNaN(amount)) {
          this.updateWater(amount);
          if (this.dom.waterDropdownPanel) this.dom.waterDropdownPanel.style.display = 'none';
        }
        return;
      }

      
      const dotsBtn = e.target.closest('#btn-water-dots');
      if (dotsBtn) {
        if (this.dom.waterDropdownPanel) {
          const isHidden = this.dom.waterDropdownPanel.style.display === 'none' || !this.dom.waterDropdownPanel.style.display;
          this.dom.waterDropdownPanel.style.display = isHidden ? 'block' : 'none';
        }
        return;
      }

      
      const resetBtn = e.target.closest('#btn-water-reset');
      if (resetBtn) {
        window.storageService.resetWater();
        ToastModule.show('Đã đặt lại lượng nước uống hôm nay về 0ml.', 'flame');
        if (this.dom.waterDropdownPanel) this.dom.waterDropdownPanel.style.display = 'none';
        this.renderWater();
        return;
      }

      
      const editTargetBtn = e.target.closest('#btn-water-edit-target');
      if (editTargetBtn) {
        if (this.dom.waterDropdownPanel) this.dom.waterDropdownPanel.style.display = 'none';
        const profile = (window.storageService && window.storageService.getUserProfile) ? window.storageService.getUserProfile() : (window.storageService.getUserProfile ? window.storageService.getUserProfile() : window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {}));
        const currentTarget = profile.waterTarget || 3000;
        const input = prompt('Nhập mục tiêu nước uống mỗi ngày của bạn (ml):', currentTarget);
        if (input !== null) {
          const newTarget = parseInt(input, 10);
          if (!isNaN(newTarget) && newTarget >= 500 && newTarget <= 10000) {
            profile.waterTarget = newTarget;
            window.storageService.setUserProfile(profile);
            ToastModule.show(`Đã cập nhật mục tiêu nước: ${newTarget.toLocaleString()}ml!`);
            this.renderWater();
          } else if (input.trim() !== '') {
            ToastModule.show('Vui lòng nhập số ml hợp lệ (từ 500 đến 10,000 ml)', 'flame');
          }
        }
        return;
      }

      
      if (this.dom.waterDropdownPanel && this.dom.waterDropdownPanel.style.display !== 'none') {
        if (!e.target.closest('.water-menu-wrapper')) {
          this.dom.waterDropdownPanel.style.display = 'none';
        }
      }
    });

    
    if (this.dom.btnWaterQuickAdd) {
      this.dom.btnWaterQuickAdd.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.updateWater(250);
        }
      });
    }

    window.addEventListener('storage', (e) => {
      if (e.key === window.STORAGE_KEYS.FOOD_LOGS || e.key === window.STORAGE_KEYS.DAILY_CALORIE_LOGS || e.key === window.STORAGE_KEYS.USER_PROFILE) {
        this.updateUI();
      }
    });
  },

  simulateTomorrowCalorieTarget() {
    const surplus = Number(this.dom.calorieDemoSurplus && this.dom.calorieDemoSurplus.value);
    const resultEl = this.dom.calorieDemoResult;
    if (!resultEl) return;
    if (!Number.isFinite(surplus) || surplus <= 0 || surplus > 10000) {
      resultEl.textContent = 'Vui lòng nhập mức ăn vượt từ 1 đến 10.000 kcal.';
      resultEl.style.display = 'block';
      return;
    }

    const profile = window.storageService.getUserProfile();
    const baseTarget = Number(profile.targetCalories) || 2600;
    const today = window.getTodayDateString();
    const todayParts = today.split('-').map(Number);
    const tomorrowDate = new Date(todayParts[0], todayParts[1] - 1, todayParts[2] + 1);
    const tomorrow = [
      tomorrowDate.getFullYear(),
      String(tomorrowDate.getMonth() + 1).padStart(2, '0'),
      String(tomorrowDate.getDate()).padStart(2, '0')
    ].join('-');
    const historyWithoutToday = window.storageService.getDailyCalorieLogs().filter(log => log.date !== today);
    const todayTarget = window.storageService.calculateDailyTarget(today, historyWithoutToday, baseTarget);
    const simulatedLog = {
      date: today,
      baseTarget,
      consumedCalories: todayTarget + surplus
    };
    const tomorrowTarget = window.storageService.calculateDailyTarget(
      tomorrow,
      [...historyWithoutToday, simulatedLog],
      baseTarget
    );
    const reducedBy = Math.max(0, baseTarget - tomorrowTarget);
    const formatDate = date => {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    };

    resultEl.textContent = `Ngày ${formatDate(today)}: mục tiêu ${Math.round(todayTarget).toLocaleString('vi-VN')} kcal, giả lập nạp ${Math.round(simulatedLog.consumedCalories).toLocaleString('vi-VN')} kcal (vượt ${Math.round(surplus).toLocaleString('vi-VN')} kcal). Ngày ${formatDate(tomorrow)}: mục tiêu dự kiến ${Math.round(tomorrowTarget).toLocaleString('vi-VN')} kcal, giảm ${Math.round(reducedBy).toLocaleString('vi-VN')} kcal so với mục tiêu gốc ${Math.round(baseTarget).toLocaleString('vi-VN')} kcal${tomorrowTarget <= window.storageService.minimumCalorieTarget ? ` (đã chạm mức sàn ${window.storageService.minimumCalorieTarget.toLocaleString('vi-VN')} kcal)` : ''}.`;
    resultEl.style.display = 'block';
  },

  updateWater(amount) {
    const updated = window.storageService.addWater(amount);
    const sign = amount > 0 ? `+${amount}` : `${amount}`;
    ToastModule.show(`Đã nạp ${sign}ml nước! Hiện tại: ${updated.toLocaleString('vi-VN')}ml`);
    this.renderWater();
  },

  renderWater() {
    const profile = (window.storageService.getUserProfile ? window.storageService.getUserProfile() : window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {}));
    const target = Number(profile.waterTarget) > 0 ? Number(profile.waterTarget) : 3000;
    const current = window.storageService.getWater();
    const percent = Math.min(100, Math.round((current / target) * 100));
    const CUP_CAPACITY_ML = 250;

    
    if (this.dom.waterVal) {
      this.dom.waterVal.textContent = current.toLocaleString('vi-VN');
    }
    if (this.dom.waterUnit) {
      this.dom.waterUnit.textContent = 'ml';
    }
    if (this.dom.waterSubOz) {
      
      const oz = (current * 0.033814).toFixed(1);
      this.dom.waterSubOz.textContent = `(${oz} fl oz)`;
    }
    if (this.dom.waterGoalVal) {
      const goalOz = (target * 0.033814).toFixed(1);
      this.dom.waterGoalVal.textContent = `${target.toLocaleString('vi-VN')} ml (${goalOz} fl oz)`;
    }

    
    if (this.dom.waterCircleBar) {
      const circumference = 113.1; 
      const rawRatio = target > 0 ? (current / target) : 0;
      const progressRatio = Math.min(1, Math.max(0, rawRatio));
      const offset = circumference * (1 - progressRatio);
      this.dom.waterCircleBar.style.strokeDashoffset = `${offset.toFixed(2)}`;

      if (current >= target) {
        this.dom.waterCircleBar.style.stroke = '#10b981'; 
      } else {
        this.dom.waterCircleBar.style.stroke = '#0ea5e9'; 
      }
    }

    
    if (this.dom.waterCupsGrid) {
      
      const baseCups = Math.max(1, Math.ceil(target / CUP_CAPACITY_ML));
      
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

          <path d="M 3.5,5 L 7,39 C 7.5,41 9.5,42.5 16,42.5 C 22.5,42.5 24.5,41 25,39 L 28.5,5 Z" class="cup-glass-stroke" fill="none" />
          <ellipse cx="16" cy="5" rx="12.5" ry="2" class="cup-glass-rim" fill="none" />

          ${contentInside}
        </svg>
      </div>
    `;
  },

  updateUI() {
    const profile = (window.storageService.getUserProfile ? window.storageService.getUserProfile() : window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {}));
    const targetMacros = profile.macros || { protein: 165, carbs: 325, fat: 72 };

    const todayDate = window.getTodayDateString();
    const dayTotals = window.storageService.calculateDayTotals(todayDate);
    const baseTarget = Number(profile.targetCalories) || 2600;
    if (dayTotals.count > 0) {
      window.storageService.saveDayLog(todayDate, dayTotals.calories, baseTarget);
    }
    const targetCalories = window.storageService.calculateDailyTarget(todayDate, null, baseTarget);

    
    const consumed = Math.round(dayTotals.calories);
    const remaining = targetCalories - consumed;
    const calPercent = Math.min(100, Math.round((consumed / targetCalories) * 100));

    
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

    
    if (this.dom.statConsumed) {
      this.dom.statConsumed.innerHTML = `${consumed.toLocaleString()} <span class="stat-unit">/ ${targetCalories.toLocaleString()} kcal</span>`;
    }
    if (this.dom.calorieCompensation) {
      const compensation = baseTarget - targetCalories;
      this.dom.calorieCompensation.textContent = compensation > 0
        ? `Đã điều chỉnh giảm ${compensation.toLocaleString()} kcal do phần calo dư hôm qua.`
        : `Mục tiêu gốc: ${baseTarget.toLocaleString()} kcal · mức bù tối thiểu: ${window.storageService.minimumCalorieTarget.toLocaleString()} kcal.`;
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

    
    this.renderMacroItem('protein', dayTotals.protein, targetMacros.protein, 4);
    this.renderMacroItem('carb', dayTotals.carbs, targetMacros.carbs, 4);
    this.renderMacroItem('fat', dayTotals.fat, targetMacros.fat, 9);

    
    this.renderWater();

    
    this.renderWeightSnippet(profile);

    
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
    const targetWeight = profile.targetWeight || null;

    if (this.dom.dashWeight) {
      if (latest && latest.weight) {
        this.dom.dashWeight.innerHTML = `${latest.weight} <span class="stat-unit">kg ${targetWeight ? `(Mục tiêu: ${targetWeight} kg)` : ''}</span>`;
      } else {
        this.dom.dashWeight.innerHTML = `-- <span class="stat-unit">kg ${targetWeight ? `(Mục tiêu: ${targetWeight} kg)` : ''}</span>`;
      }
    }

    if (this.dom.dashWeightBadge) {
      const logs = window.storageService.getWeightLogs();
      if (logs.length >= 2 && window.HealthCalculator) {
        const maData = window.HealthCalculator.calculateMovingAverage(logs, 7);
        const trend = window.HealthCalculator.calculateWeeklyTrend(maData);
        this.dom.dashWeightBadge.textContent = trend.text;
      } else if (logs.length === 1) {
        this.dom.dashWeightBadge.textContent = 'Bản ghi đầu tiên';
      } else {
        this.dom.dashWeightBadge.textContent = 'Chưa có dữ liệu';
      }
    }
  },

  
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
    const recent = dayLogs.slice(0, 3); 

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


const FoodLogModule = {
  activeMealType: 'breakfast',
  activeCategory: 'all',
  currentSearchQuery: '',
  selectedDate: null,
  modalBackdropEl: null,
  searchResultsEl: null,
  searchInputEl: null,
  selectedFood: null,

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

    
    if (headerDateEl) {
      headerDateEl.textContent = this.formatDateVN(curDateStr);
    }
  },

  bindEvents() {
    
    document.addEventListener('click', (e) => {
      const triggerBtn = e.target.closest('[data-open-food-modal]');
      if (triggerBtn) {
        const meal = triggerBtn.getAttribute('data-meal-type') || 'breakfast';
        this.openModal(meal);
      }
    });

    
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

    
    const modalTabs = document.querySelectorAll('.modal-tab-btn');
    modalTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        modalTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetView = tab.getAttribute('data-view');
        const dbView = document.getElementById('modal-view-database');
        const barcodeView = document.getElementById('modal-view-barcode');
        const customView = document.getElementById('modal-view-custom');
        if (dbView) dbView.style.display = targetView === 'database' ? 'flex' : 'none';
        if (barcodeView) barcodeView.style.display = targetView === 'barcode' ? 'flex' : 'none';
        if (customView) customView.style.display = targetView === 'custom' ? 'flex' : 'none';
      });
    });

    
    if (this.searchInputEl) {
      this.searchInputEl.addEventListener('input', (e) => {
        this.currentSearchQuery = e.target.value.trim();
        this.filterAndRenderFoods();
      });
    }

    const servingInput = document.getElementById('food-serving-grams');
    if (servingInput) {
      servingInput.addEventListener('input', () => this.renderServingPreview());
    }
    const confirmServingBtn = document.getElementById('btn-confirm-food-serving');
    if (confirmServingBtn) {
      confirmServingBtn.addEventListener('click', () => this.addSelectedFood());
    }

    // Auto-calculate calories preview for custom food form
    ['custom-food-protein', 'custom-food-carbs', 'custom-food-fat'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.updateCustomCaloriesPreview());
      }
    });

    
    const chipBtns = document.querySelectorAll('.chip-btn');
    chipBtns.forEach((chip) => {
      chip.addEventListener('click', () => {
        chipBtns.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeCategory = chip.getAttribute('data-category') || 'all';
        this.filterAndRenderFoods();
      });
    });

    
    document.addEventListener('click', (e) => {
      const foodRow = e.target.closest('.food-item-row');
      if (foodRow) {
        const foodId = foodRow.getAttribute('data-food-id');
        if (foodId) this.selectFood(foodId);
      }

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
    this.selectedFood = null;
    const editor = document.getElementById('food-serving-editor');
    if (editor) editor.style.display = 'none';
  },

  
  filterAndRenderFoods() {
    const allFoods = window.storageService.getAllFoods();
    const queryNormalized = window.removeVietnameseTones ? window.removeVietnameseTones(this.currentSearchQuery) : this.currentSearchQuery.toLowerCase();

    const filtered = allFoods.filter((food) => {
      
      if (this.activeCategory !== 'all' && food.category !== this.activeCategory) {
        return false;
      }

      
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
      <div class="food-item-row" data-food-id="${food.id}" role="group" aria-label="Chọn ${food.name} để nhập khẩu phần">
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
          <button type="button" class="btn-quick-add" title="Chọn khẩu phần món này" aria-label="Chọn khẩu phần ${food.name}">
            +
          </button>
        </div>
      </div>
    `).join('');
  },

  
  selectFood(foodId) {
    const allFoods = window.storageService.getAllFoods();
    const food = allFoods.find(item => item.id === foodId);
    if (!food) return;

    this.selectedFood = food;
    const baseGrams = Number(food.servingWeightGrams) || 100;
    const editor = document.getElementById('food-serving-editor');
    const nameEl = document.getElementById('food-serving-editor-name');
    const gramsInput = document.getElementById('food-serving-grams');
    const baseEl = document.getElementById('food-serving-base');
    if (!editor || !nameEl || !gramsInput || !baseEl) return;

    nameEl.textContent = food.name;
    gramsInput.value = baseGrams;
    baseEl.textContent = `Khẩu phần gốc: ${food.serving} (${baseGrams}g)`;
    editor.style.display = 'block';
    this.renderServingPreview();
    gramsInput.focus();
  },

  renderServingPreview() {
    if (!this.selectedFood) return;
    const gramsInput = document.getElementById('food-serving-grams');
    const preview = document.getElementById('food-serving-preview');
    if (!gramsInput || !preview) return;

    const grams = Number(gramsInput.value);
    const baseGrams = Number(this.selectedFood.servingWeightGrams) || 100;
    if (!Number.isFinite(grams) || grams <= 0) {
      preview.textContent = 'Vui lòng nhập số gram lớn hơn 0.';
      return;
    }

    const nutrition = window.FoodService.calculateServingNutrition(this.selectedFood, grams / baseGrams);
    preview.textContent = `${nutrition.calories} kcal · Đạm ${nutrition.protein}g · Carb ${nutrition.carbs}g · Béo ${nutrition.fat}g`;
  },

  addSelectedFood() {
    if (!this.selectedFood) return;
    const food = this.selectedFood;
    const gramsInput = document.getElementById('food-serving-grams');
    const grams = Number(gramsInput && gramsInput.value);
    const baseGrams = Number(food.servingWeightGrams) || 100;
    if (!Number.isFinite(grams) || grams <= 0) {
      ToastModule.show('Vui lòng nhập khẩu phần lớn hơn 0 gram.', 'flame');
      return;
    }
    const factor = grams / baseGrams;
    const nutrition = window.FoodService.calculateServingNutrition(food, factor);
    const targetDate = this.selectedDate || window.getTodayDateString();

    const newLog = window.storageService.addFoodLog({
      mealType: this.activeMealType,
      foodId: food.id,
      name: food.name,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      servingQty: factor,
      servingGrams: grams,
      date: targetDate
    });
    if (!newLog) {
      ToastModule.show('Không thể lưu món ăn. Vui lòng thử lại.', 'flame');
      return;
    }

    const dateFormatted = this.formatDateVN(targetDate);
    ToastModule.show(`Đã nạp ${food.name} ${grams}g (${nutrition.calories} kcal) vào ${this.mealNames[this.activeMealType]} (${dateFormatted})!`);
    
    
    this.closeModal();
    this.renderFoodLogs();
    if (window.DashboardModule && typeof window.DashboardModule.updateUI === 'function') {
      window.DashboardModule.updateUI();
    }
  },

  
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
                ${item.servingGrams ? `<span>${item.servingGrams}g • </span>` : ''}
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

    
    const dayTotalEl = document.getElementById('food-log-day-total-cals');
    if (dayTotalEl) {
      dayTotalEl.textContent = `${dayTotalCalories.toLocaleString()} kcal`;
    }

    // Cập nhật tổng Macro cả ngày
    const dayTotals = window.storageService.calculateDayTotals(targetDate);
    const pEl = document.getElementById('food-log-day-total-p');
    const cEl = document.getElementById('food-log-day-total-c');
    const fEl = document.getElementById('food-log-day-total-f');
    if (pEl) pEl.textContent = Math.round(dayTotals.protein);
    if (cEl) cEl.textContent = Math.round(dayTotals.carbs);
    if (fEl) fEl.textContent = Math.round(dayTotals.fat);
    this.renderWeeklyCalorieSummary();
  },

  renderWeeklyCalorieSummary() {
    const currentDate = window.getTodayDateString();
    const summary = window.storageService.getWeeklySummary(currentDate);
    const targetEl = document.getElementById('weekly-calorie-target');
    const consumedEl = document.getElementById('weekly-calorie-consumed');
    const daysEl = document.getElementById('weekly-calorie-days');
    const dayCountsEl = document.getElementById('weekly-calorie-day-counts');
    const balanceEl = document.getElementById('weekly-calorie-balance');
    const adjustmentEl = document.getElementById('weekly-calorie-adjustment');
    const formatCalories = value => `${Math.round(value).toLocaleString('vi-VN')} kcal`;

    if (targetEl) targetEl.textContent = formatCalories(summary.totalTarget);
    if (consumedEl) consumedEl.textContent = formatCalories(summary.totalConsumed);
    if (daysEl) daysEl.textContent = `${summary.daysTracked} ngày ghi nhận`;
    if (dayCountsEl) dayCountsEl.textContent = `${summary.daysOverTarget} / ${summary.daysMetTarget} ngày`;
    if (balanceEl) {
      const difference = summary.totalSurplus - summary.totalDeficit;
      balanceEl.textContent = difference > 0
        ? `Dư ${formatCalories(difference)}`
        : difference < 0
          ? `Thâm hụt ${formatCalories(Math.abs(difference))}`
          : formatCalories(0);
    }
    if (adjustmentEl) {
      adjustmentEl.textContent = `Tổng calo dư các ngày ăn lố: ${formatCalories(summary.totalSurplus)} · tổng thâm hụt các ngày đạt mục tiêu: ${formatCalories(summary.totalDeficit)}.`;
    }
  },

  updateCustomCaloriesPreview() {
    const p = parseFloat(document.getElementById('custom-food-protein')?.value) || 0;
    const c = parseFloat(document.getElementById('custom-food-carbs')?.value) || 0;
    const f = parseFloat(document.getElementById('custom-food-fat')?.value) || 0;
    const calories = Math.round((p * 4) + (c * 4) + (f * 9));
    const previewEl = document.getElementById('custom-food-calories-preview');
    if (previewEl) {
      previewEl.textContent = calories;
    }
  },

  handleCustomFoodSubmit() {
    const nameInput = document.getElementById('custom-food-name');
    const pInput = document.getElementById('custom-food-protein');
    const cInput = document.getElementById('custom-food-carbs');
    const fInput = document.getElementById('custom-food-fat');

    const name = nameInput ? nameInput.value.trim() : '';
    const protein = parseFloat(pInput?.value) || 0;
    const carbs = parseFloat(cInput?.value) || 0;
    const fat = parseFloat(fInput?.value) || 0;

    if (!name) {
      if (window.ToastModule) window.ToastModule.show('Vui lòng nhập tên món ăn!', 'flame');
      return;
    }

    const calories = Math.round((protein * 4) + (carbs * 4) + (fat * 9));
    const targetDate = this.selectedDate || window.getTodayDateString();

    // 1. Thêm bản ghi vào food logs
    const newLog = window.storageService.addFoodLog({
      mealType: this.activeMealType || 'lunch',
      foodId: 'custom_' + Date.now(),
      name: name,
      calories: calories,
      protein: protein,
      carbs: carbs,
      fat: fat,
      servingQty: 1,
      date: targetDate
    });

    const dateFormatted = this.formatDateVN(targetDate);
    const mealLabel = this.mealNames[this.activeMealType] || 'Bữa ăn';

    if (window.ToastModule) {
      window.ToastModule.show(`Đã thêm "${name}" (${calories} kcal) vào ${mealLabel} (${dateFormatted})!`, 'emerald');
    }

    // 2. Reset form
    const form = document.getElementById('form-custom-food');
    if (form) form.reset();
    const previewEl = document.getElementById('custom-food-calories-preview');
    if (previewEl) previewEl.textContent = '0';

    // 3. Đóng modal và render lại
    this.closeModal();
    this.renderFoodLogs();

    if (window.DashboardModule && typeof window.DashboardModule.updateUI === 'function') {
      window.DashboardModule.updateUI();
    }
  }
};


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
    if (window.location.hash === '#log-weight') {
      this.openModal();
    }
  },

  bindEvents() {
    
    const btnOpenModal = document.getElementById('btn-add-weight');
    if (btnOpenModal) {
      btnOpenModal.addEventListener('click', () => this.openModal());
    }

    
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

    
    if (this.formEl) {
      this.formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitForm();
      });
    }

    
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

    
    const dateInput = document.getElementById('input-weight-date');
    if (dateInput) {
      dateInput.value = window.getTodayDateString();
      dateInput.max = window.getTodayDateString();
    }

    
    const latest = window.storageService.getLatestWeight();
    const weightInput = document.getElementById('input-weight-val');
    const bfInput = document.getElementById('input-bodyfat-val');

    if (weightInput) weightInput.value = latest ? latest.weight : '';
    if (bfInput) bfInput.value = latest && latest.bodyFat ? latest.bodyFat : '';
    const noteInput = document.getElementById('input-weight-note');
    if (noteInput) noteInput.value = '';
    ['input-measure-chest', 'input-measure-waist', 'input-measure-arm', 'input-measure-thigh'].forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.value = '';
    });

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

    
    const chestInput = document.getElementById('input-measure-chest');
    const waistInput = document.getElementById('input-measure-waist');
    const armInput = document.getElementById('input-measure-arm');
    const thighInput = document.getElementById('input-measure-thigh');

    const weightVal = parseFloat(weightInput.value);
    if (isNaN(weightVal) || weightVal <= 0) {
      ToastModule.show('Vui lòng nhập cân nặng hợp lệ!', 'flame');
      return;
    }

    const logDate = dateInput.value || window.getTodayDateString();
    if (logDate > window.getTodayDateString()) {
      ToastModule.show('Ngày ghi nhận không thể ở tương lai!', 'flame');
      return;
    }

    const measurements = {};
    if (chestInput && chestInput.value) measurements.chest = parseFloat(chestInput.value);
    if (waistInput && waistInput.value) measurements.waist = parseFloat(waistInput.value);
    if (armInput && armInput.value) measurements.arm = parseFloat(armInput.value);
    if (thighInput && thighInput.value) measurements.thigh = parseFloat(thighInput.value);

    const saved = window.storageService.addWeightLog({
      date: logDate,
      weight: weightVal,
      bodyFat: bfInput.value ? parseFloat(bfInput.value) : null,
      note: noteInput.value.trim(),
      measurements: Object.keys(measurements).length > 0 ? measurements : null
    });

    if (!saved) {
      ToastModule.show('Không thể lưu dữ liệu cân nặng. Vui lòng thử lại.', 'flame');
      return;
    }

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
    const profile = (window.storageService.getUserProfile ? window.storageService.getUserProfile() : window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {}));
    this.renderWeeklyFluctuation(logs);

    if (logs.length === 0) return;

    
    const maData = window.HealthCalculator.calculateMovingAverage(logs, 7);

    
    if (window.CanvasChartEngine) {
      window.CanvasChartEngine.render(maData);
    }

    
    const latest = maData[maData.length - 1];
    const targetWeight = profile.targetWeight || 76.0;
    const height = profile.height || 175;

    
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

    
    const maValEl = document.getElementById('weight-7dma-val');
    const maTrendBadgeEl = document.getElementById('weight-7dma-trend');
    if (maValEl) {
      maValEl.innerHTML = `${latest.movingAverage} <span class="stat-unit">kg</span>`;
    }
    if (maTrendBadgeEl) {
      const trend = window.HealthCalculator.calculateWeeklyTrend(maData);
      maTrendBadgeEl.textContent = trend.text;
    }

    
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

    
    this.renderMeasurements(logs);

    
    this.renderHistory(logs, maData);
  },

  renderWeeklyFluctuation(logs) {
    const valueEl = document.getElementById('weight-weekly-range-val');
    const detailEl = document.getElementById('weight-weekly-range-detail');
    if (!valueEl || !detailEl) return;

    const today = window.getTodayDateString();
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - 6);
    const startDate = [
      cutoff.getFullYear(),
      String(cutoff.getMonth() + 1).padStart(2, '0'),
      String(cutoff.getDate()).padStart(2, '0')
    ].join('-');
    const weeklyLogs = logs.filter(log => log.date >= startDate && log.date <= today);

    if (weeklyLogs.length < 2) {
      valueEl.innerHTML = `-- <span class="stat-unit">kg</span>`;
      detailEl.textContent = weeklyLogs.length === 0
        ? 'Chưa có lần ghi cân nào trong 7 ngày gần nhất.'
        : 'Cần ít nhất 2 lần ghi nhận trong 7 ngày gần nhất để tính khoảng dao động.';
      return;
    }

    const weights = weeklyLogs.map(log => Number(log.weight));
    const lowest = Math.min(...weights);
    const highest = Math.max(...weights);
    const range = Number((highest - lowest).toFixed(1));
    const firstWeight = Number(weeklyLogs[0].weight);
    const latestWeight = Number(weeklyLogs[weeklyLogs.length - 1].weight);
    const netChange = Number((latestWeight - firstWeight).toFixed(1));
    const changeText = netChange > 0
      ? `tăng ${netChange.toFixed(1)} kg`
      : netChange < 0
        ? `giảm ${Math.abs(netChange).toFixed(1)} kg`
        : 'không đổi';

    valueEl.innerHTML = `${range.toFixed(1)} <span class="stat-unit">kg</span>`;
    detailEl.textContent = `Thấp nhất ${lowest.toFixed(1)} kg · cao nhất ${highest.toFixed(1)} kg · ${weeklyLogs.length} lần ghi. Từ lần đầu đến lần mới nhất: ${changeText}.`;
  },

  renderMeasurements(logs) {
    const container = document.getElementById('measurements-grid');
    if (!container) return;

    
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
    const profile = (window.storageService.getUserProfile ? window.storageService.getUserProfile() : window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {}));

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

      const profile = (window.storageService.getUserProfile ? window.storageService.getUserProfile() : window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {}));

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

      
      window.storageService.setUserProfile(profile);
      this.updateUserLabels(profile);

      ToastModule.show('Đã lưu thành công hồ sơ cá nhân và mục tiêu thể hình!');
    });
  },

  bindBackupEvents() {
    
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
        const result = window.storageService.resetUserData();
        closeResetModal();
        if (result.success) {
          this.loadProfile();
          ToastModule.show('Đã xóa toàn bộ dữ liệu và đặt lại hồ sơ của bạn!', 'flame');
        } else {
          ToastModule.show(result.message || 'Lỗi khi khôi phục cài đặt gốc.', 'flame');
        }
      });
    }
  }
};

window.SettingsModule = SettingsModule;

const HealthDashboardModule = {
  dom: {},
  currentRange: 'all',

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.updateDashboard();
  },

  cacheDOM() {
    this.dom = {
      
      greetingTitle: document.getElementById('health-greeting-title'),
      greetingSubtitle: document.getElementById('health-greeting-subtitle'),
      incompleteBanner: document.getElementById('health-incomplete-banner'),

      
      bmiVal: document.getElementById('hd-bmi-val'),
      bmiBadge: document.getElementById('hd-bmi-badge'),
      bmiStatusText: document.getElementById('hd-bmi-status-text'),

      weightVal: document.getElementById('hd-weight-val'),
      weightChangeBadge: document.getElementById('hd-weight-change-badge'),
      weightChangeText: document.getElementById('hd-weight-change-text'),

      heightVal: document.getElementById('hd-height-val'),
      targetVal: document.getElementById('hd-target-val'),
      targetBadge: document.getElementById('hd-target-badge'),
      targetDiffText: document.getElementById('hd-target-diff-text'),

      
      bmiCategoryBadge: document.getElementById('hd-bmi-category-badge'),
      bmiExplanation: document.getElementById('hd-bmi-explanation'),
      bmiNeedle: document.getElementById('hd-bmi-needle'),

      
      goalPercentBadge: document.getElementById('hd-goal-percent-badge'),
      goalInitialVal: document.getElementById('hd-goal-initial-val'),
      goalCurrentVal: document.getElementById('hd-goal-current-val'),
      goalTargetVal: document.getElementById('hd-goal-target-val'),
      goalBarFill: document.getElementById('hd-goal-bar-fill'),
      goalStatusDesc: document.getElementById('hd-goal-status-desc'),
      goalRemainingDiff: document.getElementById('hd-goal-remaining-diff'),

      
      waterVal: document.getElementById('hd-metric-water-val'),
      waterProgress: document.getElementById('hd-metric-water-progress'),
      caloriesVal: document.getElementById('hd-metric-calories-val'),
      caloriesProgress: document.getElementById('hd-metric-calories-progress'),

      
      recentTbody: document.getElementById('hd-recent-records-tbody'),
      recentEmpty: document.getElementById('hd-recent-empty'),

      timePills: document.querySelectorAll('.time-pill-btn')
    };
  },

  bindEvents() {
    
    if (this.dom.timePills && this.dom.timePills.length > 0) {
      this.dom.timePills.forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.timePills.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentRange = btn.getAttribute('data-range') || 'all';
          this.renderChart();
        });
      });
    }

    window.addEventListener('storage', (e) => {
      if (e.key === window.STORAGE_KEYS.WEIGHT_LOGS
        || e.key === window.STORAGE_KEYS.USER_PROFILE
        || e.key === window.STORAGE_KEYS.FOOD_LOGS
        || e.key === window.STORAGE_KEYS.DAILY_CALORIE_LOGS) {
        this.updateDashboard();
      }
    });
  },

  updateDashboard() {
    const profile = window.storageService ? (window.storageService.getUserProfile ? window.storageService.getUserProfile() : window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {})) : {};
    const weightLogs = window.storageService ? window.storageService.getWeightLogs() : [];
    const latestLog = window.storageService ? window.storageService.getLatestWeight() : null;

    const currentWeight = latestLog ? Number(latestLog.weight) : (Number(profile.currentWeight) || null);
    const height = Number(profile.height) || null;
    const targetWeight = Number(profile.targetWeight) || 70;

    
    if (this.dom.greetingTitle) {
      const userName = profile.name || 'Người dùng FitVN';
      this.dom.greetingTitle.textContent = `Xin chào, ${userName}!`;
    }

    
    const isIncomplete = !currentWeight || !height || height <= 0 || currentWeight <= 0;
    if (this.dom.incompleteBanner) {
      this.dom.incompleteBanner.style.display = isIncomplete ? 'flex' : 'none';
    }

    
    this.renderBMIAnalysis(currentWeight, height);

    
    this.renderWeightOverview(weightLogs, currentWeight);

    
    if (this.dom.heightVal) {
      this.dom.heightVal.innerHTML = height ? `${height} <span class="stat-unit">cm</span>` : `-- <span class="stat-unit">cm</span>`;
    }
    if (this.dom.targetVal) {
      this.dom.targetVal.innerHTML = `${targetWeight} <span class="stat-unit">kg</span>`;
    }
    if (this.dom.targetDiffText && currentWeight) {
      const diff = (currentWeight - targetWeight).toFixed(1);
      if (Math.abs(diff) <= 0.2) {
        this.dom.targetDiffText.textContent = '🎉 Đã đạt mục tiêu cân nặng!';
      } else if (diff > 0) {
        this.dom.targetDiffText.textContent = `Cần giảm ${diff} kg để tới đích`;
      } else {
        this.dom.targetDiffText.textContent = `Cần tăng ${Math.abs(diff)} kg để tới đích`;
      }
    }

    
    this.renderGoalProgress(profile, weightLogs, currentWeight, targetWeight);

    
    this.renderHealthMetrics(profile);

    
    this.renderChart();

    
    this.renderRecentRecords(weightLogs, height);
  },

  renderBMIAnalysis(weight, height) {
    if (!window.HealthCalculator) return;
    const bmiResult = window.HealthCalculator.calculateBMI(weight, height);

    if (!bmiResult || bmiResult.bmi === null) {
      if (this.dom.bmiVal) this.dom.bmiVal.innerHTML = `-- <span class="stat-unit">kg/m²</span>`;
      if (this.dom.bmiBadge) {
        this.dom.bmiBadge.className = 'glass-badge glass-badge-muted';
        this.dom.bmiBadge.textContent = 'Chưa đủ dữ liệu';
      }
      if (this.dom.bmiStatusText) this.dom.bmiStatusText.textContent = 'Cần cập nhật chiều cao và cân nặng';
      if (this.dom.bmiCategoryBadge) {
        this.dom.bmiCategoryBadge.className = 'glass-badge glass-badge-muted';
        this.dom.bmiCategoryBadge.textContent = 'Chưa xác định';
      }
      if (this.dom.bmiExplanation) this.dom.bmiExplanation.textContent = 'Vui lòng cập nhật đầy đủ chiều cao và cân nặng để hiển thị phân tích BMI.';
      if (this.dom.bmiNeedle) this.dom.bmiNeedle.style.display = 'none';
      return;
    }

    
    if (this.dom.bmiVal) this.dom.bmiVal.innerHTML = `${bmiResult.bmi} <span class="stat-unit">kg/m²</span>`;
    if (this.dom.bmiBadge) {
      this.dom.bmiBadge.className = `glass-badge ${bmiResult.colorClass}`;
      this.dom.bmiBadge.textContent = bmiResult.category;
    }
    if (this.dom.bmiStatusText) this.dom.bmiStatusText.textContent = bmiResult.category;
    if (this.dom.bmiCategoryBadge) {
      this.dom.bmiCategoryBadge.className = `glass-badge ${bmiResult.colorClass}`;
      this.dom.bmiCategoryBadge.textContent = `${bmiResult.category} (${bmiResult.bmi})`;
    }
    if (this.dom.bmiExplanation) this.dom.bmiExplanation.textContent = bmiResult.description;

    
    if (this.dom.bmiNeedle) {
      const minBmi = 15;
      const maxBmi = 35;
      const clampedBmi = Math.max(minBmi, Math.min(maxBmi, bmiResult.bmi));
      const percentage = ((clampedBmi - minBmi) / (maxBmi - minBmi)) * 100;
      this.dom.bmiNeedle.style.display = 'block';
      this.dom.bmiNeedle.style.left = `${percentage.toFixed(1)}%`;
      this.dom.bmiNeedle.title = `BMI: ${bmiResult.bmi} (${bmiResult.category})`;
    }
  },

  renderWeightOverview(weightLogs, currentWeight) {
    if (!currentWeight) {
      if (this.dom.weightVal) this.dom.weightVal.innerHTML = `-- <span class="stat-unit">kg</span>`;
      if (this.dom.weightChangeText) this.dom.weightChangeText.textContent = 'Chưa có dữ liệu';
      return;
    }

    if (this.dom.weightVal) {
      this.dom.weightVal.innerHTML = `${currentWeight} <span class="stat-unit">kg</span>`;
    }

    
    if (weightLogs && weightLogs.length >= 2) {
      const sorted = [...weightLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
      const latest = sorted[sorted.length - 1];
      const previous = sorted[sorted.length - 2];
      const diff = parseFloat((latest.weight - previous.weight).toFixed(1));

      if (this.dom.weightChangeBadge) {
        if (diff > 0) {
          this.dom.weightChangeBadge.className = 'glass-badge glass-badge-cyan';
          this.dom.weightChangeBadge.textContent = `+${diff} kg`;
        } else if (diff < 0) {
          this.dom.weightChangeBadge.className = 'glass-badge glass-badge-emerald';
          this.dom.weightChangeBadge.textContent = `${diff} kg`;
        } else {
          this.dom.weightChangeBadge.className = 'glass-badge glass-badge-muted';
          this.dom.weightChangeBadge.textContent = 'Không đổi';
        }
      }

      if (this.dom.weightChangeText) {
        const signText = diff > 0 ? `Tăng +${diff} kg` : diff < 0 ? `Giảm ${Math.abs(diff)} kg` : 'Giữ nguyên';
        this.dom.weightChangeText.textContent = `${signText} so với lần trước (${previous.date})`;
      }
    } else {
      if (this.dom.weightChangeBadge) {
        this.dom.weightChangeBadge.className = 'glass-badge glass-badge-emerald';
        this.dom.weightChangeBadge.textContent = 'Bản ghi đầu';
      }
      if (this.dom.weightChangeText) {
        this.dom.weightChangeText.textContent = 'Đây là bản ghi thể trọng đầu tiên';
      }
    }
  },

  renderGoalProgress(profile, weightLogs, currentWeight, targetWeight) {
    
    let initialWeight = currentWeight;
    if (weightLogs && weightLogs.length > 0) {
      const sorted = [...weightLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
      initialWeight = Number(sorted[0].weight);
    }

    if (this.dom.goalInitialVal) this.dom.goalInitialVal.textContent = initialWeight ? `${initialWeight} kg` : '-- kg';
    if (this.dom.goalCurrentVal) this.dom.goalCurrentVal.textContent = currentWeight ? `${currentWeight} kg` : '-- kg';
    if (this.dom.goalTargetVal) this.dom.goalTargetVal.textContent = targetWeight ? `${targetWeight} kg` : '-- kg';

    if (!window.HealthCalculator || !currentWeight || !initialWeight || !targetWeight) {
      if (this.dom.goalPercentBadge) this.dom.goalPercentBadge.textContent = '0%';
      if (this.dom.goalBarFill) this.dom.goalBarFill.style.width = '0%';
      if (this.dom.goalStatusDesc) this.dom.goalStatusDesc.textContent = 'Chưa đủ dữ liệu để tính tiến độ';
      return;
    }

    const progress = window.HealthCalculator.calculateGoalProgress(initialWeight, currentWeight, targetWeight);

    if (this.dom.goalPercentBadge) {
      this.dom.goalPercentBadge.textContent = `${progress.percent}%`;
      this.dom.goalPercentBadge.className = progress.isCompleted ? 'glass-badge glass-badge-emerald' : 'glass-badge glass-badge-cyan';
    }
    if (this.dom.goalBarFill) {
      this.dom.goalBarFill.style.width = `${progress.percent}%`;
    }
    if (this.dom.goalStatusDesc) {
      this.dom.goalStatusDesc.textContent = progress.statusText;
    }
    if (this.dom.goalRemainingDiff) {
      this.dom.goalRemainingDiff.textContent = progress.isCompleted ? 'Hoàn thành!' : `Còn ${progress.remainingDiff} kg`;
    }
  },

  renderHealthMetrics(profile) {
    
    const waterTarget = Number(profile.waterTarget) || 3000;
    const currentWater = window.storageService ? window.storageService.getWater() : 0;
    const waterPercent = Math.min(100, Math.round((currentWater / waterTarget) * 100));

    if (this.dom.waterVal) {
      this.dom.waterVal.textContent = `${currentWater.toLocaleString('vi-VN')} / ${waterTarget.toLocaleString('vi-VN')} ml (${waterPercent}%)`;
    }
    if (this.dom.waterProgress) {
      this.dom.waterProgress.style.width = `${waterPercent}%`;
    }

    
    const todayDate = window.getTodayDateString ? window.getTodayDateString() : new Date().toISOString().split('T')[0];
    const dayTotals = window.storageService ? window.storageService.calculateDayTotals(todayDate) : { calories: 0 };
    const baseTarget = Number(profile.targetCalories) || 2600;
    if (window.storageService && dayTotals.count > 0) {
      window.storageService.saveDayLog(todayDate, dayTotals.calories, baseTarget);
    }
    const calorieTarget = window.storageService
      ? window.storageService.calculateDailyTarget(todayDate, null, baseTarget)
      : baseTarget;
    const consumedCalories = Math.round(dayTotals.calories);
    const caloriePercent = Math.min(100, Math.round((consumedCalories / calorieTarget) * 100));

    if (this.dom.caloriesVal) {
      this.dom.caloriesVal.textContent = `${consumedCalories.toLocaleString('vi-VN')} / ${calorieTarget.toLocaleString('vi-VN')} kcal (${caloriePercent}%)`;
    }
    if (this.dom.caloriesProgress) {
      this.dom.caloriesProgress.style.width = `${caloriePercent}%`;
    }
  },

  renderChart() {
    if (!window.HealthDashboardChart) return;
    const profile = window.storageService ? (window.storageService.getUserProfile ? window.storageService.getUserProfile() : window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {})) : {};
    const weightLogs = window.storageService ? window.storageService.getWeightLogs() : [];
    const targetWeight = Number(profile.targetWeight) || null;

    HealthDashboardChart.init('health-weight-canvas', 'health-weight-tooltip', targetWeight);
    HealthDashboardChart.render(weightLogs, this.currentRange);
  },

  renderRecentRecords(weightLogs, height) {
    if (!this.dom.recentTbody) return;

    if (!weightLogs || weightLogs.length === 0) {
      this.dom.recentTbody.innerHTML = '';
      if (this.dom.recentEmpty) this.dom.recentEmpty.style.display = 'block';
      return;
    }

    if (this.dom.recentEmpty) this.dom.recentEmpty.style.display = 'none';

    
    const sortedDesc = [...weightLogs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

    const rowsHtml = sortedDesc.map((entry) => {
      let bmiBadgeHtml = '<span class="glass-badge glass-badge-muted">--</span>';
      if (height && height > 0 && window.HealthCalculator) {
        const bmiRes = window.HealthCalculator.calculateBMI(entry.weight, height);
        if (bmiRes && bmiRes.bmi) {
          bmiBadgeHtml = `<span class="glass-badge ${bmiRes.colorClass}">${bmiRes.bmi} (${bmiRes.category})</span>`;
        }
      }

      const noteText = entry.note ? entry.note : '<span style="color: var(--color-text-muted); font-style: italic;">Không có ghi chú</span>';

      return `
        <tr>
          <td style="font-weight: 600; color: var(--color-primary, #173F35); white-space: nowrap;">
            📅 ${entry.date}
          </td>
          <td style="font-weight: 700;">
            ${Number(entry.weight).toFixed(1)} kg
          </td>
          <td>
            ${bmiBadgeHtml}
          </td>
          <td style="color: var(--color-text-secondary, #63756B); max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${noteText}
          </td>
        </tr>
      `;
    });

    this.dom.recentTbody.innerHTML = rowsHtml.join('');
  }
};

window.HealthDashboardModule = HealthDashboardModule;

const ProgressChartsModule = {
  dom: {},
  currentMetric: 'weight', 
  currentRange: '90d',     
  sortAscending: false,    
  currentPage: 1,
  pageSize: 8,
  cachedAllEntries: [],
  cachedFilteredEntries: [],
  previousPeriodEntries: [],

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.loadDataAndRender();
  },

  cacheDOM() {
    this.dom = {
      
      btnMetricWeight: document.getElementById('btn-metric-weight'),
      btnMetricBmi: document.getElementById('btn-metric-bmi'),
      metricButtons: document.querySelectorAll('.metric-switch-btn'),

      
      rangeButtons: document.querySelectorAll('.progress-pill-btn'),
      rangeDatesText: document.getElementById('pc-range-dates-text'),

      
      startVal: document.getElementById('pc-start-val'),
      unitStart: document.getElementById('pc-unit-start'),
      startSub: document.getElementById('pc-start-sub'),
      startDateBadge: document.getElementById('pc-start-date-badge'),

      endVal: document.getElementById('pc-end-val'),
      unitEnd: document.getElementById('pc-unit-end'),
      endSub: document.getElementById('pc-end-sub'),
      endDateBadge: document.getElementById('pc-end-date-badge'),

      diffVal: document.getElementById('pc-diff-val'),
      unitDiff: document.getElementById('pc-unit-diff'),
      diffBadge: document.getElementById('pc-diff-badge'),
      diffSub: document.getElementById('pc-diff-sub'),

      percentVal: document.getElementById('pc-percent-val'),
      percentBadge: document.getElementById('pc-percent-badge'),
      percentSub: document.getElementById('pc-percent-sub'),

      trendVal: document.getElementById('pc-trend-val'),
      trendBadge: document.getElementById('pc-trend-badge'),
      trendSub: document.getElementById('pc-trend-sub'),

      
      chartTitle: document.getElementById('pc-chart-title'),
      chartDesc: document.getElementById('pc-chart-desc'),
      legendTargetItem: document.getElementById('pc-legend-target-item'),

      
      compCurrentVal: document.getElementById('pc-comp-current-val'),
      compPrevVal: document.getElementById('pc-comp-prev-val'),
      compResultText: document.getElementById('pc-comparison-result-text'),
      compBadge: document.getElementById('pc-comparison-badge'),

      
      goalBadge: document.getElementById('pc-goal-badge'),
      goalInitText: document.getElementById('pc-goal-init-text'),
      goalCurrText: document.getElementById('pc-goal-curr-text'),
      goalTargetText: document.getElementById('pc-goal-target-text'),
      goalFillBar: document.getElementById('pc-goal-fill-bar'),
      goalStatusText: document.getElementById('pc-goal-status-text'),
      goalDiffText: document.getElementById('pc-goal-diff-text'),

      
      insightsText: document.getElementById('pc-insights-text'),

      
      tableTbody: document.getElementById('pc-table-tbody'),
      tableEmpty: document.getElementById('pc-table-empty'),
      btnToggleSort: document.getElementById('btn-toggle-sort'),
      labelSortOrder: document.getElementById('label-sort-order'),
      iconSortOrder: document.getElementById('icon-sort-order'),
      pageInfo: document.getElementById('pc-page-info'),
      btnPagePrev: document.getElementById('btn-page-prev'),
      btnPageNext: document.getElementById('btn-page-next')
    };
  },

  bindEvents() {
    
    if (this.dom.metricButtons) {
      this.dom.metricButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.metricButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentMetric = btn.getAttribute('data-metric') || 'weight';
          this.renderMetricChanges();
        });
      });
    }

    
    if (this.dom.rangeButtons) {
      this.dom.rangeButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          this.dom.rangeButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentRange = btn.getAttribute('data-range') || '90d';
          this.currentPage = 1;
          this.filterDataAndRender();
        });
      });
    }

    
    if (this.dom.btnToggleSort) {
      this.dom.btnToggleSort.addEventListener('click', () => {
        this.sortAscending = !this.sortAscending;
        if (this.dom.labelSortOrder) {
          this.dom.labelSortOrder.textContent = this.sortAscending ? 'Cũ nhất trước' : 'Mới nhất trước';
        }
        if (this.dom.iconSortOrder) {
          this.dom.iconSortOrder.textContent = this.sortAscending ? '↑' : '↓';
        }
        this.currentPage = 1;
        this.renderTable();
      });
    }

    
    if (this.dom.btnPagePrev) {
      this.dom.btnPagePrev.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderTable();
        }
      });
    }

    if (this.dom.btnPageNext) {
      this.dom.btnPageNext.addEventListener('click', () => {
        const totalPages = Math.ceil(this.cachedFilteredEntries.length / this.pageSize) || 1;
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderTable();
        }
      });
    }
  },

  loadDataAndRender() {
    const rawLogs = window.storageService ? window.storageService.getWeightLogs() : [];
    const profile = window.storageService ? (window.storageService.getUserProfile ? window.storageService.getUserProfile() : window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {})) : {};
    const height = Number(profile.height) || 175;

    
    this.cachedAllEntries = rawLogs.map((entry) => {
      let bmiVal = null;
      if (height > 0 && window.HealthCalculator) {
        const calcRes = window.HealthCalculator.calculateBMI(entry.weight, height);
        bmiVal = calcRes.bmi;
      }
      return {
        ...entry,
        bmi: bmiVal
      };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    
    if (window.ProgressChartEngine) {
      ProgressChartEngine.init('progress-chart-canvas', 'progress-chart-tooltip');
      ProgressChartEngine.setTargetWeight(profile.targetWeight || null);
    }

    this.filterDataAndRender();
  },

  filterDataAndRender() {
    const all = this.cachedAllEntries;
    if (all.length === 0) {
      this.cachedFilteredEntries = [];
      this.previousPeriodEntries = [];
      this.renderEmptyState();
      return;
    }

    
    const now = new Date();
    let daysCutoff = null;
    if (this.currentRange === '7d') daysCutoff = 7;
    else if (this.currentRange === '30d') daysCutoff = 30;
    else if (this.currentRange === '90d') daysCutoff = 90;
    else if (this.currentRange === '180d') daysCutoff = 180;
    else if (this.currentRange === '365d') daysCutoff = 365;

    if (daysCutoff === null) {
      
      this.cachedFilteredEntries = [...all];
      this.previousPeriodEntries = [];
    } else {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysCutoff);

      const previousCutoffDate = new Date();
      previousCutoffDate.setDate(previousCutoffDate.getDate() - (daysCutoff * 2));

      this.cachedFilteredEntries = all.filter(e => new Date(e.date) >= cutoffDate);
      this.previousPeriodEntries = all.filter(e => {
        const d = new Date(e.date);
        return d >= previousCutoffDate && d < cutoffDate;
      });
    }

    this.renderActiveDateRange();
    this.renderSummaryCards();
    this.renderChart();
    this.renderPeriodComparison();
    this.renderGoalProgress();
    this.renderInsights();
    this.renderTable();
  },

  renderMetricChanges() {
    const isWeight = this.currentMetric === 'weight';
    if (this.dom.chartTitle) {
      this.dom.chartTitle.textContent = isWeight ? 'Biểu Đồ Xu Hướng Cân Nặng' : 'Biểu Đồ Xu Hướng Chỉ Số BMI';
    }
    if (this.dom.chartDesc) {
      this.dom.chartDesc.textContent = isWeight 
        ? 'Biểu diễn các điểm dữ liệu lịch sử và đường mục tiêu tham chiếu' 
        : 'Theo dõi sự thay đổi BMI theo thời gian kèm các ngưỡng tham khảo y tế (18.5, 25.0)';
    }
    if (this.dom.legendTargetItem) {
      this.dom.legendTargetItem.style.display = isWeight ? 'inline-flex' : 'none';
    }

    this.renderSummaryCards();
    this.renderChart();
    this.renderPeriodComparison();
    this.renderInsights();
    this.renderTable();
  },

  renderActiveDateRange() {
    if (!this.dom.rangeDatesText) return;

    if (this.cachedFilteredEntries.length === 0) {
      this.dom.rangeDatesText.textContent = 'Không có dữ liệu trong khoảng này';
      return;
    }

    const first = this.cachedFilteredEntries[0].date;
    const last = this.cachedFilteredEntries[this.cachedFilteredEntries.length - 1].date;

    const fmt = (dStr) => {
      const p = dStr.split('-');
      return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dStr;
    };

    if (first === last) {
      this.dom.rangeDatesText.textContent = `Ngày ${fmt(first)} (1 bản ghi)`;
    } else {
      this.dom.rangeDatesText.textContent = `Từ ${fmt(first)} đến ${fmt(last)} (${this.cachedFilteredEntries.length} bản ghi)`;
    }
  },

  renderSummaryCards() {
    const isWeight = this.currentMetric === 'weight';
    const unit = isWeight ? 'kg' : 'kg/m²';

    if (this.dom.unitStart) this.dom.unitStart.textContent = unit;
    if (this.dom.unitEnd) this.dom.unitEnd.textContent = unit;
    if (this.dom.unitDiff) this.dom.unitDiff.textContent = unit;

    if (!window.HealthCalculator) return;
    const stats = window.HealthCalculator.calculatePeriodStats(this.cachedFilteredEntries, this.currentMetric);

    if (!stats.hasData || stats.startVal === null) {
      if (this.dom.startVal) this.dom.startVal.innerHTML = `-- <span class="stat-unit">${unit}</span>`;
      if (this.dom.endVal) this.dom.endVal.innerHTML = `-- <span class="stat-unit">${unit}</span>`;
      if (this.dom.diffVal) this.dom.diffVal.innerHTML = `-- <span class="stat-unit">${unit}</span>`;
      if (this.dom.percentVal) this.dom.percentVal.innerHTML = `-- <span class="stat-unit">%</span>`;
      if (this.dom.trendVal) this.dom.trendVal.textContent = 'Chưa có dữ liệu';
      return;
    }

    
    if (this.dom.startVal) {
      this.dom.startVal.innerHTML = `${Number(stats.startVal).toFixed(1)} <span class="stat-unit">${unit}</span>`;
    }
    if (this.dom.startDateBadge && this.cachedFilteredEntries.length > 0) {
      this.dom.startDateBadge.textContent = this.cachedFilteredEntries[0].date;
    }

    
    if (this.dom.endVal) {
      this.dom.endVal.innerHTML = `${Number(stats.endVal).toFixed(1)} <span class="stat-unit">${unit}</span>`;
    }
    if (this.dom.endDateBadge && this.cachedFilteredEntries.length > 0) {
      this.dom.endDateBadge.textContent = this.cachedFilteredEntries[this.cachedFilteredEntries.length - 1].date;
    }

    
    if (this.dom.diffVal) {
      const sign = stats.diff > 0 ? `+${stats.diff}` : `${stats.diff}`;
      this.dom.diffVal.innerHTML = `${sign} <span class="stat-unit">${unit}</span>`;
    }
    if (this.dom.diffBadge) {
      this.dom.diffBadge.className = `glass-badge ${stats.badgeClass}`;
      this.dom.diffBadge.textContent = stats.diff > 0 ? 'Tăng' : stats.diff < 0 ? 'Giảm' : 'Ổn định';
    }

    
    if (this.dom.percentVal) {
      const sign = stats.percentChange > 0 ? `+${stats.percentChange}` : `${stats.percentChange}`;
      this.dom.percentVal.innerHTML = `${sign} <span class="stat-unit">%</span>`;
    }
    if (this.dom.percentBadge) {
      this.dom.percentBadge.className = `glass-badge ${stats.badgeClass}`;
      this.dom.percentBadge.textContent = `${Math.abs(stats.percentChange)}%`;
    }

    
    if (this.dom.trendVal) {
      this.dom.trendVal.textContent = stats.trend === 'increasing' ? 'Đang Tăng' : stats.trend === 'decreasing' ? 'Đang Giảm' : 'Duy Trì';
      this.dom.trendVal.style.color = stats.trend === 'increasing' ? '#173F35' : stats.trend === 'decreasing' ? '#287653' : '#63756B';
    }
    if (this.dom.trendBadge) {
      this.dom.trendBadge.className = `glass-badge ${stats.badgeClass}`;
      this.dom.trendBadge.textContent = stats.trendLabel;
    }
  },

  renderChart() {
    if (!window.ProgressChartEngine) return;
    ProgressChartEngine.render(this.cachedFilteredEntries, this.currentMetric);
  },

  renderPeriodComparison() {
    if (!window.HealthCalculator) return;
    const isWeight = this.currentMetric === 'weight';
    const unit = isWeight ? 'kg' : 'BMI';

    const comp = window.HealthCalculator.comparePeriods(
      this.cachedFilteredEntries,
      this.previousPeriodEntries,
      this.currentMetric
    );

    if (!comp.hasComparison) {
      if (this.dom.compCurrentVal) this.dom.compCurrentVal.textContent = '--';
      if (this.dom.compPrevVal) this.dom.compPrevVal.textContent = '--';
      if (this.dom.compResultText) {
        this.dom.compResultText.textContent = comp.reason;
        this.dom.compResultText.style.color = 'var(--color-text-muted, #829087)';
      }
      if (this.dom.compBadge) {
        this.dom.compBadge.className = 'glass-badge glass-badge-muted';
        this.dom.compBadge.textContent = 'Chưa đủ dữ liệu';
      }
      return;
    }

    if (this.dom.compCurrentVal) {
      this.dom.compCurrentVal.textContent = `${comp.currentAvg} ${unit}`;
    }
    if (this.dom.compPrevVal) {
      this.dom.compPrevVal.textContent = `${comp.previousAvg} ${unit}`;
    }
    if (this.dom.compResultText) {
      const sign = comp.diff > 0 ? `+${comp.diff}` : `${comp.diff}`;
      this.dom.compResultText.textContent = `Chênh lệch: ${sign} ${unit} (${comp.percentChange > 0 ? '+' : ''}${comp.percentChange}%). ${comp.trendDescription}.`;
      this.dom.compResultText.style.color = 'var(--color-primary, #173F35)';
    }
    if (this.dom.compBadge) {
      this.dom.compBadge.className = 'glass-badge glass-badge-emerald';
      this.dom.compBadge.textContent = `${comp.diff > 0 ? '+' : ''}${comp.diff} ${unit}`;
    }
  },

  renderGoalProgress() {
    const profile = window.storageService ? (window.storageService.getUserProfile ? window.storageService.getUserProfile() : window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {})) : {};
    const targetWeight = Number(profile.targetWeight) || null;
    const all = this.cachedAllEntries;

    if (!targetWeight || all.length === 0 || !window.HealthCalculator) {
      if (this.dom.goalBadge) {
        this.dom.goalBadge.className = 'glass-badge glass-badge-muted';
        this.dom.goalBadge.textContent = 'Chưa đặt mục tiêu';
      }
      if (this.dom.goalStatusText) {
        this.dom.goalStatusText.textContent = 'Bạn chưa thiết lập cân nặng mục tiêu trong Cài Đặt.';
      }
      return;
    }

    const initialWeight = Number(all[0].weight);
    const currentWeight = Number(all[all.length - 1].weight);

    if (this.dom.goalInitText) this.dom.goalInitText.textContent = `${initialWeight} kg`;
    if (this.dom.goalCurrText) this.dom.goalCurrText.textContent = `${currentWeight} kg`;
    if (this.dom.goalTargetText) this.dom.goalTargetText.textContent = `${targetWeight} kg`;

    const goalRes = window.HealthCalculator.calculateGoalProgress(initialWeight, currentWeight, targetWeight);

    if (this.dom.goalBadge) {
      this.dom.goalBadge.className = goalRes.isCompleted ? 'glass-badge glass-badge-emerald' : 'glass-badge glass-badge-cyan';
      this.dom.goalBadge.textContent = goalRes.isCompleted ? 'Đã đạt mục tiêu' : `Đạt ${goalRes.percent}%`;
    }
    if (this.dom.goalFillBar) {
      this.dom.goalFillBar.style.width = `${goalRes.percent}%`;
    }
    if (this.dom.goalStatusText) {
      this.dom.goalStatusText.textContent = goalRes.statusText;
    }
    if (this.dom.goalDiffText) {
      this.dom.goalDiffText.textContent = goalRes.isCompleted ? 'Hoàn thành!' : `Cách đích ${goalRes.remainingDiff} kg`;
    }
  },

  renderInsights() {
    if (!this.dom.insightsText) return;

    if (this.cachedFilteredEntries.length === 0) {
      this.dom.insightsText.textContent = 'Chưa có đủ dữ liệu trong khoảng thời gian này để đưa ra nhận xét xu hướng.';
      return;
    }

    if (this.cachedFilteredEntries.length === 1) {
      this.dom.insightsText.textContent = 'Hệ thống mới ghi nhận 1 mốc dữ liệu trong khoảng thời gian này. Hãy tiếp tục ghi nhận đều đặn để xây dựng biểu đồ tiến trình hoàn chỉnh.';
      return;
    }

    const isWeight = this.currentMetric === 'weight';
    const stats = window.HealthCalculator.calculatePeriodStats(this.cachedFilteredEntries, this.currentMetric);
    const count = this.cachedFilteredEntries.length;

    let insightStr = '';
    if (isWeight) {
      insightStr = `Trong chu kỳ đã chọn với ${count} lần ghi nhận, cân nặng của bạn có xu hướng ${stats.trend === 'increasing' ? 'tăng' : stats.trend === 'decreasing' ? 'giảm' : 'ổn định'} (${stats.diff > 0 ? '+' : ''}${stats.diff} kg, tương đương ${stats.percentChange}%).`;
    } else {
      insightStr = `Chỉ số khối cơ thể (BMI) của bạn dịch chuyển từ ${Number(stats.startVal).toFixed(1)} đến ${Number(stats.endVal).toFixed(1)} (${stats.diff > 0 ? '+' : ''}${stats.diff} điểm).`;
    }

    insightStr += ` Lưu ý: Xu hướng tăng hay giảm cần được đối chiếu với mục tiêu cụ thể của bạn (Tăng cơ Lean Bulk hay Giảm mỡ Cut), không nên đánh giá chỉ số đơn thuần là tốt hay xấu khi chưa xét tổng thể.`;

    this.dom.insightsText.textContent = insightStr;
  },

  renderTable() {
    if (!this.dom.tableTbody) return;

    const entries = [...this.cachedFilteredEntries];
    if (entries.length === 0) {
      this.dom.tableTbody.innerHTML = '';
      if (this.dom.tableEmpty) this.dom.tableEmpty.style.display = 'block';
      if (this.dom.pageInfo) this.dom.pageInfo.textContent = 'Trang 0 / 0';
      if (this.dom.btnPagePrev) this.dom.btnPagePrev.disabled = true;
      if (this.dom.btnPageNext) this.dom.btnPageNext.disabled = true;
      return;
    }

    if (this.dom.tableEmpty) this.dom.tableEmpty.style.display = 'none';

    
    entries.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return this.sortAscending ? dateA - dateB : dateB - dateA;
    });

    
    const totalPages = Math.ceil(entries.length / this.pageSize) || 1;
    this.currentPage = Math.min(this.currentPage, totalPages);
    const startIdx = (this.currentPage - 1) * this.pageSize;
    const pageItems = entries.slice(startIdx, startIdx + this.pageSize);

    
    const rowsHtml = pageItems.map((item, idx) => {
      
      const allSortedAsc = [...this.cachedAllEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
      const masterIdx = allSortedAsc.findIndex(e => e.id === item.id || (e.date === item.date && e.weight === item.weight));

      let diffHtml = '<span style="color: var(--color-text-muted);">--</span>';
      if (masterIdx > 0) {
        const prevItem = allSortedAsc[masterIdx - 1];
        const d = parseFloat((item.weight - prevItem.weight).toFixed(1));
        if (d > 0) {
          diffHtml = `<span style="color: #326B82; font-weight: 600;">+${d} kg</span>`;
        } else if (d < 0) {
          diffHtml = `<span style="color: #287653; font-weight: 600;">${d} kg</span>`;
        } else {
          diffHtml = `<span style="color: var(--color-text-muted);">0.0 kg</span>`;
        }
      }

      const bmiDisplay = item.bmi ? `${Number(item.bmi).toFixed(1)} kg/m²` : '--';
      const noteDisplay = item.note ? item.note : '<span style="color: var(--color-text-muted); font-style: italic;">Không có</span>';

      return `
        <tr>
          <td style="font-weight: 600; color: var(--color-primary, #173F35); white-space: nowrap;">
            📅 ${item.date}
          </td>
          <td style="font-weight: 700;">
            ${Number(item.weight).toFixed(1)} kg
          </td>
          <td style="font-weight: 600;">
            ${bmiDisplay}
          </td>
          <td>
            ${diffHtml}
          </td>
          <td style="color: var(--color-text-secondary, #63756B); max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${noteDisplay}
          </td>
        </tr>
      `;
    });

    this.dom.tableTbody.innerHTML = rowsHtml.join('');

    
    if (this.dom.pageInfo) {
      this.dom.pageInfo.textContent = `Trang ${this.currentPage} / ${totalPages} (${entries.length} bản ghi)`;
    }
    if (this.dom.btnPagePrev) {
      this.dom.btnPagePrev.disabled = this.currentPage <= 1;
    }
    if (this.dom.btnPageNext) {
      this.dom.btnPageNext.disabled = this.currentPage >= totalPages;
    }
  },

  renderEmptyState() {
    this.renderSummaryCards();
    this.renderChart();
    this.renderPeriodComparison();
    this.renderGoalProgress();
    this.renderInsights();
    this.renderTable();
  }
};

window.ProgressChartsModule = ProgressChartsModule;

const WorkoutJournalModule = {
  dom: {},
  currentRange: '30d', 
  currentType: 'all',
  currentIntensity: 'all',
  searchQuery: '',
  currentPage: 1,
  pageSize: 8,
  cachedAllWorkouts: [],
  cachedFilteredWorkouts: [],
  selectedWorkout: null,
  pendingDeleteId: null,

  
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
      
      statSessions: document.getElementById('wo-stat-sessions'),
      statDuration: document.getElementById('wo-stat-duration'),
      statAvg: document.getElementById('wo-stat-avg'),
      statDays: document.getElementById('wo-stat-days'),
      statDistanceExtra: document.getElementById('wo-stat-distance-extra'),
      rangeDatesText: document.getElementById('wo-range-dates-text'),

      
      rangeButtons: document.querySelectorAll('[data-workout-range]'),

      
      searchInput: document.getElementById('wo-search-input'),
      filterType: document.getElementById('wo-filter-type'),
      filterIntensity: document.getElementById('wo-filter-intensity'),
      btnResetFilters: document.getElementById('btn-reset-filters'),

      
      listContainer: document.getElementById('wo-list-container'),
      emptyState: document.getElementById('wo-empty-state'),
      emptyFilterState: document.getElementById('wo-empty-filter-state'),
      btnClearEmptyFilter: document.getElementById('btn-clear-empty-filter'),

      
      pageInfo: document.getElementById('wo-page-info'),
      btnPagePrev: document.getElementById('wo-btn-page-prev'),
      btnPageNext: document.getElementById('wo-btn-page-next'),

      
      btnOpenCreate: document.getElementById('btn-open-create-workout'),
      modalForm: document.getElementById('wo-modal-form'),
      modalFormClose: document.getElementById('wo-modal-form-close'),
      modalFormCancel: document.getElementById('wo-modal-form-cancel'),
      modalFormTitle: document.getElementById('wo-modal-form-title'),
      formEntry: document.getElementById('form-workout-entry'),
      btnSubmitForm: document.getElementById('wo-btn-submit-form'),

      
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

      
      modalDetail: document.getElementById('wo-modal-detail'),
      modalDetailClose: document.getElementById('wo-modal-detail-close'),
      detailBtnClose: document.getElementById('wo-detail-btn-close'),
      detailBtnEdit: document.getElementById('wo-detail-btn-edit'),
      detailBtnDelete: document.getElementById('wo-detail-btn-delete'),
      detailTitle: document.getElementById('wo-detail-title'),
      detailSubtitle: document.getElementById('wo-detail-subtitle'),
      detailContent: document.getElementById('wo-detail-content'),

      
      modalDelete: document.getElementById('wo-modal-confirm-delete'),
      btnCancelDelete: document.getElementById('wo-btn-cancel-delete'),
      btnConfirmDelete: document.getElementById('wo-btn-confirm-delete'),
      deleteMsg: document.getElementById('wo-confirm-delete-msg')
    };
  },

  bindEvents() {
    
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

    
    if (this.dom.btnOpenCreate) {
      this.dom.btnOpenCreate.addEventListener('click', () => {
        this.openCreateForm();
      });
    }

    
    if (this.dom.modalFormClose) this.dom.modalFormClose.addEventListener('click', () => this.closeFormModal());
    if (this.dom.modalFormCancel) this.dom.modalFormCancel.addEventListener('click', () => this.closeFormModal());
    if (this.dom.modalForm) {
      this.dom.modalForm.addEventListener('click', (e) => {
        if (e.target === this.dom.modalForm) this.closeFormModal();
      });
    }

    
    if (this.dom.formEntry) {
      this.dom.formEntry.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }

    
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

    
    if (this.currentType !== 'all') {
      filtered = filtered.filter(item => item.activityType === this.currentType);
    }

    
    if (this.currentIntensity !== 'all') {
      filtered = filtered.filter(item => item.intensity === this.currentIntensity);
    }

    
    if (this.searchQuery) {
      filtered = filtered.filter(item => {
        const t = (item.title || '').toLowerCase();
        const n = (item.notes || '').toLowerCase();
        return t.includes(this.searchQuery) || n.includes(this.searchQuery);
      });
    }

    
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

    
    const totalPages = Math.ceil(list.length / this.pageSize) || 1;
    this.currentPage = Math.min(this.currentPage, totalPages);
    const startIdx = (this.currentPage - 1) * this.pageSize;
    const pageItems = list.slice(startIdx, startIdx + this.pageSize);

    const itemsHtml = pageItems.map(item => this.createWorkoutCardHtml(item));
    container.innerHTML = itemsHtml.join('');

    
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

    
    const p = (item.workoutDate || '').split('-');
    const dateFormatted = p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : item.workoutDate;

    
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
    this.dom.modalForm.classList.add('active');
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
    this.dom.modalForm.classList.add('active');
  },

  closeFormModal() {
    if (this.dom.modalForm) {
      this.dom.modalForm.classList.remove('active');
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

    
    if (!title) {
      this.dom.inputTitle.classList.add('is-invalid');
      isValid = false;
    }

    
    if (!workoutDate) {
      this.dom.inputDate.classList.add('is-invalid');
      isValid = false;
    }

    
    if (isNaN(duration) || duration <= 0 || duration > 720) {
      this.dom.inputDuration.classList.add('is-invalid');
      isValid = false;
    }

    
    if (startTime && endTime) {
      if (endTime <= startTime) {
        this.dom.inputEndTime.classList.add('is-invalid');
        isValid = false;
      }
    }

    
    let distanceKm = null;
    if (distanceVal !== '') {
      distanceKm = parseFloat(distanceVal);
      if (isNaN(distanceKm) || distanceKm < 0) {
        this.dom.inputDistance.classList.add('is-invalid');
        isValid = false;
      }
    }

    
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

    
    if (this.dom.btnSubmitForm) this.dom.btnSubmitForm.disabled = true;

    try {
      if (id) {
        
        window.storageService.updateWorkoutLog(id, workoutData);
        ToastModule.show(`Đã cập nhật buổi tập "${title}"!`, 'emerald');
      } else {
        
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
    this.dom.modalDetail.classList.add('active');
  },

  closeDetailModal() {
    if (this.dom.modalDetail) {
      this.dom.modalDetail.classList.remove('active');
      this.dom.modalDetail.style.display = 'none';
    }
  },

  
  promptDelete(id, title) {
    this.pendingDeleteId = id;
    if (this.dom.deleteMsg) {
      this.dom.deleteMsg.innerHTML = `Bạn có chắc chắn muốn xóa buổi tập <strong>"${title}"</strong>? Thao tác này không thể hoàn tác.`;
    }
    if (this.dom.modalDelete) {
      this.dom.modalDelete.style.display = 'flex';
      this.dom.modalDelete.classList.add('active');
    }
  },

  closeDeleteModal() {
    this.pendingDeleteId = null;
    if (this.dom.modalDelete) {
      this.dom.modalDelete.classList.remove('active');
      this.dom.modalDelete.style.display = 'none';
    }
  }
};

window.WorkoutJournalModule = WorkoutJournalModule;

const HealthReportsModule = {
  dom: {},
  currentRange: '30d',      
  currentReportType: 'all', 
  customStartDate: null,
  customEndDate: null,
  currentPage: 1,
  pageSize: 8,

  cachedWeights: [],
  cachedWorkouts: [],
  cachedProfile: {},

  filteredWeights: [],
  filteredWorkouts: [],
  prevWeights: [],
  prevWorkouts: [],
  dailyMergedRows: [],

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.loadDataAndRender();
  },

  cacheDOM() {
    this.dom = {
      
      btnRefresh: document.getElementById('btn-refresh-report'),
      btnExportCsv: document.getElementById('btn-export-csv'),
      btnPrint: document.getElementById('btn-print-report'),

      
      typePills: document.querySelectorAll('[data-report-type]'),
      rangePills: document.querySelectorAll('[data-report-range]'),
      customRangeRow: document.getElementById('rep-custom-range-row'),
      inputStartDate: document.getElementById('rep-start-date'),
      inputEndDate: document.getElementById('rep-end-date'),
      btnApplyCustomDates: document.getElementById('btn-apply-custom-dates'),
      rangeDatesText: document.getElementById('rep-range-dates-text'),
      printMetaText: document.getElementById('print-meta-text'),

      
      secWeightReport: document.getElementById('sec-weight-report'),
      secWorkoutReport: document.getElementById('sec-workout-report'),

      
      kpiStartWeight: document.getElementById('kpi-start-weight'),
      kpiEndWeight: document.getElementById('kpi-end-weight'),
      kpiWeightDiff: document.getElementById('kpi-weight-diff'),
      kpiWeightDiffBadge: document.getElementById('kpi-weight-diff-badge'),
      kpiWeightDiffPercent: document.getElementById('kpi-weight-diff-percent'),
      kpiEndBmi: document.getElementById('kpi-end-bmi'),
      kpiBmiBadge: document.getElementById('kpi-bmi-badge'),
      kpiBmiCategory: document.getElementById('kpi-bmi-category'),
      kpiWorkoutSessions: document.getElementById('kpi-workout-sessions'),
      kpiWorkoutDuration: document.getElementById('kpi-workout-duration'),
      kpiWorkoutAvg: document.getElementById('kpi-workout-avg'),
      kpiWorkoutDays: document.getElementById('kpi-workout-days'),

      
      repWorkoutPopularBadge: document.getElementById('rep-workout-popular-badge'),
      repWoPopularType: document.getElementById('rep-wo-popular-type'),
      repWoAvgDuration: document.getElementById('rep-wo-avg-duration'),
      repWoTotalDist: document.getElementById('rep-wo-total-dist'),

      
      compCurrWeight: document.getElementById('comp-curr-weight'),
      compPrevWeight: document.getElementById('comp-prev-weight'),
      compWeightDiffText: document.getElementById('comp-weight-diff-text'),
      compCurrSessions: document.getElementById('comp-curr-sessions'),
      compPrevSessions: document.getElementById('comp-prev-sessions'),
      compSessionsDiffText: document.getElementById('comp-sessions-diff-text'),
      compBadge: document.getElementById('rep-comp-badge'),

      
      insightsContent: document.getElementById('rep-insights-content'),

      
      tableTbody: document.getElementById('rep-table-tbody'),
      tableEmpty: document.getElementById('rep-table-empty'),
      pageInfo: document.getElementById('rep-page-info'),
      btnPagePrev: document.getElementById('rep-btn-page-prev'),
      btnPageNext: document.getElementById('rep-btn-page-next')
    };
  },

  bindEvents() {
    
    if (this.dom.typePills) {
      this.dom.typePills.forEach(btn => {
        btn.addEventListener('click', () => {
          this.dom.typePills.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentReportType = btn.getAttribute('data-report-type') || 'all';
          this.toggleSectionsByType();
        });
      });
    }

    
    if (this.dom.rangePills) {
      this.dom.rangePills.forEach(btn => {
        btn.addEventListener('click', () => {
          this.dom.rangePills.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const rangeKey = btn.getAttribute('data-report-range') || '30d';
          this.currentRange = rangeKey;

          if (rangeKey === 'custom') {
            if (this.dom.customRangeRow) this.dom.customRangeRow.style.display = 'flex';
          } else {
            if (this.dom.customRangeRow) this.dom.customRangeRow.style.display = 'none';
            this.currentPage = 1;
            this.filterAndRender();
          }
        });
      });
    }

    
    if (this.dom.btnApplyCustomDates) {
      this.dom.btnApplyCustomDates.addEventListener('click', () => {
        const start = this.dom.inputStartDate.value;
        const end = this.dom.inputEndDate.value;
        if (!start || !end) {
          ToastModule.show('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.', 'flame');
          return;
        }
        if (new Date(end) < new Date(start)) {
          ToastModule.show('Ngày kết thúc không thể trước ngày bắt đầu.', 'flame');
          return;
        }
        this.customStartDate = start;
        this.customEndDate = end;
        this.currentPage = 1;
        this.filterAndRender();
      });
    }

    
    if (this.dom.btnRefresh) {
      this.dom.btnRefresh.addEventListener('click', () => {
        ToastModule.show('Đang cập nhật lại báo cáo sức khỏe...', 'cyan');
        this.loadDataAndRender();
      });
    }

    
    if (this.dom.btnExportCsv) {
      this.dom.btnExportCsv.addEventListener('click', () => {
        this.exportToCsv();
      });
    }

    
    if (this.dom.btnPrint) {
      this.dom.btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    
    if (this.dom.btnPagePrev) {
      this.dom.btnPagePrev.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderTable();
        }
      });
    }
    if (this.dom.btnPageNext) {
      this.dom.btnPageNext.addEventListener('click', () => {
        const total = Math.ceil(this.dailyMergedRows.length / this.pageSize) || 1;
        if (this.currentPage < total) {
          this.currentPage++;
          this.renderTable();
        }
      });
    }
  },

  loadDataAndRender() {
    this.cachedWeights = window.storageService ? window.storageService.getWeightLogs() : [];
    this.cachedWorkouts = window.storageService ? window.storageService.getWorkoutLogs() : [];
    this.cachedProfile = window.storageService ? (window.storageService.getUserProfile ? window.storageService.getUserProfile() : window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {})) : {};

    
    if (window.HealthReportsChartEngine) {
      HealthReportsChartEngine.init('report-weight-canvas', 'report-weight-tooltip');
    }

    
    const todayStr = window.getTodayDateString ? window.getTodayDateString() : new Date().toISOString().split('T')[0];
    const past30 = new Date();
    past30.setDate(past30.getDate() - 30);
    const past30Str = past30.toISOString().split('T')[0];

    if (this.dom.inputStartDate && !this.dom.inputStartDate.value) this.dom.inputStartDate.value = past30Str;
    if (this.dom.inputEndDate && !this.dom.inputEndDate.value) this.dom.inputEndDate.value = todayStr;

    this.filterAndRender();
  },

  filterAndRender() {
    let startD = null;
    let endD = new Date();
    let daysCount = 30;

    if (this.currentRange === 'custom') {
      if (this.customStartDate && this.customEndDate) {
        startD = new Date(`${this.customStartDate}T00:00:00`);
        endD = new Date(`${this.customEndDate}T23:59:59`);
        daysCount = Math.max(1, Math.round((endD - startD) / (1000 * 60 * 60 * 24)));
      } else {
        startD = new Date();
        startD.setDate(startD.getDate() - 30);
      }
    } else {
      if (this.currentRange === '7d') daysCount = 7;
      else if (this.currentRange === '30d') daysCount = 30;
      else if (this.currentRange === '90d') daysCount = 90;
      else if (this.currentRange === '180d') daysCount = 180;
      else if (this.currentRange === '365d') daysCount = 365;

      startD = new Date();
      startD.setDate(startD.getDate() - daysCount);
    }

    
    const prevEndD = new Date(startD);
    const prevStartD = new Date(startD);
    prevStartD.setDate(prevStartD.getDate() - daysCount);

    
    this.filteredWeights = this.cachedWeights.filter(w => {
      const d = new Date(w.date);
      return d >= startD && d <= endD;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    this.filteredWorkouts = this.cachedWorkouts.filter(w => {
      const d = new Date(w.workoutDate);
      return d >= startD && d <= endD;
    }).sort((a, b) => new Date(a.workoutDate) - new Date(b.workoutDate));

    
    this.prevWeights = this.cachedWeights.filter(w => {
      const d = new Date(w.date);
      return d >= prevStartD && d < startD;
    });

    this.prevWorkouts = this.cachedWorkouts.filter(w => {
      const d = new Date(w.workoutDate);
      return d >= prevStartD && d < startD;
    });

    this.renderRangeBadge(startD, endD, daysCount);
    this.renderKPIs();
    this.renderCharts();
    this.renderWorkoutBreakdown();
    this.renderPeriodComparison();
    this.renderInsights();
    this.buildDailyMergedRows();
    this.renderTable();
  },

  renderRangeBadge(startD, endD, daysCount) {
    const fmt = (d) => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const text = `Từ ${fmt(startD)} đến ${fmt(endD)} (${daysCount} ngày)`;
    if (this.dom.rangeDatesText) this.dom.rangeDatesText.textContent = text;
    if (this.dom.printMetaText) {
      const userName = this.cachedProfile.name || 'Người dùng FitVN';
      this.dom.printMetaText.textContent = `Khoảng thời gian: ${text} | Người dùng: ${userName} | FitVN Tracker`;
    }
  },

  toggleSectionsByType() {
    const type = this.currentReportType;
    if (this.dom.secWeightReport) {
      this.dom.secWeightReport.style.display = (type === 'all' || type === 'weight') ? 'block' : 'none';
    }
    if (this.dom.secWorkoutReport) {
      this.dom.secWorkoutReport.style.display = (type === 'all' || type === 'workout') ? 'block' : 'none';
    }
  },

  renderKPIs() {
    const height = Number(this.cachedProfile.height) || null;
    const report = window.HealthCalculator.generateComprehensiveReport(
      this.filteredWeights,
      height,
      this.filteredWorkouts
    );

    
    if (report.hasWeightData) {
      if (this.dom.kpiStartWeight) this.dom.kpiStartWeight.innerHTML = `${report.weight.startWeight.toFixed(1)} <span class="stat-unit">kg</span>`;
      if (this.dom.kpiEndWeight) this.dom.kpiEndWeight.innerHTML = `${report.weight.endWeight.toFixed(1)} <span class="stat-unit">kg</span>`;
      
      const sign = report.weight.weightDiff > 0 ? `+${report.weight.weightDiff}` : `${report.weight.weightDiff}`;
      if (this.dom.kpiWeightDiff) this.dom.kpiWeightDiff.innerHTML = `${sign} <span class="stat-unit">kg</span>`;
      if (this.dom.kpiWeightDiffPercent) {
        const pSign = report.weight.weightPercentChange > 0 ? `+${report.weight.weightPercentChange}` : `${report.weight.weightPercentChange}`;
        this.dom.kpiWeightDiffPercent.textContent = `${pSign}%`;
      }
      if (this.dom.kpiWeightDiffBadge) {
        this.dom.kpiWeightDiffBadge.textContent = report.weight.weightDiff > 0 ? 'Tăng' : report.weight.weightDiff < 0 ? 'Giảm' : 'Ổn định';
        this.dom.kpiWeightDiffBadge.className = `glass-badge ${report.weight.weightDiff > 0 ? 'glass-badge-cyan' : report.weight.weightDiff < 0 ? 'glass-badge-emerald' : 'glass-badge-muted'}`;
      }

      if (report.weight.endBMI) {
        if (this.dom.kpiEndBmi) this.dom.kpiEndBmi.innerHTML = `${report.weight.endBMI.toFixed(1)} <span class="stat-unit">kg/m²</span>`;
        if (this.dom.kpiBmiBadge) {
          this.dom.kpiBmiBadge.className = `glass-badge ${report.weight.bmiColorClass}`;
          this.dom.kpiBmiBadge.textContent = report.weight.bmiCategory;
        }
        if (this.dom.kpiBmiCategory) this.dom.kpiBmiCategory.textContent = report.weight.bmiCategory;
      } else {
        if (this.dom.kpiEndBmi) this.dom.kpiEndBmi.innerHTML = `-- <span class="stat-unit">kg/m²</span>`;
        if (this.dom.kpiBmiBadge) this.dom.kpiBmiBadge.textContent = 'Chưa có chiều cao';
        if (this.dom.kpiBmiCategory) this.dom.kpiBmiCategory.textContent = 'Chưa thiết lập';
      }
    } else {
      if (this.dom.kpiStartWeight) this.dom.kpiStartWeight.innerHTML = `-- <span class="stat-unit">kg</span>`;
      if (this.dom.kpiEndWeight) this.dom.kpiEndWeight.innerHTML = `-- <span class="stat-unit">kg</span>`;
      if (this.dom.kpiWeightDiff) this.dom.kpiWeightDiff.innerHTML = `-- <span class="stat-unit">kg</span>`;
      if (this.dom.kpiWeightDiffPercent) this.dom.kpiWeightDiffPercent.textContent = 'Chưa có dữ liệu';
      if (this.dom.kpiEndBmi) this.dom.kpiEndBmi.innerHTML = `-- <span class="stat-unit">kg/m²</span>`;
      if (this.dom.kpiBmiCategory) this.dom.kpiBmiCategory.textContent = 'Chưa có dữ liệu';
    }

    
    if (report.hasWorkoutData) {
      if (this.dom.kpiWorkoutSessions) this.dom.kpiWorkoutSessions.innerHTML = `${report.workout.totalSessions} <span class="stat-unit">buổi</span>`;
      if (this.dom.kpiWorkoutDuration) this.dom.kpiWorkoutDuration.innerHTML = `${report.workout.formattedDuration}`;
      if (this.dom.kpiWorkoutAvg) this.dom.kpiWorkoutAvg.textContent = `TB: ${report.workout.avgDurationMinutes}p / buổi`;
      if (this.dom.kpiWorkoutDays) this.dom.kpiWorkoutDays.innerHTML = `${report.workout.activeDaysCount} <span class="stat-unit">ngày</span>`;
    } else {
      if (this.dom.kpiWorkoutSessions) this.dom.kpiWorkoutSessions.innerHTML = `0 <span class="stat-unit">buổi</span>`;
      if (this.dom.kpiWorkoutDuration) this.dom.kpiWorkoutDuration.innerHTML = `0 phút`;
      if (this.dom.kpiWorkoutAvg) this.dom.kpiWorkoutAvg.textContent = 'Chưa tập buổi nào';
      if (this.dom.kpiWorkoutDays) this.dom.kpiWorkoutDays.innerHTML = `0 <span class="stat-unit">ngày</span>`;
    }
  },

  renderCharts() {
    if (!window.HealthReportsChartEngine) return;

    
    const height = Number(this.cachedProfile.height) || null;
    const targetWeight = Number(this.cachedProfile.targetWeight) || null;

    const weightsWithBmi = this.filteredWeights.map(w => {
      let bmi = null;
      if (height && height > 0) {
        const hM = height / 100;
        bmi = parseFloat((w.weight / (hM * hM)).toFixed(1));
      }
      return { ...w, bmi };
    });

    HealthReportsChartEngine.renderWeightReportChart(weightsWithBmi, targetWeight);
  },

  renderWorkoutBreakdown() {
    const workouts = this.filteredWorkouts;
    if (workouts.length === 0) {
      if (this.dom.repWorkoutPopularBadge) this.dom.repWorkoutPopularBadge.textContent = 'Chưa có';
      if (this.dom.repWoPopularType) this.dom.repWoPopularType.textContent = 'Chưa có hoạt động';
      if (this.dom.repWoAvgDuration) this.dom.repWoAvgDuration.textContent = '0 phút / buổi';
      if (this.dom.repWoTotalDist) this.dom.repWoTotalDist.textContent = '0 km';
      return;
    }

    const report = window.HealthCalculator.generateComprehensiveReport([], null, workouts);
    const typeMap = {
      gym: '🏋️‍♂️ Tập Gym',
      running: '🏃‍♂️ Chạy bộ',
      walking: '🚶‍♂️ Đi bộ',
      cycling: '🚴‍♂️ Đạp xe',
      strength: '💪 Tập sức mạnh',
      yoga: '🧘‍♀️ Yoga',
      swimming: '🏊‍♂️ Bơi lội',
      sports: '⚽ Thể thao',
      other: '⚡ Khác'
    };

    const popType = report.workout.popularType;
    if (this.dom.repWorkoutPopularBadge) this.dom.repWorkoutPopularBadge.textContent = typeMap[popType] || 'Hoạt động';
    if (this.dom.repWoPopularType) this.dom.repWoPopularType.textContent = typeMap[popType] || 'Khác';
    if (this.dom.repWoAvgDuration) this.dom.repWoAvgDuration.textContent = `${report.workout.avgDurationMinutes} phút / buổi`;
    if (this.dom.repWoTotalDist) this.dom.repWoTotalDist.textContent = `${report.workout.totalDistanceKm} km`;
  },

  renderPeriodComparison() {
    const height = Number(this.cachedProfile.height) || null;
    const currRep = window.HealthCalculator.generateComprehensiveReport(this.filteredWeights, height, this.filteredWorkouts);
    const prevRep = window.HealthCalculator.generateComprehensiveReport(this.prevWeights, height, this.prevWorkouts);

    const comp = window.HealthCalculator.compareHealthPeriods(currRep, prevRep);

    if (!comp.hasComparison) {
      if (this.dom.compCurrWeight) this.dom.compCurrWeight.textContent = currRep.weight.endWeight ? `${currRep.weight.endWeight.toFixed(1)} kg` : '-- kg';
      if (this.dom.compPrevWeight) this.dom.compPrevWeight.textContent = '-- kg';
      if (this.dom.compWeightDiffText) this.dom.compWeightDiffText.textContent = comp.reason;
      if (this.dom.compCurrSessions) this.dom.compCurrSessions.textContent = `${currRep.workout.totalSessions} buổi`;
      if (this.dom.compPrevSessions) this.dom.compPrevSessions.textContent = '-- buổi';
      if (this.dom.compSessionsDiffText) this.dom.compSessionsDiffText.textContent = comp.reason;
      if (this.dom.compBadge) this.dom.compBadge.textContent = 'Chưa đủ dữ liệu';
      return;
    }

    
    if (this.dom.compCurrWeight) this.dom.compCurrWeight.textContent = `${currRep.weight.endWeight.toFixed(1)} kg`;
    if (this.dom.compPrevWeight) this.dom.compPrevWeight.textContent = `${prevRep.weight.endWeight.toFixed(1)} kg`;
    if (this.dom.compWeightDiffText) {
      if (comp.weightDiff !== null) {
        const sign = comp.weightDiff > 0 ? `+${comp.weightDiff}` : `${comp.weightDiff}`;
        this.dom.compWeightDiffText.textContent = `Chênh lệch: ${sign} kg (${comp.weightDiffPercent > 0 ? '+' : ''}${comp.weightDiffPercent}%) so với chu kỳ trước`;
      } else {
        this.dom.compWeightDiffText.textContent = 'Không đủ dữ liệu cân nặng';
      }
    }

    
    if (this.dom.compCurrSessions) this.dom.compCurrSessions.textContent = `${currRep.workout.totalSessions} buổi`;
    if (this.dom.compPrevSessions) this.dom.compPrevSessions.textContent = `${prevRep.workout.totalSessions} buổi`;
    if (this.dom.compSessionsDiffText) {
      const sSign = comp.sessionDiff > 0 ? `+${comp.sessionDiff}` : `${comp.sessionDiff}`;
      this.dom.compSessionsDiffText.textContent = `Chênh lệch: ${sSign} buổi tập (${comp.sessionPercent > 0 ? '+' : ''}${comp.sessionPercent}%) so với chu kỳ trước`;
    }

    if (this.dom.compBadge) this.dom.compBadge.textContent = 'Đã đối chiếu';
  },

  renderInsights() {
    if (!this.dom.insightsContent) return;

    const wCount = this.filteredWeights.length;
    const woCount = this.filteredWorkouts.length;

    if (wCount === 0 && woCount === 0) {
      this.dom.insightsContent.textContent = 'Chưa có dữ liệu thể trọng hoặc nhật ký tập luyện nào trong khoảng thời gian này. Hãy tích cực ghi nhận để có phân tích toàn diện.';
      return;
    }

    const height = Number(this.cachedProfile.height) || null;
    const rep = window.HealthCalculator.generateComprehensiveReport(this.filteredWeights, height, this.filteredWorkouts);

    let parts = [];
    if (wCount > 0) {
      parts.push(`Trong kỳ này, bạn đã ghi nhận ${wCount} mốc cân nặng. Thể trọng biến thiên ${rep.weight.weightDiff > 0 ? 'tăng' : rep.weight.weightDiff < 0 ? 'giảm' : 'không đổi'} ${Math.abs(rep.weight.weightDiff)} kg.`);
      if (rep.weight.endBMI) {
        parts.push(`Chỉ số BMI cuối kỳ đạt ${rep.weight.endBMI} (${rep.weight.bmiCategory}).`);
      }
    }

    if (woCount > 0) {
      parts.push(`Bạn đã hoàn thành ${rep.workout.totalSessions} buổi rèn luyện thể chất với tổng cộng ${rep.workout.formattedDuration} (${rep.workout.activeDaysCount} ngày tập thực tế).`);
    }

    parts.push(`Lưu ý khoa học: Các biến động cân nặng ngắn hạn thường liên quan đến lượng nước tích trữ và glycogen. Hãy duy trì chế độ dinh dưỡng lành mạnh và tập luyện đều đặn.`);

    this.dom.insightsContent.textContent = parts.join(' ');
  },

  buildDailyMergedRows() {
    const map = new Map();
    const height = Number(this.cachedProfile.height) || null;

    
    this.filteredWeights.forEach(w => {
      let bmi = '--';
      if (height && height > 0) {
        const hM = height / 100;
        bmi = (w.weight / (hM * hM)).toFixed(1);
      }
      map.set(w.date, {
        date: w.date,
        weight: Number(w.weight).toFixed(1),
        bmi,
        workoutSessions: 0,
        workoutMinutes: 0
      });
    });

    
    this.filteredWorkouts.forEach(wo => {
      const d = wo.workoutDate;
      const mins = Math.max(0, parseInt(wo.durationMinutes, 10) || 0);

      if (!map.has(d)) {
        map.set(d, {
          date: d,
          weight: '--',
          bmi: '--',
          workoutSessions: 0,
          workoutMinutes: 0
        });
      }

      const item = map.get(d);
      item.workoutSessions += 1;
      item.workoutMinutes += mins;
    });

    
    this.dailyMergedRows = Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  renderTable() {
    const tbody = this.dom.tableTbody;
    if (!tbody) return;

    if (this.dailyMergedRows.length === 0) {
      tbody.innerHTML = '';
      if (this.dom.tableEmpty) this.dom.tableEmpty.style.display = 'block';
      if (this.dom.pageInfo) this.dom.pageInfo.textContent = 'Trang 0 / 0';
      if (this.dom.btnPagePrev) this.dom.btnPagePrev.disabled = true;
      if (this.dom.btnPageNext) this.dom.btnPageNext.disabled = true;
      return;
    }

    if (this.dom.tableEmpty) this.dom.tableEmpty.style.display = 'none';

    const totalPages = Math.ceil(this.dailyMergedRows.length / this.pageSize) || 1;
    this.currentPage = Math.min(this.currentPage, totalPages);
    const startIdx = (this.currentPage - 1) * this.pageSize;
    const pageRows = this.dailyMergedRows.slice(startIdx, startIdx + this.pageSize);

    const rowsHtml = pageRows.map(row => {
      const parts = row.date.split('-');
      const dFmt = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : row.date;

      return `
        <tr>
          <td style="font-weight: 600; color: var(--color-primary); white-space: nowrap;">
            📅 ${dFmt}
          </td>
          <td style="font-weight: 700;">
            ${row.weight !== '--' ? row.weight + ' kg' : '--'}
          </td>
          <td style="font-weight: 600;">
            ${row.bmi !== '--' ? row.bmi : '--'}
          </td>
          <td>
            ${row.workoutSessions > 0 ? `${row.workoutSessions} buổi` : '<span style="color: var(--color-text-muted);">Không</span>'}
          </td>
          <td>
            ${row.workoutMinutes > 0 ? `${row.workoutMinutes} phút` : '<span style="color: var(--color-text-muted);">0p</span>'}
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml.join('');

    if (this.dom.pageInfo) {
      this.dom.pageInfo.textContent = `Trang ${this.currentPage} / ${totalPages} (${this.dailyMergedRows.length} ngày ghi nhận)`;
    }
    if (this.dom.btnPagePrev) this.dom.btnPagePrev.disabled = this.currentPage <= 1;
    if (this.dom.btnPageNext) this.dom.btnPageNext.disabled = this.currentPage >= totalPages;
  },

  exportToCsv() {
    if (this.dailyMergedRows.length === 0) {
      ToastModule.show('Không có dữ liệu trong khoảng thời gian này để xuất file.', 'flame');
      return;
    }

    
    let csvContent = '\uFEFF';
    csvContent += 'Ngày ghi nhận,Cân nặng (kg),Chỉ số BMI,Số buổi tập,Thời lượng tập (phút)\n';

    this.dailyMergedRows.forEach(r => {
      csvContent += `"${r.date}","${r.weight}","${r.bmi}","${r.workoutSessions}","${r.workoutMinutes}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fitvn-health-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    ToastModule.show('Đã xuất file báo cáo CSV thành công!', 'emerald');
  }
};

window.HealthReportsModule = HealthReportsModule;
