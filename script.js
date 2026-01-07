// HERO SLIDER
const heroSlider = {
    slides: null,
    indicators: null,
    prevBtn: null,
    nextBtn: null,
    currentSlide: 0,
    autoSlideTimer: null,
    autoSlideDuration: 4000,
    videoSlideIndex: 3,
    totalSlides: 4,
    
    init() {
        this.slides = document.querySelectorAll('.hero-slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        
        if (!this.slides.length) return;
        
        this.showSlide(0);
        this.prevBtn?.addEventListener('click', () => this.handlePrevClick());
        this.nextBtn?.addEventListener('click', () => this.handleNextClick());
        this.indicators.forEach((indicator, i) => indicator.addEventListener('click', () => this.handleIndicatorClick(i)));
        
        const heroSection = document.querySelector('.hero');
        heroSection?.addEventListener('mouseenter', () => this.pauseAutoSlide());
        heroSection?.addEventListener('mouseleave', () => this.startAutoSlide());
        this.startAutoSlide();
    },
    
    showSlide(index) {
        this.slides.forEach(slide => slide.querySelector('.hero-video')?.pause());
        this.slides.forEach(s => s.classList.remove('active'));
        this.indicators.forEach(i => i.classList.remove('active'));
        
        this.slides[index]?.classList.add('active');
        this.indicators[index]?.classList.add('active');
        
        if (index === this.videoSlideIndex) {
            this.slides[index].querySelector('.hero-video')?.play();
        }
        
        const heroContent = this.slides[index]?.querySelector('.hero-content');
        if (heroContent) {
            gsap.killTweensOf(heroContent);
            gsap.fromTo(heroContent, { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power4.out' });
        }
    },
    
    nextAutoSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.showSlide(this.currentSlide);
        
        if (this.currentSlide === this.videoSlideIndex) {
            this.pauseAutoSlide();
            this.autoSlideTimer = setInterval(() => {
                this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
                this.showSlide(this.currentSlide);
                this.resetAutoSlide();
            }, 8000);
        }
    },
    
    handleNextClick() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.showSlide(this.currentSlide);
        this.resetAutoSlide();
    },
    
    handlePrevClick() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.showSlide(this.currentSlide);
        this.resetAutoSlide();
    },
    
    handleIndicatorClick(index) {
        this.currentSlide = index;
        this.showSlide(this.currentSlide);
        this.resetAutoSlide();
    },
    
    startAutoSlide() {
        this.autoSlideTimer = setInterval(() => this.nextAutoSlide(), this.autoSlideDuration);
    },
    
    pauseAutoSlide() {
        clearInterval(this.autoSlideTimer);
    },
    
    resetAutoSlide() {
        this.pauseAutoSlide();
        this.startAutoSlide();
    }
};

// Initialize slider when DOM is ready
document.readyState === 'loading' 
    ? document.addEventListener('DOMContentLoaded', () => heroSlider.init())
    : heroSlider.init();

// GSAP SETUP
gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ duration: 0.4, ease: 'power3.inOut' });

// Scroll animations for lazy elements
window.addEventListener('load', () => {
    document.querySelectorAll('.lazy-element').forEach((el, i) => {
        gsap.to(el, {
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
            opacity: 1, transform: 'translateY(0)', delay: i * 0.05, duration: 0.5, ease: 'power4.out'
        });
    });
});

// WISHLIST
let wishlist = JSON.parse(localStorage.getItem('jewelryWishlist')) || [];

function initWishlist() {
    wishlist.forEach(id => {
        const btn = document.querySelector(`[data-product-id="${id}"] .wishlist-btn`);
        btn?.classList.add('active');
    });
}

function toggleWishlist(productId, btn) {
    const index = wishlist.indexOf(productId);
    
    if (index === -1) {
        wishlist.push(productId);
        btn.classList.add('active');
        gsap.timeline()
            .fromTo(btn, { scale: 1 }, { scale: 1.15, duration: 0.25, ease: 'back.out' })
            .to(btn, { scale: 1, duration: 0.15 }, '-=0.05');
    } else {
        wishlist.splice(index, 1);
        btn.classList.remove('active');
        gsap.to(btn, { scale: 0.85, duration: 0.15, ease: 'back.in' });
    }
    
    localStorage.setItem('jewelryWishlist', JSON.stringify(wishlist));
}

