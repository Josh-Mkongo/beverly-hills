import { state, saveState } from './state.js';
import { showToast } from './notifications.js';

export function addGroup(name) {
  if (!name.trim()) {
    showToast('Group name cannot be empty', 'error');
    return;
  }
  const newId = state.groups.length + 1;
  state.groups.push({ id: newId, name: name.trim(), members: [] });
  saveState();
  showToast(`Group "${name}" added`, 'success');
}

export function removeGroup(groupId) {
  state.groups = state.groups.filter(g => g.id !== groupId);
  saveState();
  showToast(`Group ${groupId} removed`, 'info');
}

export function addMember(groupId, memberName) {
  if (!memberName.trim()) {
    showToast('Member name cannot be empty', 'error');
    return;
  }
  state.groups = state.groups.map(g =>
    g.id === groupId
      ? { ...g, members: [...g.members, memberName.trim()] }
      : g
  );
  saveState();
  showToast(`${memberName} added to ${state.groups.find(g => g.id === groupId).name}`, 'success');
}

export function removeMember(groupId, memberIndex) {
  const group = state.groups.find(g => g.id === groupId);
  if (!group) return;

  const removed = group.members[memberIndex];
  group.members.splice(memberIndex, 1);
  saveState();
  showToast(`${removed} removed from ${group.name}`, 'info');
}

export function getNextGroup() {
  const nextGroupId = (state.currentGroup % state.groups.length) + 1;
  return state.groups.find(g => g.id === nextGroupId);
}

export function handleTaskComplete() {
  const nextGroup = getNextGroup();
  const completionRecord = {
    group: state.currentGroup,
    date: new Date().toLocaleString(),
    completedBy: 'Admin'
  };

  // ✅ Just prepend the new record, don't slice
  state.history = [completionRecord, ...state.history];

  state.currentGroup = nextGroup.id;

  const memberNames = nextGroup.members.length > 0
    ? nextGroup.members.join(', ')
    : nextGroup.name;

  showToast(`Rotation complete! Next duty: ${nextGroup.name}`, 'success');
  saveState();
}











/**
 *  js/groups.js
import { state, saveState } from './state.js';
import { showToast } from './notifications.js';

// Add a new group
export function addGroup(name) {
  if (!name.trim()) {
    showToast('Group name cannot be empty', 'error');
    return;
  }
  const newId = state.groups.length + 1;
  state.groups.push({ id: newId, name: name.trim(), members: [] });
  saveState();
  showToast(`Group "${name}" added`, 'success');
}

// Remove a group
export function removeGroup(groupId) {
  state.groups = state.groups.filter(g => g.id !== groupId);
  saveState();
  showToast(`Group ${groupId} removed`, 'info');
}

// Add member to a group
export function addMember(groupId, memberName) {
  if (!memberName.trim()) {
    showToast('Member name cannot be empty', 'error');
    return;
  }
  state.groups = state.groups.map(g =>
    g.id === groupId
      ? { ...g, members: [...g.members, memberName.trim()] }
      : g
  );
  saveState();
  showToast(`${memberName} added to ${state.groups.find(g => g.id === groupId).name}`, 'success');
}

// Remove member from a group
export function removeMember(groupId, memberIndex) {
  const group = state.groups.find(g => g.id === groupId);
  if (!group) return;

  const removed = group.members[memberIndex];
  group.members.splice(memberIndex, 1);
  saveState();
  showToast(`${removed} removed from ${group.name}`, 'info');
}

// Get next group dynamically
export function getNextGroup() {
  const nextGroupId = (state.currentGroup % state.groups.length) + 1;
  return state.groups.find(g => g.id === nextGroupId);
}

// Rotate to next group
export function handleTaskComplete() {
  const nextGroup = getNextGroup();
  const completionRecord = {
    group: state.currentGroup,
    date: new Date().toLocaleString(),
    completedBy: 'Admin'
  };

  state.history = [completionRecord, ...state.history.slice(0, 9)];
  state.currentGroup = nextGroup.id;

  const memberNames = nextGroup.members.length > 0
    ? nextGroup.members.join(', ')
    : nextGroup.name;

  showToast(`Rotation complete! Next duty: ${nextGroup.name}`, 'success');
  saveState();
}
**/