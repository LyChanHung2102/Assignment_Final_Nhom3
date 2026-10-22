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
   * Aggregate Multi-Metric Health Report KPI & Statistics
   * Combines weight logs, height (from profile), and workout logs for a given period.
   * @param {Array} weightLogs 
   * @param {number} userHeightCm 
   * @param {Array} workoutLogs 
   * @returns {Object}
   */
  generateComprehensiveReport(weightLogs = [], userHeightCm = null, workoutLogs = []) {
    // 1. Weight & BMI KPIs
    let startWeight = null;
    let endWeight = null;
    let weightDiff = 0;
    let weightPercentChange = 0;
    let endBMI = null;
    let bmiCategory = 'Chưa xác định';
    let bmiColorClass = 'glass-badge-muted';
    let weightTrend = 'stable';
    let hasWeightData = false;

    if (weightLogs && weightLogs.length > 0) {
      hasWeightData = true;
      const sortedW = [...weightLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
      startWeight = Number(sortedW[0].weight);
      endWeight = Number(sortedW[sortedW.length - 1].weight);

      weightDiff = parseFloat((endWeight - startWeight).toFixed(2));
      if (startWeight > 0) {
        weightPercentChange = parseFloat(((weightDiff / startWeight) * 100).toFixed(1));
      }

      if (weightDiff > 0.2) weightTrend = 'increasing';
      else if (weightDiff < -0.2) weightTrend = 'decreasing';
      else weightTrend = 'stable';

      // BMI computation for end of period
      if (userHeightCm && userHeightCm > 0 && endWeight > 0) {
        const heightM = userHeightCm / 100;
        const bmiVal = parseFloat((endWeight / (heightM * heightM)).toFixed(1));
        endBMI = bmiVal;

        if (bmiVal < 18.5) {
          bmiCategory = 'Thiếu cân';
          bmiColorClass = 'glass-badge-info';
        } else if (bmiVal < 25.0) {
          bmiCategory = 'Bình thường';
          bmiColorClass = 'glass-badge-emerald';
        } else if (bmiVal < 30.0) {
          bmiCategory = 'Thừa cân';
          bmiColorClass = 'glass-badge-warning';
        } else {
          bmiCategory = 'Béo phì';
          bmiColorClass = 'glass-badge-danger';
        }
      }
    }

    // 2. Workout KPIs
    let totalSessions = 0;
    let totalMinutes = 0;
    let avgMinutes = 0;
    let activeDaysCount = 0;
    let totalDistanceKm = 0;
    let totalSteps = 0;
    let popularType = 'Chưa có';
    let popularTypeIcon = '⚡';
    let hasWorkoutData = false;

    if (workoutLogs && workoutLogs.length > 0) {
      hasWorkoutData = true;
      totalSessions = workoutLogs.length;
      const uniqueDays = new Set();
      const typeCounter = {};

      workoutLogs.forEach(wo => {
        const mins = Math.max(0, parseInt(wo.durationMinutes, 10) || 0);
        totalMinutes += mins;

        if (wo.distanceKm && !isNaN(wo.distanceKm)) {
          totalDistanceKm += Number(wo.distanceKm);
        }

        if (wo.steps && !isNaN(wo.steps)) {
          totalSteps += parseInt(wo.steps, 10);
        }

        if (wo.workoutDate) {
          uniqueDays.add(wo.workoutDate);
        }

        const t = wo.activityType || 'other';
        typeCounter[t] = (typeCounter[t] || 0) + 1;
      });

      activeDaysCount = uniqueDays.size;
      avgMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
      totalDistanceKm = parseFloat(totalDistanceKm.toFixed(2));

      // Find most popular type
      let maxCount = 0;
      for (const [typeKey, count] of Object.entries(typeCounter)) {
        if (count > maxCount) {
          maxCount = count;
          popularType = typeKey;
        }
      }
    }

    // Formatted workout duration
    const hours = Math.floor(totalMinutes / 60);
    const remMins = totalMinutes % 60;
    let formattedDuration = hours > 0 ? `${hours}h ${remMins > 0 ? remMins + 'm' : ''}`.trim() : `${totalMinutes} phút`;

    return {
      hasWeightData,
      hasWorkoutData,
      hasAnyData: hasWeightData || hasWorkoutData,
      weight: {
        startWeight,
        endWeight,
        weightDiff,
        weightPercentChange,
        endBMI,
        bmiCategory,
        bmiColorClass,
        weightTrend
      },
      workout: {
        totalSessions,
        totalDurationMinutes: totalMinutes,
        formattedDuration,
        avgDurationMinutes: avgMinutes,
        activeDaysCount,
        totalDistanceKm,
        totalSteps,
        popularType
      }
    };
  },

  /**
   * Compare Two Comprehensive Health Periods
   * Compares Weight, BMI, Workout sessions, and Total Workout minutes.
   */
  compareHealthPeriods(currData, prevData) {
    if (!currData || !currData.hasAnyData) {
      return {
        hasComparison: false,
        reason: 'Không có dữ liệu trong khoảng thời gian đang chọn.'
      };
    }

    if (!prevData || !prevData.hasAnyData) {
      return {
        hasComparison: false,
        reason: 'Chưa có đủ dữ liệu ở giai đoạn đối chiếu liền trước.'
      };
    }

    // Weight difference (End vs End of previous)
    let weightDiff = null;
    let weightDiffPercent = null;
    if (currData.weight.endWeight && prevData.weight.endWeight) {
      weightDiff = parseFloat((currData.weight.endWeight - prevData.weight.endWeight).toFixed(2));
      weightDiffPercent = parseFloat(((weightDiff / prevData.weight.endWeight) * 100).toFixed(1));
    }

    // Workout sessions difference
    const sessionDiff = currData.workout.totalSessions - prevData.workout.totalSessions;
    let sessionPercent = 0;
    if (prevData.workout.totalSessions > 0) {
      sessionPercent = parseFloat(((sessionDiff / prevData.workout.totalSessions) * 100).toFixed(1));
    }

    // Workout duration difference
    const durationDiff = currData.workout.totalDurationMinutes - prevData.workout.totalDurationMinutes;
    let durationPercent = 0;
    if (prevData.workout.totalDurationMinutes > 0) {
      durationPercent = parseFloat(((durationDiff / prevData.workout.totalDurationMinutes) * 100).toFixed(1));
    }

    return {
      hasComparison: true,
      weightDiff,
      weightDiffPercent,
      sessionDiff,
      sessionPercent,
      durationDiff,
      durationPercent
    };
  }
};

if (typeof window !== 'undefined') {
  window.HealthCalculator = HealthCalculator;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HealthCalculator };
}
