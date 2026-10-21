/**
 * Auth Module - Handles Login & Sign Up Forms, Validation, Password visibility and Redirects
 */
const AuthModule = {
  activeTab: 'login',

  init() {
    this.bindTabEvents();
    this.bindPasswordToggleEvents();
    this.bindFormEvents();
    this.checkAutoFill();
  },

  checkAutoFill() {
    if (!window.storageService) return;
    const authUser = window.storageService.getCurrentUser();
    if (authUser && authUser.email) {
      const loginEmailInput = document.getElementById('login-email');
      if (loginEmailInput) loginEmailInput.value = authUser.email;
    }
  },

  bindTabEvents() {
    const btnLogin = document.getElementById('tab-btn-login');
    const btnSignup = document.getElementById('tab-btn-signup');
    const linkToSignup = document.getElementById('link-to-signup');
    const linkToLogin = document.getElementById('link-to-login');

    if (btnLogin) {
      btnLogin.addEventListener('click', () => this.switchTab('login'));
    }
    if (btnSignup) {
      btnSignup.addEventListener('click', () => this.switchTab('signup'));
    }
    if (linkToSignup) {
      linkToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTab('signup');
      });
    }
    if (linkToLogin) {
      linkToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTab('login');
      });
    }
  },

  switchTab(tab) {
    this.activeTab = tab;
    this.clearErrors();
    this.hideAlert();

    const btnLogin = document.getElementById('tab-btn-login');
    const btnSignup = document.getElementById('tab-btn-signup');
    const paneLogin = document.getElementById('pane-login');
    const paneSignup = document.getElementById('pane-signup');

    if (tab === 'login') {
      btnLogin?.classList.add('active');
      btnLogin?.setAttribute('aria-selected', 'true');
      btnSignup?.classList.remove('active');
      btnSignup?.setAttribute('aria-selected', 'false');

      paneLogin?.classList.add('active');
      paneSignup?.classList.remove('active');
      document.getElementById('login-email')?.focus();
    } else {
      btnSignup?.classList.add('active');
      btnSignup?.setAttribute('aria-selected', 'true');
      btnLogin?.classList.remove('active');
      btnLogin?.setAttribute('aria-selected', 'false');

      paneSignup?.classList.add('active');
      paneLogin?.classList.remove('active');
      document.getElementById('signup-name')?.focus();
    }
  },

  bindPasswordToggleEvents() {
    document.querySelectorAll('.auth-pwd-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (!input) return;

        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';

        btn.innerHTML = isPassword
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
          : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
      });
    });
  },

  bindFormEvents() {
    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');

    if (formLogin) {
      formLogin.addEventListener('submit', (e) => this.handleLoginSubmit(e));
    }

    if (formSignup) {
      formSignup.addEventListener('submit', (e) => this.handleSignupSubmit(e));
    }

    ['login-email', 'login-password', 'signup-name', 'signup-email', 'signup-password', 'signup-confirm-password', 'signup-age', 'signup-height', 'signup-weight'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.clearFieldError(id));
      }
    });
  },

  setFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errEl = document.getElementById(`err-${fieldId}`);
    if (input) input.classList.add('has-error');
    if (errEl) {
      errEl.textContent = message;
      errEl.style.display = 'block';
    }
  },

  clearFieldError(fieldId) {
    const input = document.getElementById(fieldId);
    const errEl = document.getElementById(`err-${fieldId}`);
    if (input) input.classList.remove('has-error');
    if (errEl) {
      errEl.textContent = '';
      errEl.style.display = 'none';
    }
  },

  clearErrors() {
    document.querySelectorAll('.auth-input').forEach(input => input.classList.remove('has-error'));
    document.querySelectorAll('.auth-error-msg').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
  },

  showAlert(message, type = 'error') {
    const box = document.getElementById('auth-alert-box');
    if (!box) return;
    box.textContent = message;
    box.className = `auth-alert alert-${type}`;
    box.classList.remove('hidden');
  },

  hideAlert() {
    const box = document.getElementById('auth-alert-box');
    if (box) box.classList.add('hidden');
  },

  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  handleLoginSubmit(e) {
    e.preventDefault();
    this.clearErrors();
    this.hideAlert();

    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;

    let hasError = false;

    if (!email) {
      this.setFieldError('login-email', 'Vui lòng nhập địa chỉ email');
      hasError = true;
    } else if (!this.isValidEmail(email)) {
      this.setFieldError('login-email', 'Định dạng email không hợp lệ');
      hasError = true;
    }

    if (!password) {
      this.setFieldError('login-password', 'Vui lòng nhập mật khẩu');
      hasError = true;
    }

    if (hasError) return;

    const result = window.storageService.loginUser(email, password);
    if (!result.success) {
      this.showAlert(result.message || 'Email hoặc mật khẩu không chính xác', 'error');
      return;
    }

    this.showAlert('Đăng nhập thành công! Đang chuyển hướng...', 'success');
    if (window.ToastModule) {
      window.ToastModule.show(`Chào mừng bạn trở lại, ${result.user.name}!`, 'cyan');
    }

    setTimeout(() => {
      window.location.href = '../index.html';
    }, 800);
  },

  handleSignupSubmit(e) {
    e.preventDefault();
    this.clearErrors();
    this.hideAlert();

    const name = document.getElementById('signup-name')?.value.trim();
    const email = document.getElementById('signup-email')?.value.trim();
    const password = document.getElementById('signup-password')?.value;
    const confirmPassword = document.getElementById('signup-confirm-password')?.value;

    const gender = document.getElementById('signup-gender')?.value;
    const age = parseInt(document.getElementById('signup-age')?.value, 10);
    const height = parseFloat(document.getElementById('signup-height')?.value);
    const weight = parseFloat(document.getElementById('signup-weight')?.value);
    const fitnessGoal = document.getElementById('signup-goal')?.value;

    let hasError = false;

    if (!name) {
      this.setFieldError('signup-name', 'Vui lòng nhập họ và tên');
      hasError = true;
    } else if (name.length < 2) {
      this.setFieldError('signup-name', 'Họ tên phải có ít nhất 2 ký tự');
      hasError = true;
    }

    if (!email) {
      this.setFieldError('signup-email', 'Vui lòng nhập email');
      hasError = true;
    } else if (!this.isValidEmail(email)) {
      this.setFieldError('signup-email', 'Định dạng email không hợp lệ');
      hasError = true;
    }

    if (!password) {
      this.setFieldError('signup-password', 'Vui lòng nhập mật khẩu');
      hasError = true;
    } else if (password.length < 6) {
      this.setFieldError('signup-password', 'Mật khẩu phải từ 6 ký tự trở lên');
      hasError = true;
    }

    if (!confirmPassword) {
      this.setFieldError('signup-confirm-password', 'Vui lòng xác nhận mật khẩu');
      hasError = true;
    } else if (confirmPassword !== password) {
      this.setFieldError('signup-confirm-password', 'Mật khẩu xác nhận không trùng khớp');
      hasError = true;
    }

    if (isNaN(age) || age < 12 || age > 100) {
      this.setFieldError('signup-age', 'Độ tuổi hợp lệ từ 12 đến 100');
      hasError = true;
    }

    if (isNaN(height) || height < 100 || height > 250) {
      this.setFieldError('signup-height', 'Chiều cao hợp lệ từ 100 đến 250 cm');
      hasError = true;
    }

    if (isNaN(weight) || weight < 30 || weight > 250) {
      this.setFieldError('signup-weight', 'Cân nặng hợp lệ từ 30 đến 250 kg');
      hasError = true;
    }

    if (hasError) return;

    const result = window.storageService.registerUser({
      name,
      email,
      password,
      gender,
      age,
      height,
      weight,
      fitnessGoal
    });

    if (!result.success) {
      this.showAlert(result.message || 'Không thể đăng ký tài khoản!', 'error');
      return;
    }

    this.showAlert('Đăng ký tài khoản thành công! Đang đồng bộ dữ liệu...', 'success');
    if (window.ToastModule) {
      window.ToastModule.show(`Chào mừng ${result.user.name} đến với FitVN Tracker!`, 'cyan');
    }

    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1000);
  }
};

window.AuthModule = AuthModule;
