/**
 * Onboarding Module - Handles the onboarding wizard for new users
 * Shows after signup to collect fitness goals and preferences
 */

const OnboardingModule = {
  currentStep: 1,
  totalSteps: 3,
  modal: null,
  data: {},

  init() {
    this.modal = document.getElementById('onboarding-modal');
    if (!this.modal) return;

    this.bindEvents();
    this.checkShouldShow();
  },

  checkShouldShow() {
    const currentUser = window.storageService?.getCurrentUser();
    if (!currentUser) return;

    const hasCompletedOnboarding = localStorage.getItem(`fitvn_onboarding_${currentUser.id}`);
    const isFromSignup = sessionStorage.getItem('fitvn_show_onboarding');

    if (isFromSignup === 'true' || !hasCompletedOnboarding) {
      this.show();
    }
  },

  show() {
    if (!this.modal) return;
    this.modal.style.display = 'flex';
    this.currentStep = 1;
    this.updateStepUI();
    this.prefillUserData();
  },

  hide() {
    if (!this.modal) return;
    this.modal.style.display = 'none';
  },

  bindEvents() {
    // Cancel button
    const cancelBtn = document.getElementById('onboarding-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hide());
    }

    // Step 1 Next
    const next1Btn = document.getElementById('onboarding-next-1');
    if (next1Btn) {
      next1Btn.addEventListener('click', () => this.goToStep(2));
    }

    // Step 2 Back
    const back2Btn = document.getElementById('onboarding-back-2');
    if (back2Btn) {
      back2Btn.addEventListener('click', () => this.goToStep(1));
    }

    // Step 2 Next
    const next2Btn = document.getElementById('onboarding-next-2');
    if (next2Btn) {
      next2Btn.addEventListener('click', () => this.goToStep(3));
    }

    // Step 3 Back
    const back3Btn = document.getElementById('onboarding-back-3');
    if (back3Btn) {
      back3Btn.addEventListener('click', () => this.goToStep(2));
    }

    // Step 3 Complete
    const completeBtn = document.getElementById('onboarding-complete');
    if (completeBtn) {
      completeBtn.addEventListener('click', () => this.completeOnboarding());
    }

    // Reopen button in settings
    const reopenBtn = document.getElementById('btn-reopen-onboarding');
    if (reopenBtn) {
      reopenBtn.addEventListener('click', () => this.show());
    }
  },

  prefillUserData() {
    const profile = window.storageService?.getUserProfile();
    if (!profile) return;

    // Step 1 - Basic info
    const genderInput = document.querySelector('input[name="onboarding-gender"][value="' + (profile.gender || 'male') + '"]');
    if (genderInput) genderInput.checked = true;

    const ageInput = document.getElementById('onboarding-age');
    if (ageInput && profile.age) ageInput.value = profile.age;

    const heightInput = document.getElementById('onboarding-height');
    if (heightInput && profile.height) heightInput.value = profile.height;

    const currentWeightInput = document.getElementById('onboarding-current-weight');
    if (currentWeightInput && profile.currentWeight) currentWeightInput.value = profile.currentWeight;

    const targetWeightInput = document.getElementById('onboarding-target-weight');
    if (targetWeightInput && profile.targetWeight) targetWeightInput.value = profile.targetWeight;

    // Step 2 - Activity level
    const activityInput = document.querySelector('input[name="onboarding-activity"][value="' + (profile.activityLevel || '3') + '"]');
    if (activityInput) activityInput.checked = true;

    // Step 3 - Goal
    const goalInput = document.querySelector('input[name="onboarding-goal"][value="' + (profile.fitnessGoal || 'maintain') + '"]');
    if (goalInput) goalInput.checked = true;
  },

  goToStep(step) {
    this.currentStep = step;
    this.updateStepUI();
  },

  updateStepUI() {
    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach((el, index) => {
      if (index + 1 === this.currentStep) {
        el.classList.add('active');
      } else if (index + 1 < this.currentStep) {
        el.classList.add('completed');
        el.classList.remove('active');
      } else {
        el.classList.remove('active', 'completed');
      }
    });

    // Show/hide steps
    for (let i = 1; i <= this.totalSteps; i++) {
      const stepEl = document.getElementById(`onboarding-step-${i}`);
      if (stepEl) {
        stepEl.classList.toggle('active', i === this.currentStep);
      }
    }

    // Update summary on step 3
    if (this.currentStep === 3) {
      this.updateSummary();
    }
  },

  updateSummary() {
    const summaryEl = document.getElementById('onboarding-summary');
    if (!summaryEl) return;

    summaryEl.style.display = 'block';

    // Get values
    const gender = document.querySelector('input[name="onboarding-gender"]:checked')?.value || 'male';
    const age = document.getElementById('onboarding-age')?.value || '--';
    const height = document.getElementById('onboarding-height')?.value || '--';
    const currentWeight = document.getElementById('onboarding-current-weight')?.value || '--';
    const targetWeight = document.getElementById('onboarding-target-weight')?.value || '--';
    const activity = document.querySelector('input[name="onboarding-activity"]:checked')?.value || '3';
    const goal = document.querySelector('input[name="onboarding-goal"]:checked')?.value || 'maintain';

    // Activity labels
    const activityLabels = {
      '0': 'Ít vận động',
      '1': 'Nhẹ (1-2 buổi/tuần)',
      '3': 'Trung bình (3-5 buổi/tuần)',
      '6': 'Nhiều (6-7 buổi/tuần)',
      '8': 'Rất nhiều (2 lần/ngày)'
    };

    // Goal labels
    const goalLabels = {
      'cut': 'Giảm cân/ giảm mỡ',
      'maintain': 'Duy trì cân nặng',
      'lean_bulk': 'Tăng cơ/tăng cân'
    };

    // Update summary display
    const summaryGrid = summaryEl.querySelector('.summary-grid');
    if (summaryGrid) {
      summaryGrid.innerHTML = `
        <div class="summary-item">
          <span class="summary-label">Giới tính:</span>
          <span class="summary-value">${gender === 'male' ? 'Nam' : 'Nữ'}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Tuổi:</span>
          <span class="summary-value">${age} tuổi</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Chiều cao:</span>
          <span class="summary-value">${height} cm</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Cân nặng hiện tại:</span>
          <span class="summary-value">${currentWeight} kg</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Cân nặng mục tiêu:</span>
          <span class="summary-value">${targetWeight} kg</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Mức độ vận động:</span>
          <span class="summary-value">${activityLabels[activity] || activity}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Mục tiêu:</span>
          <span class="summary-value">${goalLabels[goal] || goal}</span>
        </div>
      `;
    }
  },

  async completeOnboarding() {
    // Collect data
    const gender = document.querySelector('input[name="onboarding-gender"]:checked')?.value || 'male';
    const age = parseInt(document.getElementById('onboarding-age')?.value) || null;
    const height = parseFloat(document.getElementById('onboarding-height')?.value) || null;
    const currentWeight = parseFloat(document.getElementById('onboarding-current-weight')?.value) || null;
    const targetWeight = parseFloat(document.getElementById('onboarding-target-weight')?.value) || null;
    const activityLevel = document.querySelector('input[name="onboarding-activity"]:checked')?.value || 'moderate';
    const fitnessGoal = document.querySelector('input[name="onboarding-goal"]:checked')?.value || 'maintain';

    // Update user profile
    const profile = window.storageService?.getUserProfile();
    if (profile) {
      profile.gender = gender;
      profile.age = age;
      profile.height = height;
      profile.currentWeight = currentWeight;
      profile.targetWeight = targetWeight;
      profile.activityLevel = activityLevel;
      profile.fitnessGoal = fitnessGoal;

      // Recalculate TDEE and calories
      if (window.calcService && currentWeight && height && age) {
        const bmr = window.calcService.calculateBMR(currentWeight, height, age, gender);
        const tdee = window.calcService.calculateTDEE(bmr, activityLevel);
        
        if (fitnessGoal === 'cut') {
          profile.targetCalories = Math.round(tdee - 500);
        } else if (fitnessGoal === 'lean_bulk') {
          profile.targetCalories = Math.round(tdee + 300);
        } else {
          profile.targetCalories = Math.round(tdee);
        }

        profile.macros = {
          protein: Math.round((profile.targetCalories * 0.3) / 4),
          carbs: Math.round((profile.targetCalories * 0.45) / 4),
          fat: Math.round((profile.targetCalories * 0.25) / 9)
        };
      }

      window.storageService?.setUserProfile(profile);
    }

    // Mark as completed
    const currentUser = window.storageService?.getCurrentUser();
    if (currentUser) {
      localStorage.setItem(`fitvn_onboarding_${currentUser.id}`, 'true');
    }

    // Clear signup flag
    sessionStorage.removeItem('fitvn_show_onboarding');

    // Hide modal
    this.hide();

    // Show success message
    if (window.ToastModule) {
      window.ToastModule.show('Thiết lập hồ sơ thành công! Chúc bạn đạt được mục tiêu!', 'cyan');
    }

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 500);
  }
};

window.OnboardingModule = OnboardingModule;
