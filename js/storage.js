const STORAGE_KEYS = {
  USER_PROFILE: 'fitvn_user_profile',
  FOOD_LOGS: 'fitvn_food_logs',
  WEIGHT_LOGS: 'fitvn_weight_logs',
  WORKOUT_LOGS: 'fitvn_workout_logs',
  SETTINGS: 'fitvn_settings',
  CUSTOM_FOODS: 'fitvn_custom_foods',
  WATER_LOGS: 'fitvn_water_logs',
  AUTH_USER: 'fitvn_auth_user',
  USERS_LIST: 'fitvn_users_list',
  REDIRECT_AFTER_LOGIN: 'fitvn_redirect_url'
};

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function hashPassword(plainText) {
  if (!plainText) return '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(plainText);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return fallbackHash(plainText);
    }
  }
  return fallbackHash(plainText);
}

function fallbackHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
}

const storageService = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`[storageService] Error reading key "${key}":`, error);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[storageService] Error writing key "${key}":`, error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[storageService] Error removing key "${key}":`, error);
    }
  },

  initStorage() {
    if (!this.get(STORAGE_KEYS.USERS_LIST)) {
      this.set(STORAGE_KEYS.USERS_LIST, []);
    }
    if (!this.get(STORAGE_KEYS.FOOD_LOGS)) {
      this.set(STORAGE_KEYS.FOOD_LOGS, []);
    }
    if (!this.get(STORAGE_KEYS.WEIGHT_LOGS)) {
      this.set(STORAGE_KEYS.WEIGHT_LOGS, []);
    }
    if (!this.get(STORAGE_KEYS.WORKOUT_LOGS)) {
      this.set(STORAGE_KEYS.WORKOUT_LOGS, []);
    }
    if (!this.get(STORAGE_KEYS.CUSTOM_FOODS)) {
      this.set(STORAGE_KEYS.CUSTOM_FOODS, []);
    }
    if (!this.get(STORAGE_KEYS.WATER_LOGS)) {
      this.set(STORAGE_KEYS.WATER_LOGS, {});
    }
  },

  getCurrentUser() {
    return this.get(STORAGE_KEYS.AUTH_USER, null);
  },

  setCurrentUser(user) {
    if (!user) {
      this.remove(STORAGE_KEYS.AUTH_USER);
      return;
    }
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      age: user.age,
      height: user.height,
      weight: user.weight,
      fitnessGoal: user.fitnessGoal,
      registeredAt: user.registeredAt
    };
    this.set(STORAGE_KEYS.AUTH_USER, safeUser);
  },

  hasActiveSession() {
    const user = this.getCurrentUser();
    return !!(user && user.id && user.email);
  },

  logoutUser() {
    try {
      this.remove(STORAGE_KEYS.AUTH_USER);
      return true;
    } catch (e) {
      return false;
    }
  },

  getUsers() {
    return this.get(STORAGE_KEYS.USERS_LIST, []);
  },

  async registerUser(userData) {
    const users = this.getUsers();
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: 'Email này đã được đăng ký trên hệ thống!' };
    }

    const hashedPwd = await hashPassword(userData.password);

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: (userData.name || '').trim(),
      email: cleanEmail,
      passwordHash: hashedPwd,
      gender: userData.gender || 'male',
      age: Number(userData.age) || null,
      height: Number(userData.height) || null,
      weight: Number(userData.weight) || null,
      fitnessGoal: userData.fitnessGoal || 'maintain',
      registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    this.set(STORAGE_KEYS.USERS_LIST, users);

    this.setCurrentUser(newUser);

    const initialProfile = {
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      gender: newUser.gender,
      age: newUser.age,
      height: newUser.height,
      currentWeight: newUser.weight,
      targetWeight: userData.targetWeight ? Number(userData.targetWeight) : newUser.weight,
      activityLevel: userData.activityLevel || 'moderate',
      fitnessGoal: newUser.fitnessGoal,
      targetCalories: userData.targetCalories ? Number(userData.targetCalories) : 2000,
      macros: {
        protein: Math.round(((userData.targetCalories || 2000) * 0.3) / 4),
        carbs: Math.round(((userData.targetCalories || 2000) * 0.45) / 4),
        fat: Math.round(((userData.targetCalories || 2000) * 0.25) / 9)
      },
      waterTarget: 2500
    };

    if (typeof window !== 'undefined' && window.calcService && typeof window.calcService.calculateTDEE === 'function' && initialProfile.currentWeight && initialProfile.height && initialProfile.age) {
      const bmr = window.calcService.calculateBMR(initialProfile.currentWeight, initialProfile.height, initialProfile.age, initialProfile.gender);
      const tdee = window.calcService.calculateTDEE(bmr, initialProfile.activityLevel || 'moderate');
      if (initialProfile.fitnessGoal === 'cut') initialProfile.targetCalories = Math.round(tdee - 500);
      else if (initialProfile.fitnessGoal === 'lean_bulk') initialProfile.targetCalories = Math.round(tdee + 300);
      else initialProfile.targetCalories = Math.round(tdee);
      initialProfile.macros = {
        protein: Math.round((initialProfile.targetCalories * 0.3) / 4),
        carbs: Math.round((initialProfile.targetCalories * 0.45) / 4),
        fat: Math.round((initialProfile.targetCalories * 0.25) / 9)
      };
    }

    this.setUserProfile(initialProfile);

    if (newUser.weight && newUser.weight > 0) {
      this.addWeightLog({
        date: getTodayDateString(),
        weight: newUser.weight,
        bodyFat: null,
        note: 'Cân nặng ban đầu khi đăng ký'
      });
    }

    return { success: true, user: newUser };
  },

  async loginUser(email, password) {
    const users = this.getUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    const hashedPwd = await hashPassword(password);

    const user = users.find(u => {
      const matchesEmail = u.email.toLowerCase() === cleanEmail;
      const matchesPwd = u.passwordHash ? (u.passwordHash === hashedPwd) : (u.password === password);
      return matchesEmail && matchesPwd;
    });

    if (!user) {
      return { success: false, message: 'Email hoặc mật khẩu không chính xác!' };
    }

    if (!user.passwordHash) {
      user.passwordHash = hashedPwd;
      delete user.password;
      this.set(STORAGE_KEYS.USERS_LIST, users);
    }

    this.setCurrentUser(user);

    let profile = this.getUserProfile();
    if (!profile || !profile.name) {
      this.setUserProfile({
        userId: user.id,
        name: user.name,
        email: user.email,
        gender: user.gender || 'male',
        age: user.age || null,
        height: user.height || null,
        currentWeight: user.weight || null,
        targetWeight: user.weight || null,
        activityLevel: 'moderate',
        fitnessGoal: user.fitnessGoal || 'maintain',
        targetCalories: 2000,
        macros: { protein: 150, carbs: 225, fat: 55 },
        waterTarget: 2500
      });
    }

    return { success: true, user };
  },

  getUserProfile() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;
    const allProfiles = this.get(STORAGE_KEYS.USER_PROFILE, {});
    return allProfiles[currentUser.id] || {
      userId: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      gender: currentUser.gender || 'male',
      age: currentUser.age || null,
      height: currentUser.height || null,
      currentWeight: currentUser.weight || null,
      targetWeight: currentUser.weight || null,
      activityLevel: 'moderate',
      fitnessGoal: currentUser.fitnessGoal || 'maintain',
      targetCalories: 2000,
      macros: { protein: 150, carbs: 225, fat: 55 },
      waterTarget: 2500
    };
  },

  setUserProfile(profileData) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;
    const allProfiles = this.get(STORAGE_KEYS.USER_PROFILE, {});
    const updated = {
      ...(allProfiles[currentUser.id] || {}),
      ...profileData,
      userId: currentUser.id
    };
    allProfiles[currentUser.id] = updated;
    this.set(STORAGE_KEYS.USER_PROFILE, allProfiles);

    if (profileData.name && profileData.name !== currentUser.name) {
      currentUser.name = profileData.name;
      this.setCurrentUser(currentUser);
      const users = this.getUsers();
      const uIdx = users.findIndex(u => u.id === currentUser.id);
      if (uIdx !== -1) {
        users[uIdx].name = profileData.name;
        this.set(STORAGE_KEYS.USERS_LIST, users);
      }
    }
    return true;
  },

  getAllFoods() {
    const builtinFoods = window.VIETNAMESE_FOOD_DATABASE || [];
    const customFoods = this.get(STORAGE_KEYS.CUSTOM_FOODS, []);
    return [...builtinFoods, ...customFoods];
  },

  findFoodByBarcode(barcode) {
    if (!barcode) return null;
    const cleanBarcode = barcode.trim();
    const allFoods = this.getAllFoods();
    return allFoods.find(food => food.barcode === cleanBarcode) || null;
  },

  getFoodLogs(dateString = null) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];
    const allLogs = this.get(STORAGE_KEYS.FOOD_LOGS, []);
    const userLogs = allLogs.filter(log => log.userId === currentUser.id);
    if (!dateString) return userLogs;
    return userLogs.filter(log => {
      const logDate = log.date || getTodayDateString();
      return logDate === dateString;
    });
  },

  addFoodLog(entry) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;
    const allLogs = this.get(STORAGE_KEYS.FOOD_LOGS, []);
    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: currentUser.id,
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
    allLogs.unshift(newLog);
    this.set(STORAGE_KEYS.FOOD_LOGS, allLogs);
    return newLog;
  },

  removeFoodLog(logId) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;
    const allLogs = this.get(STORAGE_KEYS.FOOD_LOGS, []);
    const filtered = allLogs.filter(log => !(log.id === logId && log.userId === currentUser.id));
    this.set(STORAGE_KEYS.FOOD_LOGS, filtered);
    return filtered.length < allLogs.length;
  },

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

  getWeightLogs() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];
    const allLogs = this.get(STORAGE_KEYS.WEIGHT_LOGS, []);
    const userLogs = allLogs.filter(log => log.userId === currentUser.id || log.userId === currentUser.email);
    return userLogs.sort((a, b) => new Date(a.date) - new Date(b.date));
  },

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

    const existingIndex = allLogs.findIndex(log => log.date === cleanDate && (log.userId === currentUser.id || log.userId === currentUser.email));

    const newEntry = {
      id: existingIndex >= 0 ? allLogs[existingIndex].id : `wt-${Date.now()}`,
      userId: currentUser.id,
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

    const profile = this.getUserProfile();
    if (profile) {
      profile.currentWeight = cleanWeight;
      this.setUserProfile(profile);
    }

    return newEntry;
  },

  removeWeightLog(logId) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;
    const allLogs = this.get(STORAGE_KEYS.WEIGHT_LOGS, []);
    const filtered = allLogs.filter(log => !(log.id === logId && (log.userId === currentUser.id || log.userId === currentUser.email)));
    this.set(STORAGE_KEYS.WEIGHT_LOGS, filtered);
    return filtered.length < allLogs.length;
  },

  getLatestWeight() {
    const logs = this.getWeightLogs();
    if (logs.length === 0) return null;
    return logs[logs.length - 1];
  },

  getWater(dateString = null) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return 0;
    const date = dateString || getTodayDateString();
    const waterData = this.get(STORAGE_KEYS.WATER_LOGS, {});
    const userWater = waterData[currentUser.id] || {};
    if (typeof userWater[date] !== 'undefined') {
      return Math.max(0, Number(userWater[date]) || 0);
    }
    return 0;
  },

  addWater(amount, dateString = null) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return 0;
    const date = dateString || getTodayDateString();
    const waterData = this.get(STORAGE_KEYS.WATER_LOGS, {});
    if (!waterData[currentUser.id]) {
      waterData[currentUser.id] = {};
    }
    const current = Math.max(0, Number(waterData[currentUser.id][date]) || 0);
    const updated = Math.max(0, current + amount);
    waterData[currentUser.id][date] = updated;
    this.set(STORAGE_KEYS.WATER_LOGS, waterData);
    return updated;
  },

  resetWater(dateString = null) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return 0;
    const date = dateString || getTodayDateString();
    const waterData = this.get(STORAGE_KEYS.WATER_LOGS, {});
    if (!waterData[currentUser.id]) {
      waterData[currentUser.id] = {};
    }
    waterData[currentUser.id][date] = 0;
    this.set(STORAGE_KEYS.WATER_LOGS, waterData);
    return 0;
  },

  getWorkoutLogs() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];
    const allLogs = this.get(STORAGE_KEYS.WORKOUT_LOGS, []);
    return allLogs.filter(log => log.userId === currentUser.id);
  },

  addWorkoutLog(workoutData) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;
    const allLogs = this.get(STORAGE_KEYS.WORKOUT_LOGS, []);
    const nowIso = new Date().toISOString();

    const newLog = {
      id: workoutData.id || `wo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: currentUser.id,
      title: (workoutData.title || '').trim() || 'Buổi tập luyện',
      activityType: workoutData.activityType || 'gym',
      workoutDate: workoutData.workoutDate || getTodayDateString(),
      startTime: workoutData.startTime || '',
      endTime: workoutData.endTime || '',
      durationMinutes: Math.max(1, parseInt(workoutData.durationMinutes, 10) || 30),
      intensity: workoutData.intensity || 'medium',
      distanceKm: workoutData.distanceKm !== null && workoutData.distanceKm !== '' ? parseFloat(Number(workoutData.distanceKm).toFixed(2)) : null,
      steps: workoutData.steps ? parseInt(workoutData.steps, 10) : null,
      notes: (workoutData.notes || '').trim(),
      feeling: workoutData.feeling || 'good',
      createdAt: workoutData.createdAt || nowIso,
      updatedAt: nowIso
    };

    allLogs.unshift(newLog);
    this.set(STORAGE_KEYS.WORKOUT_LOGS, allLogs);
    return newLog;
  },

  updateWorkoutLog(id, updatedData) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;
    const allLogs = this.get(STORAGE_KEYS.WORKOUT_LOGS, []);
    const index = allLogs.findIndex(item => item.id === id && item.userId === currentUser.id);
    if (index === -1) return null;

    const existing = allLogs[index];
    const nowIso = new Date().toISOString();

    const updated = {
      ...existing,
      ...updatedData,
      id: existing.id,
      userId: currentUser.id,
      durationMinutes: Math.max(1, parseInt(updatedData.durationMinutes, 10) || existing.durationMinutes),
      distanceKm: updatedData.distanceKm !== null && updatedData.distanceKm !== '' ? parseFloat(Number(updatedData.distanceKm).toFixed(2)) : null,
      steps: updatedData.steps ? parseInt(updatedData.steps, 10) : null,
      updatedAt: nowIso
    };

    allLogs[index] = updated;
    this.set(STORAGE_KEYS.WORKOUT_LOGS, allLogs);
    return updated;
  },

  deleteWorkoutLog(id) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;
    const allLogs = this.get(STORAGE_KEYS.WORKOUT_LOGS, []);
    const filtered = allLogs.filter(item => !(item.id === id && item.userId === currentUser.id));
    if (filtered.length !== allLogs.length) {
      this.set(STORAGE_KEYS.WORKOUT_LOGS, filtered);
      return true;
    }
    return false;
  },

  exportBackupData() {
    const currentUser = this.getCurrentUser();
    const backupSnapshot = {
      app: 'FitVN Tracker',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      currentUser: currentUser ? currentUser.email : null,
      data: {
        profile: this.getUserProfile(),
        foodLogs: this.getFoodLogs(),
        weightLogs: this.getWeightLogs(),
        workoutLogs: this.getWorkoutLogs(),
        water: currentUser ? (this.get(STORAGE_KEYS.WATER_LOGS, {})[currentUser.id] || {}) : {}
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

    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'Vui lòng đăng nhập trước khi khôi phục dữ liệu!' };
    }

    try {
      const data = jsonObj.data;
      if (data.profile) {
        this.setUserProfile(data.profile);
      }
      if (data.foodLogs && Array.isArray(data.foodLogs)) {
        const allFood = this.get(STORAGE_KEYS.FOOD_LOGS, []).filter(l => l.userId !== currentUser.id);
        const importedFood = data.foodLogs.map(l => ({ ...l, userId: currentUser.id }));
        this.set(STORAGE_KEYS.FOOD_LOGS, [...importedFood, ...allFood]);
      }
      if (data.weightLogs && Array.isArray(data.weightLogs)) {
        const allWeight = this.get(STORAGE_KEYS.WEIGHT_LOGS, []).filter(l => l.userId !== currentUser.id && l.userId !== currentUser.email);
        const importedWeight = data.weightLogs.map(l => ({ ...l, userId: currentUser.id }));
        this.set(STORAGE_KEYS.WEIGHT_LOGS, [...importedWeight, ...allWeight]);
      }
      if (data.workoutLogs && Array.isArray(data.workoutLogs)) {
        const allWorkout = this.get(STORAGE_KEYS.WORKOUT_LOGS, []).filter(l => l.userId !== currentUser.id);
        const importedWorkout = data.workoutLogs.map(l => ({ ...l, userId: currentUser.id }));
        this.set(STORAGE_KEYS.WORKOUT_LOGS, [...importedWorkout, ...allWorkout]);
      }
      if (data.water) {
        const allWater = this.get(STORAGE_KEYS.WATER_LOGS, {});
        allWater[currentUser.id] = data.water;
        this.set(STORAGE_KEYS.WATER_LOGS, allWater);
      }
      return { success: true, message: 'Khôi phục dữ liệu thành công!' };
    } catch (error) {
      return { success: false, message: 'Lỗi trong quá trình ghi dữ liệu: ' + error.message };
    }
  },

  resetUserData() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, message: 'Chưa đăng nhập!' };
    try {
      const allFood = this.get(STORAGE_KEYS.FOOD_LOGS, []).filter(l => l.userId !== currentUser.id);
      this.set(STORAGE_KEYS.FOOD_LOGS, allFood);

      const allWeight = this.get(STORAGE_KEYS.WEIGHT_LOGS, []).filter(l => l.userId !== currentUser.id && l.userId !== currentUser.email);
      this.set(STORAGE_KEYS.WEIGHT_LOGS, allWeight);

      const allWorkout = this.get(STORAGE_KEYS.WORKOUT_LOGS, []).filter(l => l.userId !== currentUser.id);
      this.set(STORAGE_KEYS.WORKOUT_LOGS, allWorkout);

      const allWater = this.get(STORAGE_KEYS.WATER_LOGS, {});
      delete allWater[currentUser.id];
      this.set(STORAGE_KEYS.WATER_LOGS, allWater);

      return { success: true, message: 'Đã xóa toàn bộ dữ liệu nhật ký của tài khoản hiện tại!' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

if (typeof window !== 'undefined') {
  window.storageService = storageService;
  window.STORAGE_KEYS = STORAGE_KEYS;
  window.getTodayDateString = getTodayDateString;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { storageService, STORAGE_KEYS, getTodayDateString };
}
