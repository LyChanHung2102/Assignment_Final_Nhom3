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
  }
};

if (typeof window !== 'undefined') {
  window.HealthCalculator = HealthCalculator;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HealthCalculator };
}
