/**
 * BMI Calculator Module
 * Calculates Body Mass Index and provides health recommendations
 */

const BMICalculator = {
  /**
   * Convert weight between units
   * @param {number} weight - Weight value
   * @param {string} fromUnit - 'kg' or 'lbs'
   * @param {string} toUnit - 'kg' or 'lbs'
   * @returns {number} Converted weight
   */
  convertWeight(weight, fromUnit, toUnit) {
    if (fromUnit === toUnit) return weight;
    if (fromUnit === 'lbs' && toUnit === 'kg') return weight * 0.453592;
    if (fromUnit === 'kg' && toUnit === 'lbs') return weight / 0.453592;
    return weight;
  },

  /**
   * Convert height between units
   * @param {number} height - Height value
   * @param {string} fromUnit - 'cm' or 'inches'
   * @param {string} toUnit - 'cm' or 'inches'
   * @returns {number} Converted height
   */
  convertHeight(height, fromUnit, toUnit) {
    if (fromUnit === toUnit) return height;
    if (fromUnit === 'inches' && toUnit === 'cm') return height * 2.54;
    if (fromUnit === 'cm' && toUnit === 'inches') return height / 2.54;
    return height;
  },

  /**
   * Calculate BMI from weight and height (always in metric)
   * @param {number} weight - Weight in kilograms
   * @param {number} height - Height in centimeters
   * @returns {number} BMI value
   */
  calculateBMI(weight, height) {
    if (!weight || !height || weight <= 0 || height <= 0) {
      return null;
    }
    // BMI = weight (kg) / (height (m))^2
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  },

  /**
   * Calculate Ponderal Index (PI) - weight / height^3
   * @param {number} weight - Weight in kilograms
   * @param {number} height - Height in centimeters
   * @returns {number} Ponderal Index value
   */
  calculatePonderalIndex(weight, height) {
    if (!weight || !height || weight <= 0 || height <= 0) {
      return null;
    }
    // PI = weight (kg) / (height (m))^3
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters * heightInMeters);
  },

  /**
   * Get BMI category and color based on BMI value and standard
   * @param {number} bmi - BMI value
   * @param {string} standard - 'WHO' or 'Asian'
   * @returns {Object} Category information
   */
  getBMICategory(bmi, standard = 'WHO') {
    if (bmi === null || isNaN(bmi)) {
      return {
        category: 'Chưa tính',
        color: 'gray',
        description: 'Nhập cân nặng và chiều cao để tính BMI',
        recommendation: ''
      };
    }

    // Asian standard thresholds
    const asianThresholds = {
      underweight: 18.5,
      normal: 23,
      overweight: 27.5,
      obese: 40
    };

    // WHO standard thresholds
    const whoThresholds = {
      underweight: 18.5,
      normal: 25,
      overweight: 30,
      obese: 40
    };

    const thresholds = standard === 'Asian' ? asianThresholds : whoThresholds;

    if (bmi < thresholds.underweight) {
      return {
        category: 'Gầy',
        color: 'orange',
        description: 'Bạn đang thiếu cân so với chiều cao',
        recommendation: 'Nên tăng cân bằng cách ăn nhiều calo, tập thể dục để tăng cơ bắp'
      };
    } else if (bmi >= thresholds.underweight && bmi < thresholds.normal) {
      return {
        category: 'Bình thường',
        color: 'green',
        description: 'Cân nặng của bạn ở mức lý tưởng',
        recommendation: 'Tiếp tục duy trì chế độ ăn uống và tập luyện hiện tại'
      };
    } else if (bmi >= thresholds.normal && bmi < thresholds.overweight) {
      return {
        category: 'Thừa cân',
        color: 'yellow',
        description: 'Bạn đang thừa cân nhẹ',
        recommendation: 'Nên giảm calo tiêu thụ và tăng cường vận động'
      };
    } else {
      return {
        category: 'Béo phì',
        color: 'red',
        description: 'Bạn đang ở mức báo động béo phì',
        recommendation: 'Cần giảm cân ngay lập tức, tham khảo ý kiến bác sĩ hoặc chuyên gia dinh dưỡng'
      };
    }
  },

  /**
   * Calculate ideal weight range based on height and standard
   * @param {number} height - Height in centimeters
   * @param {string} standard - 'WHO' or 'Asian'
   * @returns {Object} Min and max ideal weight
   */
  getIdealWeightRange(height, standard = 'WHO') {
    if (!height || height <= 0) {
      return { min: null, max: null };
    }
    const heightInMeters = height / 100;
    
    // Ideal BMI range based on standard
    let minBMI, maxBMI;
    if (standard === 'Asian') {
      minBMI = 18.5;
      maxBMI = 23;
    } else {
      minBMI = 18.5;
      maxBMI = 24.9;
    }
    
    const minWeight = minBMI * (heightInMeters * heightInMeters);
    const maxWeight = maxBMI * (heightInMeters * heightInMeters);
    return {
      min: Math.round(minWeight * 10) / 10,
      max: Math.round(maxWeight * 10) / 10
    };
  },

  /**
   * Calculate weight difference from ideal range
   * @param {number} weight - Current weight in kg
   * @param {number} height - Height in cm
   * @param {string} standard - 'WHO' or 'Asian'
   * @returns {Object} Weight difference information
   */
  getWeightDifference(weight, height, standard = 'WHO') {
    const idealRange = this.getIdealWeightRange(height, standard);
    if (!idealRange.min || !idealRange.max) {
      return { difference: null, message: '' };
    }

    let difference, message;
    
    if (weight < idealRange.min) {
      difference = idealRange.min - weight;
      message = `Cần tăng ${difference.toFixed(1)} kg để đạt cân nặng tối thiểu`;
    } else if (weight > idealRange.max) {
      difference = weight - idealRange.max;
      message = `Cần giảm ${difference.toFixed(1)} kg để đạt cân nặng tối đa`;
    } else {
      difference = 0;
      message = 'Cân nặng của bạn ở mức lý tưởng';
    }

    return { difference, message };
  },

  /**
   * Calculate distance to overweight threshold
   * @param {number} weight - Current weight in kg
   * @param {number} height - Height in cm
   * @param {string} standard - 'WHO' or 'Asian'
   * @returns {Object} Distance information
   */
  getDistanceToOverweight(weight, height, standard = 'WHO') {
    const heightInMeters = height / 100;
    
    // Overweight threshold BMI
    const overweightBMI = standard === 'Asian' ? 23 : 25;
    const overweightWeight = overweightBMI * (heightInMeters * heightInMeters);
    
    const distance = overweightWeight - weight;
    
    if (distance >= 0) {
      return {
        distance: Math.round(distance * 10) / 10,
        message: `Bạn có thể tăng thêm ${distance.toFixed(1)} kg trước khi vượt ngưỡng thừa cân`
      };
    } else {
      return {
        distance: Math.abs(Math.round(distance * 10) / 10),
        message: `Bạn đã vượt ngưỡng thừa cân ${Math.abs(distance).toFixed(1)} kg`
      };
    }
  },

  /**
   * Get BMI percentage position on a scale (0-100)
   * @param {number} bmi - BMI value
   * @returns {number} Position percentage
   */
  getBMIPosition(bmi) {
    if (bmi === null || isNaN(bmi)) return 0;
    
    // Scale from 15 to 40
    const minBMI = 15;
    const maxBMI = 40;
    
    let position = ((bmi - minBMI) / (maxBMI - minBMI)) * 100;
    return Math.max(0, Math.min(100, position));
  },

  /**
   * Get body visual type based on BMI and gender
   * @param {number} bmi - BMI value
   * @param {string} gender - 'male' or 'female'
   * @returns {string} Visual type identifier
   */
  getBodyVisualType(bmi, gender) {
    if (bmi === null || isNaN(bmi)) return 'normal';
    
    if (bmi < 18.5) return 'underweight';
    if (bmi >= 18.5 && bmi < 25) return 'normal';
    if (bmi >= 25 && bmi < 30) return 'overweight';
    return 'obese';
  }
};

// Expose to window for use in other modules
window.BMICalculator = BMICalculator;
