const GITHUB_PAGES_URL = "https://hridayrocky777-a11y.github.io/Quartz";
const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
const authRedirectBase = localHosts.has(window.location.hostname)
    ? window.location.origin
    : GITHUB_PAGES_URL;

const QUARTZ_AUTH = Object.freeze({
    supabaseUrl: "https://gnslhfxlonwgmygbgxnm.supabase.co",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imduc2xoZnhsb253Z215Z2JneG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMDM5MjYsImV4cCI6MjA5Nzc3OTkyNn0.y96BrMK-gPnKyJzfsFMpSCL2MoOdxHDBjl4_NJqCqMQ",
    googleClientId: "52937508326-7v0tlk5ffkubkqb60vretfocv4j7i624.apps.googleusercontent.com",
    googleRedirectUrl: `${authRedirectBase}/html/home.html`,
});

let currentUser = null;
let quartzSupabase = null;

function showNotification(message, type = "default") {
    const notification = document.getElementById("academicToast");

    if (notification) {
        notification.textContent = message;
        notification.dataset.type = type;
        notification.classList.add("show");
        setTimeout(() => notification.classList.remove("show"), 2600);
        return;
    }

    if (type === "error") {
        console.error(message);
    } else {
        console.log(message);
    }
}

function setAuthScreenVisibility(isAuthenticated) {
    const authShell = document.querySelector(".auth-shell");
    const appShell = document.querySelector(".container");

    if (authShell) authShell.style.display = isAuthenticated ? "none" : "grid";
    if (appShell) appShell.style.display = isAuthenticated ? "flex" : "none";
}

async function initializeAuthState() {
    const supabase = await initSupabaseClient();
    if (!supabase || !supabase.auth) {
        setAuthScreenVisibility(false);
        return;
    }

    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.warn("Supabase session check failed:", error.message);
            setAuthScreenVisibility(false);
            return;
        }

        if (session?.user) {
            currentUser = session.user;
            handleAuthSuccess(session.user);
            return;
        }

        setAuthScreenVisibility(false);
    } catch (error) {
        console.error("Failed to initialize auth state:", error);
        setAuthScreenVisibility(false);
    }
}

function isPlaceholder(value) {
    return !value || value.includes("YOUR_") || value.includes("your_") || value.includes("example") || value.includes("replace-me");
}

function ensureSupabaseLoaded() {
    return new Promise((resolve) => {
        if (window.supabase && typeof window.supabase.createClient === "function") {
            resolve();
            return;
        }

        const existingScript = document.querySelector('script[src*="@supabase/supabase-js"]');
        if (existingScript) {
            existingScript.addEventListener("load", resolve, { once: true });
            return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
        script.async = true;
        script.onload = resolve;
        script.onerror = () => {
            console.error("Supabase SDK failed to load from the CDN.");
            resolve();
        };
        document.head.appendChild(script);
    });
}

async function initSupabaseClient() {
    await ensureSupabaseLoaded();

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
        console.warn("Supabase JS SDK is not loaded yet.");
        return null;
    }

    if (!quartzSupabase) {
        if (isPlaceholder(QUARTZ_AUTH.supabaseUrl) || isPlaceholder(QUARTZ_AUTH.supabaseAnonKey)) {
            return null;
        }

        quartzSupabase = window.supabase.createClient(QUARTZ_AUTH.supabaseUrl, QUARTZ_AUTH.supabaseAnonKey);
    }

    return quartzSupabase;
}

function setButtonLoading(button, isLoading, label) {
    if (!button) return;

    button.disabled = isLoading;
    if (isLoading) {
        button.dataset.originalText = button.dataset.originalText || button.textContent;
        button.textContent = "Please wait...";
    } else {
        button.textContent = button.dataset.originalText || label;
    }
}

