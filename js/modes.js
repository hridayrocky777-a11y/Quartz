/* ========================================
   Quartz Modes Selection - JavaScript
   Interactive Features
   ======================================== */

// ========================================
// DOM Elements
// ========================================

const modeCards = document.querySelectorAll('.mode-card');
const modeButtons = document.querySelectorAll('.mode-button');
const header = document.querySelector('.header');
const titleSection = document.querySelector('.title-section');
const modesContainer = document.querySelector('.modes-container');

// ========================================
// Card Interaction Effects
// ========================================

/**
 * Add interactive effects to mode cards
 */
modeCards.forEach((card, index) => {
    // Hover animation
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-12px)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });

    // Click feedback
    card.addEventListener('click', function(e) {
        const button = this.querySelector('.mode-button');
        if (button) {
            button.click();
        }
    });

    // Staggered animation on load
    card.style.animation = `fadeInUp 0.8s ease-out ${0.4 + index * 0.2}s both`;
});

// ========================================
// Button Interactions
// ========================================

/**
 * Handle mode button clicks with visual feedback
 */
modeButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        // Create ripple effect
        createRipple(e, this);

        const text = this.textContent.trim();
        const href = this.getAttribute('href');

        console.log(`Button clicked: ${text}`);
        console.log(`Redirecting to: ${href}`);

        // Show transition effect
        document.body.style.animation = 'fadeOut 0.3s ease-out';

        // Navigate after animation
        setTimeout(() => {
            window.location.href = href;
        }, 300);
    });

    // Add hover effects
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(4px) translateY(-2px)';
    });

    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0) translateY(0)';
    });
});

// ========================================
// Ripple Effect Animation
// ========================================

/**
 * Create ripple effect on button click
 */
function createRipple(event, button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// ========================================
// Add Ripple Styles Dynamically
// ========================================

/**
 * Add ripple animation styles
 */
function setupRippleStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: rippleAnimation 0.6s ease-out;
            pointer-events: none;
        }

        @keyframes rippleAnimation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// Page Transition Animation
// ========================================

/**
 * Add fade-in animation on page load
 */
function setupPageAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        body {
            animation: fadeInBody 0.6s ease-out;
        }

        @keyframes fadeInBody {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// Keyboard Shortcuts
// ========================================

/**
 * Setup keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Press 'H' for Home Mode
    if (e.key === 'h' || e.key === 'H') {
        const homeButton = document.querySelector('.home-button');
        if (homeButton) {
            homeButton.click();
        }
    }

    // Press 'S' for School Mode
    if (e.key === 's' || e.key === 'S') {
        const schoolButton = document.querySelector('.school-button');
        if (schoolButton) {
            schoolButton.click();
        }
    }
});

// ========================================
// Accessibility Enhancements
// ========================================

/**
 * Add keyboard navigation support
 */
modeCards.forEach((card, index) => {
    card.setAttribute('tabindex', '0');

    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const button = card.querySelector('.mode-button');
            if (button) {
                button.click();
            }
        }
    });
});

// ========================================
// Intersection Observer for Animations
// ========================================

/**
 * Setup intersection observer for additional animations
 */
function setupIntersectionObserver() {
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, options);

    // Observe all cards
    modeCards.forEach(card => {
        observer.observe(card);
    });
}

// ========================================
// Console Welcome Message
// ========================================

/**
 * Log welcome message to console
 */
function logWelcomeMessage() {
    console.log('%c🚀 Welcome to Quartz Mode Selection!', 'color: #00d4ff; font-size: 20px; font-weight: bold;');
    console.log('%cChoose your learning mode', 'color: #00d4ff; font-size: 14px;');
    console.log('%cKeyboard Shortcuts:', 'color: #b855ff; font-weight: bold;');
    console.log('%cPress "H" for Home Mode', 'color: #b855ff;');
    console.log('%cPress "S" for School Mode', 'color: #b855ff;');
}

// ========================================
// Performance Tracking
// ========================================

/**
 * Track which mode user selects
 */
modeButtons.forEach(button => {
    button.addEventListener('click', function() {
        const mode = this.classList.contains('home-button') ? 'Home Mode' : 'School Mode';
        console.log(`📊 User selected: ${mode}`);

        // Could send analytics here
        if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'mode_selected', {
                'mode': mode
            });
        }
    });
});

// ========================================
// Initialize Application
// ========================================

/**
 * Initialize all features on page load
 */
function initializeApp() {
    console.log('✅ Modes Selection Page Initialized');

    // Setup animations and styles
    setupRippleStyles();
    setupPageAnimation();
    setupIntersectionObserver();

    // Log welcome message
    logWelcomeMessage();

    // Log page info
    console.log('🎨 Glassmorphism design active');
    console.log('⚡ Interactive elements ready');
    console.log('🎯 Navigation ready');
}

// ========================================
// Event Listeners
// ========================================

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ========================================
// Smooth Scroll Support
// ========================================

/**
 * Smooth scroll to elements
 */
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// ========================================
// Mobile Optimization
// ========================================

/**
 * Optimize for mobile devices
 */
function optimizeForMobile() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        // Reduce animation duration on mobile
        document.documentElement.style.setProperty('--transition-normal', '0.2s ease-in-out');
        console.log('📱 Mobile optimizations applied');
    }
}

optimizeForMobile();

// ========================================
// Prevent User Journey Confusion
// ========================================

/**
 * Add visual feedback for mode selection
 */
modeCards.forEach(card => {
    const modeType = card.classList.contains('home-mode') ? 'Home' : 'School';

    card.addEventListener('focus', () => {
        console.log(`👁️ Focused on: ${modeType} Mode`);
    });
});
