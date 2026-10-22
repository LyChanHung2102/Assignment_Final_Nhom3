/**
 * FitVN Tracker - LocalStorage Service Module
 * Handles safe data persistence, schema validation, and seeding default state.
 */

const STORAGE_KEYS = {
  USER_PROFILE: 'fitvn_user_profile',
  FOOD_LOGS: 'fitvn_food_logs',
  WEIGHT_LOGS: 'fitvn_weight_logs',
  SETTINGS: 'fitvn_settings',
  CUSTOM_FOODS: 'fitvn_custom_foods',
  WATER_LOGS: 'fitvn_water_logs',
  AUTH_USER: 'fitvn_auth_user',
  USERS_LIST: 'fitvn_users_list'
};

const DEFAULT_PROFILE = {
  name: 'Gymer FitVN',
  gender: 'male',
  age: 24,
  height: 175, // cm
  currentWeight: 72.5, // kg
  targetWeight: 76.0, // kg
  activityLevel: 'moderate', // sedentary, light, moderate, active, very_active
  fitnessGoal: 'lean_bulk', // cut, maintain, lean_bulk
  targetCalories: 2600,
  macros: {
    protein: 165, // grams
    carbs: 325,   // grams
    fat: 72       // grams
  },
  waterTarget: 3000 // ml
};

// Seed initial logs for today
function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_FOOD_LOGS = [
  {
    id: 'seed-log-1',
    mealType: 'breakfast',
    foodId: 'gym-07',
    name: 'Yến mạch + Chuối tiêu',
    calories: 320,
    protein: 14.5,
    carbs: 58.0,
    fat: 4.5,
    servingQty: 1,
    time: '07:30',
    date: getTodayDateString()
  },
  {
    id: 'seed-log-2',
    mealType: 'breakfast',
    foodId: 'bc-01',
    name: 'Whey Gold Standard 100%',
    calories: 120,
    protein: 24.0,
    carbs: 3.0,
    fat: 1.5,
    servingQty: 1,
    time: '07:45',
    date: getTodayDateString()
  },
  {
    id: 'seed-log-3',
    mealType: 'lunch',
    foodId: 'vn-01',
    name: 'Cơm tấm sườn bì chả',
    calories: 765,
    protein: 34.5,
    carbs: 88.0,
    fat: 30.2,
    servingQty: 1,
    time: '12:15',
    date: getTodayDateString()
  },
  {
    id: 'seed-log-4',
    mealType: 'snack',
    foodId: 'bc-04',
    name: 'Sữa chua Hy Lạp Vinamilk',
    calories: 95,
    protein: 7.0,
    carbs: 8.5,
    fat: 3.6,
    servingQty: 1,
    time: '16:00',
    date: getTodayDateString()
  }
];

const DEFAULT_SETTINGS = {
  theme: 'dark',
  unitSystem: 'metric',
  remindersEnabled: true
};

