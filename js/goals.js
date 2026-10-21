/**
 * FitVN Tracker - Fitness Goals Management Module
 * Handles Goal CRUD, Real-time Progress calculations, Modals and Quick Weight Updates
 */

const GoalsModule = {
  activeGoal: null,
  goalsList: [],

  init() {
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    // Open create goal modal
    const btnNewGoal = document.getElementById('btn-new-goal');
    if (btnNewGoal) {
      btnNewGoal.addEventListener('click', () => this.openGoalModal());
    }

    // Modal close events
    const btnCloseModal = document.getElementById('btn-close-goal-modal');
    const btnCancelModal = document.getElementById('btn-cancel-goal-modal');
    const modalBackdrop = document.getElementById('modal-goal');

    if (btnCloseModal) btnCloseModal.addEventListener('click', () => this.closeGoalModal());
    if (btnCancelModal) btnCancelModal.addEventListener('click', () => this.closeGoalModal());
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) this.closeGoalModal();
      });
    }

    // Quick weight update modal events
    const btnCloseWeightModal = document.getElementById('btn-close-quick-weight-modal');
    const btnCancelWeightModal = document.getElementById('btn-cancel-quick-weight');
    const modalQuickWeight = document.getElementById('modal-quick-weight');

    if (btnCloseWeightModal) btnCloseWeightModal.addEventListener('click', () => this.closeQuickWeightModal());
    if (btnCancelWeightModal) btnCancelWeightModal.addEventListener('click', () => this.closeQuickWeightModal());
    if (modalQuickWeight) {
      modalQuickWeight.addEventListener('click', (e) => {
        if (e.target === modalQuickWeight) this.closeQuickWeightModal();
      });
    }

    // Goal Form Submit
    const formGoal = document.getElementById('form-goal');
    if (formGoal) {
      formGoal.addEventListener('submit', (e) => this.handleGoalSubmit(e));
    }

    // Quick Weight Form Submit
    const formQuickWeight = document.getElementById('form-quick-weight');
    if (formQuickWeight) {
      formQuickWeight.addEventListener('submit', (e) => this.handleQuickWeightSubmit(e));
    }

    // Type select change helper (auto-suggest target weight direction)
    const typeSelect = document.getElementById('goal-type');
    if (typeSelect) {
      typeSelect.addEventListener('change', () => this.handleTypeChange());
    }
  },

  render() {
    if (!window.storageService) return;

    this.goalsList = window.storageService.getGoals();
    this.activeGoal = window.storageService.getActiveGoal();

    this.renderActiveHero();
    this.renderGoalsList();
  },

  calculateProgress(goal) {
    if (!goal) return { percent: 0, text: '0%', diff: 0, label: '0 kg' };

    const start = Number(goal.startWeight);
    const current = Number(goal.currentWeight);
    const target = Number(goal.targetWeight);

    let percent = 0;
    let diff = 0;
    let label = '';

    if (goal.type === 'weight_loss' || goal.type === 'fat_loss') {
      const totalToLose = start - target;
      if (totalToLose <= 0) {
        percent = current <= target ? 100 : 0;
      } else {
        const lost = start - current;
        percent = Math.round((lost / totalToLose) * 100);
      }
      diff = parseFloat((current - target).toFixed(1));
      label = diff > 0 ? `Còn giảm ${diff} kg` : `Đã giảm vượt ${(target - current).toFixed(1)} kg`;
    } else if (goal.type === 'weight_gain' || goal.type === 'muscle_gain') {
      const totalToGain = target - start;
      if (totalToGain <= 0) {
        percent = current >= target ? 100 : 0;
      } else {
        const gained = current - start;
        percent = Math.round((gained / totalToGain) * 100);
      }
      diff = parseFloat((target - current).toFixed(1));
      label = diff > 0 ? `Còn tăng ${diff} kg` : `Đã tăng vượt ${(current - target).toFixed(1)} kg`;
    } else {
      // maintenance
      const diffFromTarget = Math.abs(current - target);
      if (diffFromTarget <= 0.5) percent = 100;
      else if (diffFromTarget <= 1.5) percent = 80;
      else if (diffFromTarget <= 3.0) percent = 50;
      else percent = 20;
      label = diffFromTarget === 0 ? 'Cân nặng hoàn hảo' : `Đang lệch ${diffFromTarget.toFixed(1)} kg`;
    }

    percent = Math.max(0, Math.min(100, percent));
    return { percent, text: `${percent}%`, diff, label };
  },

  getGoalTypeBadge(type) {
    const map = {
      'weight_loss': { text: 'Giảm Cân', class: 'badge-loss' },
      'fat_loss': { text: 'Giảm Mỡ', class: 'badge-loss' },
      'weight_gain': { text: 'Tăng Cân', class: 'badge-gain' },
      'muscle_gain': { text: 'Tăng Cơ', class: 'badge-gain' },
      'maintenance': { text: 'Duy Trì Vóc Dáng', class: 'badge-maintain' }
    };
    return map[type] || { text: 'Mục Tiêu Thể Hình', class: 'badge-maintain' };
  },

  getStatusBadge(status) {
    const map = {
      'in_progress': { text: 'Đang Thực Hiện', class: 'status-progress' },
      'completed': { text: 'Đã Hoàn Thành', class: 'status-completed' },
      'overdue': { text: 'Quá Thời Hạn', class: 'status-overdue' },
      'paused': { text: 'Tạm Dừng', class: 'status-paused' }
    };
    return map[status] || { text: 'Đang thực hiện', class: 'status-progress' };
  },

  renderActiveHero() {
    const heroEl = document.getElementById('active-goal-hero');
    if (!heroEl) return;

    const goal = this.activeGoal;
    if (!goal) {
      heroEl.innerHTML = `
        <div class="empty-goal-state">
          <div class="empty-icon">🎯</div>
          <h3>Chưa có mục tiêu đang hoạt động</h3>
          <p>Thiết lập mục tiêu cân nặng hoặc thể hình ngay hôm nay để FitVN đồng hành cùng bạn!</p>
          <button type="button" class="auth-submit-btn" style="width: auto; margin: 16px auto 0 auto;" onclick="GoalsModule.openGoalModal()">
            + Thiết Lập Mục Tiêu Đầu Tiên
          </button>
        </div>
      `;
      return;
    }

    const typeInfo = this.getGoalTypeBadge(goal.type);
    const statusInfo = this.getStatusBadge(goal.status);
    const progress = this.calculateProgress(goal);

    // Days remaining
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysLabel = diffDays > 0 ? `Còn ${diffDays} ngày` : (diffDays === 0 ? 'Hôm nay là ngày kết thúc' : `Đã quá hạn ${Math.abs(diffDays)} ngày`);

    heroEl.innerHTML = `
      <div class="hero-goal-card">
        <div class="hero-goal-top">
          <div class="hero-goal-badges">
            <span class="goal-type-pill ${typeInfo.class}">${typeInfo.text}</span>
            <span class="goal-status-pill ${statusInfo.class}">${statusInfo.text}</span>
          </div>
          <div class="hero-goal-actions">
            <button type="button" class="btn-goal-icon" onclick="GoalsModule.openGoalModal('${goal.id}')" title="Chỉnh sửa mục tiêu">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        </div>

        <h2 class="hero-goal-title">${this.escapeHtml(goal.title)}</h2>
        ${goal.note ? `<p class="hero-goal-note">${this.escapeHtml(goal.note)}</p>` : ''}

        <!-- 3 Metrics Columns -->
        <div class="hero-metrics-grid">
          <div class="hero-metric-item">
            <span class="metric-label">Bắt đầu</span>
            <div class="metric-val">${goal.startWeight} <small>kg</small></div>
            <span class="metric-sub">${goal.startDate}</span>
          </div>
          <div class="hero-metric-item current">
            <span class="metric-label">Hiện tại</span>
            <div class="metric-val text-primary">${goal.currentWeight} <small>kg</small></div>
            <button type="button" class="btn-quick-weight" onclick="GoalsModule.openQuickWeightModal('${goal.id}', ${goal.currentWeight})">
              + Cập nhật cân nặng
            </button>
          </div>
          <div class="hero-metric-item">
            <span class="metric-label">Mục tiêu</span>
            <div class="metric-val text-sage">${goal.targetWeight} <small>kg</small></div>
            <span class="metric-sub">${daysLabel}</span>
          </div>
        </div>

        <!-- Visual Progress Bar -->
        <div class="hero-progress-section">
          <div class="progress-info-row">
            <span class="progress-status-desc">${progress.label}</span>
            <span class="progress-percent-bold">${progress.text}</span>
          </div>
          <div class="goal-progress-track">
            <div class="goal-progress-fill" style="width: ${progress.percent}%;"></div>
          </div>
        </div>
      </div>
    `;
  },

  renderGoalsList() {
    const listEl = document.getElementById('goals-history-list');
    if (!listEl) return;

    if (this.goalsList.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--color-text-muted);">
          Chưa có mục tiêu nào trong lịch sử.
        </div>
      `;
      return;
    }

    const html = this.goalsList.map(goal => {
      const typeInfo = this.getGoalTypeBadge(goal.type);
      const statusInfo = this.getStatusBadge(goal.status);
      const progress = this.calculateProgress(goal);
      const isActive = this.activeGoal && this.activeGoal.id === goal.id;

      return `
        <div class="goal-item-card ${isActive ? 'active-border' : ''}">
          <div class="goal-item-header">
            <div>
              <div class="goal-item-badges">
                <span class="goal-type-pill ${typeInfo.class}">${typeInfo.text}</span>
                <span class="goal-status-pill ${statusInfo.class}">${statusInfo.text}</span>
                ${isActive ? '<span class="goal-active-tag">Đang theo đuổi</span>' : ''}
              </div>
              <h3 class="goal-item-title">${this.escapeHtml(goal.title)}</h3>
            </div>
            <div class="goal-item-btns">
              <button type="button" class="btn-goal-icon" onclick="GoalsModule.openGoalModal('${goal.id}')" title="Sửa mục tiêu">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button type="button" class="btn-goal-icon danger" onclick="GoalsModule.confirmDeleteGoal('${goal.id}')" title="Xóa mục tiêu">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </div>

          <div class="goal-item-stats">
            <span>Bắt đầu: <strong>${goal.startWeight}kg</strong></span>
            <span>Hiện tại: <strong class="text-primary">${goal.currentWeight}kg</strong></span>
            <span>Đích: <strong class="text-sage">${goal.targetWeight}kg</strong></span>
            <span>Hạn: <strong>${goal.targetDate}</strong></span>
          </div>

          <div class="goal-item-progress">
            <div class="goal-progress-track small">
              <div class="goal-progress-fill" style="width: ${progress.percent}%;"></div>
            </div>
            <span class="goal-item-percent">${progress.text}</span>
          </div>
        </div>
      `;
    }).join('');

    listEl.innerHTML = html;
  },

  openGoalModal(goalId = null) {
    const modal = document.getElementById('modal-goal');
    const form = document.getElementById('form-goal');
    const modalTitle = document.getElementById('goal-modal-title');
    const profile = window.storageService.get(window.STORAGE_KEYS.USER_PROFILE, {});

    this.clearErrors();

    if (goalId) {
      const goal = this.goalsList.find(g => g.id === goalId);
      if (goal) {
        modalTitle.textContent = 'Chỉnh Sửa Mục Tiêu Thể Hình';
        document.getElementById('goal-id').value = goal.id;
        document.getElementById('goal-title').value = goal.title;
        document.getElementById('goal-type').value = goal.type;
        document.getElementById('goal-start-weight').value = goal.startWeight;
        document.getElementById('goal-current-weight').value = goal.currentWeight;
        document.getElementById('goal-target-weight').value = goal.targetWeight;
        document.getElementById('goal-height').value = goal.heightCm || profile.height || 175;
        document.getElementById('goal-start-date').value = goal.startDate;
        document.getElementById('goal-target-date').value = goal.targetDate;
        document.getElementById('goal-status').value = goal.status;
        document.getElementById('goal-note').value = goal.note || '';
        document.getElementById('goal-status-group').style.display = 'block';
      }
    } else {
      modalTitle.textContent = 'Thiết Lập Mục Tiêu Thể Hình Mới';
      form.reset();
      document.getElementById('goal-id').value = '';
      document.getElementById('goal-title').value = 'Kế hoạch vóc dáng mới';
      document.getElementById('goal-start-weight').value = profile.currentWeight || 70;
      document.getElementById('goal-current-weight').value = profile.currentWeight || 70;
      document.getElementById('goal-target-weight').value = profile.targetWeight || 68;
      document.getElementById('goal-height').value = profile.height || 175;
      document.getElementById('goal-start-date').value = window.getTodayDateString();
      
      // Default deadline +60 days
      const d60 = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      document.getElementById('goal-target-date').value = d60;
      document.getElementById('goal-status-group').style.display = 'none';
    }

    modal?.classList.add('active');
  },

  closeGoalModal() {
    const modal = document.getElementById('modal-goal');
    modal?.classList.remove('active');
  },

  openQuickWeightModal(goalId, currentWeight) {
    const modal = document.getElementById('modal-quick-weight');
    document.getElementById('quick-goal-id').value = goalId;
    document.getElementById('quick-weight-input').value = currentWeight;
    modal?.classList.add('active');
    setTimeout(() => document.getElementById('quick-weight-input')?.focus(), 100);
  },

  closeQuickWeightModal() {
    const modal = document.getElementById('modal-quick-weight');
    modal?.classList.remove('active');
  },

  handleTypeChange() {
    const type = document.getElementById('goal-type').value;
    const startW = parseFloat(document.getElementById('goal-start-weight').value) || 70;
    const targetInput = document.getElementById('goal-target-weight');

    if (!targetInput) return;
    if (type === 'weight_loss' || type === 'fat_loss') {
      if (parseFloat(targetInput.value) >= startW) targetInput.value = (startW - 4).toFixed(1);
    } else if (type === 'weight_gain' || type === 'muscle_gain') {
      if (parseFloat(targetInput.value) <= startW) targetInput.value = (startW + 4).toFixed(1);
    } else if (type === 'maintenance') {
      targetInput.value = startW.toFixed(1);
    }
  },

  handleGoalSubmit(e) {
    e.preventDefault();
    this.clearErrors();

    const id = document.getElementById('goal-id').value;
    const title = document.getElementById('goal-title').value.trim();
    const type = document.getElementById('goal-type').value;
    const startWeight = parseFloat(document.getElementById('goal-start-weight').value);
    const currentWeight = parseFloat(document.getElementById('goal-current-weight').value);
    const targetWeight = parseFloat(document.getElementById('goal-target-weight').value);
    const heightCm = parseInt(document.getElementById('goal-height').value, 10);
    const startDate = document.getElementById('goal-start-date').value;
    const targetDate = document.getElementById('goal-target-date').value;
    const status = document.getElementById('goal-status')?.value || 'in_progress';
    const note = document.getElementById('goal-note').value.trim();

    let hasError = false;

    if (!title) {
      this.setError('goal-title', 'Vui lòng nhập tên mục tiêu');
      hasError = true;
    }

    if (isNaN(startWeight) || startWeight < 30 || startWeight > 250) {
      this.setError('goal-start-weight', 'Cân nặng bắt đầu từ 30 đến 250 kg');
      hasError = true;
    }

    if (isNaN(currentWeight) || currentWeight < 30 || currentWeight > 250) {
      this.setError('goal-current-weight', 'Cân nặng hiện tại từ 30 đến 250 kg');
      hasError = true;
    }

    if (isNaN(targetWeight) || targetWeight < 30 || targetWeight > 250) {
      this.setError('goal-target-weight', 'Cân nặng mục tiêu từ 30 đến 250 kg');
      hasError = true;
    }

    if (isNaN(heightCm) || heightCm < 100 || heightCm > 250) {
      this.setError('goal-height', 'Chiều cao từ 100 đến 250 cm');
      hasError = true;
    }

    if (!startDate) {
      this.setError('goal-start-date', 'Chọn ngày bắt đầu');
      hasError = true;
    }

    if (!targetDate) {
      this.setError('goal-target-date', 'Chọn ngày thời hạn');
      hasError = true;
    } else if (targetDate < startDate) {
      this.setError('goal-target-date', 'Thời hạn không được trước ngày bắt đầu');
      hasError = true;
    }

    if (hasError) return;

    window.storageService.saveGoal({
      id: id || undefined,
      title,
      type,
      startWeight,
      currentWeight,
      targetWeight,
      heightCm,
      startDate,
      targetDate,
      status,
      note
    });

    if (window.ToastModule) {
      window.ToastModule.show(id ? 'Đã cập nhật mục tiêu thành công!' : 'Đã tạo mục tiêu mới thành công!', 'emerald');
    }

    this.closeGoalModal();
    this.render();
  },

  handleQuickWeightSubmit(e) {
    e.preventDefault();
    const goalId = document.getElementById('quick-goal-id').value;
    const weightVal = parseFloat(document.getElementById('quick-weight-input').value);

    if (isNaN(weightVal) || weightVal < 30 || weightVal > 250) {
      alert('Vui lòng nhập cân nặng hợp lệ từ 30 đến 250 kg');
      return;
    }

    const updated = window.storageService.updateGoalWeight(goalId, weightVal);
    if (updated) {
      if (window.ToastModule) {
        window.ToastModule.show(`Đã cập nhật cân nặng ${weightVal} kg và tính toán lại tiến độ!`, 'emerald');
      }
      this.closeQuickWeightModal();
      this.render();
    }
  },

  confirmDeleteGoal(goalId) {
    const goal = this.goalsList.find(g => g.id === goalId);
    if (!goal) return;

    const confirmed = confirm(`Bạn có chắc chắn muốn xóa mục tiêu "${goal.title}" không? Dữ liệu tiến độ của mục tiêu này sẽ bị xóa khỏi trình duyệt.`);
    if (confirmed) {
      window.storageService.deleteGoal(goalId);
      if (window.ToastModule) {
        window.ToastModule.show('Đã xóa mục tiêu thành công!', 'cyan');
      }
      this.render();
    }
  },

  setError(fieldId, msg) {
    const input = document.getElementById(fieldId);
    const errEl = document.getElementById(`err-${fieldId}`);
    if (input) input.classList.add('has-error');
    if (errEl) {
      errEl.textContent = msg;
      errEl.style.display = 'block';
    }
  },

  clearErrors() {
    document.querySelectorAll('.auth-input, .glass-input').forEach(el => el.classList.remove('has-error'));
    document.querySelectorAll('.auth-error-msg, .form-error-msg').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

window.GoalsModule = GoalsModule;
