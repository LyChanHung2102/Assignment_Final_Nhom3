/**
 * BMI Page Module
 * Handles BMI calculator form submission and result display
 */

const BMIModule = {
  formEl: null,
  resultEl: null,
  currentUnit: 'metric',
  currentGender: 'male',
  currentStandard: 'WHO',

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

    // Bind toggle buttons
    this.bindToggleButtons();
  },

  bindToggleButtons() {
    // Unit system toggle
    const unitBtns = document.querySelectorAll('.unit-toggle-btn');
    unitBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const unit = btn.dataset.unit;
        this.switchUnit(unit);
      });
    });

    // Gender toggle
    const genderBtns = document.querySelectorAll('.gender-toggle-btn');
    genderBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const gender = btn.dataset.gender;
        this.switchGender(gender);
      });
    });

    // Standard toggle
    const standardBtns = document.querySelectorAll('.standard-toggle-btn');
    standardBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const standard = btn.dataset.standard;
        this.switchStandard(standard);
      });
    });
  },

  switchUnit(unit) {
    this.currentUnit = unit;
    
    // Update button states
    document.querySelectorAll('.unit-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.unit === unit);
    });

    // Convert current values
    const weightInput = document.getElementById('bmi-weight');
    const heightInput = document.getElementById('bmi-height');
    const weightLabel = document.getElementById('label-weight');
    const heightLabel = document.getElementById('label-height');

    const currentWeight = parseFloat(weightInput.value) || 0;
    const currentHeight = parseFloat(heightInput.value) || 0;

    if (unit === 'imperial') {
      // Convert to imperial
      weightInput.value = window.BMICalculator.convertWeight(currentWeight, 'kg', 'lbs').toFixed(1);
      heightInput.value = window.BMICalculator.convertHeight(currentHeight, 'cm', 'inches').toFixed(1);
      weightLabel.textContent = 'Cân nặng (lbs)';
      heightLabel.textContent = 'Chiều cao (inches)';
      weightInput.min = 66;
      weightInput.max = 661;
      heightInput.min = 39;
      heightInput.max = 98;
    } else {
      // Convert to metric
      weightInput.value = window.BMICalculator.convertWeight(currentWeight, 'lbs', 'kg').toFixed(1);
      heightInput.value = window.BMICalculator.convertHeight(currentHeight, 'inches', 'cm').toFixed(1);
      weightLabel.textContent = 'Cân nặng (kg)';
      heightLabel.textContent = 'Chiều cao (cm)';
      weightInput.min = 30;
      weightInput.max = 300;
      heightInput.min = 100;
      heightInput.max = 250;
    }
  },

  switchGender(gender) {
    this.currentGender = gender;
    
    // Update button states
    document.querySelectorAll('.gender-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.gender === gender);
    });

    // Update body visual if result is shown
    if (this.resultEl.style.display !== 'none') {
      this.updateBodyVisual();
    }
  },

  switchStandard(standard) {
    this.currentStandard = standard;
    
    // Update button states
    document.querySelectorAll('.standard-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.standard === standard);
    });

    // Recalculate if result is shown
    if (this.resultEl.style.display !== 'none') {
      this.handleCalculate(new Event('submit'));
    }
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

    if (profile.gender) {
      this.switchGender(profile.gender);
    }
  },

  handleCalculate(e) {
    if (e instanceof Event) e.preventDefault();

    const weightInput = document.getElementById('bmi-weight');
    const heightInput = document.getElementById('bmi-height');
    
    let weight = parseFloat(weightInput.value);
    let height = parseFloat(heightInput.value);

    // Validate inputs
    if (!weight || !height || weight <= 0 || height <= 0) {
      alert('Vui lòng nhập cân nặng và chiều cao hợp lệ');
      return;
    }

    // Convert to metric if needed
    if (this.currentUnit === 'imperial') {
      weight = window.BMICalculator.convertWeight(weight, 'lbs', 'kg');
      height = window.BMICalculator.convertHeight(height, 'inches', 'cm');
    }

    // Calculate BMI
    const bmi = window.BMICalculator.calculateBMI(weight, height);
    if (bmi === null) {
      alert('Có lỗi xảy ra khi tính BMI');
      return;
    }

    // Calculate Ponderal Index
    const ponderal = window.BMICalculator.calculatePonderalIndex(weight, height);

    // Get category information
    const category = window.BMICalculator.getBMICategory(bmi, this.currentStandard);
    const idealRange = window.BMICalculator.getIdealWeightRange(height, this.currentStandard);
    const weightDiff = window.BMICalculator.getWeightDifference(weight, height, this.currentStandard);
    const distanceToOverweight = window.BMICalculator.getDistanceToOverweight(weight, height, this.currentStandard);
    const bmiPosition = window.BMICalculator.getBMIPosition(bmi);

    // Update UI
    this.updateResult(bmi, ponderal, category, idealRange, weightDiff, distanceToOverweight, bmiPosition, weight);
  },

  updateResult(bmi, ponderal, category, idealRange, weightDiff, distanceToOverweight, bmiPosition, weightKg) {
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

    // Update analysis table
    this.updateAnalysisTable(bmi, category, weightKg, idealRange, ponderal, distanceToOverweight);

    // Update body visual
    this.updateBodyVisual(bmi);

    // Update recommendation
    const recommendationText = document.getElementById('recommendation-text');
    if (recommendationText) {
      recommendationText.textContent = category.recommendation;
    }

    // Scroll to result
    this.resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  updateAnalysisTable(bmi, category, weightKg, idealRange, ponderal, distanceToOverweight) {
    // BMI value and status
    const bmiEl = document.getElementById('analysis-bmi');
    const bmiStatusEl = document.getElementById('analysis-bmi-status');
    if (bmiEl) bmiEl.textContent = `${bmi.toFixed(1)} kg/m²`;
    if (bmiStatusEl) {
      bmiStatusEl.textContent = category.category;
      bmiStatusEl.className = `analysis-status bmi-${category.color}`;
    }

    // Current weight
    const currentWeightEl = document.getElementById('analysis-current-weight');
    if (currentWeightEl) {
      const displayWeight = this.currentUnit === 'imperial' 
        ? window.BMICalculator.convertWeight(weightKg, 'kg', 'lbs').toFixed(1)
        : weightKg.toFixed(1);
      const unit = this.currentUnit === 'imperial' ? 'lbs' : 'kg';
      currentWeightEl.textContent = `${displayWeight} ${unit}`;
    }

    // Ideal weight range
    const idealRangeEl = document.getElementById('analysis-ideal-range');
    if (idealRangeEl) {
      const displayMin = this.currentUnit === 'imperial'
        ? window.BMICalculator.convertWeight(idealRange.min, 'kg', 'lbs').toFixed(1)
        : idealRange.min.toFixed(1);
      const displayMax = this.currentUnit === 'imperial'
        ? window.BMICalculator.convertWeight(idealRange.max, 'kg', 'lbs').toFixed(1)
        : idealRange.max.toFixed(1);
      const unit = this.currentUnit === 'imperial' ? 'lbs' : 'kg';
      idealRangeEl.textContent = `${displayMin} - ${displayMax} ${unit}`;
    }

    // Ponderal Index
    const ponderalEl = document.getElementById('analysis-ponderal');
    const ponderalStatusEl = document.getElementById('analysis-ponderal-status');
    if (ponderalEl) ponderalEl.textContent = `${ponderal.toFixed(2)} kg/m³`;
    if (ponderalStatusEl) {
      if (ponderal >= 11.0 && ponderal <= 15.0) {
        ponderalStatusEl.textContent = 'Bình thường';
        ponderalStatusEl.className = 'analysis-status bmi-green';
      } else if (ponderal < 11.0) {
        ponderalStatusEl.textContent = 'Thấp';
        ponderalStatusEl.className = 'analysis-status bmi-orange';
      } else {
        ponderalStatusEl.textContent = 'Cao';
        ponderalStatusEl.className = 'analysis-status bmi-red';
      }
    }

    // Distance to overweight
    const distanceEl = document.getElementById('analysis-distance');
    if (distanceEl) {
      const displayDistance = this.currentUnit === 'imperial'
        ? window.BMICalculator.convertWeight(distanceToOverweight.distance, 'kg', 'lbs').toFixed(1)
        : distanceToOverweight.distance.toFixed(1);
      const unit = this.currentUnit === 'imperial' ? 'lbs' : 'kg';
      distanceEl.textContent = distanceToOverweight.distance >= 0 
        ? `+${displayDistance} ${unit}`
        : `-${displayDistance} ${unit}`;
    }
  },

  updateBodyVisual(bmi) {
    const bodySvg = document.getElementById('body-svg');
    const bodyLabel = document.getElementById('body-visual-label');
    
    if (!bodySvg || !bodyLabel) return;

    const visualType = window.BMICalculator.getBodyVisualType(bmi, this.currentGender);
    
    // Update body silhouette based on type
    let headRx, bodyWidth, bodyColor;
    
    switch (visualType) {
      case 'underweight':
        headRx = 12;
        bodyWidth = 20;
        bodyColor = '#FCD34D';
        bodyLabel.textContent = 'Gầy';
        break;
      case 'normal':
        headRx = 15;
        bodyWidth = 25;
        bodyColor = '#E8E4D9';
        bodyLabel.textContent = 'Bình thường';
        break;
      case 'overweight':
        headRx = 18;
        bodyWidth = 30;
        bodyColor = '#FBBF24';
        bodyLabel.textContent = 'Thừa cân';
        break;
      case 'obese':
        headRx = 20;
        bodyWidth = 35;
        bodyColor = '#EF4444';
        bodyLabel.textContent = 'Béo phì';
        break;
      default:
        headRx = 15;
        bodyWidth = 25;
        bodyColor = '#E8E4D9';
        bodyLabel.textContent = 'Bình thường';
    }

    // Update SVG
    const ellipse = bodySvg.querySelector('ellipse');
    if (ellipse) {
      ellipse.setAttribute('rx', headRx);
      ellipse.setAttribute('fill', bodyColor);
    }

    const path = bodySvg.querySelector('path');
    if (path) {
      const armSpread = bodyWidth / 2;
      const legSpread = bodyWidth / 3;
      path.setAttribute('d', `M50 43 L50 90 M50 55 L${50 - armSpread} 75 M50 55 L${50 + armSpread} 75 M50 90 L${50 - legSpread} 140 M50 90 L${50 + legSpread} 140 M${50 - legSpread} 140 L${50 - legSpread - 10} 190 M${50 + legSpread} 140 L${50 + legSpread + 10} 190`);
    }
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  BMIModule.init();
});

// Expose to window
window.BMIModule = BMIModule;
