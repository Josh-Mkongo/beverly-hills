import { state, saveState } from './state.js';
import { showToast } from './notifications.js';

export async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function handleSetPassword(newPassword) {
  if (newPassword.length >= 4) {
    state.adminPasswordHash = await hashPassword(newPassword);
    saveState();
    showToast('Admin password set successfully!', 'success');
  } else {
    showToast('Password must be at least 4 characters', 'error');
  }
}

export async function handleAdminLogin() {
  const input = document.getElementById('adminPasswordInput');
  if (!input) return;

  const enteredHash = await hashPassword(input.value);
  if (enteredHash === state.adminPasswordHash) {
    state.isAdmin = true;
    state.passwordInput = '';
    showToast('Admin login successful!', 'success');
  } else {
    showToast('Incorrect password', 'error');
    state.passwordInput = '';
  }
}

export function logoutAdmin() {
  state.isAdmin = false;
  showToast('Logged out', 'info');
}












/**
// js/admin.js
import { state, saveState } from './state.js';

// Hash password using SHA-256
export async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Set password
export async function handleSetPassword(newPassword) {
  if (newPassword.length >= 4) {
    state.adminPasswordHash = await hashPassword(newPassword);
    saveState();
    showToast('Admin password set successfully!', 'success');
  } else {
    showToast('Password must be at least 4 characters', 'error');
  }
}

// Admin login
export async function handleAdminLogin() {
  const input = document.getElementById('adminPasswordInput');
  if (!input) return;

  const enteredHash = await hashPassword(input.value);
  if (enteredHash === state.adminPasswordHash) {
    state.isAdmin = true;
    state.passwordInput = '';
    showToast('Admin login successful!', 'success');
  } else {
    showToast('Incorrect password', 'error');
    state.passwordInput = '';
  }
}

// Logout
export function logoutAdmin() {
  state.isAdmin = false;
  showToast('Logged out', 'info');
}
**/