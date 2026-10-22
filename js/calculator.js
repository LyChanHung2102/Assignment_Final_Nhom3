/**
 * FitVN Tracker - Health & Fitness Calculation Engine
 * Math functions for 7-Day Moving Average, BMI, Body Fat, Progress Rates
 * BMR, TDEE, Macro Calculation, and Goal Estimation
 */

const HealthCalculator = {
  /**
   * Calculate 7-Day Moving Average (7DMA) from chronological weight entries
   * Formula: MA_t = (1 / k) * SUM(w_{t-i}) where k = min(windowSize, itemsSoFar)
   * @param {Array} weightEntries Array of { date: 'YYYY-MM-DD', weight: number, ... }
   * @param {number} windowSize Default 7 days
   * @returns {Array} Array of { date, rawWeight, movingAverage, bodyFat }
   */
  calculateMovingAverage(weightEntries, windowSize = 7) {
    if (!weightEntries || weightEntries.length === 0) return [];

    // 1. Sort by date ascending (chronological order)
    const sorted = [...weightEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

    // 2. Sliding window calculation
    return sorted.map((entry, index) => {
      const startIndex = Math.max(0, index - windowSize + 1);
      const windowSlice = sorted.slice(startIndex, index + 1);
      
      const sumWeight = windowSlice.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
      const movingAverage = parseFloat((sumWeight / windowSlice.length).toFixed(2));

      return {
        id: entry.id,
        date: entry.date,
        rawWeight: Number(entry.weight),
        movingAverage: movingAverage,
        bodyFat: entry.bodyFat ? Number(entry.bodyFat) : null,
        note: entry.note || '',
        measurements: entry.measurements || null
      };
    });
  },

  /**
   * Calculate Body Mass Index (BMI)
   * Formula: weight (kg) / (height (m) ^ 2)
   * @param {number} weightKg 
   * @param {number} heightCm 
   * @returns {Object} { bmi, category, colorClass }
   */
  calculateBMI(weightKg, heightCm) {
    if (!weightKg || !heightCm) return { bmi: 0, category: 'Chưa xác định', colorClass: 'muted' };

    const heightM = heightCm / 100;
    const bmiVal = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

    let category = 'Bình thường (Cân đối)';
    let colorClass = 'glass-badge-emerald';

    if (bmiVal < 18.5) {
      category = 'Gầy / Thiếu cân';
      colorClass = 'glass-badge-cyan';
    } else if (bmiVal >= 18.5 && bmiVal < 24.9) {
      category = 'Thể trạng chuẩn cân đối';
      colorClass = 'glass-badge-emerald';
    } else if (bmiVal >= 25 && bmiVal < 29.9) {
      category = 'Cơ bắp phát triển / Thừa cân nhẹ';
      colorClass = 'glass-badge-cyan';
    } else {
      category = 'Cần kiểm soát mỡ thừa';
      colorClass = 'glass-badge-flame';
    }

    return { bmi: bmiVal, category, colorClass };
  },

  /**
   * Calculate Fat Mass and Lean Body Mass (LBM)
   * @param {number} weightKg 
   * @param {number} bodyFatPercent 
   * @returns {Object} { fatMass, leanMass }
   */
  calculateBodyComposition(weightKg, bodyFatPercent) {
    if (!weightKg || !bodyFatPercent) return { fatMass: 0, leanMass: 0 };
    const fatMass = parseFloat(((weightKg * bodyFatPercent) / 100).toFixed(1));
    const leanMass = parseFloat((weightKg - fatMass).toFixed(1));
    return { fatMass, leanMass };
  },

  /**
   * Calculate weekly progress rate from Moving Average
   * @param {Array} maResults 
   * @returns {Object} { weeklyDiff, trendDescription }
   */
  calculateWeeklyTrend(maResults) {
    if (!maResults || maResults.length < 2) {
      return { diff: 0, text: 'Chưa đủ dữ liệu' };
    }

    const latestMA = maResults[maResults.length - 1].movingAverage;
    const compareIndex = Math.max(0, maResults.length - 8);
    const pastMA = maResults[compareIndex].movingAverage;

    const diff = parseFloat((latestMA - pastMA).toFixed(2));
    let text = 'Duy trì ổn định';

    if (diff > 0.1) {
      text = `+${diff} kg (Đang tăng cơ/cân)`;
    } else if (diff < -0.1) {
      text = `${diff} kg (Đang thâm hụt mỡ)`;
    }

    return { diff, text };
  },

  /**
   * Calculate BMR using Mifflin-St Jeor Equation
   * Formula:
   * - Male: BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5
   * - Female: BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161
   * @param {number} weightKg - Weight in kg
   * @param {number} heightCm - Height in cm
   * @param {number} age - Age in years
   * @param {string} gender - 'male' or 'female'
   * @returns {number} BMR in kcal/day
   */
  calculateBMR(weightKg, heightCm, age, gender) {
    if (!weightKg || !heightCm || !age) return 0;

    const weight = Number(weightKg);
    const height = Number(heightCm);
    const ageNum = Number(age);

    let bmr = (10 * weight) + (6.25 * height) - (5 * ageNum);

    if (gender === 'female') {
      bmr -= 161;
    } else {
      bmr += 5;
    }

    return Math.round(bmr);
  },

  /**
   * Calculate TDEE (Total Daily Energy Expenditure)
   * Multipliers based on activity level (sessions per week):
   * - 0 sessions (sedentary): 1.2
   * - 1-2 sessions (light): 1.375
   * - 3-5 sessions (moderate): 1.55
   * - 6-7 sessions (active): 1.725
   * - 7+ sessions (very active): 1.9
   * @param {number} bmr - Basal Metabolic Rate
   * @param {number} sessionsPerWeek - Number of workout sessions per week
   * @returns {number} TDEE in kcal/day
   */
  calculateTDEE(bmr, sessionsPerWeek) {
    if (!bmr) return 0;

    const sessions = Number(sessionsPerWeek) || 0;
    let multiplier = 1.2; // Default sedentary

    if (sessions === 0) {
      multiplier = 1.2;
    } else if (sessions >= 1 && sessions <= 2) {
      multiplier = 1.375;
    } else if (sessions >= 3 && sessions <= 5) {
      multiplier = 1.55;
    } else if (sessions >= 6 && sessions <= 7) {
      multiplier = 1.725;
    } else {
      multiplier = 1.9;
    }

    return Math.round(bmr * multiplier);
  },

  /**
   * Calculate target calories based on fitness goal
   * @param {number} tdee - Total Daily Energy Expenditure
   * @param {string} goal - 'cut', 'maintain', or 'lean_bulk'
   * @returns {number} Target calories in kcal/day
   */
  calculateTargetCalories(tdee, goal) {
    if (!tdee) return 0;

    switch (goal) {
      case 'cut':
        return Math.round(tdee - 500); // 500 kcal deficit
      case 'lean_bulk':
        return Math.round(tdee + 300); // 300 kcal surplus
      case 'maintain':
      default:
        return Math.round(tdee);
    }
  },

  /**
   * Calculate macro distribution (Protein, Carbs, Fat)
   * Protein: 1.6-2.2g per kg body weight
   * Fat: 20-25% of total calories
   * Carbs: Remaining calories
   * @param {number} targetCalories - Target daily calories
   * @param {number} weightKg - Current weight in kg
   * @param {string} goal - 'cut', 'maintain', or 'lean_bulk'
   * @returns {Object} { protein: grams, carbs: grams, fat: grams }
   */
  calculateMacros(targetCalories, weightKg, goal) {
    if (!targetCalories || !weightKg) return { protein: 0, carbs: 0, fat: 0 };

    const weight = Number(weightKg);
    let proteinPerKg = 1.8; // Default

    // Adjust protein based on goal
    if (goal === 'cut') {
      proteinPerKg = 2.2; // Higher protein to preserve muscle
    } else if (goal === 'lean_bulk') {
      proteinPerKg = 2.0; // High protein for muscle building
    } else {
      proteinPerKg = 1.6; // Maintenance
    }

    const proteinGrams = Math.round(proteinPerKg * weight);
    const proteinKcal = proteinGrams * 4;

    // Fat: 20-25% of total calories
    const fatPercentage = 0.22; // 22% average
    const fatKcal = Math.round(targetCalories * fatPercentage);
    const fatGrams = Math.round(fatKcal / 9);

    // Carbs: Remaining calories
    const remainingKcal = targetCalories - proteinKcal - fatKcal;
    const carbsGrams = Math.max(0, Math.round(remainingKcal / 4));

    return {
      protein: proteinGrams,
      carbs: carbsGrams,
      fat: fatGrams
    };
  },

  /**
   * Estimate time to reach target weight
   * @param {number} currentWeight - Current weight in kg
   * @param {number} targetWeight - Target weight in kg
   * @param {string} goal - 'cut', 'maintain', or 'lean_bulk'
   * @returns {Object} { weeksNeeded, estimatedDate, weeklyChange }
   */
  estimateGoalTimeline(currentWeight, targetWeight, goal) {
    if (!currentWeight || !targetWeight || goal === 'maintain') {
      return { weeksNeeded: 0, estimatedDate: null, weeklyChange: 0 };
    }

    const weightDiff = targetWeight - currentWeight;
    const absDiff = Math.abs(weightDiff);

    let weeklyChange = 0.5; // kg per week default

    if (goal === 'cut') {
      weeklyChange = 0.5; // Safe weight loss: 0.5kg/week
    } else if (goal === 'lean_bulk') {
      weeklyChange = 0.3; // Safe muscle gain: 0.3kg/week
    }

    const weeksNeeded = Math.ceil(absDiff / weeklyChange);
    const today = new Date();
    const estimatedDate = new Date(today.getTime() + (weeksNeeded * 7 * 24 * 60 * 60 * 1000));

    // Format date as DD/MM/YYYY
    const formattedDate = `${String(estimatedDate.getDate()).padStart(2, '0')}/${String(estimatedDate.getMonth() + 1).padStart(2, '0')}/${estimatedDate.getFullYear()}`;

    return {
      weeksNeeded,
      estimatedDate: formattedDate,
      weeklyChange
    };
  },

  /**
   * Complete calculation pipeline for onboarding
   * @param {Object} userData - { gender, age, height, currentWeight, targetWeight, sessionsPerWeek, goal }
   * @returns {Object} Complete profile with BMR, TDEE, calories, macros, and timeline
   */
  calculateCompleteProfile(userData) {
    const { gender, age, height, currentWeight, targetWeight, sessionsPerWeek, goal } = userData;

    const bmr = this.calculateBMR(currentWeight, height, age, gender);
    const tdee = this.calculateTDEE(bmr, sessionsPerWeek);
    const targetCalories = this.calculateTargetCalories(tdee, goal);
    const macros = this.calculateMacros(targetCalories, currentWeight, goal);
    const timeline = this.estimateGoalTimeline(currentWeight, targetWeight, goal);

    return {
      bmr,
      tdee,
      targetCalories,
      macros,
      timeline,
      activityLevel: this.getActivityLevelLabel(sessionsPerWeek)
    };
  },

  /**
   * Get activity level label based on sessions per week
   * @param {number} sessionsPerWeek
   * @returns {string} Activity level label
   */
  getActivityLevelLabel(sessionsPerWeek) {
    const sessions = Number(sessionsPerWeek) || 0;
    if (sessions === 0) return 'Ít vận động';
    if (sessions <= 2) return 'Nhẹ (1-2 buổi/tuần)';
    if (sessions <= 5) return 'Trung bình (3-5 buổi/tuần)';
    if (sessions <= 7) return 'Năng động (6-7 buổi/tuần)';
    return 'Rất nặng (7+ buổi/tuần)';
  }
};

window.HealthCalculator = HealthCalculator;
