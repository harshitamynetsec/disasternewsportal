const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
let sessions = {};
let activityLogs = [];

// --- Rate limiting and lockout additions ---
const FAILED_ATTEMPTS_LIMIT = 5;
const LOCKOUT_DURATION = 10 * 60 * 1000; // 10 minutes
let failedAttempts = {}; // { email: { count, lastFailed, lockoutUntil } }

export const validateEmail = (email) => {
  const mynetsecRegex = /^[a-zA-Z0-9._%+-]+@mynetsec\.com$/;
  return mynetsecRegex.test(email);
};

export const COMMON_PASSWORD = 'mynetsec2024';

export const authenticateUser = (email, password) => {
  return validateEmail(email) && password === COMMON_PASSWORD;
};

export function sanitizeInput(input) {
  // Basic sanitization: trim and remove script tags
  return String(input).replace(/<.*?>/g, '').trim();
}

export class AuthManager {
  authenticateUser(email, password) {
    if (!validateEmail(email)) throw new Error('Invalid email domain.');
    if (password !== COMMON_PASSWORD) {
      throw new Error('Incorrect password.');
    }
    return true;
  }
}

export class SessionManager {
  createSession(user) {
    const expiresAt = Date.now() + SESSION_DURATION;
    sessions[user.email] = { user, expiresAt };
    return { user, expiresAt };
  }
  getSession() {
    const emails = Object.keys(sessions);
    if (emails.length === 0) return null;
    const session = sessions[emails[0]];
    if (session && session.expiresAt > Date.now()) {
      return session;
    }
    this.clearSession();
    return null;
  }
  extendSession() {
    const session = this.getSession();
    if (session) {
      session.expiresAt = Date.now() + SESSION_DURATION;
    }
  }
  clearSession() {
    Object.keys(sessions).forEach(email => delete sessions[email]);
  }
}

export class ActivityLogger {
  log(event, data) {
    activityLogs.push({ event, data, timestamp: new Date().toISOString() });
  }
  getLogs() {
    return [...activityLogs];
  }
}

export class RateLimiter {
  constructor() {
    this.lastAttempt = 0;
    this.cooldown = 1000; // 1 second between attempts
  }
  isAllowed() {
    const now = Date.now();
    if (now - this.lastAttempt < this.cooldown) {
      return false;
    }
    this.lastAttempt = now;
    return true;
  }
}

export function recordFailedAttempt(email) {
  if (!failedAttempts[email]) {
    failedAttempts[email] = { count: 0, lastFailed: 0, lockoutUntil: 0 };
  }
  failedAttempts[email].count += 1;
  failedAttempts[email].lastFailed = Date.now();
  if (failedAttempts[email].count >= FAILED_ATTEMPTS_LIMIT) {
    failedAttempts[email].lockoutUntil = Date.now() + LOCKOUT_DURATION;
  }
}

export function isLockedOut(email) {
  const entry = failedAttempts[email];
  if (!entry) return false;
  if (entry.lockoutUntil && entry.lockoutUntil > Date.now()) {
    return true;
  }
  if (entry.lockoutUntil && entry.lockoutUntil <= Date.now()) {
    // Reset after lockout expires
    failedAttempts[email] = { count: 0, lastFailed: 0, lockoutUntil: 0 };
    return false;
  }
  return false;
}

export function resetFailedAttempts(email) {
  delete failedAttempts[email];
}

export function getAttemptsLeft(email) {
  const entry = failedAttempts[email];
  if (!entry) return FAILED_ATTEMPTS_LIMIT;
  if (entry.lockoutUntil && entry.lockoutUntil > Date.now()) return 0;
  return Math.max(0, FAILED_ATTEMPTS_LIMIT - entry.count);
}