document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWishlist(btn.closest('.product-card').dataset.productId, btn);
    });
});

initWishlist();

// CART
let cart = [];
const cartBtn = document.querySelector('.cart-btn');
const cartPanel = document.querySelector('.cart-panel');
const cartOverlay = document.querySelector('.cart-overlay');
const closeCartBtn = document.querySelector('.close-cart-btn');
const cartCount = document.querySelector('.cart-count');
const cartItems = document.querySelector('.cart-items');
const totalPrice = document.querySelector('.total-price');
const checkoutBtn = document.querySelector('.checkout-btn');

const closeCart = () => {
    cartPanel.classList.remove('active');
    cartOverlay.classList.remove('active');
};

cartBtn.addEventListener('click', () => {
    cartPanel.classList.add('active');
    cartOverlay.classList.add('active');
    gsap.timeline()
        .fromTo(cartPanel, { x: 400, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' })
        .fromTo(cartOverlay, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
});

closeCartBtn?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);

document.querySelectorAll('.product-action-btn.cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.product-card');
        const priceMatch = card.querySelector('.product-price').textContent.match(/\$(\d+\.\d{2})/);
        const numericPrice = parseFloat(priceMatch[1]);
        const existingItem = cart.find(item => item.name === card.querySelector('.product-name').textContent);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                name: card.querySelector('.product-name').textContent,
                price: numericPrice,
                displayPrice: '$' + numericPrice.toFixed(2),
                image: card.querySelector('.product-image').src,
                id: Date.now(),
                quantity: 1
            });
        }
        updateCart();
        gsap.fromTo(btn, { scale: 1 }, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
        gsap.to(cartCount, { scale: 1.5, duration: 0.2, yoyo: true, repeat: 1 });
    });
});

