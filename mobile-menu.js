// ==================== MOBILE MENU ====================
const MobileMenu = {
    menu: null,
    overlay: null,
    hamburger: null,
    closeBtn: null,
    mobileLoginBtn: null,

    init() {
        this.menu = document.querySelector('.mobile-menu');
        this.overlay = document.querySelector('.mobile-menu-overlay');
        this.hamburger = document.querySelector('.hamburger');
        this.closeBtn = document.querySelector('.mobile-menu-close');
        this.mobileLoginBtn = document.querySelector('.mobile-login-btn');

        if (!this.menu || !this.hamburger) return;

        this.bindEvents();
    },

    open() {
        this.menu.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // GSAP animation
        gsap.fromTo(this.menu,
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
        );

        gsap.fromTo(this.overlay,
            { opacity: 0 },
            { opacity: 1, duration: 0.3 }
        );
    },

    close() {
        gsap.to(this.menu, {
            x: 100,
            opacity: 0,
            duration: 0.3,
            ease: 'power3.in',
            onComplete: () => {
                this.menu.classList.remove('active');
            }
        });

        gsap.to(this.overlay, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                this.overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    },

    bindEvents() {
        // Open menu
        this.hamburger.addEventListener('click', () => this.open());

        // Close menu
        this.closeBtn?.addEventListener('click', () => this.close());
        this.overlay?.addEventListener('click', () => this.close());

        // Mobile login button - open auth modal
        this.mobileLoginBtn?.addEventListener('click', () => {
            this.close();
            // Wait for menu to close, then open auth modal
            setTimeout(() => {
                if (typeof AuthSystem !== 'undefined' && AuthSystem.openModal) {
                    AuthSystem.openModal();
                }
            }, 400);
        });

        // Close menu when clicking nav links
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.close();
            });
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.menu.classList.contains('active')) {
                this.close();
            }
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MobileMenu.init());
} else {
    MobileMenu.init();
}
