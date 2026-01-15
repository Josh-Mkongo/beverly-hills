import { state, saveState } from './state.js';

export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      state.notificationsEnabled = true;
      sendNotification('Notifications Enabled!', 'You will now receive reminders for trash duty.');
      saveState();
    } else {
      showToast('Notification permission denied. Enable in browser settings.', 'error');
    }
  } else {
    showToast('Your browser does not support notifications.', 'error');
  }
}

export function sendNotification(title, body) {
  if (state.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: '/icons/trash.png'
    });
  }
}

export function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  // Ensure we have a container for stacking
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  container.appendChild(toast);

  // ✅ Play subtle audio feedback depending on type
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch (type) {
      case 'success':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.25);
        break;

      case 'error':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(220, ctx.currentTime); // low buzz
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.4);
        break;

      case 'info':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime); // neutral tone
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.2);
        break;
    }
  } catch (err) {
    console.warn('Audio play blocked:', err);
  }

  // ✅ Gentle vibration for mobile devices
  if (navigator.vibrate) {
    switch (type) {
      case 'success':
        navigator.vibrate(50); // short tap
        break;
      case 'error':
        navigator.vibrate([100, 50, 100]); // double buzz
        break;
      case 'info':
        navigator.vibrate(30); // quick pulse
        break;
    }
  }

  // Show toast
  setTimeout(() => toast.classList.add('show'), 10);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

















/**
// js/notifications.js
import { state, saveState } from './state.js';

// Request notification permission
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      state.notificationsEnabled = true;
      sendNotification('Notifications Enabled!', 'You will now receive reminders for trash duty.');
      saveState();
    } else {
      showToast('Notification permission denied. Enable in browser settings.', 'error');
    }
  } else {
    showToast('Your browser does not support notifications.', 'error');
  }
}

// Send browser notification
export function sendNotification(title, body) {
  if (state.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: '/icons/trash.png' // replace with a real icon file
    });
  }
}

// Toast helper
export function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `
    fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg
    ${type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-gray-800'}
    text-white text-sm font-medium
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
**/