function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (!cart.length) {
        cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        totalPrice.textContent = '$0';
        return;
    }

    let total = 0;
    cartItems.innerHTML = '';

    cart.forEach(item => {
        const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
        const itemTotal = itemPrice * item.quantity;
        total += itemTotal;
        const displayPrice = item.displayPrice || '$' + itemPrice.toFixed(2);
        
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-header">
                    <div class="cart-item-name">${item.name}</div>
                    <button class="remove-item-btn" data-id="${item.id}">Remove</button>
                </div>
                <div class="cart-item-price">${displayPrice}</div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn minus-btn" data-id="${item.id}">−</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="qty-btn plus-btn" data-id="${item.id}">+</button>
                    </div>
                    <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
                </div>
            </div>
        `;
        cartItems.appendChild(cartItemEl);
    });

    totalPrice.textContent = `$${total.toFixed(2)}`;
    
    // Add event listeners for quantity buttons
    document.querySelectorAll('.plus-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = cart.find(i => i.id == btn.dataset.id);
            if (item) {
                item.quantity++;
                updateCart();
                gsap.fromTo(btn, { scale: 1 }, { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1 });
            }
        });
    });
    
    document.querySelectorAll('.minus-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = cart.find(i => i.id == btn.dataset.id);
            if (item && item.quantity > 1) {
                item.quantity--;
                updateCart();
                gsap.fromTo(btn, { scale: 1 }, { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1 });
            } else if (item) {
                cart = cart.filter(i => i.id !== item.id);
                updateCart();
            }
        });
    });
    
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cart = cart.filter(item => item.id != btn.dataset.id);
            updateCart();
        });
    });
}

// Payment Modal Functionality
const paymentModal = document.querySelector('.payment-modal');
const paymentOverlay = document.querySelector('.payment-overlay');
const successModal = document.querySelector('.success-modal');
const paymentModalClose = document.querySelector('.payment-modal-close');
const successCloseBtn = document.querySelector('.success-close-btn');
const payNowBtn = document.getElementById('payNowBtn');
const cardPaymentForm = document.getElementById('cardPaymentForm');
const cardholderName = document.getElementById('cardholderName');
const cardNumber = document.getElementById('cardNumber');
const cardExpiry = document.getElementById('cardExpiry');
const cardCVV = document.getElementById('cardCVV');

let selectedPaymentMethod = null;

// Payment methods data
const paymentMethods = {
    card: { name: 'Credit/Debit Card', icon: 'fas fa-credit-card' },
    cod: { name: 'Cash on Delivery', icon: 'fas fa-truck' },
    upi: { name: 'UPI/Mobile', icon: 'fas fa-mobile-alt' },
    bank: { name: 'Bank Transfer', icon: 'fas fa-university' }
};

// Open payment modal
const openPaymentModal = () => {
    paymentModal.classList.add('active');
    paymentOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    selectedPaymentMethod = null;
    populateOrderSummary();
    resetPaymentForm();
};

// Close payment modal
const closePaymentModal = () => {
    paymentModal.classList.remove('active');
    paymentOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
};

// Close success modal
const closeSuccessModal = () => {
    successModal.classList.remove('active');
    paymentOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
};

// Populate order summary in payment modal
const populateOrderSummary = () => {
    const orderItemsSummary = document.getElementById('orderItemsSummary');
    const orderTotalPrice = document.getElementById('orderTotalPrice');
    
    orderItemsSummary.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
        const itemTotal = itemPrice * item.quantity;
        total += itemTotal;

        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div class="order-item-content">
                <img src="${item.image}" alt="${item.name}" class="order-item-image">
                <div class="order-item-info">
                    <span class="order-item-name">${item.name}</span>
                    <span class="order-item-qty">Qty: ${item.quantity}</span>
                </div>
            </div>
            <span class="order-item-price">$${itemTotal.toFixed(2)}</span>
        `;
        orderItemsSummary.appendChild(orderItem);
    });

    orderTotalPrice.textContent = `$${total.toFixed(2)}`;
};

// Reset payment form
const resetPaymentForm = () => {
    cardholderName.value = '';
    cardNumber.value = '';
    cardExpiry.value = '';
    cardCVV.value = '';
    document.getElementById('codFullName').value = '';
    document.getElementById('codEmail').value = '';
    document.getElementById('codPhone').value = '';
    document.getElementById('codAddress').value = '';
    document.getElementById('codCity').value = '';
    document.getElementById('codPostalCode').value = '';
    document.getElementById('codNotes').value = '';
};

// Payment method selection
document.querySelectorAll('.payment-method-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedPaymentMethod = card.dataset.method;

        // Show/hide card form
        if (selectedPaymentMethod === 'card') {
            cardPaymentForm.classList.remove('hidden');
            document.getElementById('codDeliveryForm').classList.add('hidden');
        } else if (selectedPaymentMethod === 'cod') {
            cardPaymentForm.classList.add('hidden');
            document.getElementById('codDeliveryForm').classList.remove('hidden');
        } else {
            cardPaymentForm.classList.add('hidden');
            document.getElementById('codDeliveryForm').classList.add('hidden');
        }
    });
});

// Card number formatting
cardNumber.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s+/g, '');
    let formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
    e.target.value = formattedValue.slice(0, 19);
});

// Card expiry formatting
cardExpiry.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
});

// Card CVV (only numbers)
cardCVV.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Phone number validation
document.getElementById('codPhone').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Postal code validation
document.getElementById('codPostalCode').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9\s-]/g, '');
});

