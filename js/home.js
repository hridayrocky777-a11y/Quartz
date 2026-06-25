/* ========================================
   Quartz Home Dashboard - JavaScript
   Interactive Features & Functionality
   ======================================== */

// ========================================
// Supabase Configuration
// ========================================

const SUPABASE_URL = "https://gnslhfxlonwgmygbgxnm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imduc2xoZnhsb253Z215Z2JneG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMDM5MjYsImV4cCI6MjA5Nzc3OTkyNn0.y96BrMK-gPnKyJzfsFMpSCL2MoOdxHDBjl4_NJqCqMQ";

let supabase = null;
let currentUser = null;

/**
 * Initialize Supabase client
 */
function initializeSupabase() {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase initialized');
}

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
const themeToggle = document.querySelector('.icon-btn');
themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    showNotification('Theme changed', 'default');
});

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

// ========================================
// ========================================
// Login Modal Functionality - Supabase Auth
// ========================================

/**
 * Check if user is logged in and initialize accordingly
 */
async function initializeLoginModal() {
    try {
        // Get current authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // User is logged in
            currentUser = user;
            hideLoginModal();
            showDashboard();
            updateUserProfile(user);
            console.log('User logged in:', user.email);
        } else {
            // User is not logged in
            showLoginModal();
            hideDashboard();
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
        showLoginModal();
        hideDashboard();
    }
}

/**
 * Show login modal
 */
function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const container = document.querySelector('.container');
    if (loginModal) loginModal.classList.remove('hidden');
    if (container) container.style.display = 'none';
}

/**
 * Hide login modal
 */
function hideLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.classList.add('hidden');
}

/**
 * Show dashboard
 */
function showDashboard() {
    const container = document.querySelector('.container');
    if (container) container.style.display = 'flex';
}

/**
 * Hide dashboard
 */
function hideDashboard() {
    const container = document.querySelector('.container');
    if (container) container.style.display = 'none';
}

/**
 * Handle Google Login with Supabase
 */
async function loginWithGoogle() {
    const googleBtn = document.getElementById('googleLoginBtn');
    const originalText = googleBtn.innerHTML;

    try {
        // Show loading state
        googleBtn.innerHTML = '<span style="display: inline-block; animation: spin 1s linear infinite;">⏳</span> Signing in...';
        googleBtn.disabled = true;

        // Sign in with Google using Supabase
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/html/home.html'
            }
        });

        if (error) {
            console.error('Google login error:', error);
            showNotification('Login failed. Please try again.', 'error');
            googleBtn.innerHTML = originalText;
            googleBtn.disabled = false;
            return;
        }

        console.log('Google sign-in initiated');
        // Supabase will redirect to Google, then back to your app
    } catch (error) {
        console.error('Login error:', error);
        showNotification('An error occurred. Please try again.', 'error');
        googleBtn.innerHTML = originalText;
        googleBtn.disabled = false;
    }
}

/**
 * Update user profile in UI after successful login
 */
function updateUserProfile(user) {
    if (!user) return;

    // Get user metadata
    const userName = user.user_metadata?.full_name || 'Student';
    const userEmail = user.email || '';
    const avatarUrl = user.user_metadata?.avatar_url || '';

    // Update account card information
    const accountName = document.querySelector('.account-name');
    const accountEmail = document.querySelector('.account-email');
    const accountAvatar = document.querySelector('.account-avatar');

    if (accountName) accountName.textContent = userName;
    if (accountEmail) accountEmail.textContent = userEmail;
    if (avatarUrl && accountAvatar) {
        accountAvatar.style.backgroundImage = `url('${avatarUrl}')`;
        accountAvatar.style.backgroundSize = 'cover';
        accountAvatar.style.backgroundPosition = 'center';
    }

    console.log('Profile updated:', { userName, userEmail });
    showNotification(`Welcome back, ${userName}! 🎓`, 'success');
}

/**
 * Logout user
 */
async function logout() {
    try {
        // Show loading state
        const logoutBtn = document.querySelector('.account-logout');
        if (logoutBtn) {
            const originalText = logoutBtn.textContent;
            logoutBtn.textContent = 'Logging out...';
            logoutBtn.disabled = true;
        }

        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Logout error:', error);
            showNotification('Logout failed. Please try again.', 'error');
            return;
        }

        // Clear current user
        currentUser = null;

        // Show login modal
        showLoginModal();
        hideDashboard();

        showNotification('Logged out successfully', 'success');
        console.log('User logged out');
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('An error occurred during logout.', 'error');
    }
}

/**
 * Set up authentication event listeners
 */
function setupAuthListeners() {
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const closeBtn = document.querySelector('.close-btn');
    const logoutBtn = document.querySelector('.account-logout');
    const signupLink = document.querySelector('.signup-link');

    // Google login button
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', loginWithGoogle);
    }

    // Close button - inform user login is required
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            showNotification('You need to log in to access Quartz', 'info');
        });
    }

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Sign up link - redirect to Supabase signup or your signup page
    if (signupLink) {
        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Redirecting to sign up...', 'success');
            // You can redirect to a signup page here
            // window.location.href = '/signup.html';
        });
    }
}

/**
 * Monitor authentication state changes
 */
function monitorAuthState() {
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            console.log('User signed in');
            currentUser = session.user;
            hideLoginModal();
            showDashboard();
            updateUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            currentUser = null;
            showLoginModal();
            hideDashboard();
        } else if (event === 'USER_UPDATED') {
            console.log('User updated');
            currentUser = session.user;
            updateUserProfile(session.user);
        }
    });
}


// ========================================
// Event Listeners
// ========================================

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        initializeSupabase();
        await initializeLoginModal();
        setupAuthListeners();
        monitorAuthState();
        initializeApp();
    });
} else {
    initializeSupabase();
    initializeLoginModal();
    setupAuthListeners();
    monitorAuthState();
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
