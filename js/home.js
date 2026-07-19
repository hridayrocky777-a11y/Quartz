/* ========================================
   Quartz Home Dashboard - JavaScript
   Interactive Features & Functionality
   ======================================== */

// Supabase and login removed — app opens directly to Home

// ========================================
// DOM Elements
// ========================================

const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const menuItems = document.querySelectorAll('.menu-item');
const statCards = document.querySelectorAll('.stat-card');
const noteCards = document.querySelectorAll('.note-card');
const chatItems = document.querySelectorAll('.chat-item');
const toolCards = document.querySelectorAll('.tool-card');
const buttons = document.querySelectorAll('.btn');
const toolButtons = document.querySelectorAll('.tool-btn');
const sidebar = document.querySelector('.sidebar');

// ========================================
// Mobile Menu Toggle
// ========================================

/**
 * Toggle mobile menu visibility
 */
menuToggle?.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

/**
 * Close mobile menu when a nav link is clicked
 */
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

// ========================================
// Navigation Active State
// ========================================

/**
 * Update active navigation link based on scroll or click
 */
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

/**
 * Update active sidebar menu item
 */
menuItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});

// ========================================
// Smooth Scroll Animation
// ========================================

/**
 * Smooth scroll to element
 */
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// ========================================
// Card Interaction Effects
// ========================================

/**
 * Add interactive effects to stat cards
 */
statCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });

    // Add click handler
    card.addEventListener('click', function() {
        const label = this.querySelector('.stat-label').textContent;
        console.log(`Clicked stat card: ${label}`);
        showNotification(`${label} clicked!`);
    });
});

/**
 * Add interactive effects to note cards
 */
noteCards.forEach((card, index) => {
    card.addEventListener('click', function() {
        const title = this.querySelector('.note-title').textContent;
        console.log(`Opened note: ${title}`);
        showNotification(`Opening note: ${title}`, 'info');
    });

    // Add staggered animation on load
    card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
});

/**
 * Add interactive effects to chat items
 */
chatItems.forEach((item, index) => {
    item.addEventListener('click', function() {
        const title = this.querySelector('.chat-title').textContent;
        console.log(`Opening chat: ${title}`);
        showNotification(`Opening chat: ${title}`, 'info');
    });

    item.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
});

/**
 * Add interactive effects to tool cards
 */
toolCards.forEach((card, index) => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });

    card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
});

// ========================================
// Button Interactions
// ========================================

/**
 * Handle primary button clicks
 */
buttons.forEach(button => {
    button.addEventListener('click', function(e) {
        // Create ripple effect
        createRipple(e, this);

        const text = this.textContent.trim();
        console.log(`Button clicked: ${text}`);

        if (text === 'Continue Learning') {
            showNotification('Redirecting to learning dashboard...', 'success');
            // Simulate navigation
            setTimeout(() => {
                console.log('Navigate to learning');
            }, 1000);
        } else if (text === 'Open Notes') {
            showNotification('Opening your notes...', 'success');
            // Simulate navigation
            setTimeout(() => {
                console.log('Navigate to notes');
            }, 1000);
        } else if (text === 'New Chat') {
            showWorkspace();
        }
    });
});

/**
 * Handle tool button clicks
 */
toolButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        createRipple(e, this);
        const toolTitle = this.closest('.tool-card').querySelector('.tool-title').textContent;
        showNotification(`Opening ${toolTitle}...`, 'success');
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
// Notification System
// ========================================

/**
 * Show notification toast
 */
