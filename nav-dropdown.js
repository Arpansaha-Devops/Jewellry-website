
const NavDropdown = {
    navItems: null,
    activeDropdown: null,
    hideTimeout: null,

    init() {
        this.navItems = document.querySelectorAll('.nav-link.has-dropdown');
        
        if (!this.navItems.length) return;

        this.bindEvents();
    },

    showDropdown(navLink) {
        // Clear any pending hide timeout
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }

        // Hide any currently active dropdown
        if (this.activeDropdown && this.activeDropdown !== navLink) {
            this.hideDropdown(this.activeDropdown);
        }

        const dropdown = navLink.querySelector('.nav-dropdown');
        if (dropdown) {
            dropdown.classList.add('active');
            this.activeDropdown = navLink;

            // GSAP animation
            gsap.fromTo(dropdown,
                { opacity: 0, y: -10 },
                { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
            );
        }
    },

    hideDropdown(navLink) {
        const dropdown = navLink.querySelector('.nav-dropdown');
        if (dropdown) {
            gsap.to(dropdown, {
                opacity: 0,
                y: -10,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: () => {
                    dropdown.classList.remove('active');
                    if (this.activeDropdown === navLink) {
                        this.activeDropdown = null;
                    }
                }
            });
        }
    },

    bindEvents() {
        this.navItems.forEach(navLink => {
            const parentLi = navLink.closest('li');
            const dropdown = navLink.querySelector('.nav-dropdown');

            if (!dropdown) return;

            // Mouse enter on nav link
            parentLi.addEventListener('mouseenter', () => {
                this.showDropdown(navLink);
            });

            // Mouse leave on parent li
            parentLi.addEventListener('mouseleave', () => {
                // Delay hiding to allow smooth transition
                this.hideTimeout = setTimeout(() => {
                    this.hideDropdown(navLink);
                }, 100);
            });

            // Prevent dropdown items from closing dropdown
            dropdown.addEventListener('mouseenter', () => {
                if (this.hideTimeout) {
                    clearTimeout(this.hideTimeout);
                    this.hideTimeout = null;
                }
            });

            // Dropdown item clicks
            dropdown.querySelectorAll('.nav-dropdown-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Navigating to:', item.textContent);
                    // In a real app, this would navigate to the page
                    this.hideDropdown(navLink);
                });
            });
        });

        // Close dropdowns on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeDropdown) {
                this.hideDropdown(this.activeDropdown);
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (this.activeDropdown && !e.target.closest('.nav-links')) {
                this.hideDropdown(this.activeDropdown);
            }
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NavDropdown.init());
} else {
    NavDropdown.init();
}
