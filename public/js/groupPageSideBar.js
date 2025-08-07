// File: public/js/groupPageSideBar.js

import { getCurrentUser, setGroupInfo, getGroupInfo } from './groupPage.js';

const profileEl = document.getElementById('group-profile');
const actionsEl = document.getElementById('group-actions');
let membersListEl = null;

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

  if (group.isDeleted) {
    actionsEl.innerHTML = `
      <div class="alert alert-warning">
        This group has been deleted.
      </div>`;
    return;
  }
  
  if (!actionsEl) return;

  // clear any member list
  if (membersListEl) membersListEl.remove();

  if (!user) {
    actionsEl.innerHTML = `
      <a href="/login" class="btn btn-outline-primary">Login to Join</a>
    `;
    return;
  }

   // Determine admin ID (handle both populated object or raw ID)
  const adminId = group.admin && group.admin._id ? String(group.admin._id) : String(group.admin);

  // Admin
  if (String(user._id) === adminId) {
    actionsEl.innerHTML = `
      <button id="editGroupBtn" class="btn btn-outline-secondary me-2">
        <i class="fas fa-edit me-1"></i>Edit Group
      </button>
      <button id="manageMembersBtn" class="btn btn-outline-info me-2">
        <i class="fas fa-users me-1"></i>Manage Members
      </button>
      <button id="deleteGroupBtn" class="btn btn-outline-danger">
        <i class="fas fa-trash me-1"></i>Delete Group
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
      await showEditGroupModal(groupId);
    }
    if (e.target.id === 'manageMembersBtn') {
       await showManageMembers(groupId);
    }
    if (e.target.id === 'deleteGroupBtn') {
      await handleDeleteGroup(groupId);
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

async function showManageMembers(groupId) {
  // Toggle close if already open
  if (membersListEl) {
    membersListEl.remove();
    membersListEl = null;
    return;
  }

  const group = getGroupInfo();
  const adminId = group.admin && group.admin._id ? String(group.admin._id) : String(group.admin);

  // Create members list UI
  membersListEl = document.createElement('div');
  membersListEl.className = 'card mt-3 p-3';
  membersListEl.innerHTML = '<h6>Members</h6>';

  const list = document.createElement('ul');
  list.className = 'list-group';

  // Only non-admin members
  const membersToShow = group.members.filter(id => String(id) !== adminId);

  membersToShow.forEach(memberObj => {
    const id = String(memberObj._id || memberObj);
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = 'Loading...';
    fetch(`/api/users/${id}`, { credentials:'include' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(user => {
        li.innerHTML = `
          <span>${user.username}</span>
          <button class="btn btn-sm btn-danger remove-member-btn" data-id="${user._id}">
            <i class="fas fa-trash-alt"></i>
          </button>`;
      })
      .catch(() => { li.textContent = 'Error loading'; });
    list.appendChild(li);
  });

  membersListEl.appendChild(list);
  actionsEl.after(membersListEl);

  // Delegate remove clicks
  membersListEl.addEventListener('click', async e => {
    const removeBtn = e.target.closest('.remove-member-btn');
    if (!removeBtn) return;
    const memberId = removeBtn.dataset.id;
    if (!confirm('Remove this member?')) return;
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ userId: memberId })
      });
      if (!res.ok) throw new Error();
      // update UI
      removeBtn.closest('li').remove();
      const grp = getGroupInfo();
      grp.members = grp.members.filter(id => String(id)!==memberId);
      setGroupInfo(grp);
      renderActionButtons();
    } catch {
      alert('Failed to remove member');
    }
  });
}


function showEditGroupModal(groupId) {
  const group = getGroupInfo();
  // Create modal container
  let modal = document.getElementById('editGroupModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'editGroupModal';
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Group</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input id="editGroupName" class="form-control" value="${group.name}" />
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea id="editGroupDesc" class="form-control" rows="3">${group.description || ''}</textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button id="saveGroupBtn" class="btn btn-primary">Save</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    // init Bootstrap modal
  }
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  // Save handler
  document.getElementById('saveGroupBtn').onclick = async () => {
    const name = document.getElementById('editGroupName').value.trim();
    const desc = document.getElementById('editGroupDesc').value.trim();
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'PUT', credentials: 'include',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ name, description: desc })
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setGroupInfo(updated);
      renderGroupProfile(updated);
      renderActionButtons();
      bsModal.hide();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };
}

async function handleDeleteGroup(groupId) {
  if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
  try {
    const res = await fetch(`/api/groups/${groupId}`, {
      method: 'DELETE',
      credentials:'include'
    });
    if (!res.ok) throw new Error('Delete failed');
    window.location.href = '/feed';
  } catch (err) {
    alert('Error deleting group: ' + err.message);
  }
}
