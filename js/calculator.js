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
   * Reference: WHO & Vietnam IDI/WPRO standards for adults
   * @param {number} weightKg 
   * @param {number} heightCm 
   * @returns {Object} { bmi, category, colorClass, statusKey, description }
   */
  calculateBMI(weightKg, heightCm) {
    const weight = Number(weightKg);
    const height = Number(heightCm);

    if (!weight || !height || weight <= 0 || height <= 0) {
      return {
        bmi: null,
        category: 'Chưa đủ dữ liệu',
        colorClass: 'glass-badge-muted',
        statusKey: 'incomplete',
        description: 'Vui lòng cập nhật đầy đủ chiều cao và cân nặng để tính chỉ số BMI.'
      };
    }

    const heightM = height / 100;
    const bmiVal = parseFloat((weight / (heightM * heightM)).toFixed(1));

    let category = 'Bình thường';
    let colorClass = 'glass-badge-emerald';
    let statusKey = 'normal';
    let description = 'Cân nặng của bạn nằm trong khoảng lý tưởng đối với chiều cao hiện tại.';

    if (bmiVal < 18.5) {
      category = 'Thiếu cân';
      colorClass = 'glass-badge-info';
      statusKey = 'underweight';
      description = 'Cân nặng dưới mức khuyến nghị. Nên bổ sung dinh dưỡng và tăng cường năng lượng lành mạnh.';
    } else if (bmiVal < 25.0) {
      category = 'Bình thường';
      colorClass = 'glass-badge-emerald';
      statusKey = 'normal';
      description = 'Chỉ số khối cơ thể cân đối và ổn định. Tiếp tục duy trì chế độ dinh dưỡng và tập luyện.';
    } else if (bmiVal < 30.0) {
      category = 'Thừa cân';
      colorClass = 'glass-badge-warning';
      statusKey = 'overweight';
      description = 'Thể trọng cao hơn ngưỡng tiêu chuẩn. Có thể do cơ bắp phát triển hoặc tích lũy mỡ thừa.';
    } else {
      category = 'Béo phì';
      colorClass = 'glass-badge-danger';
      statusKey = 'obese';
      description = 'Chỉ số BMI ở mức cảnh báo béo phì. Khuyến nghị thiết lập lộ trình giảm mỡ khoa học.';
    }

    return {
      bmi: bmiVal,
      category,
      colorClass,
      statusKey,
      description
    };
  },

  /**
   * Calculate Goal Weight Progress
   * Correctly handles Weight Loss (cut), Weight Gain (lean_bulk/gain), and Maintenance (maintain)
   * @param {number} initialWeight Starting weight in kg
   * @param {number} currentWeight Current weight in kg
   * @param {number} targetWeight Target goal weight in kg
   * @returns {Object} { percent, remainingDiff, isCompleted, directionText, statusText }
   */
  calculateGoalProgress(initialWeight, currentWeight, targetWeight) {
    const initW = Number(initialWeight);
    const currW = Number(currentWeight);
    const targetW = Number(targetWeight);

    if (isNaN(initW) || isNaN(currW) || isNaN(targetW) || initW <= 0 || currW <= 0 || targetW <= 0) {
      return {
        percent: 0,
        remainingDiff: 0,
        isCompleted: false,
        directionText: 'Chưa xác định',
        statusText: 'Chưa đủ dữ liệu mục tiêu'
      };
    }

    const remainingDiff = parseFloat(Math.abs(currW - targetW).toFixed(1));

    // Case 1: Maintenance (Target == Initial)
    if (Math.abs(targetW - initW) < 0.05) {
      const diffFromTarget = Math.abs(currW - targetW);
      const isCompleted = diffFromTarget <= 0.5;
      return {
        percent: isCompleted ? 100 : Math.max(0, Math.round(100 - diffFromTarget * 10)),
        remainingDiff,
        isCompleted,
        directionText: 'Duy trì cân nặng',
        statusText: isCompleted ? 'Đang duy trì rất tốt cân nặng mục tiêu!' : `Lệch ${remainingDiff} kg so với mức cần duy trì`
      };
    }

    // Case 2: Weight Loss (Target < Initial)
    if (targetW < initW) {
      const totalDistance = initW - targetW;
      const progressMade = initW - currW;
      let rawPercent = (progressMade / totalDistance) * 100;
      
      const isCompleted = currW <= targetW;
      const percent = isCompleted ? 100 : Math.max(0, Math.min(100, Math.round(rawPercent)));

      let statusText = `Cần giảm thêm ${remainingDiff} kg để đạt mục tiêu`;
      if (isCompleted) {
        statusText = currW < targetW 
          ? `Đã vượt mục tiêu giảm cân! (Nhẹ hơn ${remainingDiff} kg)` 
          : 'Đã hoàn thành chính xác mục tiêu giảm cân!';
      } else if (currW > initW) {
        statusText = `Cân nặng đang tăng so với ban đầu (+${(currW - initW).toFixed(1)} kg)`;
      }

      return {
        percent,
        remainingDiff,
        isCompleted,
        directionText: 'Giảm cân',
        statusText
      };
    }

    // Case 3: Weight Gain / Lean Bulk (Target > Initial)
    const totalDistance = targetW - initW;
    const progressMade = currW - initW;
    let rawPercent = (progressMade / totalDistance) * 100;

    const isCompleted = currW >= targetW;
    const percent = isCompleted ? 100 : Math.max(0, Math.min(100, Math.round(rawPercent)));

    let statusText = `Cần tăng thêm ${remainingDiff} kg để đạt mục tiêu`;
    if (isCompleted) {
      statusText = currW > targetW
        ? `Đã vượt mục tiêu tăng cân! (+${(currW - targetW).toFixed(1)} kg)` 
        : 'Đã hoàn thành chính xác mục tiêu tăng cân!';
    } else if (currW < initW) {
      statusText = `Cân nặng đang giảm so với ban đầu (-${(initW - currW).toFixed(1)} kg)`;
    }

    return {
      percent,
      remainingDiff,
      isCompleted,
      directionText: 'Tăng cân / Tăng cơ',
      statusText
    };
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
   * Calculate Summary Statistics for a set of chronological entries in a selected period
   * @param {Array} entries Sorted array of entries { date, weight, bmi, ... }
   * @param {string} metric 'weight' | 'bmi'
   * @returns {Object} { startVal, endVal, diff, percentChange, trend, hasData }
   */
  calculatePeriodStats(entries, metric = 'weight') {
    if (!entries || entries.length === 0) {
      return {
        startVal: null,
        endVal: null,
        diff: 0,
        percentChange: 0,
        trend: 'no_data',
        trendLabel: 'Chưa có dữ liệu',
        badgeClass: 'glass-badge-muted',
        hasData: false
      };
    }

    const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstVal = Number(sorted[0][metric]);
    const lastVal = Number(sorted[sorted.length - 1][metric]);

    if (isNaN(firstVal) || isNaN(lastVal) || sorted.length === 1) {
      const singleVal = isNaN(lastVal) ? firstVal : lastVal;
      return {
        startVal: singleVal,
        endVal: singleVal,
        diff: 0,
        percentChange: 0,
        trend: 'single',
        trendLabel: 'Bản ghi duy nhất',
        badgeClass: 'glass-badge-cyan',
        hasData: true
      };
    }

    const diff = parseFloat((lastVal - firstVal).toFixed(2));
    let percentChange = 0;
    if (firstVal > 0) {
      percentChange = parseFloat(((diff / firstVal) * 100).toFixed(1));
    }

    let trend = 'stable';
    let trendLabel = 'Duy trì ổn định';
    let badgeClass = 'glass-badge-emerald';

    // Threshold of 0.2kg or 0.1 BMI point to avoid declaring noise as significant trend
    const threshold = metric === 'bmi' ? 0.1 : 0.2;

    if (diff > threshold) {
      trend = 'increasing';
      trendLabel = `Tăng +${diff} (${percentChange > 0 ? '+' : ''}${percentChange}%)`;
      badgeClass = 'glass-badge-cyan';
    } else if (diff < -threshold) {
      trend = 'decreasing';
      trendLabel = `Giảm ${Math.abs(diff)} (${percentChange}%)`;
      badgeClass = 'glass-badge-emerald';
    }

    return {
      startVal: firstVal,
      endVal: lastVal,
      diff,
      percentChange,
      trend,
      trendLabel,
      badgeClass,
      hasData: true
    };
  },

  /**
   * Compare two chronological periods (e.g. Current 30 days vs Previous 30 days)
   * Method: Compares representative values (Average and End-of-period)
   * @param {Array} currentEntries 
   * @param {Array} previousEntries 
   * @param {string} metric 'weight' | 'bmi'
   * @returns {Object}
   */
  comparePeriods(currentEntries, previousEntries, metric = 'weight') {
    if (!currentEntries || currentEntries.length === 0) {
      return {
        hasComparison: false,
        reason: 'Không có dữ liệu trong khoảng thời gian đang chọn.'
      };
    }

    if (!previousEntries || previousEntries.length === 0) {
      return {
        hasComparison: false,
        reason: 'Chưa có đủ bản ghi ở giai đoạn liền trước để đối chiếu.'
      };
    }

    const getAvg = (list) => {
      const valid = list.map(item => Number(item[metric])).filter(val => !isNaN(val) && val > 0);
      if (valid.length === 0) return 0;
      const sum = valid.reduce((acc, curr) => acc + curr, 0);
      return parseFloat((sum / valid.length).toFixed(2));
    };

    const currentAvg = getAvg(currentEntries);
    const previousAvg = getAvg(previousEntries);

    const diff = parseFloat((currentAvg - previousAvg).toFixed(2));
    let percentChange = 0;
    if (previousAvg > 0) {
      percentChange = parseFloat(((diff / previousAvg) * 100).toFixed(1));
    }

    let trendDescription = 'Tương đương giai đoạn trước';
    if (diff > 0.15) {
      trendDescription = `Tăng cao hơn ${diff} so với chu kỳ trước`;
    } else if (diff < -0.15) {
      trendDescription = `Thấp hơn ${Math.abs(diff)} so với chu kỳ trước`;
    }

    return {
      hasComparison: true,
      currentAvg,
      previousAvg,
      diff,
      percentChange,
      trendDescription
    };
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

if (typeof window !== 'undefined') {
  window.HealthCalculator = HealthCalculator;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HealthCalculator };
}
