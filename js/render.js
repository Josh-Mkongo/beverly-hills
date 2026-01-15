// js/render.js
import { state, saveState } from './state.js';
import { handleSetPassword, handleAdminLogin, logoutAdmin } from './admin.js';
import { requestNotificationPermission, showToast, sendNotification } from './notifications.js';
import { addMember, removeMember, handleTaskComplete, getNextGroup } from './groups.js';
import { Icons } from './icons.js';

export function render() {
  const currentGroupData = state.groups.find(g => g.id === state.currentGroup);
  const nextGroupData = getNextGroup();

  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 text-indigo-600">${Icons.Trash2()}</div>
          <h1 class="text-2xl font-bold text-gray-800">Beverly Hills Apartment</h1>
        </div>
        <button data-action="toggle-settings" class="p-2 hover:bg-gray-100 rounded-lg transition">
          <div class="w-6 h-6 text-gray-600">${Icons.Settings()}</div>
        </button>
      </div>
      <p class="text-gray-600 text-sm">Trash Duty Rotation Tracker</p>
    </div>

    <!-- Settings Panel -->
    ${state.showSettings ? renderSettings() : ''}

    <!-- Current Group Display -->
    ${renderCurrentGroup(currentGroupData, nextGroupData)}

    <!-- Rotation Schedule -->
    ${renderSchedule()}

    <!-- History -->
    ${renderHistory()}
  `;

  bindEvents();
}

function renderSettings() {
  return `
    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Settings</h2>
        <button data-action="toggle-settings">
          <div class="w-6 h-6 text-gray-600">${Icons.X()}</div>
        </button>
      </div>
      <div class="space-y-6">
        <!-- Password Settings -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            ${state.adminPasswordHash ? 'Change Admin Password' : 'Set Admin Password'}
          </label>
          <div class="flex gap-2">
            <input type="password" id="passwordInput" placeholder="Enter new password"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
            <button data-action="set-password"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Save
            </button>
          </div>
        </div>

        <!-- Notifications -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Notifications</label>
          <button data-action="toggle-notifications"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
              state.notificationsEnabled 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }">
            <div class="w-5 h-5">${state.notificationsEnabled ? Icons.Bell() : Icons.BellOff()}</div>
            ${state.notificationsEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
          </button>
        </div>

        <!-- Groups -->
        ${state.groups.map(group => renderGroup(group)).join('')}
      </div>
    </div>
  `;
}

function renderGroup(group) {
  return `
    <div class="border border-gray-200 rounded-lg p-4 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-800">${group.name}</h3>
        <button data-action="toggle-edit-group" data-group-id="${group.id}"
          class="text-sm text-indigo-600 hover:text-indigo-700">
          ${state.editingGroup === group.id ? 'Done' : 'Edit'}
        </button>
      </div>
      <div class="space-y-2 mb-3">
        ${group.members.length > 0 ? group.members.map((member, index) => `
          <div class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
            <span class="text-sm text-gray-700">${member}</span>
            ${state.editingGroup === group.id ? `
              <button data-action="remove-member" data-group-id="${group.id}" data-index="${index}"
                class="text-red-600 hover:text-red-700">
                ${Icons.Trash()}
              </button>
            ` : ''}
          </div>
        `).join('') : '<p class="text-sm text-gray-500 italic">No members added yet</p>'}
      </div>
      ${state.editingGroup === group.id ? `
        <div class="flex gap-2">
          <input type="text" id="memberInput${group.id}" placeholder="Member name"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <button data-action="add-member" data-group-id="${group.id}"
            class="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            ${Icons.UserPlus()}
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderCurrentGroup(currentGroupData, nextGroupData) {
  return `
    <div class="bg-white rounded-lg shadow-lg p-8 mb-6">
      <div class="text-center mb-6">
        <h2 class="text-5xl font-bold text-indigo-600 mb-2">${currentGroupData.name}</h2>
        ${currentGroupData.members.map(m => `
          <span class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">${m}</span>
        `).join('')}
        <p class="text-gray-600 mt-4">It's your turn to take out the trash!</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <p class="text-sm text-gray-600 text-center">
          <strong>Next up:</strong> ${nextGroupData.name}
          ${nextGroupData.members.length > 0 ? ` (${nextGroupData.members.join(', ')})` : ''}
        </p>
      </div>
      ${state.notificationsEnabled ? `
        <button data-action="send-reminder"
          class="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition flex items-center justify-center gap-2 mb-4">
          ${Icons.Bell()} Send Reminder
        </button>
      ` : ''}
      ${!state.isAdmin ? `
        <div class="space-y-3">
          <input type="password" id="adminPasswordInput" placeholder="Enter admin password"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-center" />
          <button data-action="admin-login"
            class="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition">
            Admin Login
          </button>
        </div>
      ` : `
        <div class="space-y-3">
          <button data-action="task-complete"
            class="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
            ${Icons.CheckCircle()} Mark Task Complete & Rotate
          </button>
          <button data-action="logout-admin"
            class="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition text-sm">
            Logout Admin
          </button>
        </div>
      `}
    </div>
  `;
}

function renderSchedule() {
  return `
    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">Rotation Schedule</h3>
      ${state.groups.map(group => `
        <div class="p-3 rounded-lg ${group.id === state.currentGroup ? 'bg-indigo-100 border-2 border-indigo-400' : 'bg-gray-50'}">
          <div class="flex items-center justify-between">
            <span class="font-medium ${group.id === state.currentGroup ? 'text-indigo-700' : 'text-gray-700'}">${group.name}</span>
            ${group.id === state.currentGroup ? `<span class="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">Current</span>` : ''}
          </div>
          ${group.members.length > 0 ? `<p class="text-xs text-gray-600 mt-1">${group.members.join(', ')}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

// ✅ Added missing function
function renderHistory() {
  if (state.history.length === 0) {
    return `
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-lg font-semibold mb-4">Recent Completions</h3>
        <p class="text-sm text-gray-500 italic">No tasks have been completed yet.</p>
      </div>
    `;
  }

  const showAll = state.showAllHistory === true;
  const recentHistory = showAll ? state.history : state.history.slice(0, 10);

  return `
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-semibold">Recent Completions</h3>
        ${state.isAdmin ? `
          <button data-action="clear-history-request"
            class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition">
            Clear History
          </button>
        ` : ''}
      </div>
      <p class="text-xs text-gray-500 mb-4">
        Showing ${recentHistory.length} of ${state.history.length} records
      </p>
      <div class="space-y-2 ${showAll ? 'max-h-64 overflow-y-auto pr-2 custom-scrollbar' : ''}">
        ${recentHistory.map(record => `
          <div class="p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition">
            <div class="flex justify-between items-center">
              <span class="font-medium text-gray-700">
                Group ${record.group}
              </span>
              <span class="text-gray-500 text-xs">${record.date}</span>
            </div>
          </div>
        `).join('')}
      </div>
      ${state.history.length > 10 ? `
        <button data-action="toggle-history"
          class="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition text-sm">
          ${showAll ? 'Show Less' : 'View All History'}
        </button>
      ` : ''}
      ${state.showClearConfirm ? `
        <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
          <p class="text-sm text-red-700 mb-3">Are you sure you want to clear all history? This action cannot be undone.</p>
          <div class="flex gap-2">
            <button data-action="confirm-clear-history"
              class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm">
              Yes, Clear
            </button>
            <button data-action="cancel-clear-history"
              class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition text-sm">
              Cancel
            </button>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}




function bindEvents() {
  // Toggle settings
  document.querySelectorAll('[data-action="toggle-settings"]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.showSettings = !state.showSettings;
      render();
    });
  });

  // Set password
  document.querySelectorAll('[data-action="set-password"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const input = document.getElementById('passwordInput');
      if (input && input.value) {
        await handleSetPassword(input.value);
        input.value = '';
        render();
      }
    });
  });

  // Toggle notifications
  document.querySelectorAll('[data-action="toggle-notifications"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.notificationsEnabled) {
        state.notificationsEnabled = false;
        saveState();
        showToast('Notifications disabled', 'info');
        render();
      } else {
        requestNotificationPermission().then(() => render());
      }
    });
  });

  // Toggle edit group
  document.querySelectorAll('[data-action="toggle-edit-group"]').forEach(btn => {
    btn.addEventListener('click', e => {
      const groupId = parseInt(e.target.closest('button').dataset.groupId);
      state.editingGroup = state.editingGroup === groupId ? null : groupId;
      render();
    });
  });

  // Add member
  document.querySelectorAll('[data-action="add-member"]').forEach(btn => {
    btn.addEventListener('click', e => {
      const groupId = parseInt(e.target.closest('button').dataset.groupId);
      const input = document.getElementById('memberInput' + groupId);
      if (input && input.value.trim()) {
        addMember(groupId, input.value);
        input.value = '';
        render();
      }
    });
  });

  // Remove member
  document.querySelectorAll('[data-action="remove-member"]').forEach(btn => {
    btn.addEventListener('click', e => {
      const groupId = parseInt(e.target.closest('button').dataset.groupId);
      const index = parseInt(e.target.closest('button').dataset.index);
      removeMember(groupId, index);
      render();
    });
  });

  // Admin login
  document.querySelectorAll('[data-action="admin-login"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await handleAdminLogin();
      render();
    });
  });

  // Logout admin
  document.querySelectorAll('[data-action="logout-admin"]').forEach(btn => {
    btn.addEventListener('click', () => {
      logoutAdmin();
      render();
    });
  });

  // Task complete
  document.querySelectorAll('[data-action="task-complete"]').forEach(btn => {
    btn.addEventListener('click', () => {
      handleTaskComplete();
      render();
    });
  });

