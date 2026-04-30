import cors from "cors";
import Database from "better-sqlite3";
import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 4000;
const OTP_EXPIRY_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 30;
const ALLOWED_DOMAIN = "bennett.edu.in";

const dataDir = path.resolve("server", "data");
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "studentsquare.db");
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// ─────────────────────────────────────────────
// DATABASE SCHEMA
// ─────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    university TEXT DEFAULT 'Bennett University',
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    cover_url TEXT DEFAULT '',
    location TEXT DEFAULT '',
    website TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS otp_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('signup', 'signin')),
    full_name TEXT,
    username TEXT,
    expires_at INTEGER NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    caption TEXT NOT NULL DEFAULT '',
    image_url TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS post_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(post_id, user_id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_type TEXT NOT NULL CHECK (author_type IN ('department', 'club', 'admin')),
    date_label TEXT NOT NULL DEFAULT 'Today',
    is_pinned INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'announcements',
    location TEXT DEFAULT '',
    attendees INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS follows (
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS follows (
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Add columns to users table if they don't exist (migration-safe)
const userCols = db.pragma("table_info(users)").map((c) => c.name);
if (!userCols.includes("bio")) db.exec("ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ''");
if (!userCols.includes("avatar_url")) db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT ''");
if (!userCols.includes("cover_url")) db.exec("ALTER TABLE users ADD COLUMN cover_url TEXT DEFAULT ''");
if (!userCols.includes("location")) db.exec("ALTER TABLE users ADD COLUMN location TEXT DEFAULT ''");
if (!userCols.includes("website")) db.exec("ALTER TABLE users ADD COLUMN website TEXT DEFAULT ''");

// ─────────────────────────────────────────────
// SEED DATA (only if tables are empty)
// ─────────────────────────────────────────────

function seedDatabase() {
  const userCount = db.prepare("SELECT COUNT(*) as cnt FROM users").get().cnt;
  if (userCount > 0) return; // Already seeded

  console.log("Seeding database with initial data...");

  // Seed demo users
  const seedUsers = [
    { email: "ananya@bennett.edu.in", username: "sarahj", full_name: "Ananya Sharma", bio: "Photography enthusiast 📸 | Traveler ✈️", avatar_url: "https://images.unsplash.com/photo-1615109398623-88346a601842?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
    { email: "rohan@bennett.edu.in", username: "davidk", full_name: "Rohan Mehta", bio: "Foodie + Code lover 🍔💻", avatar_url: "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
    { email: "priya@bennett.edu.in", username: "emilyc", full_name: "Priya Nair", bio: "City photographer | Sunset chaser 🌅", avatar_url: "https://images.unsplash.com/photo-1595436065982-84fa400d8d8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
    { email: "arjun@bennett.edu.in", username: "marcusw", full_name: "Arjun Verma", bio: "Beach lover 🌊 | Surf & Code", avatar_url: "https://images.unsplash.com/photo-1614436163996-25cee5f54290?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
    { email: "ishita@bennett.edu.in", username: "alexm", full_name: "Ishita Rao", bio: "Art & Design 🎨", avatar_url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
    { email: "kavya@bennett.edu.in", username: "jesslee", full_name: "Kavya Iyer", bio: "Music is life 🎵", avatar_url: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
    { email: "vikram@bennett.edu.in", username: "ryanc", full_name: "Vikram Singh", bio: "Sports & Fitness 💪", avatar_url: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
    { email: "nina@bennett.edu.in", username: "ninap", full_name: "Nina Patel", bio: "Travel blogger ✈️", avatar_url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
    { email: "neel@bennett.edu.in", username: "toma", full_name: "Neel Patel", bio: "Tech geek 🤖", avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
    { email: "sneha@bennett.edu.in", username: "lisaw", full_name: "Sneha Kapoor", bio: "Bookworm 📚", avatar_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
    { email: "aditya@bennett.edu.in", username: "jamesm", full_name: "Aditya Kulkarni", bio: "Startup dreamer 🚀", avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
  ];

  const insertSeedUser = db.prepare(
    "INSERT INTO users (email, username, full_name, bio, avatar_url) VALUES (?, ?, ?, ?, ?)"
  );

  const seedInsert = db.transaction(() => {
    for (const u of seedUsers) {
      insertSeedUser.run(u.email, u.username, u.full_name, u.bio, u.avatar_url);
    }
  });
  seedInsert();

  // Get user IDs after insert
  const getUid = (username) => db.prepare("SELECT id FROM users WHERE username = ?").get(username)?.id;

  // Seed posts
  const insertPost = db.prepare(
    "INSERT INTO posts (user_id, caption, image_url, created_at) VALUES (?, ?, ?, datetime('now', ?))"
  );
  const seedPosts = [
    { username: "sarahj", caption: "Finally made it to the top! The view was absolutely worth the climb 🏔️", image: "https://images.unsplash.com/photo-1713959989861-2425c95e9777?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", ago: "-2 hours" },
    { username: "davidk", caption: "Sunday brunch done right! Check out this amazing spread at @skylarkbistro", image: "https://images.unsplash.com/photo-1600555379885-08a02224726d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", ago: "-5 hours" },
    { username: "emilyc", caption: "Golden hour in the city never disappoints ✨", image: "https://images.unsplash.com/photo-1562351768-f68650f3ec54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", ago: "-8 hours" },
    { username: "marcusw", caption: "Beach therapy 🌊 Nothing clears the mind like ocean waves", image: "https://images.unsplash.com/photo-1661953029179-e1b0dc900490?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", ago: "-1 days" },
  ];

  const seedPostsInsert = db.transaction(() => {
    for (const p of seedPosts) {
      insertPost.run(getUid(p.username), p.caption, p.image, p.ago);
    }
  });
  seedPostsInsert();

  // Seed some likes
  const insertLike = db.prepare("INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)");
  const seedLikes = db.transaction(() => {
    // Post 1 gets likes from several users
    for (const uname of ["davidk", "emilyc", "marcusw", "alexm", "jesslee"]) {
      insertLike.run(1, getUid(uname));
    }
    // Post 2
    for (const uname of ["sarahj", "emilyc", "ninap"]) {
      insertLike.run(2, getUid(uname));
    }
    // Post 3
    for (const uname of ["sarahj", "davidk", "marcusw", "alexm", "jesslee", "ryanc"]) {
      insertLike.run(3, getUid(uname));
    }
    // Post 4
    for (const uname of ["sarahj", "davidk", "emilyc", "alexm"]) {
      insertLike.run(4, getUid(uname));
    }
  });
  seedLikes();

  // Seed comments
  const insertComment = db.prepare("INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)");
  const seedComments = db.transaction(() => {
    insertComment.run(1, getUid("alexm"), "This is stunning! Where is this?");
    insertComment.run(1, getUid("davidk"), "Goals! 😍");
    insertComment.run(2, getUid("ninap"), "Omg this looks incredible 🤤");
    insertComment.run(3, getUid("ryanc"), "Perfect shot! What camera did you use?");
    insertComment.run(3, getUid("sarahj"), "Beautiful capture!");
    insertComment.run(3, getUid("jesslee"), "Love this perspective 📸");
    insertComment.run(4, getUid("alexm"), "Paradise! 🏖️");
    insertComment.run(4, getUid("toma"), "Need this in my life right now");
  });
  seedComments();

  // Seed notices
  const insertNotice = db.prepare(
    "INSERT INTO notices (title, content, author_name, author_type, date_label, is_pinned, category, location, attendees) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const seedNoticesInsert = db.transaction(() => {
    insertNotice.run(
      "Mid-Semester Examinations Schedule Released",
      "The mid-semester examination schedule for all departments has been released. Exams will be conducted from March 15-22, 2026. Please check your department notice boards for detailed timetables and report to your respective exam halls 15 minutes before the scheduled time.",
      "Academic Affairs Office", "department", "Today", 1, "academics", "", 0
    );
    insertNotice.run(
      "Annual Tech Fest 2026 - Call for Participants",
      "Get ready for the biggest tech event of the year! Register your teams for hackathons, coding competitions, robotics challenges, and more. Exciting prizes worth $50,000 up for grabs. Last date for registration: March 10, 2026.",
      "Tech Club", "club", "2 hours ago", 1, "events", "Main Auditorium", 342
    );
    insertNotice.run(
      "Library Extended Hours During Exam Week",
      "The central library will remain open 24/7 during the examination week (March 15-22). Students can access all reading rooms and online resources. Please carry your valid student ID cards.",
      "Library Administration", "department", "5 hours ago", 0, "announcements", "", 0
    );
    insertNotice.run(
      "Inter-College Basketball Championship",
      "Trials for the inter-college basketball team will be held on March 5, 2026, at 4:00 PM in the sports complex. All interested students are encouraged to participate. Bring your sports gear and student ID.",
      "Sports Committee", "club", "Yesterday", 0, "sports", "Sports Complex", 89
    );
    insertNotice.run(
      "Guest Lecture on AI and Machine Learning",
      "The Computer Science Department is organizing a guest lecture by Dr. Sarah Mitchell, AI Researcher at Tech Innovators Inc. Topic: \"The Future of AI in Healthcare\". Date: March 8, 2026, Time: 2:00 PM. Open to all students.",
      "CS Department", "department", "2 days ago", 0, "academics", "Seminar Hall B", 156
    );
    insertNotice.run(
      "Photography Club - Campus Photo Walk",
      "Join us for a guided photo walk around campus to capture the beauty of spring! Whether you are a beginner or pro, all are welcome. Bring your cameras and creativity. We will share tips and techniques along the way.",
      "Photography Club", "club", "3 days ago", 0, "clubs", "Main Gate", 45
    );
    insertNotice.run(
      "Blood Donation Drive - Save Lives",
      "The Red Cross Society is organizing a blood donation camp on campus. Every donation can save up to three lives. Date: March 12, 2026, Time: 9:00 AM - 5:00 PM. Free health checkup for all donors.",
      "Red Cross Society", "club", "4 days ago", 0, "events", "Student Center", 234
    );
  });
  seedNoticesInsert();

  // Seed follows (create a connected network)
  const insertSeedFollow = db.prepare(
    "INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)"
  );
  const seedFollowsInsert = db.transaction(() => {
    // User 1 follows users 2, 3, 4
    insertSeedFollow.run(1, 2);
    insertSeedFollow.run(1, 3);
    insertSeedFollow.run(1, 4);
    // User 2 follows user 1, 5
    insertSeedFollow.run(2, 1);
    insertSeedFollow.run(2, 5);
    // User 3 follows user 1, 7, 10
    insertSeedFollow.run(3, 1);
    insertSeedFollow.run(3, 7);
    insertSeedFollow.run(3, 10);
    // User 5 follows user 1
    insertSeedFollow.run(5, 1);
  });
  seedFollowsInsert();

  // Seed some messages between users
  const insertMessage = db.prepare(
    "INSERT INTO messages (sender_id, receiver_id, text, created_at) VALUES (?, ?, ?, datetime('now', ?))"
  );
  const seedMessagesInsert = db.transaction(() => {
    const sarahId = getUid("sarahj");
    const emilyId = getUid("emilyc");
    const davidId = getUid("davidk");
    const lisaId = getUid("lisaw");
    const jamesId = getUid("jamesm");

    // We need a "dummy" logged-in user. Seed messages will use user ID 100 as placeholder.
    // Actual messages will be created between real users once they sign up.
    // For now, seed conversations between existing demo users.

    // Conversation: sarahj <-> emilyc
    insertMessage.run(sarahId, emilyId, "Hey! How are you?", "-3 hours");
    insertMessage.run(emilyId, sarahId, "I'm great! Just checking out your mountain post, looks amazing!", "-2 hours");
    insertMessage.run(sarahId, emilyId, "Thanks! It was such an incredible hike. You should join me next time!", "-2 hours");

    // Conversation: davidk <-> emilyc
    insertMessage.run(davidId, emilyId, "Did you see the sunset last night?", "-5 hours");
    insertMessage.run(emilyId, davidId, "Yes! It was beautiful.", "-4 hours");

    // Conversation: sarahj <-> davidk
    insertMessage.run(davidId, sarahId, "Brunch this weekend?", "-1 days");
    insertMessage.run(sarahId, davidId, "Sounds good! Where are you thinking?", "-1 days");
    insertMessage.run(davidId, sarahId, "That new place on 5th? The one with the amazing pancakes", "-1 days");
  });
  seedMessagesInsert();

  console.log("Database seeded successfully.");
}

seedDatabase();

// ─────────────────────────────────────────────
// PREPARED STATEMENTS
// ─────────────────────────────────────────────

// Auth
const getUserByEmail = db.prepare("SELECT * FROM users WHERE email = ?");
const getUserByUsername = db.prepare("SELECT * FROM users WHERE username = ?");
const getUserById = db.prepare("SELECT * FROM users WHERE id = ?");
const insertUser = db.prepare(
  "INSERT INTO users (email, username, full_name) VALUES (?, ?, ?)"
);
const insertOtp = db.prepare(
  "INSERT INTO otp_codes (email, otp_hash, mode, full_name, username, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
);
const markOtpUsed = db.prepare("UPDATE otp_codes SET used = 1 WHERE id = ?");
const latestOtp = db.prepare(
  "SELECT * FROM otp_codes WHERE email = ? AND mode = ? ORDER BY created_at DESC LIMIT 1"
);
const deleteExpiredOtps = db.prepare(
  "DELETE FROM otp_codes WHERE expires_at < ? OR used = 1"
);

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────

const emailTransporter =
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  process.env.SMTP_FROM
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : null;

function smtpConfigStatus() {
  return {
    configured: Boolean(emailTransporter),
    host: process.env.SMTP_HOST || null,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || null,
    from: process.env.SMTP_FROM || null,
  };
}

function formatSmtpError(error) {
  const message = String(error?.message || "");
  if (message.toLowerCase().includes("invalid login")) {
    return "SMTP authentication failed. Check SMTP_USER and SMTP_PASS.";
  }
  if (message.toLowerCase().includes("timeout")) {
    return "SMTP connection timed out. Check SMTP_HOST, SMTP_PORT, and network access.";
  }
  if (message.toLowerCase().includes("certificate")) {
    return "SMTP TLS certificate issue. Check SMTP_SECURE and provider settings.";
  }
  return `SMTP error: ${message || "unknown error"}`;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isAllowedUniversityEmail(email) {
  return email.endsWith(`@${ALLOWED_DOMAIN}`);
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function sanitizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
}

async function sendOtpEmail(email, otp, mode) {
  const subject =
    mode === "signup" ? "Your students^2 signup OTP" : "Your students^2 sign-in OTP";
  const text = `Your OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`;

  if (!emailTransporter) {
    console.log(`[DEV OTP] ${email} (${mode}) => ${otp}`);
    return { deliveredByEmail: false, devOtp: otp };
  }

  await emailTransporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject,
    text,
  });
  return { deliveredByEmail: true };
}

function formatUser(u) {
  if (!u) return null;
  const followers = db.prepare("SELECT COUNT(*) as cnt FROM follows WHERE following_id = ?").get(u.id).cnt;
  const following = db.prepare("SELECT COUNT(*) as cnt FROM follows WHERE follower_id = ?").get(u.id).cnt;
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    fullName: u.full_name,
    university: u.university,
    bio: u.bio || "",
    avatarUrl: u.avatar_url || "",
    coverUrl: u.cover_url || "",
    location: u.location || "",
    website: u.website || "",
    createdAt: u.created_at,
    followers,
    following
  };
}

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

// ─────────────────────────────────────────────
// AUTH ROUTES (preserved from original)
// ─────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/auth/status", (_req, res) => {
  const status = smtpConfigStatus();
  res.json({
    ok: true,
    apiPort: PORT,
    smtpConfigured: status.configured,
    smtpHost: status.host,
    smtpPort: status.port,
    smtpSecure: status.secure,
    smtpUserPresent: Boolean(status.user),
    smtpFromPresent: Boolean(status.from),
  });
});

app.post("/api/auth/request-otp", async (req, res) => {
  try {
    const mode = req.body?.mode === "signup" ? "signup" : "signin";
    const email = normalizeEmail(req.body?.email);
    const fullName = String(req.body?.fullName || "").trim();
    const username = sanitizeUsername(req.body?.username);

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    if (!isAllowedUniversityEmail(email)) {
      return res
        .status(400)
        .json({ error: "Only @bennett.edu.in email addresses are allowed." });
    }

    const existing = getUserByEmail.get(email);
    if (mode === "signup") {
      if (!fullName || !username) {
        return res
          .status(400)
          .json({ error: "Full name and username are required for signup." });
      }
      if (existing) {
        return res.status(400).json({ error: "Account already exists. Please sign in." });
      }
      if (getUserByUsername.get(username)) {
        return res.status(400).json({ error: "Username is already taken." });
      }
    } else if (!existing) {
      return res.status(400).json({ error: "No account found. Please sign up first." });
    }

    const now = Date.now();
    deleteExpiredOtps.run(now);

    const recent = latestOtp.get(email, mode);
    if (recent && now - recent.created_at < OTP_COOLDOWN_SECONDS * 1000) {
      return res.status(429).json({
        error: `Please wait ${OTP_COOLDOWN_SECONDS} seconds before requesting another OTP.`,
      });
    }

    const otp = generateOtp();
    insertOtp.run(
      email,
      hashOtp(otp),
      mode,
      mode === "signup" ? fullName : null,
      mode === "signup" ? username : null,
      now + OTP_EXPIRY_MINUTES * 60 * 1000,
      now
    );

    const deliveryResult = await sendOtpEmail(email, otp, mode);
    res.json({
      message: deliveryResult.deliveredByEmail
        ? "OTP sent successfully."
        : "SMTP is not configured. OTP generated in dev mode.",
      ...deliveryResult,
    });
  } catch (error) {
    console.error("request-otp error:", error);
    res.status(500).json({ error: formatSmtpError(error) });
  }
});

app.post("/api/auth/verify-otp", (req, res) => {
  try {
    const mode = req.body?.mode === "signup" ? "signup" : "signin";
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || "").trim();

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required." });
    }

    const record = latestOtp.get(email, mode);
    if (!record || record.used) {
      return res.status(400).json({ error: "OTP not found. Please request a new OTP." });
    }

    if (Date.now() > record.expires_at) {
      return res.status(400).json({ error: "OTP expired. Please request a new OTP." });
    }

    if (record.otp_hash !== hashOtp(otp)) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    markOtpUsed.run(record.id);

    let user = getUserByEmail.get(email);
    if (mode === "signup") {
      insertUser.run(email, record.username, record.full_name);
      user = getUserByEmail.get(email);
    }

    if (!user) {
      return res.status(400).json({ error: "Account not found." });
    }

    res.json({ user: formatUser(user) });
  } catch (error) {
    console.error("verify-otp error:", error);
    res.status(500).json({ error: "Failed to verify OTP." });
  }
});

// ─────────────────────────────────────────────
// USER PROFILE ROUTES
// ─────────────────────────────────────────────

app.get("/api/user/:id", (req, res) => {
  try {
    const user = getUserById.get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    // Get post count
    const postCount = db.prepare("SELECT COUNT(*) as cnt FROM posts WHERE user_id = ?").get(user.id).cnt;

    res.json({ user: { ...formatUser(user), postCount } });
  } catch (error) {
    console.error("get-user error:", error);
    res.status(500).json({ error: "Failed to get user." });
  }
});

app.put("/api/user/:id", (req, res) => {
  try {
    const userId = Number(req.params.id);
    const user = getUserById.get(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const { fullName, bio, avatarUrl, coverUrl, location, website } = req.body;

    db.prepare(`
      UPDATE users SET
        full_name = COALESCE(?, full_name),
        bio = COALESCE(?, bio),
        avatar_url = COALESCE(?, avatar_url),
        cover_url = COALESCE(?, cover_url),
        location = COALESCE(?, location),
        website = COALESCE(?, website)
      WHERE id = ?
    `).run(
      fullName ?? null,
      bio ?? null,
      avatarUrl ?? null,
      coverUrl ?? null,
      location ?? null,
      website ?? null,
      userId
    );

    const updated = getUserById.get(userId);
    res.json({ user: formatUser(updated) });
  } catch (error) {
    console.error("update-user error:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

app.get("/api/user/by-username/:username", (req, res) => {
  try {
    const user = getUserByUsername.get(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found." });

    const postCount = db.prepare("SELECT COUNT(*) as cnt FROM posts WHERE user_id = ?").get(user.id).cnt;
    res.json({ user: { ...formatUser(user), postCount } });
  } catch (error) {
    console.error("get-user-by-username error:", error);
    res.status(500).json({ error: "Failed to get user." });
  }
});

app.post("/api/user/:id/follow", (req, res) => {
  try {
    const followerId = Number(req.params.id);
    const followingId = Number(req.body.targetId);
    
    if (!followerId || !followingId) return res.status(400).json({ error: "Invalid parameters." });

    const existing = db.prepare("SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?").get(followerId, followingId);
    
    if (existing) {
      db.prepare("DELETE FROM follows WHERE follower_id = ? AND following_id = ?").run(followerId, followingId);
      res.json({ isFollowing: false });
    } else {
      db.prepare("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)").run(followerId, followingId);
      res.json({ isFollowing: true });
    }
  } catch (error) {
    console.error("follow error:", error);
    res.status(500).json({ error: "Failed to toggle follow status." });
  }
});

app.get("/api/user/:id/follow-status", (req, res) => {
  try {
    const followerId = Number(req.params.id);
    const followingId = Number(req.query.targetId);
    
    const existing = db.prepare("SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?").get(followerId, followingId);
    res.json({ isFollowing: !!existing });
  } catch (error) {
    console.error("follow-status error:", error);
    res.status(500).json({ error: "Failed to get follow status." });
  }
});

// ─────────────────────────────────────────────
// POSTS ROUTES
// ─────────────────────────────────────────────

app.get("/api/posts", (req, res) => {
  try {
    const requestingUserId = Number(req.query.userId) || 0;
    const profileUserId = Number(req.query.profileUserId) || 0;
    const feed = req.query.feed || 'all';

    let posts;
    if (profileUserId > 0) {
      posts = db.prepare(`
        SELECT
          p.id, p.caption, p.image_url, p.created_at,
          u.id as user_id, u.username, u.full_name, u.avatar_url,
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
          CASE WHEN EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) THEN 1 ELSE 0 END as is_liked
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
      `).all(requestingUserId, profileUserId);
    } else if (feed === 'following') {
      posts = db.prepare(`
        SELECT
          p.id, p.caption, p.image_url, p.created_at,
          u.id as user_id, u.username, u.full_name, u.avatar_url,
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
          CASE WHEN EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) THEN 1 ELSE 0 END as is_liked
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ? OR p.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
        ORDER BY p.created_at DESC
      `).all(requestingUserId, requestingUserId, requestingUserId);
    } else {
      posts = db.prepare(`
        SELECT
          p.id, p.caption, p.image_url, p.created_at,
          u.id as user_id, u.username, u.full_name, u.avatar_url,
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
          CASE WHEN EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) THEN 1 ELSE 0 END as is_liked
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
      `).all(requestingUserId);
    }

    const result = posts.map((p) => {
      const comments = db.prepare(`
        SELECT c.id, c.text, c.created_at, u.username
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
      `).all(p.id);

      return {
        id: String(p.id),
        user: {
          name: p.full_name,
          username: p.username,
          avatar: p.avatar_url || "",
        },
        image: p.image_url || undefined,
        caption: p.caption,
        likes: p.like_count,
        isLiked: p.is_liked === 1,
        comments: comments.map((c) => ({
          id: String(c.id),
          user: c.username,
          text: c.text,
        })),
        timestamp: timeAgo(p.created_at),
      };
    });

    res.json({ posts: result });
  } catch (error) {
    console.error("get-posts error:", error);
    res.status(500).json({ error: "Failed to get posts." });
  }
});

app.post("/api/posts", (req, res) => {
  try {
    const { userId, caption, imageUrl } = req.body;
    if (!userId || !caption) {
      return res.status(400).json({ error: "userId and caption are required." });
    }

    const user = getUserById.get(userId);
    if (!user) return res.status(400).json({ error: "User not found." });

    const result = db.prepare(
      "INSERT INTO posts (user_id, caption, image_url) VALUES (?, ?, ?)"
    ).run(userId, caption, imageUrl || "");

    const newPost = {
      id: String(result.lastInsertRowid),
      user: {
        name: user.full_name,
        username: user.username,
        avatar: user.avatar_url || "",
      },
      image: imageUrl || undefined,
      caption,
      likes: 0,
      isLiked: false,
      comments: [],
      timestamp: "Just now",
    };

    res.json({ post: newPost });
  } catch (error) {
    console.error("create-post error:", error);
    res.status(500).json({ error: "Failed to create post." });
  }
});

app.post("/api/posts/:id/like", (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required." });

    const existing = db.prepare(
      "SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?"
    ).get(postId, userId);

    if (existing) {
      db.prepare("DELETE FROM post_likes WHERE id = ?").run(existing.id);
    } else {
      db.prepare("INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)").run(postId, userId);
    }

    const likeCount = db.prepare(
      "SELECT COUNT(*) as cnt FROM post_likes WHERE post_id = ?"
    ).get(postId).cnt;

    res.json({ liked: !existing, likeCount });
  } catch (error) {
    console.error("like-post error:", error);
    res.status(500).json({ error: "Failed to like post." });
  }
});

app.post("/api/posts/:id/comments", (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { userId, text } = req.body;
    if (!userId || !text) {
      return res.status(400).json({ error: "userId and text are required." });
    }

    const user = getUserById.get(userId);
    if (!user) return res.status(400).json({ error: "User not found." });

    const result = db.prepare(
      "INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)"
    ).run(postId, userId, text);

    res.json({
      comment: {
        id: String(result.lastInsertRowid),
        user: user.username,
        text,
      },
    });
  } catch (error) {
    console.error("add-comment error:", error);
    res.status(500).json({ error: "Failed to add comment." });
  }
});

// ─────────────────────────────────────────────
// MESSAGES ROUTES
// ─────────────────────────────────────────────

app.get("/api/messages/:userId", (req, res) => {
  try {
    const userId = Number(req.params.userId);

    // Get all unique conversation partners
    const partners = db.prepare(`
      SELECT DISTINCT
        CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as partner_id
      FROM messages
      WHERE sender_id = ? OR receiver_id = ?
    `).all(userId, userId, userId);

    const conversations = partners.map((p) => {
      const partner = getUserById.get(p.partner_id);
      if (!partner) return null;

      const messages = db.prepare(`
        SELECT id, sender_id, receiver_id, text, created_at
        FROM messages
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at ASC
      `).all(userId, p.partner_id, p.partner_id, userId);

      const lastMsg = messages[messages.length - 1];

      return {
        id: `conv_${p.partner_id}`,
        user: {
          id: partner.id,
          name: partner.full_name,
          username: partner.username,
          avatar: partner.avatar_url || "",
          isOnline: Math.random() > 0.5, // Simulated online status
        },
        messages: messages.map((m) => ({
          id: String(m.id),
          senderId: m.sender_id === userId ? "you" : partner.username,
          text: m.text,
          timestamp: timeAgo(m.created_at),
        })),
        lastMessage: lastMsg?.text || "",
        timestamp: lastMsg ? timeAgo(lastMsg.created_at) : "",
        unread: false,
      };
    }).filter(Boolean);

    res.json({ conversations });
  } catch (error) {
    console.error("get-messages error:", error);
    res.status(500).json({ error: "Failed to get messages." });
  }
});

app.post("/api/messages", (req, res) => {
  try {
    const { senderId, receiverUsername, text } = req.body;
    if (!senderId || !receiverUsername || !text) {
      return res.status(400).json({ error: "senderId, receiverUsername, and text are required." });
    }

    const receiver = getUserByUsername.get(receiverUsername);
    if (!receiver) return res.status(400).json({ error: "Receiver not found." });

    const result = db.prepare(
      "INSERT INTO messages (sender_id, receiver_id, text) VALUES (?, ?, ?)"
    ).run(senderId, receiver.id, text);

    res.json({
      message: {
        id: String(result.lastInsertRowid),
        senderId: "you",
        text,
        timestamp: "Just now",
      },
    });
  } catch (error) {
    console.error("send-message error:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
});

// ─────────────────────────────────────────────
// NOTICES ROUTES
// ─────────────────────────────────────────────

app.get("/api/notices", (_req, res) => {
  try {
    const notices = db.prepare(
      "SELECT * FROM notices ORDER BY is_pinned DESC, created_at DESC"
    ).all();

    const result = notices.map((n) => ({
      id: String(n.id),
      title: n.title,
      content: n.content,
      author: {
        name: n.author_name,
        type: n.author_type,
      },
      date: n.date_label,
      isPinned: n.is_pinned === 1,
      category: n.category,
      location: n.location || undefined,
      attendees: n.attendees || undefined,
    }));

    res.json({ notices: result });
  } catch (error) {
    console.error("get-notices error:", error);
    res.status(500).json({ error: "Failed to get notices." });
  }
});

// ─────────────────────────────────────────────
// SUGGESTED USERS
// ─────────────────────────────────────────────

app.get("/api/users/suggested", (req, res) => {
  try {
    const excludeId = Number(req.query.excludeId) || 0;

    const users = db.prepare(`
      SELECT id, full_name, username, avatar_url
      FROM users
      WHERE id != ?
      ORDER BY RANDOM()
      LIMIT 5
    `).all(excludeId);

    const result = users.map((u) => ({
      id: String(u.id),
      name: u.full_name,
      username: u.username,
      avatar: u.avatar_url || "",
    }));

    res.json({ users: result });
  } catch (error) {
    console.error("get-suggested error:", error);
    res.status(500).json({ error: "Failed to get suggested users." });
  }
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────

const server = app.listen(PORT, () => {
  console.log(`Auth API running on http://localhost:${PORT}`);
  const status = smtpConfigStatus();
  if (!status.configured) {
    console.log("SMTP not configured. OTPs will be generated in dev mode.");
  }
});
server.on("error", (err) => {
  console.error("Server startup error:", err);
});

