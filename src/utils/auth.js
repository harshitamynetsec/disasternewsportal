const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
let sessions = {};
let activityLogs = [];

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