// Process payment
const processPayment = () => {
    if (!selectedPaymentMethod) {
        alert('Please select a payment method');
        return;
    }

    // Validate card payment
    if (selectedPaymentMethod === 'card') {
        if (!cardholderName.value.trim()) {
            alert('Please enter cardholder name');
            return;
        }
        if (!cardNumber.value || cardNumber.value.replace(/\s/g, '').length < 16) {
            alert('Please enter a valid card number');
            return;
        }
        if (!cardExpiry.value || cardExpiry.value.length < 5) {
            alert('Please enter a valid expiry date');
            return;
        }
        if (!cardCVV.value || cardCVV.value.length < 3) {
            alert('Please enter a valid CVV');
            return;
        }
    }

    // Validate COD delivery details
    if (selectedPaymentMethod === 'cod') {
        const codFullName = document.getElementById('codFullName').value.trim();
        const codEmail = document.getElementById('codEmail').value.trim();
        const codPhone = document.getElementById('codPhone').value.trim();
        const codAddress = document.getElementById('codAddress').value.trim();
        const codCity = document.getElementById('codCity').value.trim();
        const codPostalCode = document.getElementById('codPostalCode').value.trim();

        if (!codFullName) {
            alert('Please enter your full name');
            return;
        }
        if (!codEmail || !codEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            alert('Please enter a valid email address');
            return;
        }
        if (!codPhone || codPhone.length < 10) {
            alert('Please enter a valid phone number');
            return;
        }
        if (!codAddress) {
            alert('Please enter your address');
            return;
        }
        if (!codCity) {
            alert('Please enter your city');
            return;
        }
        if (!codPostalCode) {
            alert('Please enter your postal code');
            return;
        }
    }

    // Simulate payment processing
    payNowBtn.classList.add('loading');
    payNowBtn.textContent = 'Processing...';

    // Simulate API call with delay
    setTimeout(() => {
        showSuccessMessage();
        payNowBtn.classList.remove('loading');
        payNowBtn.textContent = 'Pay Now';
        closePaymentModal();
        cart = [];
        updateCart();
    }, 1500);
};

// Show success message
const showSuccessMessage = () => {
    const orderId = 'ORD-' + Date.now().toString().slice(-8);
    document.getElementById('orderIdDisplay').textContent = `Order ID: ${orderId}`;
    successModal.classList.add('active');
};

// Event listeners
checkoutBtn?.addEventListener('click', () => {
    if (!cart.length) {
        alert('Your cart is empty!');
        return;
    }
    openPaymentModal();
});

paymentModalClose?.addEventListener('click', closePaymentModal);
paymentOverlay?.addEventListener('click', closePaymentModal);
payNowBtn?.addEventListener('click', processPayment);
successCloseBtn?.addEventListener('click', () => {
    closeSuccessModal();
});

// Product Details Modal
const productModal = document.querySelector('.product-modal');
const modalOverlay = document.querySelector('.modal-overlay');
const modalCloseBtn = document.querySelector('.modal-close-btn');

const productData = {
    '1': { name: 'Sterling Silver', originalPrice: '$80.00', currentPrice: '$69.00', rating: 4.5, reviews: 128 },
    '2': { name: 'Ruby Necklace', originalPrice: '$85.00', currentPrice: '$75.00', rating: 4.8, reviews: 95 },
    '3': { name: 'Rose Necklace', originalPrice: '$95.00', currentPrice: '$85.00', rating: 4.6, reviews: 112 },
    '4': { name: 'Necklace Diamond', originalPrice: '$140.00', currentPrice: '$120.00', rating: 5.0, reviews: 156 },
    '5': { name: 'Sterling Silver', originalPrice: '$110.00', currentPrice: '$95.00', rating: 4.7, reviews: 98 },
    '6': { name: 'Ruby Necklace', originalPrice: '$70.00', currentPrice: '$60.00', rating: 4.5, reviews: 87 },
    '7': { name: 'Rose Necklace', originalPrice: '$170.00', currentPrice: '$150.00', rating: 4.9, reviews: 142 },
    '8': { name: 'Necklace Diamond', originalPrice: '$160.00', currentPrice: '$140.00', rating: 4.8, reviews: 134 },
    '9': { name: 'Ruby Necklace', originalPrice: '$150.00', currentPrice: '$130.00', rating: 4.7, reviews: 119 },
    '10': { name: 'Emerald Bracelet', originalPrice: '$95.00', currentPrice: '$78.00', rating: 4.6, reviews: 104 },
    '11': { name: 'Sapphire Ring', originalPrice: '$125.00', currentPrice: '$105.00', rating: 4.7, reviews: 98 },
    '12': { name: 'Pearl Earrings', originalPrice: '$72.00', currentPrice: '$55.00', rating: 4.4, reviews: 76 },
    '13': { name: 'Gold Pendant', originalPrice: '$115.00', currentPrice: '$92.00', rating: 4.8, reviews: 112 }
};