function showNotification(message, type = 'default') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
            z-index: 2000;
            max-width: 300px;
            word-wrap: break-word;
        }

        .notification-default {
            background: rgba(100, 100, 255, 0.2);
            border: 1px solid rgba(100, 100, 255, 0.3);
            color: #00d4ff;
        }

        .notification-success {
            background: rgba(0, 212, 255, 0.2);
            border: 1px solid rgba(0, 212, 255, 0.3);
            color: #00d4ff;
        }

        .notification-info {
            background: rgba(184, 85, 255, 0.2);
            border: 1px solid rgba(184, 85, 255, 0.3);
            color: #b855ff;
        }

        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;

    if (!document.querySelector('style[data-notifications]')) {
        style.setAttribute('data-notifications', 'true');
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========================================
// Scroll Animation Setup
// ========================================

/**
 * Add fade-in animations for elements on scroll
 */
function setupScrollAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

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
    `;
    document.head.appendChild(style);
}

// ========================================
// Intersection Observer for Scroll Effects
// ========================================

/**
 * Setup intersection observer for scroll animations
 */
function setupIntersectionObserver() {
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, options);

    // Observe all cards
    const allCards = document.querySelectorAll(
        '.stat-card, .note-card, .chat-item, .tool-card'
    );
    allCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });
}

// ========================================
// Responsive Sidebar
// ========================================

/**
 * Handle sidebar responsiveness
 */
function handleResponsive() {
    const width = window.innerWidth;

    if (width <= 768) {
        sidebar.classList.add('mobile');
    } else {
        sidebar.classList.remove('mobile');
    }
}

window.addEventListener('resize', handleResponsive);

// ========================================
// Profile Icon Click Handler
// ========================================

/**
 * Handle profile icon click
 */
const profileBtn = document.querySelector('.profile-btn');
profileBtn?.addEventListener('click', () => {
    showNotification('Opening profile...', 'info');
    console.log('Navigate to profile');
});

// ========================================
// Upgrade Button Handler
// ========================================

/**
 * Handle upgrade button click
 */
const upgradeBtn = document.querySelector('.upgrade-btn');
upgradeBtn?.addEventListener('click', () => {
    showNotification('Redirecting to upgrade page...', 'success');
    console.log('Navigate to upgrade');
});

// ========================================
// Account Logout Handler
// ========================================

/**
 * Handle logout button click
 */
const logoutBtn = document.querySelector('.account-logout');
logoutBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        showNotification('Logging out...', 'default');
        setTimeout(() => {
            console.log('Navigate to login');
        }, 1000);
    }
});

// ========================================
// Theme Toggle
// ========================================

/**
 * Handle theme toggle
 */
const themeToggle = document.querySelector('.theme-toggle-btn');
let isLightTheme = false;

function applyTheme(theme) {
    document.body.classList.toggle('light-theme', theme === 'light');
    document.body.classList.toggle('dark-theme', theme === 'dark');
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to normal mode' : 'Switch to light mode');
        themeToggle.title = theme === 'light' ? 'Switch to normal mode' : 'Switch to light mode';
        themeToggle.innerHTML = theme === 'light'
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
            : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"></path></svg>';
    }
}

themeToggle?.addEventListener('click', () => {
    isLightTheme = !isLightTheme;
    const nextTheme = isLightTheme ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('quartz-theme', nextTheme);
    showNotification(nextTheme === 'light' ? 'Light mode enabled' : 'Normal mode restored', 'default');
});

const savedTheme = localStorage.getItem('quartz-theme');
if (savedTheme === 'light') {
    isLightTheme = true;
    applyTheme('light');
} else {
    applyTheme('dark');
}

// ========================================
// Keyboard Shortcuts
// ========================================

/**
 * Setup keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        showNotification('Opening search...', 'info');
    }

    // Escape to close any active elements
    if (e.key === 'Escape') {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
    }
});

// ========================================
// Initialize Application
// ========================================

/**
 * Initialize all features on page load
 */
function initializeApp() {
    console.log('🚀 Quartz Dashboard Initialized');

    // Setup animations
    setupScrollAnimations();
    setupIntersectionObserver();

    // Handle responsive
    handleResponsive();

    // Log app info
    console.log('✅ All features loaded');
    console.log('🎨 Glassmorphism design ready');
    console.log('⚡ Interactive elements active');
}

// Login and auth logic removed — app shows Home directly


// ========================================
// Event Listeners
// ========================================

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeApp();
    });
} else {
    initializeApp();
}

// ========================================
// Performance Optimization
// ========================================

/**
 * Lazy load images (for future use)
 */
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ========================================
// Console Welcome Message
// ========================================

console.log('%c🚀 Welcome to Quartz!', 'color: #00d4ff; font-size: 20px; font-weight: bold;');
console.log('%cYour AI-powered learning workspace', 'color: #00d4ff; font-size: 14px;');
console.log('%cMade for Students. Built by Students. 🎓', 'color: #b855ff; font-size: 12px;');
