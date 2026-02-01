
const AuthSystem = {
    storageKey: 'diamonUsers',
    modal: null,
    overlay: null,
    loginForm: null,
    signupForm: null,
    loginTab: null,
    signupTab: null,
    loginBtn: null,
    currentUser: null,

    init() {
        this.modal = document.querySelector('.auth-modal');
        this.overlay = document.querySelector('.auth-modal-overlay');
        this.loginForm = document.getElementById('loginForm');
        this.signupForm = document.getElementById('signupForm');
        this.loginTab = document.querySelector('[data-tab="login"]');
        this.signupTab = document.querySelector('[data-tab="signup"]');
        this.loginBtn = document.querySelector('.login-btn');

        if (!this.modal) return;

        this.checkSession();
        this.bindEvents();
    },

    checkSession() {
        const data = this.getUsers();
        if (data.currentUser) {
            this.currentUser = data.currentUser;
            this.showLoggedInUI();
        }
    },

    getUsers() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : { users: [], currentUser: null };
    },

    saveUsers(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    },

    openModal() {
        this.modal.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        gsap.timeline()
            .fromTo(this.overlay, 
                { opacity: 0 }, 
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            )
            .fromTo(this.modal, 
                { opacity: 0, scale: 0.9, y: 30 }, 
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' },
                '-=0.2'
            );
    },

    closeModal() {
        gsap.timeline()
            .to(this.modal, { 
                opacity: 0, 
                scale: 0.9, 
                y: 20, 
                duration: 0.3, 
                ease: 'power2.in' 
            })
            .to(this.overlay, { 
                opacity: 0, 
                duration: 0.2 
            }, '-=0.1')
            .then(() => {
                this.modal.classList.remove('active');
                this.overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
    },

    switchTab(tab) {
        const isLogin = tab === 'login';
        
        this.loginTab.classList.toggle('active', isLogin);
        this.signupTab.classList.toggle('active', !isLogin);
        this.loginForm.classList.toggle('hidden', !isLogin);
        this.signupForm.classList.toggle('hidden', isLogin);

        // Clear forms
        this.loginForm.reset();
        this.signupForm.reset();
        this.clearErrors();
    },

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    validatePassword(password) {
        return password.length >= 8;
    },

    showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorEl = input?.parentElement.querySelector('.form-error');
        if (errorEl) {
            errorEl.textContent = message;
            input.classList.add('error');
        }
    },

    clearErrors() {
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
    },

    login(email, password) {
        this.clearErrors();

        // Validate
        if (!email) {
            this.showError('loginEmail', 'Email is required');
            return;
        }
        if (!this.validateEmail(email)) {
            this.showError('loginEmail', 'Invalid email format');
            return;
        }
        if (!password) {
            this.showError('loginPassword', 'Password is required');
            return;
        }

        // Check credentials
        const data = this.getUsers();
        const user = data.users.find(u => u.email === email && u.password === password);

        if (!user) {
            this.showError('loginEmail', 'Invalid email or password');
            return;
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        data.currentUser = {
            id: user.id,
            fullName: user.fullName,
            email: user.email
        };
        this.saveUsers(data);

        this.currentUser = data.currentUser;
        this.showLoggedInUI();
        this.closeModal();

        // Show success message
        this.showMessage('Welcome back, ' + user.fullName + '!', 'success');
    },

    signup(fullName, email, password, confirmPassword) {
        this.clearErrors();

        // Validate
        if (!fullName) {
            this.showError('signupName', 'Full name is required');
            return;
        }
        if (!email) {
            this.showError('signupEmail', 'Email is required');
            return;
        }
        if (!this.validateEmail(email)) {
            this.showError('signupEmail', 'Invalid email format');
            return;
        }
        if (!password) {
            this.showError('signupPassword', 'Password is required');
            return;
        }
        if (!this.validatePassword(password)) {
            this.showError('signupPassword', 'Password must be at least 8 characters');
            return;
        }
        if (password !== confirmPassword) {
            this.showError('signupConfirmPassword', 'Passwords do not match');
            return;
        }

        // Check if email exists
        const data = this.getUsers();
        if (data.users.find(u => u.email === email)) {
            this.showError('signupEmail', 'Email already registered');
            return;
        }

        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            fullName: fullName,
            email: email,
            password: password,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        data.users.push(newUser);
        data.currentUser = {
            id: newUser.id,
            fullName: newUser.fullName,
            email: newUser.email
        };
        this.saveUsers(data);

        this.currentUser = data.currentUser;
        this.showLoggedInUI();
        this.closeModal();

        // Show success message
        this.showMessage('Welcome to DIAMON, ' + fullName + '!', 'success');
    },

    logout() {
        const data = this.getUsers();
        data.currentUser = null;
        this.saveUsers(data);

        this.currentUser = null;
        this.showLoggedOutUI();
        this.showMessage('Logged out successfully', 'info');
    },

    showLoggedInUI() {
        if (!this.currentUser) return;

        const initial = this.currentUser.fullName.charAt(0).toUpperCase();
        const firstName = this.currentUser.fullName.split(' ')[0];
        
        // Replace login button with user menu
        const navIcons = document.querySelector('.nav-icons');
        const existingMenu = document.querySelector('.user-menu-container');
        
        if (existingMenu) {
            existingMenu.remove();
        }

        const userMenuHTML = `
            <div class="user-menu-container">
                <button class="user-menu-trigger" aria-label="User Menu">
                    <div class="user-avatar">${initial}</div>
                    <span class="user-name">${firstName}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="user-dropdown">
                    <div class="user-dropdown-item">
                        <i class="fas fa-user"></i> My Profile
                    </div>
                    <div class="user-dropdown-item">
                        <i class="fas fa-box"></i> My Orders
                    </div>
                    <div class="user-dropdown-item">
                        <i class="fas fa-heart"></i> Wishlist
                    </div>
                    <div class="user-dropdown-item">
                        <i class="fas fa-cog"></i> Settings
                    </div>
                    <div class="user-dropdown-divider"></div>
                    <div class="user-dropdown-item logout-btn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </div>
                </div>
            </div>
        `;

        this.loginBtn.style.display = 'none';
        this.loginBtn.insertAdjacentHTML('afterend', userMenuHTML);

        // Update mobile login button
        const mobileLoginBtn = document.querySelector('.mobile-login-btn');
        if (mobileLoginBtn) {
            mobileLoginBtn.innerHTML = `
                <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.9rem;">${initial}</div>
                <span>${firstName}'s Account</span>
            `;
            mobileLoginBtn.onclick = null; // Remove auth modal trigger
            mobileLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Close mobile menu
                const mobileMenu = document.querySelector('.mobile-menu');
                const mobileOverlay = document.querySelector('.mobile-menu-overlay');
                if (mobileMenu) mobileMenu.classList.remove('active');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
                
                // Show user options (you can expand this)
                this.showMessage('Profile features coming soon!', 'info');
            });
        }

        // Bind user menu events
        this.bindUserMenuEvents();
    },

    showLoggedOutUI() {
        const userMenu = document.querySelector('.user-menu-container');
        if (userMenu) {
            userMenu.remove();
        }
        this.loginBtn.style.display = 'flex';

        // Reset mobile login button
        const mobileLoginBtn = document.querySelector('.mobile-login-btn');
        if (mobileLoginBtn) {
            mobileLoginBtn.innerHTML = `
                <i class="fa-solid fa-user"></i>
                <span>Login / Sign Up</span>
            `;
            // Re-bind the auth modal trigger
            mobileLoginBtn.onclick = null;
            mobileLoginBtn.addEventListener('click', () => {
                // Close mobile menu first
                const mobileMenu = document.querySelector('.mobile-menu');
                const mobileOverlay = document.querySelector('.mobile-menu-overlay');
                if (mobileMenu) mobileMenu.classList.remove('active');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
                
                // Open auth modal after a short delay
                setTimeout(() => {
                    this.openModal();
                }, 300);
            });
        }
    },

    bindUserMenuEvents() {
        const menuTrigger = document.querySelector('.user-menu-trigger');
        const userDropdown = document.querySelector('.user-dropdown');
        const logoutBtn = document.querySelector('.user-dropdown-item.logout-btn');

        if (!menuTrigger || !userDropdown) return;

        // Toggle dropdown on click
        menuTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = userDropdown.classList.contains('active');
            
            if (isActive) {
                // Close dropdown
                gsap.to(userDropdown, {
                    opacity: 0,
                    y: -10,
                    duration: 0.2,
                    ease: 'power2.in',
                    onComplete: () => {
                        userDropdown.classList.remove('active');
                    }
                });
            } else {
                // Open dropdown
                userDropdown.classList.add('active');
                gsap.fromTo(userDropdown,
                    { opacity: 0, y: -10 },
                    { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
                );
            }
        });

        // Logout button
        logoutBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.logout();
        });

        // Close dropdown when clicking outside
        const closeDropdown = (e) => {
            if (!e.target.closest('.user-menu-container') && userDropdown.classList.contains('active')) {
                gsap.to(userDropdown, {
                    opacity: 0,
                    y: -10,
                    duration: 0.2,
                    ease: 'power2.in',
                    onComplete: () => {
                        userDropdown.classList.remove('active');
                    }
                });
            }
        };

        // Add event listener to document
        document.addEventListener('click', closeDropdown);
        
        // Store reference to remove later if needed
        this.closeDropdownHandler = closeDropdown;
    },

    showMessage(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `auth-toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        gsap.timeline()
            .fromTo(toast,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
            )
            .to(toast, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                delay: 3,
                ease: 'power2.in',
                onComplete: () => toast.remove()
            });
    },

    updatePasswordStrength(password) {
        const strengthFill = document.querySelector('.password-strength-fill');
        const strengthText = document.querySelector('.password-strength-text');
        
        if (!strengthFill || !strengthText) return;

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        const levels = ['Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['#c41e3a', '#ff9800', '#2196f3', '#4caf50'];

        strengthFill.style.width = (strength * 25) + '%';
        strengthFill.style.backgroundColor = colors[strength - 1] || '#c41e3a';
        strengthText.textContent = levels[strength - 1] || 'Weak';
    },

    bindEvents() {
        // Open modal
        this.loginBtn?.addEventListener('click', () => this.openModal());

        // Close modal
        document.querySelector('.auth-modal-close')?.addEventListener('click', () => this.closeModal());
        this.overlay?.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.closeModal();
            }
        });

        // Tab switching
        this.loginTab?.addEventListener('click', () => this.switchTab('login'));
        this.signupTab?.addEventListener('click', () => this.switchTab('signup'));

        // Login form
        this.loginForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            this.login(email, password);
        });

        // Signup form
        this.signupForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            this.signup(fullName, email, password, confirmPassword);
        });

        // Password visibility toggle
        document.querySelectorAll('.password-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.previousElementSibling;
                const icon = btn.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });

        // Password strength indicator
        document.getElementById('signupPassword')?.addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
                this.closeModal();
            }
        });

        // Auth switch links
        document.querySelectorAll('[data-switch]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = link.dataset.switch;
                this.switchTab(tab);
            });
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AuthSystem.init());
} else {
    AuthSystem.init();
}
