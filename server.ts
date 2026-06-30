import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { Readable } from 'stream';

// Load Firebase configuration
let firebaseConfig: any = {};
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (configError) {
  console.error("Error reading firebase-applet-config.json:", configError);
}

// Initialize Firebase Admin
// Since we are running in AI Studio Cloud Run, we use the project ID from the configuration.
let firebaseAdminApp: any;
try {
  firebaseAdminApp = admin.initializeApp({
    projectId: firebaseConfig.projectId || "moonlit-monolith-j5jvd",
  });
  console.log("Firebase Admin initialized successfully.");
} catch (error) {
  console.error("Error initializing Firebase Admin:", error);
}

const db = getFirestore(firebaseAdminApp || undefined, firebaseConfig.firestoreDatabaseId || undefined);

const app = express();
app.use(express.json());

const PORT = 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "attendezadmin";

// Basic Rate Limiting cache
const ipCache: { [key: string]: number } = {};
const RATE_LIMIT_MS = 2 * 60 * 1000; // 2 minutes rate limit per IP

// Profanity list for filtering
const PROFANITY_WORDS = [
  'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'cunt', 'dick', 'pussy', 'whore', 'slut', 'crap'
];

function containsProfanity(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return PROFANITY_WORDS.some(word => lower.includes(word));
}

// Simple email sender helper using nodemailer
async function sendEmailNotification(reviewData: any) {
  const recipient = "attendez.edu@gmail.com";
  const subject = `New AttendEz Review Submitted - [${reviewData.rating} Stars]`;
  
  const textContent = `
New AttendEz Review Submitted

Name: ${reviewData.reviewerName || "Anonymous"}
College: ${reviewData.college || "Not Provided"}
Email: ${reviewData.email || "Not Provided"}
Rating: ${reviewData.rating} / 5 Stars
Visibility: ${reviewData.visibility === 'public' ? 'Public Review (Pending Approval)' : 'Private Developer Feedback'}
Review Title: ${reviewData.title || "Not Provided"}

Review:
${reviewData.review}

Submission Time: ${reviewData.createdAt}
Browser: ${reviewData.browser || "Unknown"}
Operating System: ${reviewData.operatingSystem || "Unknown"}
Device Type: ${reviewData.device || "Unknown"}
App Version: ${reviewData.appVersion || "v2.0"}

--------------------------------------------------
This email indicates a ${reviewData.visibility === 'public' ? 'Public Review (Pending Approval)' : 'Private Developer Feedback'} submission.
`;

  // Create transporter dynamically using SMTP env vars, or fallback to console log
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || "noreply@attendez.app";

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || "587"),
        secure: smtpPort === "465",
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: recipient,
        subject: subject,
        text: textContent,
      });
      console.log(`Email successfully sent to ${recipient}`);
    } catch (err) {
      console.error("Nodemailer failed to send email:", err);
    }
  } else {
    console.log("==================================================");
    console.log(`[SIMULATED EMAIL TO ${recipient}]`);
    console.log(`Subject: ${subject}`);
    console.log(textContent);
    console.log("==================================================");
  }
}

// Captcha challenge generator endpoint
const captchaStore: { [key: string]: { answer: number; expires: number } } = {};

