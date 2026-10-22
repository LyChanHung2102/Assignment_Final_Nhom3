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
   * Calculate Workout Statistics Summary
   * Calculates total sessions, total duration, average duration, unique active days,
   * total distance, and total steps without counting duplicate days.
   * @param {Array} workouts Array of workout objects
   * @returns {Object}
   */
  calculateWorkoutSummary(workouts) {
    if (!workouts || !Array.isArray(workouts) || workouts.length === 0) {
      return {
        totalSessions: 0,
        totalDurationMinutes: 0,
        formattedDuration: '0 phút',
        avgDurationMinutes: 0,
        activeDaysCount: 0,
        totalDistanceKm: 0,
        totalSteps: 0,
        hasData: false
      };
    }

    const totalSessions = workouts.length;
    let totalMinutes = 0;
    let totalDistance = 0;
    let totalSteps = 0;
    const uniqueDaysSet = new Set();

    workouts.forEach(wo => {
      const mins = Math.max(0, parseInt(wo.durationMinutes, 10) || 0);
      totalMinutes += mins;

      if (wo.distanceKm && !isNaN(wo.distanceKm)) {
        totalDistance += Number(wo.distanceKm);
      }

      if (wo.steps && !isNaN(wo.steps)) {
        totalSteps += parseInt(wo.steps, 10);
      }

      if (wo.workoutDate) {
        uniqueDaysSet.add(wo.workoutDate);
      }
    });

    const avgMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    const activeDaysCount = uniqueDaysSet.size;

    // Format total duration: e.g., "5h 25m" or "45 phút"
    const hours = Math.floor(totalMinutes / 60);
    const remainderMinutes = totalMinutes % 60;
    let formattedDuration = '';
    if (hours > 0) {
      formattedDuration = `${hours}h ${remainderMinutes > 0 ? remainderMinutes + 'm' : ''}`.trim();
    } else {
      formattedDuration = `${totalMinutes} phút`;
    }

    return {
      totalSessions,
      totalDurationMinutes: totalMinutes,
      formattedDuration,
      avgDurationMinutes: avgMinutes,
      activeDaysCount,
      totalDistanceKm: parseFloat(totalDistance.toFixed(2)),
      totalSteps,
      hasData: true
    };
  },

  /**
   * Group workouts by date for chart rendering
   * @param {Array} workouts 
   * @returns {Array} Array of { date, totalMinutes, sessionCount } sorted ascending
   */
  groupWorkoutsByDate(workouts) {
    if (!workouts || workouts.length === 0) return [];

    const map = new Map();
    workouts.forEach(wo => {
      const d = wo.workoutDate;
      if (!d) return;
      const mins = Math.max(0, parseInt(wo.durationMinutes, 10) || 0);

      if (!map.has(d)) {
        map.set(d, { date: d, totalMinutes: 0, sessionCount: 0 });
      }
      const item = map.get(d);
      item.totalMinutes += mins;
      item.sessionCount += 1;
    });

    return Array.from(map.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
  }
};

if (typeof window !== 'undefined') {
  window.HealthCalculator = HealthCalculator;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HealthCalculator };
}
