export let state = {
  currentGroup: 1,
  isAdmin: false,
  showSettings: false,
  adminPasswordHash: '',
  passwordInput: '',
  history: [],
  notificationsEnabled: false,
  groups: [
    { id: 1, name: 'Group 1', members: [] },
    { id: 2, name: 'Group 2', members: [] },
    { id: 3, name: 'Group 3', members: [] }
  ],
  editingGroup: null,
  newMemberName: '',
  showAllHistory: false
};

export function loadState() {
  const saved = localStorage.getItem('trashRotation');
  if (saved) {
    const data = JSON.parse(saved);
    state = { ...state, ...data };
  }
}

export function saveState() {
  localStorage.setItem('trashRotation', JSON.stringify({
    currentGroup: state.currentGroup,
    adminPasswordHash: state.adminPasswordHash,
    history: state.history,
    groups: state.groups,
    notificationsEnabled: state.notificationsEnabled
  }));
}













/** 
// js/state.js
export let state = {
  currentGroup: 1,
  isAdmin: false,
  showSettings: false,
  adminPasswordHash: '',
  passwordInput: '',
  history: [],
  notificationsEnabled: false,
  groups: [
    { id: 1, name: 'Group 1', members: [] },
    { id: 2, name: 'Group 2', members: [] },
    { id: 3, name: 'Group 3', members: [] }
  ],
  editingGroup: null,
  newMemberName: ''
};

// Load state from localStorage
export function loadState() {
  const saved = localStorage.getItem('trashRotation');
  if (saved) {
    const data = JSON.parse(saved);
    state = { ...state, ...data };
  }
}

// Save state to localStorage
export function saveState() {
  localStorage.setItem('trashRotation', JSON.stringify({
    currentGroup: state.currentGroup,
    adminPasswordHash: state.adminPasswordHash,
    history: state.history,
    groups: state.groups,
    notificationsEnabled: state.notificationsEnabled
  }));
}
**/