const storageService = {
  /**
   * Safe getter from LocalStorage
   * @param {string} key 
   * @param {*} defaultValue 
   * @returns {*}
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`[storageService] Error reading key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Safe setter to LocalStorage
   * @param {string} key 
   * @param {*} value 
   * @returns {boolean}
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[storageService] Error writing key "${key}":`, error);
      return false;
    }
  },

  /**
   * Remove item from LocalStorage
   * @param {string} key 
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[storageService] Error removing key "${key}":`, error);
    }
  },

  /**
   * Initialize LocalStorage with starter seed data if not already present
   */
  initStorage() {
    if (!this.get(STORAGE_KEYS.USER_PROFILE)) {
      this.set(STORAGE_KEYS.USER_PROFILE, DEFAULT_PROFILE);
    }
    if (!this.get(STORAGE_KEYS.FOOD_LOGS)) {
      this.set(STORAGE_KEYS.FOOD_LOGS, DEFAULT_FOOD_LOGS);
    }
    // Initialize empty weight logs array (no default data since it's user-specific)
    if (!this.get(STORAGE_KEYS.WEIGHT_LOGS)) {
      this.set(STORAGE_KEYS.WEIGHT_LOGS, []);
    }
    if (!this.get(STORAGE_KEYS.SETTINGS)) {
      this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!this.get(STORAGE_KEYS.CUSTOM_FOODS)) {
      this.set(STORAGE_KEYS.CUSTOM_FOODS, []);
    }
  },

  /**
   * Get all food items (Built-in + Custom created)
   */
  getAllFoods() {
    const builtinFoods = window.VIETNAMESE_FOOD_DATABASE || [];
    const customFoods = this.get(STORAGE_KEYS.CUSTOM_FOODS, []);
    return [...builtinFoods, ...customFoods];
  },

  /**
   * Find food by Barcode
   * @param {string} barcode 
   */
  findFoodByBarcode(barcode) {
    if (!barcode) return null;
    const cleanBarcode = barcode.trim();
    const allFoods = this.getAllFoods();
    return allFoods.find(food => food.barcode === cleanBarcode) || null;
  },

  /**
   * Get food logs, optionally filtered by date
   * @param {string} dateString 'YYYY-MM-DD'
   * @returns {Array}
   */
  getFoodLogs(dateString = null) {
    const logs = this.get(STORAGE_KEYS.FOOD_LOGS, []);
    if (!dateString) return logs;
    return logs.filter(log => log.date === dateString);
  },

  /**
   * Add a new food entry
   * @param {Object} entry 
   * @returns {Object} savedEntry
   */
  addFoodLog(entry) {
    const logs = this.get(STORAGE_KEYS.FOOD_LOGS, []);
    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      mealType: entry.mealType || 'breakfast',
      foodId: entry.foodId || null,
      name: entry.name || 'Món ăn',
      calories: Math.round(Number(entry.calories) || 0),
      protein: parseFloat((Number(entry.protein) || 0).toFixed(1)),
      carbs: parseFloat((Number(entry.carbs) || 0).toFixed(1)),
      fat: parseFloat((Number(entry.fat) || 0).toFixed(1)),
      servingQty: entry.servingQty || 1,
      time: entry.time || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      date: entry.date || getTodayDateString()
    };
    logs.unshift(newLog);
    this.set(STORAGE_KEYS.FOOD_LOGS, logs);
    return newLog;
  },

  /**
   * Remove a food entry by ID
   * @param {string} logId 
   * @returns {boolean}
   */
  removeFoodLog(logId) {
    const logs = this.get(STORAGE_KEYS.FOOD_LOGS, []);
    const filteredLogs = logs.filter(log => log.id !== logId);
    this.set(STORAGE_KEYS.FOOD_LOGS, filteredLogs);
    return filteredLogs.length < logs.length;
  },

  /**
   * Calculate daily nutrient totals using Array.reduce
   * @param {string} dateString 
   * @returns {Object} totals { calories, protein, carbs, fat, count }
   */
  calculateDayTotals(dateString = null) {
    const targetDate = dateString || getTodayDateString();
    const dayLogs = this.getFoodLogs(targetDate);

    return dayLogs.reduce((acc, log) => {
      acc.calories += (Number(log.calories) || 0);
      acc.protein += (Number(log.protein) || 0);
      acc.carbs += (Number(log.carbs) || 0);
      acc.fat += (Number(log.fat) || 0);
      acc.count += 1;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 });
  },

  /**
   * WEIGHT & BODY METRICS METHODS
   */
  getWeightLogs() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return [];
    }

    const allLogs = this.get(STORAGE_KEYS.WEIGHT_LOGS, []);
    // Filter logs for current user only
    const userLogs = allLogs.filter(log => log.userId === currentUser.email);
    // Ensure chronological sort
    return userLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  /**
   * Add or update weight log for a specific date
   * @param {Object} entry { date, weight, bodyFat, note, measurements }
   */
  addWeightLog(entry) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      console.warn('Cannot add weight log: No user logged in');
      return null;
    }

    const allLogs = this.get(STORAGE_KEYS.WEIGHT_LOGS, []);
    const cleanDate = entry.date || getTodayDateString();
    const cleanWeight = parseFloat(Number(entry.weight).toFixed(1));
    const cleanBodyFat = entry.bodyFat ? parseFloat(Number(entry.bodyFat).toFixed(1)) : null;

    // Check if entry for date exists for this user
    const existingIndex = allLogs.findIndex(log => log.date === cleanDate && log.userId === currentUser.email);

    const newEntry = {
      id: existingIndex >= 0 ? allLogs[existingIndex].id : `wt-${Date.now()}`,
      userId: currentUser.email,
      date: cleanDate,
      weight: cleanWeight,
      bodyFat: cleanBodyFat,
      note: entry.note || '',
      measurements: entry.measurements || null
    };

    if (existingIndex >= 0) {
      allLogs[existingIndex] = newEntry;
    } else {
      allLogs.push(newEntry);
    }

    allLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
    this.set(STORAGE_KEYS.WEIGHT_LOGS, allLogs);

    // Update current weight in user profile
    const profile = this.get(STORAGE_KEYS.USER_PROFILE, {});
    profile.currentWeight = cleanWeight;
    this.set(STORAGE_KEYS.USER_PROFILE, profile);

    return newEntry;
  },

  removeWeightLog(logId) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      console.warn('Cannot remove weight log: No user logged in');
      return false;
    }

    const allLogs = this.get(STORAGE_KEYS.WEIGHT_LOGS, []);
    const filtered = allLogs.filter(log => log.id !== logId || log.userId !== currentUser.email);
    this.set(STORAGE_KEYS.WEIGHT_LOGS, filtered);
    return filtered.length < allLogs.length;
  },

  getLatestWeight() {
    const logs = this.getWeightLogs();
    if (logs.length === 0) return null;
    return logs[logs.length - 1];
  },

  /**
   * WATER LOGGING METHODS
   */
  getWater(dateString = null) {
    const date = dateString || getTodayDateString();
    const waterData = this.get(STORAGE_KEYS.WATER_LOGS, {});
    if (waterData && typeof waterData[date] !== 'undefined') {
      return Math.max(0, Number(waterData[date]) || 0);
    }
    return 1750; // default seed for fresh demo
  },

  addWater(amount, dateString = null) {
    const date = dateString || getTodayDateString();
    const waterData = this.get(STORAGE_KEYS.WATER_LOGS, {});
    const current = this.getWater(date);
    const updated = Math.max(0, current + amount);
    waterData[date] = updated;
    this.set(STORAGE_KEYS.WATER_LOGS, waterData);
    return updated;
  },

  resetWater(dateString = null) {
    const date = dateString || getTodayDateString();
    const waterData = this.get(STORAGE_KEYS.WATER_LOGS, {});
    waterData[date] = 0;
    this.set(STORAGE_KEYS.WATER_LOGS, waterData);
    return 0;
  },

  /**
   * AUTHENTICATION & USER MANAGEMENT
   */
  getUsers() {
    return this.get(STORAGE_KEYS.USERS_LIST, []);
  },

  registerUser(userData) {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      return { success: false, message: 'Email này đã được đăng ký trên hệ thống!' };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      gender: userData.gender || 'male',
      age: Number(userData.age) || 24,
      height: Number(userData.height) || 175,
      weight: Number(userData.weight) || 70,
      fitnessGoal: userData.fitnessGoal || 'maintain',
      registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    this.set(STORAGE_KEYS.USERS_LIST, users);
    
    // Set active session & sync profile
    this.setCurrentUser(newUser);
    this.syncUserProfile(newUser);

    return { success: true, user: newUser };
  },

  loginUser(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
    if (!user) {
      return { success: false, message: 'Email hoặc mật khẩu không chính xác!' };
    }

    this.setCurrentUser(user);
    this.syncUserProfile(user);
    return { success: true, user };
  },

  getCurrentUser() {
    return this.get(STORAGE_KEYS.AUTH_USER, null);
  },

  setCurrentUser(user) {
    const safeUser = { ...user };
    delete safeUser.password;
    this.set(STORAGE_KEYS.AUTH_USER, safeUser);
  },

  logoutUser() {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      return true;
    } catch (e) {
      return false;
    }
  },

  syncUserProfile(user) {
    const profile = this.get(STORAGE_KEYS.USER_PROFILE, DEFAULT_PROFILE);
    profile.name = user.name;
    profile.email = user.email;
    if (user.age) profile.age = user.age;
    if (user.height) profile.height = user.height;
    if (user.weight) {
      profile.currentWeight = user.weight;
      // also record initial weight if no weight logs exist yet for this user
      const weightLogs = this.getWeightLogs();
      if (weightLogs.length === 0) {
        this.addWeightLog({ date: getTodayDateString(), weight: user.weight, note: 'Khởi tạo tài khoản' });
      }
    }
    if (user.gender) profile.gender = user.gender;
    if (user.fitnessGoal) profile.fitnessGoal = user.fitnessGoal;

    // Estimate target calories
    if (window.calcService && typeof window.calcService.calculateTDEE === 'function') {
      const bmr = window.calcService.calculateBMR(profile.currentWeight, profile.height, profile.age, profile.gender);
      const tdee = window.calcService.calculateTDEE(bmr, 'moderate');
      if (profile.fitnessGoal === 'cut') profile.targetCalories = Math.round(tdee - 500);
      else if (profile.fitnessGoal === 'lean_bulk') profile.targetCalories = Math.round(tdee + 300);
      else profile.targetCalories = Math.round(tdee);
    }

    this.set(STORAGE_KEYS.USER_PROFILE, profile);
  },

  /**
   * DATA BACKUP & RESTORE METHODS
   */
  exportBackupData() {
    const backupSnapshot = {
      app: 'FitVN Tracker',
      version: '1.2',
      exportedAt: new Date().toISOString(),
      data: {
        [STORAGE_KEYS.USER_PROFILE]: this.get(STORAGE_KEYS.USER_PROFILE),
        [STORAGE_KEYS.FOOD_LOGS]: this.get(STORAGE_KEYS.FOOD_LOGS),
        [STORAGE_KEYS.WEIGHT_LOGS]: this.get(STORAGE_KEYS.WEIGHT_LOGS),
        [STORAGE_KEYS.WATER_LOGS]: this.get(STORAGE_KEYS.WATER_LOGS),
        [STORAGE_KEYS.SETTINGS]: this.get(STORAGE_KEYS.SETTINGS),
        [STORAGE_KEYS.CUSTOM_FOODS]: this.get(STORAGE_KEYS.CUSTOM_FOODS),
        [STORAGE_KEYS.USERS_LIST]: this.get(STORAGE_KEYS.USERS_LIST),
        [STORAGE_KEYS.AUTH_USER]: this.get(STORAGE_KEYS.AUTH_USER)
      }
    };
    return JSON.stringify(backupSnapshot, null, 2);
  },

  validateBackupData(jsonObj) {
    if (!jsonObj || typeof jsonObj !== 'object') {
      return { valid: false, message: 'Dữ liệu không phải là đối tượng JSON hợp lệ.' };
    }
    if (jsonObj.app !== 'FitVN Tracker') {
      return { valid: false, message: 'File không phải là bản sao lưu của ứng dụng FitVN Tracker.' };
    }
    if (!jsonObj.data || typeof jsonObj.data !== 'object') {
      return { valid: false, message: 'File thiếu phần dữ liệu cốt lõi (data).' };
    }
    return { valid: true };
  },

  importBackupData(jsonObj, isMerge = false) {
    const validation = this.validateBackupData(jsonObj);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    try {
      const data = jsonObj.data;

      if (!isMerge) {
        // Complete overwrite
        if (data[STORAGE_KEYS.USER_PROFILE]) this.set(STORAGE_KEYS.USER_PROFILE, data[STORAGE_KEYS.USER_PROFILE]);
        if (data[STORAGE_KEYS.FOOD_LOGS]) this.set(STORAGE_KEYS.FOOD_LOGS, data[STORAGE_KEYS.FOOD_LOGS]);
        if (data[STORAGE_KEYS.WEIGHT_LOGS]) this.set(STORAGE_KEYS.WEIGHT_LOGS, data[STORAGE_KEYS.WEIGHT_LOGS]);
        if (data[STORAGE_KEYS.WATER_LOGS]) this.set(STORAGE_KEYS.WATER_LOGS, data[STORAGE_KEYS.WATER_LOGS]);
        if (data[STORAGE_KEYS.SETTINGS]) this.set(STORAGE_KEYS.SETTINGS, data[STORAGE_KEYS.SETTINGS]);
        if (data[STORAGE_KEYS.CUSTOM_FOODS]) this.set(STORAGE_KEYS.CUSTOM_FOODS, data[STORAGE_KEYS.CUSTOM_FOODS]);
        if (data[STORAGE_KEYS.USERS_LIST]) this.set(STORAGE_KEYS.USERS_LIST, data[STORAGE_KEYS.USERS_LIST]);
        if (data[STORAGE_KEYS.AUTH_USER]) this.set(STORAGE_KEYS.AUTH_USER, data[STORAGE_KEYS.AUTH_USER]);
      } else {
        // Smart merge lists
        if (data[STORAGE_KEYS.FOOD_LOGS] && Array.isArray(data[STORAGE_KEYS.FOOD_LOGS])) {
          const currentLogs = this.get(STORAGE_KEYS.FOOD_LOGS, []);
          const existingIds = new Set(currentLogs.map(item => item.id));
          const newItems = data[STORAGE_KEYS.FOOD_LOGS].filter(item => !existingIds.has(item.id));
          this.set(STORAGE_KEYS.FOOD_LOGS, [...newItems, ...currentLogs]);
        }
        if (data[STORAGE_KEYS.WEIGHT_LOGS] && Array.isArray(data[STORAGE_KEYS.WEIGHT_LOGS])) {
          const currentWeights = this.get(STORAGE_KEYS.WEIGHT_LOGS, []);
          const existingDates = new Set(currentWeights.map(w => w.date));
          const newWeights = data[STORAGE_KEYS.WEIGHT_LOGS].filter(w => !existingDates.has(w.date));
          const merged = [...currentWeights, ...newWeights].sort((a, b) => new Date(a.date) - new Date(b.date));
          this.set(STORAGE_KEYS.WEIGHT_LOGS, merged);
        }
        if (data[STORAGE_KEYS.USER_PROFILE]) {
          this.set(STORAGE_KEYS.USER_PROFILE, { ...this.get(STORAGE_KEYS.USER_PROFILE, {}), ...data[STORAGE_KEYS.USER_PROFILE] });
        }
      }

      return { success: true, message: 'Khôi phục dữ liệu sao lưu thành công!' };
    } catch (error) {
      console.error('[storageService] importBackupData error:', error);
      return { success: false, message: 'Lỗi trong quá trình ghi dữ liệu: ' + error.message };
    }
  },

  resetToDefaultData() {
    try {
      this.set(STORAGE_KEYS.USER_PROFILE, DEFAULT_PROFILE);
      this.set(STORAGE_KEYS.FOOD_LOGS, DEFAULT_FOOD_LOGS);
      this.set(STORAGE_KEYS.WEIGHT_LOGS, DEFAULT_WEIGHT_LOGS);
      this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      this.set(STORAGE_KEYS.CUSTOM_FOODS, []);
      this.set(STORAGE_KEYS.WATER_LOGS, {});
      return { success: true, message: 'Đã khôi phục toàn bộ dữ liệu mẫu ban đầu!' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// Expose globally
window.storageService = storageService;
window.STORAGE_KEYS = STORAGE_KEYS;
window.getTodayDateString = getTodayDateString;