const openProductModal = (productCard) => {
    const productId = productCard.dataset.productId;
    const data = productData[productId];
    const image = productCard.querySelector('.product-image')?.src || productCard.querySelector('.product-placeholder')?.parentElement?.src || '';
    
    document.querySelector('.modal-product-image').src = image;
    document.querySelector('.modal-product-name').textContent = data.name;
    document.querySelector('.modal-current-price').textContent = data.currentPrice;
    document.querySelector('.modal-old-price').textContent = data.originalPrice;
    document.querySelector('.rating-text').textContent = `${data.rating} (${data.reviews} reviews)`;
    
    // Generate star rating
    const starsContainer = document.querySelector('.stars');
    const fullStars = Math.floor(data.rating);
    const hasHalfStar = data.rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHTML += '<span class="star full">★</span>';
        } else if (i === fullStars && hasHalfStar) {
            starsHTML += '<span class="star half">★</span>';
        } else {
            starsHTML += '<span class="star empty">★</span>';
        }
    }
    starsContainer.innerHTML = starsHTML;
    
    // Calculate discount
    const original = parseFloat(data.originalPrice.replace('$', ''));
    const current = parseFloat(data.currentPrice.replace('$', ''));
    const discount = Math.round(((original - current) / original) * 100);
    document.querySelector('.discount-badge').textContent = `-${discount}%`;
    
    // Store current product ID for add to cart
    document.querySelector('.modal-add-to-cart-btn').dataset.productId = productId;
    
    productModal.classList.add('active');
    modalOverlay.classList.add('active');
    
    gsap.timeline()
        .fromTo(productModal, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' })
        .fromTo(modalOverlay, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
};

const closeProductModal = () => {
    gsap.timeline()
        .to(productModal, { opacity: 0, scale: 0.9, duration: 0.3, ease: 'back.in(1.7)' })
        .to(modalOverlay, { opacity: 0, duration: 0.2 }, 0)
        .then(() => {
            productModal.classList.remove('active');
            modalOverlay.classList.remove('active');
        });
};

modalCloseBtn?.addEventListener('click', closeProductModal);
modalOverlay?.addEventListener('click', closeProductModal);

// Modal add to cart button
document.querySelector('.modal-add-to-cart-btn')?.addEventListener('click', (e) => {
    const productId = e.target.dataset.productId;
    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
    
    if (productCard) {
        const data = productData[productId];
        const currentPrice = data.currentPrice;
        const numPriceFromModal = parseFloat(currentPrice.replace('$', ''));
        const existingItem = cart.find(item => item.name === data.name);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                name: data.name,
                price: numPriceFromModal,
                displayPrice: currentPrice,
                image: productCard.querySelector('.product-image').src,
                id: Date.now(),
                quantity: 1
            });
        }
        updateCart();
        closeProductModal();
        
        // Open cart panel to show the added item
        cartPanel.classList.add('active');
        cartOverlay.classList.add('active');
        gsap.timeline()
            .fromTo(cartPanel, { x: 400, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' })
            .fromTo(cartOverlay, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
    }
});

// Quick view
document.querySelectorAll('.eye-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const productCard = btn.closest('.product-card');
        openProductModal(productCard);
    });
});


// SCROLL OBSERVER
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 100);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.lazy-element').forEach(el => observer.observe(el));

