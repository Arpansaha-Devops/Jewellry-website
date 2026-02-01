
const AdModal = {
    storageKey: 'diamonAdModalShown',
    modal: null,
    overlay: null,
    closeBtn: null,
    ctaBtn: null,

    init() {
        this.modal = document.querySelector('.ad-modal-container');
        this.overlay = document.querySelector('.ad-modal-overlay');
        this.closeBtn = document.querySelector('.ad-modal-close');
        this.ctaBtn = document.querySelector('.ad-cta-button');

        if (!this.modal || !this.overlay) return;

        // Check if modal should be shown
        if (this.shouldShowModal()) {
            this.showModal();
        }

        // Bind events
        this.bindEvents();
    },

    shouldShowModal() {
        // Check if modal was already shown in this session
        const shown = sessionStorage.getItem(this.storageKey);
        return !shown;
    },

    showModal() {
        // Wait 1 second before showing modal
        setTimeout(() => {
            this.overlay.classList.add('active');
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            // GSAP animation
            gsap.timeline()
                .fromTo(this.overlay, 
                    { opacity: 0 }, 
                    { opacity: 1, duration: 0.3, ease: 'power2.out' }
                )
                .fromTo(this.modal, 
                    { opacity: 0, scale: 0.8, y: 50 }, 
                    { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' },
                    '-=0.2'
                );

            // Mark as shown in session
            sessionStorage.setItem(this.storageKey, 'true');
        }, 1000);
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
                this.overlay.classList.remove('active');
                this.modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
    },

    bindEvents() {
        // Close button
        this.closeBtn?.addEventListener('click', () => this.closeModal());

        // Click outside modal
        this.overlay?.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.closeModal();
            }
        });

        // CTA button - close and scroll to products
        this.ctaBtn?.addEventListener('click', () => {
            this.closeModal();
            setTimeout(() => {
                document.querySelector('#products')?.scrollIntoView({ 
                    behavior: 'smooth' 
                });
            }, 400);
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
                this.closeModal();
            }
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdModal.init());
} else {
    AdModal.init();
}
