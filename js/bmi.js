/**
 * BMI Calculator Module
 * Calculates Body Mass Index and provides health recommendations
 */

const BMICalculator = {
  /**
   * Calculate BMI from weight (kg) and height (cm)
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
   * Get BMI category and color based on BMI value
   * @param {number} bmi - BMI value
   * @returns {Object} Category information
   */
  getBMICategory(bmi) {
    if (bmi === null || isNaN(bmi)) {
      return {
        category: 'Chưa tính',
        color: 'gray',
        description: 'Nhập cân nặng và chiều cao để tính BMI',
        recommendation: ''
      };
    }

    if (bmi < 18.5) {
      return {
        category: 'Gầy',
        color: 'orange',
        description: 'Bạn đang thiếu cân so với chiều cao',
        recommendation: 'Nên tăng cân bằng cách ăn nhiều calo, tập thể dục để tăng cơ bắp'
      };
    } else if (bmi >= 18.5 && bmi < 25) {
      return {
        category: 'Bình thường',
        color: 'green',
        description: 'Cân nặng của bạn ở mức lý tưởng',
        recommendation: 'Tiếp tục duy trì chế độ ăn uống và tập luyện hiện tại'
      };
    } else if (bmi >= 25 && bmi < 30) {
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
   * Calculate ideal weight range based on height
   * @param {number} height - Height in centimeters
   * @returns {Object} Min and max ideal weight
   */
  getIdealWeightRange(height) {
    if (!height || height <= 0) {
      return { min: null, max: null };
    }
    const heightInMeters = height / 100;
    // Ideal BMI range: 18.5 - 24.9
    const minWeight = 18.5 * (heightInMeters * heightInMeters);
    const maxWeight = 24.9 * (heightInMeters * heightInMeters);
    return {
      min: Math.round(minWeight * 10) / 10,
      max: Math.round(maxWeight * 10) / 10
    };
  },

  /**
   * Calculate weight difference from ideal range
   * @param {number} weight - Current weight in kg
   * @param {number} height - Height in cm
   * @returns {Object} Weight difference information
   */
  getWeightDifference(weight, height) {
    const idealRange = this.getIdealWeightRange(height);
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
  }
};

// Expose to window for use in other modules
window.BMICalculator = BMICalculator;
