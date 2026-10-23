/**
 * Onboarding Module - Handles the onboarding wizard for new users
 * Shows after signup to collect fitness goals and preferences
 */

const OnboardingModule = {
  currentStep: 1,
  totalSteps: 3,
  modal: null,

  SIGNUP_FLAG_KEY: 'fitvn_show_onboarding',

  FIELD_RULES: {
    'onboarding-age': { label: 'Tuổi', min: 12, max: 100, unit: '' },
    'onboarding-height': { label: 'Chiều cao', min: 100, max: 250, unit: 'cm' },
    'onboarding-current-weight': { label: 'Cân nặng hiện tại', min: 30, max: 250, unit: 'kg' },
    'onboarding-target-weight': { label: 'Cân nặng mục tiêu', min: 30, max: 250, unit: 'kg' }
  },

  // Hồ sơ cũ lưu activityLevel dạng chữ ('moderate'), wizard dùng số buổi tập ('3')
  ACTIVITY_TO_RADIO: {
    '0': '0', '1': '1', '3': '3', '6': '6', '8': '8',
    sedentary: '0', light: '1', moderate: '3', active: '6', very_active: '8'
  },

  init() {
    this.modal = document.getElementById('onboarding-modal');
    if (!this.modal) return;

    this.bindEvents();
    this.checkShouldShow();
  },

  onboardingKey(userId) {
    return `fitvn_onboarding_${userId}`;
  },

  checkShouldShow() {
    const currentUser = window.storageService?.getCurrentUser();
    if (!currentUser?.id) return;

    const doneFlag = window.storageService.get(this.onboardingKey(currentUser.id));
    const isFromSignup = sessionStorage.getItem(this.SIGNUP_FLAG_KEY) === 'true';

    if (isFromSignup || !doneFlag) {
      this.show();
    }
  },

  show() {
    if (!this.modal) return;

    this.modal.style.display = 'flex';
    this.modal.classList.add('active');
    this.currentStep = 1;
    this.updateStepUI();
    this.prefillUserData();
  },

  hide() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    this.modal.style.display = 'none';
  },

  onClick(id, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', handler);
  },

  bindEvents() {
    this.onClick('onboarding-skip-btn', () => this.skip());
    this.onClick('onboarding-cancel-btn', () => this.hide());

    this.onClick('onboarding-next-1', () => {
      if (this.validateStep1()) this.goToStep(2);
    });
    this.onClick('onboarding-back-2', () => this.goToStep(1));
    this.onClick('onboarding-next-2', () => {
      if (this.validateStep1()) this.goToStep(3);
    });
    this.onClick('onboarding-back-3', () => this.goToStep(2));
    this.onClick('onboarding-complete', () => this.completeOnboarding());

    this.onClick('btn-reopen-onboarding', () => this.show());

    const refreshSummary = () => {
      if (this.currentStep === 3) this.updateSummary();
    };

    Object.keys(this.FIELD_RULES).forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          el.classList.remove('has-error');
          refreshSummary();
        });
      }
    });

    this.modal.querySelectorAll('input[type="radio"]').forEach(el => {
      el.addEventListener('change', refreshSummary);
    });
  },

  prefillUserData() {
    const profile = window.storageService?.getUserProfile();
    if (!profile) return;

    this.checkRadio('onboarding-gender', profile.gender || 'male');
    this.checkRadio('onboarding-activity', this.ACTIVITY_TO_RADIO[profile.activityLevel] || '3');
    this.checkRadio('onboarding-goal', profile.fitnessGoal || 'maintain');

    this.setFieldValue('onboarding-age', profile.age);
    this.setFieldValue('onboarding-height', profile.height);
    this.setFieldValue('onboarding-current-weight', profile.currentWeight);
    this.setFieldValue('onboarding-target-weight', profile.targetWeight);
  },

  checkRadio(name, value) {
    const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (input) input.checked = true;
  },

  setFieldValue(id, value) {
    const el = document.getElementById(id);
    if (el && value !== null && value !== undefined && value !== '') el.value = value;
  },

  readNumber(id) {
    const el = document.getElementById(id);
    if (!el || String(el.value).trim() === '') return null;
    const num = parseFloat(el.value);
    return Number.isFinite(num) ? num : null;
  },

  readRadio(name, fallback) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || fallback;
  },

  collectInput() {
    return {
      gender: this.readRadio('onboarding-gender', 'male'),
      age: this.readNumber('onboarding-age'),
      height: this.readNumber('onboarding-height'),
      currentWeight: this.readNumber('onboarding-current-weight'),
      targetWeight: this.readNumber('onboarding-target-weight'),
      activityLevel: this.readRadio('onboarding-activity', '3'),
      fitnessGoal: this.readRadio('onboarding-goal', 'maintain')
    };
  },

  validateStep1() {
    let firstInvalidId = null;
    let firstMessage = '';

    Object.keys(this.FIELD_RULES).forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      const rule = this.FIELD_RULES[id];
      const value = this.readNumber(id);
      const unit = rule.unit ? ` ${rule.unit}` : '';
      let message = '';

      if (value === null) {
        message = `Vui lòng nhập ${rule.label.toLowerCase()}`;
      } else if (value < rule.min || value > rule.max) {
        message = `${rule.label} hợp lệ từ ${rule.min} đến ${rule.max}${unit}`;
      }

      el.classList.toggle('has-error', Boolean(message));
      if (message && !firstInvalidId) {
        firstInvalidId = id;
        firstMessage = message;
      }
    });

    if (firstInvalidId) {
      document.getElementById(firstInvalidId)?.focus();
      window.ToastModule?.show(firstMessage, 'flame');
      return false;
    }
    return true;
  },

  buildPlan(input) {
    if (!window.HealthCalculator) return null;
    return window.HealthCalculator.calculateNutritionPlan(input);
  },

  goToStep(step) {
    this.currentStep = step;
    this.updateStepUI();
  },

  updateStepUI() {
    document.querySelectorAll('.step-indicator').forEach((el, index) => {
      el.classList.toggle('active', index + 1 === this.currentStep);
      el.classList.toggle('completed', index + 1 < this.currentStep);
    });

    for (let i = 1; i <= this.totalSteps; i++) {
      const stepEl = document.getElementById(`onboarding-step-${i}`);
      if (stepEl) stepEl.classList.toggle('active', i === this.currentStep);
    }

    if (this.currentStep === 3) this.updateSummary();
  },

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },

  updateSummary() {
    const summaryEl = document.getElementById('onboarding-summary');
    if (!summaryEl) return;

    const plan = this.buildPlan(this.collectInput());
    if (!plan) {
      summaryEl.style.display = 'none';
      return;
    }

    const kcal = value => `${Number(value).toLocaleString('vi-VN')} kcal`;

    this.setText('summary-bmr', kcal(plan.bmr));
    this.setText('summary-tdee', kcal(plan.tdee));
    this.setText('summary-calories', kcal(plan.targetCalories));
    this.setText('summary-protein', `${plan.macros.protein} g`);
    this.setText('summary-carbs', `${plan.macros.carbs} g`);
    this.setText('summary-fat', `${plan.macros.fat} g`);

    const timelineEl = document.querySelector('#summary-timeline .timeline-value');
    if (timelineEl) {
      timelineEl.textContent = plan.timeline ? `${plan.timeline.text} (ước tính)` : '-- tuần (ước tính)';
    }

    summaryEl.style.display = 'block';
  },

  markDone(value) {
    const currentUser = window.storageService?.getCurrentUser();
    if (currentUser?.id) {
      window.storageService.set(this.onboardingKey(currentUser.id), value);
    }
    sessionStorage.removeItem(this.SIGNUP_FLAG_KEY);
  },

  skip() {
    this.markDone('skipped');
    this.hide();
    window.ToastModule?.show('Bạn có thể hoàn tất thiết lập bất kỳ lúc nào trong phần Cài đặt.', 'cyan');
  },

  completeOnboarding() {
    if (!this.validateStep1()) {
      this.goToStep(1);
      return;
    }

    const input = this.collectInput();
    const plan = this.buildPlan(input);

    if (!plan) {
      window.ToastModule?.show('Không thể tính kế hoạch dinh dưỡng. Vui lòng kiểm tra lại thông tin.', 'flame');
      this.goToStep(1);
      return;
    }

    const profile = window.storageService?.getUserProfile();
    if (!profile) return;

    Object.assign(profile, {
      gender: input.gender,
      age: input.age,
      height: input.height,
      currentWeight: input.currentWeight,
      targetWeight: input.targetWeight,
      activityLevel: input.activityLevel,
      fitnessGoal: input.fitnessGoal,
      targetCalories: plan.targetCalories,
      macros: plan.macros
    });

    window.storageService.setUserProfile(profile);

    window.storageService.updateCurrentUser({
      gender: input.gender,
      age: input.age,
      height: input.height,
      weight: input.currentWeight,
      fitnessGoal: input.fitnessGoal
    });

    this.markDone('true');
    this.hide();

    window.ToastModule?.show('Thiết lập hồ sơ thành công! Chúc bạn đạt được mục tiêu!', 'cyan');

    setTimeout(() => this.navigateHome(), 600);
  },

  navigateHome() {
    const isSubdir = window.location.pathname.toLowerCase().includes('/page/');
    if (isSubdir) {
      window.location.href = '../index.html';
    } else {
      window.location.reload();
    }
  }
};

window.OnboardingModule = OnboardingModule;