// INITIAL ANIMATIONS
gsap.from('.logo', { opacity: 0, x: -30, duration: 1, ease: 'power3.out', delay: 0.2 });
gsap.from('.nav-link', { opacity: 0, y: -20, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.3 });
gsap.from('.hero-slide.active .hero-image', { scale: 1.2, duration: 1.5, ease: 'power2.out' });
gsap.from('.hero-slide.active .hero-content', { opacity: 0, x: -50, duration: 1, delay: 0.5, ease: 'power3.out' });

// HOVER ANIMATIONS
const addHoverAnimation = (selector, onEnter, onLeave) => {
    document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('mouseenter', () => onEnter(el));
        el.addEventListener('mouseleave', () => onLeave(el));
    });
};

addHoverAnimation('.category-card', (card) => {
    gsap.to(card.querySelector('.category-image'), { scale: 1.1, duration: 0.5, ease: 'power2.out' });
    gsap.to(card.querySelector('.category-btn'), { opacity: 1, duration: 0.3 });
}, (card) => {
    gsap.to(card.querySelector('.category-image'), { scale: 1, duration: 0.5, ease: 'power2.out' });
    gsap.to(card.querySelector('.category-btn'), { opacity: 0, duration: 0.3 });
});

addHoverAnimation('.product-card', (card) => {
    gsap.to(card, { y: -10, duration: 0.3, ease: 'power2.out' });
}, (card) => {
    gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' });
});

addHoverAnimation('.instagram-item', (item) => {
    gsap.to(item.querySelector('img'), { duration: 0.35, ease: 'power3.out', filter: 'brightness(0.9) blur(1px)' });
}, (item) => {
    gsap.to(item.querySelector('img'), { duration: 0.35, ease: 'power3.out', filter: 'brightness(1) blur(0px)' });
});

// SCROLL TRIGGER ANIMATIONS
const scrollAnimate = (selector, config = {}) => {
    gsap.from(selector, {
        scrollTrigger: { trigger: selector, start: 'top 80%', ...config.scrollTrigger },
        ...config.animation
    });
};

scrollAnimate('.section-title', { scrollTrigger: { toggleActions: 'play none none reverse' }, animation: { opacity: 0, y: 30, duration: 1, ease: 'power3.out' } });
scrollAnimate('.collection-title', { animation: { opacity: 0, y: 30, duration: 1, ease: 'power3.out' } });
scrollAnimate('.collection-text', { animation: { opacity: 0, y: 20, duration: 0.8, delay: 0.2, ease: 'power3.out' } });
scrollAnimate('.shop-now-btn', { animation: { opacity: 0, scale: 0.8, duration: 0.6, delay: 0.4, ease: 'back.out(1.7)' } });
scrollAnimate('.deals-title', { animation: { opacity: 0, y: 30, duration: 1, ease: 'power3.out' } });

// COLLECTION PARALLAX
document.querySelectorAll('.collection-image').forEach(image => {
    gsap.to(image.querySelector('img'), {
        scrollTrigger: { trigger: image, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
        y: -60, ease: 'none'
    });
});

// CATEGORY BUTTONS
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        alert(`Viewing ${btn.closest('.category-card').querySelector('.category-title').textContent} collection`);
    });
});

// INSTAGRAM ITEMS
document.querySelectorAll('.instagram-item').forEach(item => {
    item.addEventListener('click', () => {
        gsap.to(item, { scale: 0.95, duration: 0.15, onComplete: () => gsap.to(item, { scale: 1, duration: 0.15 }) });
        alert('View on Instagram');
    });
});

// SMOOTH SCROLLING
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target && window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
});

// SCROLL TO TOP
const scrollTopBtn = document.querySelector('.scroll-top-btn');
window.addEventListener('scroll', () => {
    scrollTopBtn?.classList.toggle('visible', window.pageYOffset > 300);
});
scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// HERO CTA
document.querySelectorAll('.hero-cta').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' });
    });
});

// MOBILE MENU
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-link');

