
const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Gemini configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const GEMINI_API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "";

const supabase = SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        }
    })
    : null;

// CORS configuration
const allowedOrigins = (
    process.env.FRONTEND_ORIGINS ||
    "https://hridayrocky777-a11y.github.io,http://localhost:5500,http://127.0.0.1:5500"
)
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "20kb" }));

// Health check
app.get("/api/health", (_req, res) => {
    res.json({
        ok: true,
        service: "Quartz AI API",
        geminiConfigured: Boolean(GEMINI_API_KEY),
        supabaseConfigured: Boolean(supabase)
    });
});

// Authentication middleware
async function requireAuth(req, res, next) {
    try {
        if (!supabase) {
            return res.status(503).json({
                error: "Authentication service is not configured."
            });
        }

        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7).trim()
            : "";

        if (!token) {
            return res.status(401).json({
                error: "Please log in to use Quartz AI."
            });
        }

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                error: "Your session is invalid or expired. Please log in again."
            });
        }

        req.user = data.user;
        return next();

    } catch (error) {
        console.error("Authentication error:", error.message);

        return res.status(401).json({
            error: "Authentication failed."
        });
    }
}

// Protected Gemini chat
app.post("/api/chat", requireAuth, async (req, res) => {
    try {
        const { message } = req.body || {};

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                error: "A message is required."
            });
        }

        if (message.length > 10000) {
            return res.status(400).json({
                error: "Message is too long."
            });
        }

        if (!GEMINI_API_KEY) {
            return res.status(503).json({
                error: "Gemini API key is not configured."
            });
        }

        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{
                        text: "You are Quartz, a helpful AI study assistant for students. Explain concepts clearly, accurately and in student-friendly language. Use examples when helpful."
                    }]
                },
                contents: [{
                    role: "user",
                    parts: [{
                        text: message.trim()
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1000
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API status:", response.status);

            return res.status(502).json({
                error: "The AI service could not complete your request."
            });
        }

        const reply = data?.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("")
            .trim();

        if (!reply) {
            return res.status(502).json({
                error: "No response received from Gemini."
            });
        }

        return res.json({ reply });

    } catch (error) {
        console.error("Chat error:", error.message);

        return res.status(500).json({
            error: "Unable to reach the AI service."
        });
    }
});

// Unknown API routes
app.use("/api", (_req, res) => {
    res.status(404).json({
        error: "API endpoint not found."
    });
});

// Error handler
app.use((err, _req, res, _next) => {
    console.error("Server error:", err.message);

    res.status(err.status || 500).json({
        error: err.status === 413
            ? "Request is too large."
            : "Something went wrong."
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Quartz AI server running on port ${PORT}`);
});