// Toggle history view
document.querySelectorAll('[data-action="toggle-history"]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.showAllHistory = !state.showAllHistory;
    render();
  });
});

// Request clear history (show confirmation panel)
document.querySelectorAll('[data-action="clear-history-request"]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.showClearConfirm = true;
    render();
  });
});

// Confirm clear history
document.querySelectorAll('[data-action="confirm-clear-history"]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.history = [];
    state.showClearConfirm = false;
    saveState();
    showToast('History cleared successfully', 'success');
    render();
  });
});

// Cancel clear history
document.querySelectorAll('[data-action="cancel-clear-history"]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.showClearConfirm = false;
    render();
  });
});




  // Send reminder
  document.querySelectorAll('[data-action="send-reminder"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const currentGroupData = state.groups.find(g => g.id === state.currentGroup);
      const memberNames = currentGroupData.members.length > 0
        ? currentGroupData.members.join(', ')
        : currentGroupData.name;

      showToast(`Reminder sent to ${currentGroupData.name}`, 'success');
      requestNotificationPermission().then(() => {
        sendNotification('🗑️ Reminder: Trash Duty!', `${currentGroupData.name} (${memberNames}) - Don’t forget!`);
      });
    });
  });
}












/**
// / js/render.js
import { state } from './state.js';
import { handleSetPassword, handleAdminLogin, logoutAdmin } from './admin.js';
import { requestNotificationPermission, showToast } from './notifications.js';
import { addMember, removeMember, handleTaskComplete, getNextGroup } from './groups.js';
import { Icons } from './icons.js'; // assume icons.js exports your SVGs

export function render() {
  const currentGroupData = state.groups.find(g => g.id === state.currentGroup);
  const nextGroupData = getNextGroup();

  const app = document.getElementById('app');
  app.innerHTML = `
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 text-indigo-600">${Icons.Trash2()}</div>
          <h1 class="text-2xl font-bold text-gray-800">Beverly Hills Apartment</h1>
        </div>
        <button data-action="toggle-settings" class="p-2 hover:bg-gray-100 rounded-lg transition">
          <div class="w-6 h-6 text-gray-600">${Icons.Settings()}</div>
        </button>
      </div>
      <p class="text-gray-600 text-sm">Trash Duty Rotation Tracker</p>
    </div>

    <!-- Settings Panel -->
    ${state.showSettings ? renderSettings() : ''}

    <!-- Current Group Display -->
    ${renderCurrentGroup(currentGroupData, nextGroupData)}

    <!-- Rotation Schedule -->
    ${renderSchedule()}

    <!-- History -->
    ${renderHistory()}
  `;

  bindEvents();
}

function renderSettings() {
  return `
    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Settings</h2>
        <button data-action="toggle-settings">
          <div class="w-6 h-6 text-gray-600">${Icons.X()}</div>
        </button>
      </div>
      <div class="space-y-6">
        <!-- Password Settings -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            ${state.adminPasswordHash ? 'Change Admin Password' : 'Set Admin Password'}
          </label>
          <div class="flex gap-2">
            <input type="password" id="passwordInput" placeholder="Enter new password"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
            <button data-action="set-password"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Save
            </button>
          </div>
        </div>

        <!-- Notifications -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Notifications</label>
          <button data-action="toggle-notifications"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
              state.notificationsEnabled 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }">
            <div class="w-5 h-5">${state.notificationsEnabled ? Icons.Bell() : Icons.BellOff()}</div>
            ${state.notificationsEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
          </button>
        </div>

        <!-- Groups -->
        ${state.groups.map(group => renderGroup(group)).join('')}
      </div>
    </div>
  `;
}

function renderGroup(group) {
  return `
    <div class="border border-gray-200 rounded-lg p-4 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-800">${group.name}</h3>
        <button data-action="toggle-edit-group" data-group-id="${group.id}"
          class="text-sm text-indigo-600 hover:text-indigo-700">
          ${state.editingGroup === group.id ? 'Done' : 'Edit'}
        </button>
      </div>
      <div class="space-y-2 mb-3">
        ${group.members.length > 0 ? group.members.map((member, index) => `
          <div class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
            <span class="text-sm text-gray-700">${member}</span>
            ${state.editingGroup === group.id ? `
              <button data-action="remove-member" data-group-id="${group.id}" data-index="${index}"
                class="text-red-600 hover:text-red-700">
                ${Icons.Trash()}
              </button>
            ` : ''}
          </div>
        `).join('') : '<p class="text-sm text-gray-500 italic">No members added yet</p>'}
      </div>
      ${state.editingGroup === group.id ? `
        <div class="flex gap-2">
          <input type="text" id="memberInput${group.id}" placeholder="Member name"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <button data-action="add-member" data-group-id="${group.id}"
            class="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            ${Icons.UserPlus()}
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderCurrentGroup(currentGroupData, nextGroupData) {
  return `
    <div class="bg-white rounded-lg shadow-lg p-8 mb-6">
      <div class="text-center mb-6">
        <h2 class="text-5xl font-bold text-indigo-600 mb-2">${currentGroupData.name}</h2>
        ${currentGroupData.members.map(m => `
          <span class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">${m}</span>
        `).join('')}
        <p class="text-gray-600 mt-4">It's your turn to take out the trash!</p>
      </div>
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <p class="text-sm text-gray-600 text-center">
          <strong>Next up:</strong> ${nextGroupData.name}
          ${nextGroupData.members.length > 0 ? ` (${nextGroupData.members.join(', ')})` : ''}
        </p>
      </div>
      ${state.notificationsEnabled ? `
        <button data-action="send-reminder"
          class="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition flex items-center justify-center gap-2 mb-4">
          ${Icons.Bell()} Send Reminder
        </button>
      ` : ''}
      ${!state.isAdmin ? `
        <div class="space-y-3">
          <input type="password" id="adminPasswordInput" placeholder="Enter admin password"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg text-center" />
          <button data-action="admin-login"
            class="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition">
            Admin Login
          </button>
        </div>
      ` : `
        <div class="space-y-3">
          <button data-action="task-complete"
            class="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
            ${Icons.CheckCircle()} Mark Task Complete & Rotate
          </button>
          <button data-action="logout-admin"
            class="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition text-sm">
            Logout Admin
          </button>
        </div>
      `}
    </div>
  `;
}

function renderSchedule() {
  return `
    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">Rotation Schedule</h3>
      ${state.groups.map(group => `
        <div class="p-3 rounded-lg ${group.id === state.currentGroup ? 'bg-indigo-100 border-2 border-indigo-400' : 'bg-gray-50'}">
          <div class="flex items-center justify-between">
            <span class="font-medium ${group.id === state.currentGroup ? 'text-indigo-700' : 'text-gray-700'}">${group.name}</span>
            ${group.id === state.currentGroup ? `<span class="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">Current</span>` : ''}
          </div>
          ${group.members.length > 0 ? `<p class="text-xs text-gray-600 mt-1">${group.members.join(', ')}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}
function bindEvents() {
  // Toggle settings
  document.querySelectorAll('[data-action="toggle-settings"]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.showSettings = !state.showSettings;
      render();
    });
  });

  // Set password
  document.querySelectorAll('[data-action="set-password"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const input = document.getElementById('passwordInput');
      if (input && input.value) {
        await handleSetPassword(input.value);
        input.value = '';
        render();
      }
    });
  });

  // Toggle notifications
  document.querySelectorAll('[data-action="toggle-notifications"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.notificationsEnabled) {
        state.notificationsEnabled = false;
        saveState();
        showToast('Notifications disabled', 'info');
        render();
      } else {
        requestNotificationPermission().then(() => render());
      }
    });
  });

  // Toggle edit group
  document.querySelectorAll('[data-action="toggle-edit-group"]').forEach(btn => {
    btn.addEventListener('click', e => {
      const groupId = parseInt(e.target.closest('button').dataset.groupId);
      state.editingGroup = state.editingGroup === groupId ? null : groupId;
      render();
    });
  });

  // Add member
  document.querySelectorAll('[data-action="add-member"]').forEach(btn => {
    btn.addEventListener('click', e => {
      const groupId = parseInt(e.target.closest('button').dataset.groupId);
      const input = document.getElementById('memberInput' + groupId);
      if (input && input.value.trim()) {
        addMember(groupId, input.value);
        input.value = '';
        render();
      }
    });
  });

  // Remove member
  document.querySelectorAll('[data-action="remove-member"]').forEach(btn => {
    btn.addEventListener('click', e => {
      const groupId = parseInt(e.target.closest('button').dataset.groupId);
      const index = parseInt(e.target.closest('button').dataset.index);
      removeMember(groupId, index);
      render();
    });
  });

  // Admin login
  document.querySelectorAll('[data-action="admin-login"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await handleAdminLogin();
      render();
    });
  });

  // Logout admin
  document.querySelectorAll('[data-action="logout-admin"]').forEach(btn => {
    btn.addEventListener('click', () => {
      logoutAdmin();
      render();
    });
  });

  // Task complete
  document.querySelectorAll('[data-action="task-complete"]').forEach(btn => {
    btn.addEventListener('click', () => {
      handleTaskComplete();
      render();
    });
  });

  // Send reminder
  document.querySelectorAll('[data-action="send-reminder"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const currentGroupData = state.groups.find(g => g.id === state.currentGroup);
      const memberNames = currentGroupData.members.length > 0
        ? currentGroupData.members.join(', ')
        : currentGroupData.name;

      showToast(`Reminder sent to ${currentGroupData.name}`, 'success');
      // also trigger browser notification
      requestNotificationPermission().then(() => {
        sendNotification('🗑️ Reminder: Trash Duty!', `${currentGroupData.name} (${memberNames}) - Don’t forget!`);
      });
    });
  });
}
**/