const toggleMenu = (show) => {
    navLinks.classList.toggle('active', show);
    const icon = hamburger.querySelector('i');
    icon.classList.toggle('fa-xmark', show);
    icon.classList.toggle('fa-bars', !show);
};

hamburger?.addEventListener('click', () => toggleMenu(navLinks.classList.contains('active') === false));
navLinksItems.forEach(item => item.addEventListener('click', () => toggleMenu(false)));
document.addEventListener('click', (e) => {
    if (!hamburger?.contains(e.target) && !navLinks?.contains(e.target)) {
        toggleMenu(false);
    }
});
// ==================== SEARCH FUNCTIONALITY ====================
// All products data
const allProducts = [
    { id: 1, name: 'Sterling Silver', price: '$69.00', oldPrice: '$80.00', image: 'images/product1.png.jpeg' },
    { id: 2, name: 'Ruby Necklace', price: '$75.00', oldPrice: '$85.00', image: 'images/product2.png.jpeg' },
    { id: 3, name: 'Rose Necklace', price: '$85.00', oldPrice: '$95.00', image: 'images/product3.png.jpeg' },
    { id: 4, name: 'Necklace Diamond', price: '$120.00', oldPrice: '$140.00', image: 'images/product4.png.jpeg' },
    { id: 5, name: 'Sterling Silver', price: '$95.00', oldPrice: '$110.00', image: 'images/product7.png.jpeg' },
    { id: 6, name: 'Ruby Necklace', price: '$60.00', oldPrice: '$70.00', image: 'images/product11.png.jpeg' },
    { id: 7, name: 'Rose Necklace', price: '$150.00', oldPrice: '$170.00', image: 'images/product9.png.jpeg' },
    { id: 8, name: 'Necklace Diamond', price: '$110.00', oldPrice: '$130.00', image: 'images/product10.png.jpeg' },
    { id: 9, name: 'Ruby Necklace', price: '$130.00', oldPrice: '$150.00', image: 'images/product11.png.jpeg' },
    { id: 10, name: 'Emerald Bracelet', price: '$78.00', oldPrice: '$95.00', image: 'images/product15.png.jpeg' },
    { id: 11, name: 'Sapphire Ring', price: '$105.00', oldPrice: '$125.00', image: 'images/product16.png.jpeg' },
    { id: 12, name: 'Pearl Earrings', price: '$55.00', oldPrice: '$72.00', image: 'images/product17.png.jpeg' },
    { id: 13, name: 'Gold Pendant', price: '$92.00', oldPrice: '$115.00', image: 'images/product18.png.jpeg' }
];

// Search modal elements
const searchModal = document.querySelector('.search-modal');
const searchOverlay = document.querySelector('.search-overlay');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.querySelector('.search-btn');
const searchModalClose = document.querySelector('.search-modal-close');
const searchSuggestions = document.getElementById('searchSuggestions');
const suggestionsList = document.getElementById('suggestionsList');
const searchResults = document.getElementById('searchResults');
const resultsGrid = document.getElementById('resultsGrid');
const noResults = document.getElementById('noResults');

// Debounce function
const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

// Get search history from localStorage
const getSearchHistory = () => {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
};

// Save to search history
const saveToHistory = (query) => {
    let history = getSearchHistory();
    if (!history.includes(query)) {
        history.unshift(query);
        if (history.length > 10) {
            history.pop();
        }
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }
};

// Display search history/suggestions
const displaySuggestions = () => {
    const history = getSearchHistory();
    suggestionsList.innerHTML = '';
    
    if (history.length === 0) {
        searchSuggestions.classList.add('hidden');
        return;
    }

    history.forEach(term => {
        const tag = document.createElement('span');
        tag.className = 'suggestion-tag';
        tag.textContent = term;
        tag.addEventListener('click', () => {
            searchInput.value = term;
            performSearch(term);
        });
        suggestionsList.appendChild(tag);
    });

    searchSuggestions.classList.remove('hidden');
};

// Clear search history
const clearSearchHistory = () => {
    localStorage.removeItem('searchHistory');
    suggestionsList.innerHTML = '';
    searchSuggestions.classList.add('hidden');
    displayDefaultProducts();
};

