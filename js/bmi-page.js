/**
 * BMI Page Module
 * Handles BMI calculator form submission and result display
 */

const BMIModule = {
  formEl: null,
  resultEl: null,

  init() {
    this.formEl = document.getElementById('bmi-form');
    this.resultEl = document.getElementById('bmi-result');

    if (!this.formEl) {
      console.error('BMI form not found');
      return;
    }

    // Load user profile data if available
    this.loadUserProfile();

    // Bind form submission
    this.formEl.addEventListener('submit', (e) => this.handleCalculate(e));
  },

  loadUserProfile() {
    if (!window.storageService) return;

    const profile = window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {});
    
    // Pre-fill form with user profile data
    if (profile.currentWeight) {
      const weightInput = document.getElementById('bmi-weight');
      if (weightInput) weightInput.value = profile.currentWeight;
    }

    if (profile.height) {
      const heightInput = document.getElementById('bmi-height');
      if (heightInput) heightInput.value = profile.height;
    }
  },

  handleCalculate(e) {
    e.preventDefault();

    const weight = parseFloat(document.getElementById('bmi-weight').value);
    const height = parseFloat(document.getElementById('bmi-height').value);

    // Validate inputs
    if (!weight || !height || weight <= 0 || height <= 0) {
      alert('Vui lòng nhập cân nặng và chiều cao hợp lệ');
      return;
    }

    // Calculate BMI
    const bmi = window.BMICalculator.calculateBMI(weight, height);
    if (bmi === null) {
      alert('Có lỗi xảy ra khi tính BMI');
      return;
    }

    // Get category information
    const category = window.BMICalculator.getBMICategory(bmi);
    const idealRange = window.BMICalculator.getIdealWeightRange(height);
    const weightDiff = window.BMICalculator.getWeightDifference(weight, height);
    const bmiPosition = window.BMICalculator.getBMIPosition(bmi);

    // Update UI
    this.updateResult(bmi, category, idealRange, weightDiff, bmiPosition);
  },

  updateResult(bmi, category, idealRange, weightDiff, bmiPosition) {
    // Show result card
    this.resultEl.style.display = 'block';

    // Update BMI value
    const bmiValueEl = document.getElementById('bmi-value');
    if (bmiValueEl) {
      bmiValueEl.textContent = bmi.toFixed(1);
    }

    // Update category badge
    const categoryBadge = document.getElementById('bmi-category');
    if (categoryBadge) {
      categoryBadge.className = `bmi-category-badge bmi-${category.color}`;
      categoryBadge.querySelector('.category-text').textContent = category.category;
    }

    // Update scale indicator position
    const indicator = document.getElementById('bmi-indicator');
    if (indicator) {
      indicator.style.left = `${bmiPosition}%`;
    }

    // Update description
    const descriptionEl = document.getElementById('bmi-description');
    if (descriptionEl) {
      descriptionEl.querySelector('p').textContent = category.description;
    }

    // Update ideal weight range
    const idealMinEl = document.getElementById('ideal-min');
    const idealMaxEl = document.getElementById('ideal-max');
    if (idealMinEl && idealMaxEl) {
      idealMinEl.textContent = idealRange.min;
      idealMaxEl.textContent = idealRange.max;
    }

    // Update weight difference
    const weightDiffText = document.getElementById('weight-diff-text');
    const weightDiffIcon = document.getElementById('weight-diff-icon');
    if (weightDiffText && weightDiffIcon) {
      weightDiffText.textContent = weightDiff.message;
      if (weightDiff.difference > 0) {
        weightDiffIcon.textContent = weight < idealRange.min ? '⬆️' : '⬇️';
      } else {
        weightDiffIcon.textContent = '✅';
      }
    }

    // Update recommendation
    const recommendationText = document.getElementById('recommendation-text');
    if (recommendationText) {
      recommendationText.textContent = category.recommendation;
    }

    // Scroll to result
    this.resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  BMIModule.init();
});

// Expose to window
window.BMIModule = BMIModule;