function updateUserProfile(user) {
    if (!user) return;

    const userName = user.user_metadata?.full_name || user.user_metadata?.name || "Student";
    const userEmail = user.email || "student@quartz.ai";
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || "";

    const nameNode = document.querySelector(".account-name");
    const emailNode = document.querySelector(".account-email");
    const avatarNode = document.querySelector(".account-avatar");

    if (nameNode) nameNode.textContent = userName;
    if (emailNode) emailNode.textContent = userEmail;

    if (avatarUrl && avatarNode) {
        avatarNode.style.backgroundImage = `url("${avatarUrl}")`;
        avatarNode.style.backgroundSize = "cover";
        avatarNode.style.backgroundPosition = "center";
    }
}

function handleAuthSuccess(user) {
    currentUser = user;
    setAuthScreenVisibility(true);
    updateUserProfile(user);
    showNotification("Welcome to Quartz!", "success");
}

async function loginWithGoogle() {
    const googleButtons = document.querySelectorAll(".auth-google-button");
    googleButtons.forEach((button) => setButtonLoading(button, true, "Continue with Google"));

    const supabase = await initSupabaseClient();

    if (!supabase || !supabase.auth) {
        showNotification("Supabase SDK did not load. Check your network or reload the page.", "error");
        googleButtons.forEach((button) => setButtonLoading(button, false, "Continue with Google"));
        return;
    }

    if (isPlaceholder(QUARTZ_AUTH.googleClientId)) {
        showNotification("Add your Google OAuth Client ID in js/home.js before using Google sign-in.", "error");
        return;
    }

    googleButtons.forEach((button) => setButtonLoading(button, true, "Continue with Google"));

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: QUARTZ_AUTH.googleRedirectUrl,
            },
        });

        if (error) throw error;

        console.log("Google OAuth started:", data);
        showNotification("Google sign-in started. Complete the redirect to continue.", "default");
    } catch (error) {
        console.error("Google login failed:", error);
        showNotification(error?.message || "Google sign-in failed.", "error");
        googleButtons.forEach((button) => setButtonLoading(button, false, "Continue with Google"));
    }
}

async function handleEmailAuth(mode) {
    const emailInput = document.getElementById("authEmail");
    const passwordInput = document.getElementById("authPassword");
    const submitButton = document.querySelector(`[data-auth-mode="${mode}"]`);

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showNotification("Please enter your email and password.", "error");
        return;
    }

    const supabase = await initSupabaseClient();
    if (!supabase || !supabase.auth) {
        showNotification("Supabase auth is not configured yet. Add the API values in js/home.js.", "error");
        return;
    }

    setButtonLoading(submitButton, true, mode === "login" ? "Log in" : "Create account");

    try {
        const authAction = mode === "login" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
        const { data, error } = await authAction({ email, password });

        if (error) throw error;

        const user = data?.user || data?.session?.user;
        if (user) {
            handleAuthSuccess(user);
        } else {
            showNotification(mode === "login" ? "Logged in successfully." : "Account created. Please confirm your email.", "success");
            setAuthScreenVisibility(true);
        }
    } catch (error) {
        console.error("Email auth failed:", error);
        showNotification(error?.message || "Authentication failed.", "error");
    } finally {
        setButtonLoading(submitButton, false, mode === "login" ? "Log in" : "Create account");
    }
}

function bindAuthEvents() {
    const googleButton = document.querySelector(".auth-google-button");
    if (googleButton) {
        googleButton.addEventListener("click", loginWithGoogle);
    }

    const authForm = document.getElementById("authForm");
    if (authForm) {
        authForm.addEventListener("submit", (event) => {
            event.preventDefault();
            handleEmailAuth("login");
        });
    }

    document.querySelectorAll("[data-auth-mode]").forEach((button) => {
        button.addEventListener("click", () => {
            if (button.dataset.authMode === "signup") {
                handleEmailAuth("signup");
            }
        });
    });
}

bindAuthEvents();
setAuthScreenVisibility(false);

(async () => {
    const supabase = await initSupabaseClient();
    if (supabase && supabase.auth && typeof supabase.auth.onAuthStateChange === "function") {
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session?.user) {
                handleAuthSuccess(session.user);
            } else if (event === "SIGNED_OUT") {
                currentUser = null;
                setAuthScreenVisibility(false);
            }
        });
    }

    await initializeAuthState();
    showNotification("Add your Supabase and Google API values in js/home.js to activate login.", "default");
})();