document.getElementById('clearHistoryBtn')?.addEventListener('click', clearSearchHistory);

// Display default products (8 products)
const displayDefaultProducts = () => {
    const defaultProductsGrid = document.getElementById('defaultProductsGrid');
    const defaultProducts = document.getElementById('defaultProducts');
    
    defaultProductsGrid.innerHTML = '';
    const productsToShow = allProducts.slice(0, 8);

    productsToShow.forEach(product => {
        const card = document.createElement('div');
        card.className = 'search-result-card';
        card.innerHTML = `
            <div class="search-result-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<span>📸</span>'}
            </div>
            <div class="search-result-info">
                <div class="search-result-name">${product.name}</div>
                <div class="search-result-price">
                    ${product.price}
                    <span class="old-price">${product.oldPrice}</span>
                </div>
                <button class="search-result-btn" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        defaultProductsGrid.appendChild(card);

        // Add to cart functionality
        card.querySelector('.search-result-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const priceValue = parseFloat(product.price.replace('$', ''));
            const existingItem = cart.find(item => item.name === product.name);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    name: product.name,
                    price: priceValue,
                    displayPrice: product.price,
                    image: product.image || 'images/placeholder.jpg',
                    id: product.id,
                    quantity: 1
                });
            }
            updateCart();
            gsap.fromTo(card.querySelector('.search-result-btn'), { scale: 1 }, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
        });
    });

    defaultProducts.classList.remove('hidden');
};

// Perform search
const performSearch = (query) => {
    const trimmedQuery = query.toLowerCase().trim();

    if (!trimmedQuery) {
        searchResults.classList.add('hidden');
        noResults.classList.add('hidden');
        document.getElementById('defaultProducts').classList.remove('hidden');
        displaySuggestions();
        return;
    }

    saveToHistory(trimmedQuery);

    const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(trimmedQuery)
    );

    searchSuggestions.classList.add('hidden');
    document.getElementById('defaultProducts').classList.add('hidden');

    if (filtered.length === 0) {
        searchResults.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }

    resultsGrid.innerHTML = '';
    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'search-result-card';
        card.innerHTML = `
            <div class="search-result-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<span>📸</span>'}
            </div>
            <div class="search-result-info">
                <div class="search-result-name">${product.name}</div>
                <div class="search-result-price">
                    ${product.price}
                    <span class="old-price">${product.oldPrice}</span>
                </div>
                <button class="search-result-btn" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        resultsGrid.appendChild(card);

        // Add to cart functionality
        card.querySelector('.search-result-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const priceValue = parseFloat(product.price.replace('$', ''));
            const existingItem = cart.find(item => item.name === product.name);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    name: product.name,
                    price: priceValue,
                    displayPrice: product.price,
                    image: product.image || 'images/placeholder.jpg',
                    id: product.id,
                    quantity: 1
                });
            }
            updateCart();
            gsap.fromTo(card.querySelector('.search-result-btn'), { scale: 1 }, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
        });
    });

    searchResults.classList.remove('hidden');
    noResults.classList.add('hidden');
};

// Debounced search
const debouncedSearch = debounce(performSearch, 300);

// Search input event
searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
});

// Open search modal
const openSearch = () => {
    searchModal.classList.add('active');
    searchOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    searchInput.focus();
    searchInput.value = '';
    searchResults.classList.add('hidden');
    noResults.classList.add('hidden');
    displayDefaultProducts();
    displaySuggestions();
};

// Close search modal
const closeSearch = () => {
    searchModal.classList.remove('active');
    searchOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    searchInput.value = '';
    searchResults.classList.add('hidden');
    noResults.classList.add('hidden');
};

// Event listeners
searchBtn?.addEventListener('click', openSearch);
searchModalClose?.addEventListener('click', closeSearch);
searchOverlay?.addEventListener('click', closeSearch);

// Close on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModal.classList.contains('active')) {
        closeSearch();
    }
});