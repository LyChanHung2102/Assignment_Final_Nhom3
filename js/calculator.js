/**
 * FitVN Tracker - Health & Fitness Calculation Engine
 * Math functions for 7-Day Moving Average, BMI, Body Fat, and Progress Rates
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
  }
};

if (typeof window !== 'undefined') {
  window.HealthCalculator = HealthCalculator;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HealthCalculator };
}
