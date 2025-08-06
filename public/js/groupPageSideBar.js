// File: public/js/groupPageSideBar.js

import { getCurrentUser, setGroupInfo, getGroupInfo } from './groupPage.js';

const profileEl = document.getElementById('group-profile');
const actionsEl = document.getElementById('group-actions');

export async function loadGroupSidebar(groupId) {
  const res = await fetch(`/api/groups/${groupId}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load group data');
  const group = await res.json();
  setGroupInfo(group);
  renderGroupProfile(group);
  renderActionButtons();
}

function renderGroupProfile(group) {
  profileEl.innerHTML = `
    <div class="card shadow-sm">
      <div class="card-body">
        <h4 class="mb-2">${group.name}</h4>
        <p class="text-muted mb-0">${group.description || ''}</p>
      </div>
    </div>`;
}

export function renderActionButtons() {
  const user = getCurrentUser();
  const group = getGroupInfo();

  if (!actionsEl) return;

  if (!user) {
    actionsEl.innerHTML = `
      <a href="/login" class="btn btn-outline-primary">Login to Join</a>
    `;
    return;
  }

   // Determine admin ID (handle both populated object or raw ID)
  const adminId = group.admin && group.admin._id ? String(group.admin._id) : String(group.admin);
  console.log('adminId', adminId)

  console.log('current user', String(user._id))
  console.log('group admin', String(group.admin))

  // Admin
  if (String(user._id) === adminId) {
    actionsEl.innerHTML = `
      <button id="editGroupBtn" class="btn btn-outline-secondary me-2">
        <i class="fas fa-edit me-1"></i>Edit Group
      </button>
      <button id="manageMembersBtn" class="btn btn-outline-info">
        <i class="fas fa-users me-1"></i>Manage Members
      </button>
    `;
    return;
  }

  // Member?
  const isMember = Array.isArray(group.members) &&
    group.members.some(id => String(id) === String(user._id));

  if (isMember) {
    actionsEl.innerHTML = `
      <button id="leaveGroupBtn" class="btn btn-warning">
        <i class="fas fa-sign-out-alt me-1"></i>Leave Group
      </button>
    `;
  } else {
    actionsEl.innerHTML = `
      <button id="joinGroupBtn" class="btn btn-success">
        <i class="fas fa-sign-in-alt me-1"></i>Join Group
      </button>
    `;
  }
}

export function initGroupSidebarEvents(groupId) {
  actionsEl.addEventListener('click', async e => {
    const user = getCurrentUser();
    if (!user) return window.location.href = '/login';

    if (e.target.id === 'joinGroupBtn' || e.target.closest('#joinGroupBtn')) {
      await handleJoinLeave('add', groupId);
    }
    if (e.target.id === 'leaveGroupBtn' || e.target.closest('#leaveGroupBtn')) {
      await handleJoinLeave('remove', groupId);
    }
    if (e.target.id === 'editGroupBtn') {
      // TODO: open edit modal
    }
    if (e.target.id === 'manageMembersBtn') {
      // TODO: open manage members modal
    }
  });
}

async function handleJoinLeave(action, groupId) {
  const btnId = action === 'add' ? 'joinGroupBtn' : 'leaveGroupBtn';
  const btn = document.getElementById(btnId);
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i>Processing...`;

  try {
    const endpoint = `/api/groups/${groupId}/members`;
    const options = {
      method: action === 'add' ? 'POST' : 'DELETE',
      credentials: 'include',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ userId: getCurrentUser()._id })
    };
    const res = await fetch(endpoint, options);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Request failed');
    }

    // Update local state
    const group = getGroupInfo();
    if (action === 'add') {
      group.members = group.members || [];
      group.members.push(getCurrentUser()._id);
    } else {
      group.members = (group.members || [])
        .filter(id => String(id) !== String(getCurrentUser()._id));
    }
    setGroupInfo(group);

    // Re-render buttons
    renderActionButtons();

  } catch (err) {
    console.error('Group join/leave error:', err);
    alert('Error: ' + err.message);
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}