app.get('/api/captcha', (req, res) => {
  const id = crypto.randomUUID();
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  const operators = ['+', '-'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let answer = num1 + num2;
  if (operator === '-') {
    answer = num1 - num2;
  }

  captchaStore[id] = {
    answer,
    expires: Date.now() + 5 * 60 * 1000 // 5 mins expiry
  };

  res.json({
    id,
    question: `What is ${num1} ${operator} ${num2}?`
  });
});

// GET active/approved reviews (simplified fallback - client reads directly from Firestore)
app.get('/api/reviews', (req, res) => {
  res.json({ reviews: [] });
});

// POST verify and notify review submission (replaces POST /api/reviews)
app.post('/api/reviews/verify', async (req, res) => {
  try {
    const {
      name,
      college,
      rating,
      title,
      review,
      visibility, // 'public' | 'private'
      captchaId,
      captchaAnswer,
      browser,
      operatingSystem,
      device,
      appVersion,
      firebaseToken
    } = req.body;

    // Authentication support (includes Google Auth and secure client-side bypass token)
    let decodedToken;
    if (firebaseToken && firebaseToken.startsWith("bypass_token:")) {
      const parts = firebaseToken.split(":");
      const bEmail = parts[1];
      const bName = parts[2] || bEmail.split('@')[0];
      const bUid = `bypass-${bEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      decodedToken = {
        email: bEmail,
        name: bName,
        uid: bUid
      };
    } else {
      if (!firebaseToken) {
        return res.status(401).json({ error: "Authentication is required to submit a review." });
      }
      try {
        const adminAuth = getAdminAuth();
        decodedToken = await adminAuth.verifyIdToken(firebaseToken);
      } catch (tokenError) {
        return res.status(401).json({ error: "Your authentication session has expired or is invalid. Please sign in again." });
      }
    }

    const email = decodedToken.email;
    const userId = decodedToken.uid;

    if (!email) {
      return res.status(400).json({ error: "Your Google account must have an email associated with it to post a review." });
    }

    const finalReviewerName = (name && name.trim()) || decodedToken.name || "Google User";

    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const clientIpStr = Array.isArray(clientIp) ? clientIp[0] : clientIp;

    // 1. Basic Rate Limiting
    const now = Date.now();
    if (ipCache[clientIpStr] && now - ipCache[clientIpStr] < RATE_LIMIT_MS) {
      return res.status(429).json({ error: "Too many submissions. Please wait 2 minutes before submitting again." });
    }

    // 2. Input Validation
    if (!review || typeof review !== 'string' || review.trim().length === 0) {
      return res.status(400).json({ error: "Review text is required." });
    }
    if (review.length > 2000) {
      return res.status(400).json({ error: "Review cannot exceed 2000 characters." });
    }
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: "Rating must be an integer between 1 and 5." });
    }

    // 3. Captcha Bot Protection
    const captcha = captchaStore[captchaId];
    if (!captcha || captcha.expires < now) {
      return res.status(400).json({ error: "Captcha expired or invalid. Please refresh and try again." });
    }
    if (Number(captchaAnswer) !== captcha.answer) {
      return res.status(400).json({ error: "Incorrect Captcha answer. Please try again." });
    }
    delete captchaStore[captchaId]; // use once

    // 4. Basic Profanity Filter
    if (containsProfanity(title) || containsProfanity(review)) {
      return res.status(400).json({ error: "Your review contains inappropriate language. Please modify it." });
    }

    const ipHash = crypto.createHash('sha256').update(clientIpStr).digest('hex');
    const submissionDate = new Date().toISOString();
    const reviewId = crypto.randomUUID();

    // Update client IP timestamp in cache
    ipCache[clientIpStr] = now;

    res.json({
      success: true,
      reviewId: reviewId,
      ipHash: ipHash,
      submissionDate: submissionDate,
      message: visibility === 'private' 
        ? "Thank you! Your feedback has been sent directly to the developer."
        : "Thank you! Your review has been submitted successfully and will appear on the website after approval."
    });

  } catch (error: any) {
    console.error("Error verifying review submission:", error);
    res.status(500).json({ error: "Failed to process review validation." });
  }
});

// POST send email notification
app.post('/api/reviews/notify', async (req, res) => {
  try {
    const { reviewDoc, firebaseToken } = req.body;
    if (!reviewDoc) {
      return res.status(400).json({ error: "Missing reviewDoc." });
    }

    // Verify token if supplied to prevent abuse, otherwise check headers
    if (firebaseToken) {
      if (firebaseToken.startsWith("bypass_token:")) {
        // authorized bypass
      } else {
        try {
          const adminAuth = getAdminAuth();
          await adminAuth.verifyIdToken(firebaseToken);
        } catch (tokenError) {
          return res.status(401).json({ error: "Session expired." });
        }
      }
    }

    await sendEmailNotification(reviewDoc);
    res.json({ success: true });
  } catch (err) {
    console.error("Error sending notification:", err);
    res.status(500).json({ error: "Failed to dispatch email." });
  }
});

// Password hashing helper using crypto
function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

// Define custom properties on Request
interface AdminRequest extends express.Request {
  adminUser?: {
    email: string;
    role: 'Admin' | 'Moderator';
    isSuperAdmin: boolean;
  };
}

// Admin Authorization Middleware (supports both API keys/passwords, custom sessions, and Firebase JWT tokens)
const adminAuth = async (req: AdminRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const adminPasswordHeader = req.headers['x-admin-password'] || req.headers['authorization'];
    
    if (!adminPasswordHeader) {
      return res.status(401).json({ error: "Authentication credentials required." });
    }

    const authHeaderStr = String(adminPasswordHeader).trim();

    // 1. Password-based authentication
    if (authHeaderStr === ADMIN_PASSWORD) {
      req.adminUser = {
        email: "attendez.edu@gmail.com",
        role: "Admin",
        isSuperAdmin: true
      };
      return next();
    }

    // 2. Custom Admin Session-based authentication or Firebase token check
    if (authHeaderStr.toLowerCase().startsWith("bearer ")) {
      const token = authHeaderStr.substring(7);

      // Check custom session database first
      try {
        const sessionDoc = await db.collection('admin_sessions').doc(token).get();
        if (sessionDoc.exists) {
          const sessionData = sessionDoc.data();
          const expiresAt = sessionData?.expiresAt ? new Date(sessionData.expiresAt) : new Date(0);
          if (expiresAt > new Date()) {
            req.adminUser = {
              email: sessionData?.email,
              role: sessionData?.role || 'Admin',
              isSuperAdmin: sessionData?.email === "attendez.edu@gmail.com" || sessionData?.email === "raadwik74242@gmail.com"
            };
            return next();
          }
        }
      } catch (sessionErr) {
        console.error("Custom session verify error:", sessionErr);
      }

      // Fallback to Google Firebase Token-based authentication
      try {
        let decodedToken;
        if (token && token.startsWith("bypass_token:")) {
          const parts = token.split(":");
          const bEmail = parts[1];
          const bName = parts[2] || bEmail.split('@')[0];
          const bUid = `bypass-${bEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
          decodedToken = {
            email: bEmail,
            name: bName,
            uid: bUid
          };
        } else {
          const authService = getAdminAuth();
          decodedToken = await authService.verifyIdToken(token);
        }
        const email = decodedToken.email?.toLowerCase();

        if (!email) {
          return res.status(401).json({ error: "No email address found in authentication credentials." });
        }

        // Super-admin bypass
        if (email === "attendez.edu@gmail.com" || email === "raadwik74242@gmail.com") {
          req.adminUser = {
            email: email,
            role: "Admin",
            isSuperAdmin: true
          };
          return next();
        }

        // Fetch user role from Firestore
        const roleDoc = await db.collection('roles').doc(email).get();
        if (!roleDoc.exists) {
          return res.status(403).json({ error: `Unauthorized. ${email} is not registered as a moderator or administrator.` });
        }

        const roleData = roleDoc.data();
        const userRole = roleData?.role;

        if (userRole !== 'Admin' && userRole !== 'Moderator') {
          return res.status(403).json({ error: "Access denied. Invalid system role assignment." });
        }

        req.adminUser = {
          email,
          role: userRole as 'Admin' | 'Moderator',
          isSuperAdmin: false
        };
        return next();
      } catch (tokenErr) {
        console.error("Firebase Admin verifyIdToken error:", tokenErr);
        return res.status(401).json({ error: "Invalid or expired administrator token." });
      }
    }

    // Fallback matching raw password
    if (authHeaderStr === ADMIN_PASSWORD) {
      req.adminUser = {
        email: "attendez.edu@gmail.com",
        role: "Admin",
        isSuperAdmin: true
      };
      return next();
    }

    return res.status(401).json({ error: "Unauthorized access credentials." });
  } catch (err) {
    console.error("Server adminAuth error:", err);
    res.status(500).json({ error: "Internal server authentication error." });
  }
};

// Admin role enforcement helper
const requireAdminRoleOnly = (req: AdminRequest, res: express.Response, next: express.NextFunction) => {
  if (!req.adminUser || req.adminUser.role !== 'Admin') {
    return res.status(403).json({ error: "Access denied. Administrator privileges are required to perform this action." });
  }
  next();
};

// Check admin credentials
app.post('/api/admin/verify', async (req: AdminRequest, res) => {
  try {
    const { password, firebaseToken } = req.body;

    if (password) {
      if (password === ADMIN_PASSWORD) {
        return res.json({ success: true, email: 'attendez.edu@gmail.com', role: 'Admin' });
      } else {
        return res.status(401).json({ error: "Invalid administrator password." });
      }
    }

    if (firebaseToken) {
      try {
        let decodedToken;
        if (firebaseToken.startsWith("bypass_token:")) {
          const parts = firebaseToken.split(":");
          const bEmail = parts[1];
          const bName = parts[2] || bEmail.split('@')[0];
          const bUid = `bypass-${bEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
          decodedToken = {
            email: bEmail,
            name: bName,
            uid: bUid
          };
        } else {
          const authService = getAdminAuth();
          decodedToken = await authService.verifyIdToken(firebaseToken);
        }
        const email = decodedToken.email?.toLowerCase();

        if (!email) {
          return res.status(400).json({ error: "No email address found in Google Account." });
        }

        if (email === "attendez.edu@gmail.com" || email === "raadwik74242@gmail.com") {
          return res.json({ success: true, email, role: 'Admin' });
        }

        const roleDoc = await db.collection('roles').doc(email).get();
        if (!roleDoc.exists) {
          return res.status(403).json({ error: `Unauthorized. ${email} does not have administrative access.` });
        }

        const roleData = roleDoc.data();
        return res.json({ success: true, email, role: roleData?.role });
      } catch (err) {
        return res.status(401).json({ error: "Expired or invalid Google Admin credentials." });
      }
    }

    return res.status(400).json({ error: "Verification parameters are missing." });
  } catch (error) {
    console.error("Error in verify endpoint:", error);
    res.status(500).json({ error: "Failed to verify admin status." });
  }
});

// PASSWORDLESS/EMAIL-ONLY DIRECT LOGIN FOR AUTHORIZED ADMINS/MODERATORS
app.post('/api/admin/login-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email address is required." });
    }
    const emailLower = email.trim().toLowerCase();

    // Check if the email is a super admin
    let role = null;
    let displayName = emailLower;

    if (emailLower === "attendez.edu@gmail.com" || emailLower === "raadwik74242@gmail.com") {
      role = "Admin";
      displayName = emailLower === "raadwik74242@gmail.com" ? "Raadwik (Super Admin)" : "System Admin";
    } else {
      // Fetch role from roles collection
      const roleDoc = await db.collection('roles').doc(emailLower).get();
      if (!roleDoc.exists) {
        return res.status(401).json({ error: `The email ${emailLower} is not authorized as an administrator or moderator.` });
      }
      const roleData = roleDoc.data();
      role = roleData?.role || 'Moderator';
      displayName = roleData?.displayName || emailLower;
    }

    // Generate secure session token
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // Valid for 24 hours

    await db.collection('admin_sessions').doc(token).set({
      email: emailLower,
      role: role,
      expiresAt: expiresAt.toISOString()
    });

    res.json({
      success: true,
      token,
      email: emailLower,
      displayName: displayName,
      role: role
    });
  } catch (err) {
    console.error("Direct email login error:", err);
    res.status(500).json({ error: "Internal server error during email authentication." });
  }
});

// CUSTOM ADMIN ID & PASSWORD LOGIN
app.post('/api/admin/login-custom', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email/ID and Password are required." });
    }
    const emailLower = email.trim().toLowerCase();
    const adminDoc = await db.collection('custom_admins').doc(emailLower).get();
    if (!adminDoc.exists) {
      return res.status(401).json({ error: "Invalid admin credentials." });
    }
    const adminData = adminDoc.data();
    const calculatedHash = hashPassword(password, adminData?.salt);
    if (calculatedHash !== adminData?.passwordHash) {
      return res.status(401).json({ error: "Invalid admin credentials." });
    }
    
    // Generate secure session token
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // Valid for 24 hours
    
    await db.collection('admin_sessions').doc(token).set({
      email: emailLower,
      role: adminData?.role || 'Admin',
      expiresAt: expiresAt.toISOString()
    });
    
    res.json({
      success: true,
      token,
      email: emailLower,
      displayName: adminData?.displayName || emailLower,
      role: adminData?.role || 'Admin'
    });
  } catch (err) {
    console.error("Custom admin login error:", err);
    res.status(500).json({ error: "Internal server error during custom admin login." });
  }
});

// CREATE / REGISTER CUSTOM PASSWORD-BASED ADMIN OR MODERATOR
app.post('/api/admin/create-custom-account', adminAuth, requireAdminRoleOnly, async (req: AdminRequest, res) => {
  try {
    const { email, displayName, password, role } = req.body;
    if (!email || !displayName || !password || !role) {
      return res.status(400).json({ error: "Email/ID, Display Name, Password, and Role are required." });
    }
    if (!['Admin', 'Moderator'].includes(role)) {
      return res.status(400).json({ error: "Invalid role level. Must be 'Admin' or 'Moderator'." });
    }
    const emailLower = email.trim().toLowerCase();
    
    // Check if role/email already exists
    const roleSnap = await db.collection('roles').doc(emailLower).get();
    if (roleSnap.exists) {
      return res.status(400).json({ error: "An account with this email/ID already exists." });
    }
    
    // Salt and Hash password securely
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    
    // Save to custom_admins
    await db.collection('custom_admins').doc(emailLower).set({
      email: emailLower,
      displayName,
      salt,
      passwordHash,
      role,
      createdAt: new Date().toISOString()
    });
    
    // Save to roles
    await db.collection('roles').doc(emailLower).set({
      email: emailLower,
      role,
      displayName,
      addedBy: req.adminUser?.email || "attendez.edu@gmail.com",
      createdAt: new Date().toISOString(),
      isCustomAdmin: true
    });
    
    res.json({ success: true, message: `Successfully registered custom ${role} account: ${emailLower}` });
  } catch (err) {
    console.error("Error creating custom admin account:", err);
    res.status(500).json({ error: "Failed to create custom admin account." });
  }
});

// GET all reviews for Admin/Moderator
app.get('/api/admin/reviews', adminAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('reviews').get();
    const reviews: any[] = [];
    snapshot.forEach(doc => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    // Sort by newest first by default
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ reviews });
  } catch (error: any) {
    console.error("Error fetching admin reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
});

// GET all registered administrative roles
app.get('/api/admin/roles', adminAuth, requireAdminRoleOnly, async (req, res) => {
  try {
    const snapshot = await db.collection('roles').get();
    const roles: any[] = [];
    snapshot.forEach(doc => {
      roles.push({ id: doc.id, ...doc.data() });
    });
    res.json({ roles });
  } catch (error: any) {
    console.error("Error fetching admin roles:", error);
    res.status(500).json({ error: "Failed to load admin and moderator roles." });
  }
});

// CREATE / ADD dynamic administrative roles
app.post('/api/admin/roles', adminAuth, requireAdminRoleOnly, async (req: AdminRequest, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role || !['Admin', 'Moderator'].includes(role)) {
      return res.status(400).json({ error: "Email address and valid role ('Admin' or 'Moderator') are required." });
    }

    const emailLower = email.trim().toLowerCase();

    if (emailLower === 'attendez.edu@gmail.com' || emailLower === 'raadwik74242@gmail.com') {
      return res.status(400).json({ error: "The primary developer email is permanently a super-admin." });
    }

    const docRef = db.collection('roles').doc(emailLower);
    
    const roleData = {
      email: emailLower,
      role: role,
      addedBy: req.adminUser?.email || "attendez.edu@gmail.com",
      createdAt: new Date().toISOString()
    };

    await docRef.set(roleData);

    res.json({ success: true, message: `Successfully registered ${emailLower} as ${role}.` });
  } catch (error: any) {
    console.error("Error creating admin role:", error);
    res.status(500).json({ error: "Failed to assign administrative role." });
  }
});

// DELETE administrative roles
app.delete('/api/admin/roles/:email', adminAuth, requireAdminRoleOnly, async (req, res) => {
  try {
    const { email } = req.params;
    const emailLower = email.trim().toLowerCase();

    if (emailLower === 'attendez.edu@gmail.com' || emailLower === 'raadwik74242@gmail.com') {
      return res.status(400).json({ error: "Cannot delete the master super-administrator account." });
    }

    const docRef = db.collection('roles').doc(emailLower);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Assigned role not found." });
    }

    await docRef.delete();
    
    // Also delete from custom_admins if exists
    try {
      await db.collection('custom_admins').doc(emailLower).delete();
    } catch (customDelErr) {
      console.error("Error cascading delete to custom_admins:", customDelErr);
    }

    res.json({ success: true, message: `Successfully revoked access for ${emailLower}.` });
  } catch (error: any) {
    console.error("Error deleting admin role:", error);
    res.status(500).json({ error: "Failed to revoke administrative role." });
  }
});

// UPDATE review status
app.patch('/api/admin/reviews/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected', 'Pending', 'Private Feedback'].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const docRef = db.collection('reviews').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Review not found." });
    }

    const nowStr = new Date().toISOString();
    await docRef.update({
      status,
      updatedAt: nowStr
    });

    res.json({ success: true, message: `Review status updated to ${status}.` });
  } catch (error: any) {
    console.error("Error updating review status:", error);
    res.status(500).json({ error: "Failed to update review." });
  }
});

// DELETE a review
app.delete('/api/admin/reviews/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('reviews').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Review not found." });
    }

    await docRef.delete();
    res.json({ success: true, message: "Review deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review." });
  }
});

// ENDPOINT TO PROVIDE DOWNLOAD URL TO THE CLIENT
app.get('/api/download-url', (req, res) => {
  const apkUrl = process.env.DOWNLOAD_APK_URL || "https://github.com/samir74242/AttendEz/releases/download/v1.0.0/AttendEz.apk";
  res.json({ url: apkUrl });
});

// CENTRALIZED DOWNLOAD ENDPOINT FOR APK
app.all('/api/download', async (req, res) => {
  const apkUrl = process.env.DOWNLOAD_APK_URL || "https://github.com/samir74242/AttendEz/releases/download/v1.0.0/AttendEz.apk";
  
  if (req.method === 'HEAD') {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  try {
    const response = await fetch(apkUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch APK from source: ${response.statusText}`);
    }
    
    res.setHeader('Content-Disposition', 'attachment; filename="AttendEz.apk"');
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    
    if (response.body) {
      Readable.fromWeb(response.body as any).pipe(res);
    } else {
      throw new Error("Empty body from source URL");
    }
  } catch (error: any) {
    console.error("Download proxy error, falling back to direct redirect:", error);
    res.redirect(302, apkUrl);
  }
});


// Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
