const HealthCalculator = {

  calculateMovingAverage(weightEntries, windowSize = 7) {
    if (!weightEntries || weightEntries.length === 0) return [];

    
    const sorted = [...weightEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

    
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

  ACTIVITY_MULTIPLIERS: {
    '0': 1.2,
    '1': 1.375,
    '3': 1.55,
    '6': 1.725,
    '8': 1.9,
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  },

  GOAL_PRESETS: {
    cut: { calorieAdjust: -500, protein: 0.40, carbs: 0.35, fat: 0.25, weeklyRateKg: 0.5 },
    maintain: { calorieAdjust: 0, protein: 0.30, carbs: 0.45, fat: 0.25, weeklyRateKg: 0 },
    lean_bulk: { calorieAdjust: 300, protein: 0.25, carbs: 0.50, fat: 0.25, weeklyRateKg: 0.3 }
  },

  MIN_SAFE_CALORIES: 1200,

  getGoalPreset(fitnessGoal) {
    return this.GOAL_PRESETS[fitnessGoal] || this.GOAL_PRESETS.maintain;
  },

  // Mifflin-St Jeor: nam +5, nữ -161
  calculateBMR(weightKg, heightCm, age, gender) {
    const weight = Number(weightKg);
    const height = Number(heightCm);
    const ageNum = Number(age);

    if (!weight || !height || !ageNum || weight <= 0 || height <= 0) return null;
    if (ageNum < 12 || ageNum > 100) return null;

    const base = 10 * weight + 6.25 * height - 5 * ageNum;
    return Math.round(gender === 'female' ? base - 161 : base + 5);
  },

  calculateTDEE(bmr, activityLevel) {
    const bmrNum = Number(bmr);
    if (!bmrNum || bmrNum <= 0) return null;

    const key = activityLevel === null || activityLevel === undefined || activityLevel === ''
      ? 'moderate'
      : String(activityLevel);
    const multiplier = this.ACTIVITY_MULTIPLIERS[key] || this.ACTIVITY_MULTIPLIERS.moderate;

    return Math.round(bmrNum * multiplier);
  },

  calculateTargetCalories(tdee, fitnessGoal) {
    const tdeeNum = Number(tdee);
    if (!tdeeNum || tdeeNum <= 0) return null;

    const adjusted = Math.round(tdeeNum + this.getGoalPreset(fitnessGoal).calorieAdjust);
    return Math.max(this.MIN_SAFE_CALORIES, adjusted);
  },

  calculateMacroTargets(targetCalories, fitnessGoal) {
    const calories = Number(targetCalories);
    if (!calories || calories <= 0) return null;

    const preset = this.getGoalPreset(fitnessGoal);
    return {
      protein: Math.round((calories * preset.protein) / 4),
      carbs: Math.round((calories * preset.carbs) / 4),
      fat: Math.round((calories * preset.fat) / 9)
    };
  },

  estimateGoalTimeline(currentWeight, targetWeight, fitnessGoal) {
    const curr = Number(currentWeight);
    const target = Number(targetWeight);
    if (!curr || !target || curr <= 0 || target <= 0) return null;

    const preset = this.getGoalPreset(fitnessGoal);
    const diffKg = Math.abs(curr - target);

    if (!preset.weeklyRateKg || diffKg < 0.25) {
      return { weeks: 0, text: 'Duy trì cân nặng hiện tại' };
    }

    const weeks = Math.max(1, Math.ceil(diffKg / preset.weeklyRateKg));
    const direction = target < curr ? 'giảm' : 'tăng';
    return { weeks, text: `~${weeks} tuần để ${direction} ${diffKg.toFixed(1)} kg` };
  },

  calculateNutritionPlan(input) {
    if (!input) return null;

    const bmr = this.calculateBMR(input.currentWeight, input.height, input.age, input.gender);
    if (bmr === null) return null;

    const tdee = this.calculateTDEE(bmr, input.activityLevel);
    const targetCalories = this.calculateTargetCalories(tdee, input.fitnessGoal);
    if (targetCalories === null) return null;

    return {
      bmr,
      tdee,
      targetCalories,
      macros: this.calculateMacroTargets(targetCalories, input.fitnessGoal),
      timeline: this.estimateGoalTimeline(input.currentWeight, input.targetWeight, input.fitnessGoal)
    };
  },

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

  
  calculateBodyComposition(weightKg, bodyFatPercent) {
    if (!weightKg || !bodyFatPercent) return { fatMass: 0, leanMass: 0 };
    const fatMass = parseFloat(((weightKg * bodyFatPercent) / 100).toFixed(1));
    const leanMass = parseFloat((weightKg - fatMass).toFixed(1));
    return { fatMass, leanMass };
  },

  
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
  },

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
  },

  generateComprehensiveReport(weightLogs = [], userHeightCm = null, workoutLogs = []) {
    
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

      
      let maxCount = 0;
      for (const [typeKey, count] of Object.entries(typeCounter)) {
        if (count > maxCount) {
          maxCount = count;
          popularType = typeKey;
        }
      }
    }

    
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

    
    let weightDiff = null;
    let weightDiffPercent = null;
    if (currData.weight.endWeight && prevData.weight.endWeight) {
      weightDiff = parseFloat((currData.weight.endWeight - prevData.weight.endWeight).toFixed(2));
      weightDiffPercent = parseFloat(((weightDiff / prevData.weight.endWeight) * 100).toFixed(1));
    }

    
    const sessionDiff = currData.workout.totalSessions - prevData.workout.totalSessions;
    let sessionPercent = 0;
    if (prevData.workout.totalSessions > 0) {
      sessionPercent = parseFloat(((sessionDiff / prevData.workout.totalSessions) * 100).toFixed(1));
    }

    
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
