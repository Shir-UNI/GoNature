import { getCurrentUser, setCurrentUser, getGroupInfo, setGroupInfo } from './groupPage.js';

// load group side bar by currentuser
export const loadGroupSidebar = async (groupId) => {
  // check the current user
  try {
    const meRes = await fetch('/api/users/me', { credentials: 'include' });
    if (meRes.ok) setCurrentUser(await meRes.json());
  } catch (e) {
    console.error('Could not load current user', e);
  }

  // load the group details
  const grpRes = await fetch(`/api/groups/${groupId}`, { credentials: 'include' });
  if (!grpRes.ok) throw new Error('Failed to load group info');
  const group = await grpRes.json();
  setGroupInfo(group);

  // render profile
  document.getElementById('group-profile').innerHTML = `
    <div class="card shadow-sm">
      <div class="card-body">
        <h2 class="mb-1">${group.name}</h2>
        ${group.description ? `<p class="text-muted">${group.description}</p>` : ''}
      </div>
    </div>
  `;

  updateGroupActionButtons();
};

// Show action button by permission
export const updateGroupActionButtons = () => {
  const user = getCurrentUser();
  const group = getGroupInfo();
  const container = document.getElementById('group-actions');
  container.innerHTML = '';

  if (!user) {
    container.innerHTML = `<a href="/login" class="btn btn-outline-primary">Login to Join</a>`;
    return;
  }

  const isAdmin = group.admin._id === user._id;
  const isMember = group.members.some(m => m._id === user._id);

  if (isAdmin) {
    container.innerHTML = `
      <button id="editGroupBtn" class="btn btn-outline-primary me-2">Edit Group</button>
      <button id="manageMembersBtn" class="btn btn-outline-danger">Manage Members</button>
    `;
  } else {
    container.innerHTML = isMember
      ? `<button id="leaveGroupBtn" class="btn btn-secondary">Leave Group</button>`
      : `<button id="joinGroupBtn" class="btn btn-outline-success">Join Group</button>`;
  }
};

// Listen to click events
export const initGroupSidebarEvents = (groupId) => {
  document.addEventListener('click', async (e) => {
    const user = getCurrentUser();
    if (e.target.id === 'joinGroupBtn') {
      await fetch(`/api/groups/${groupId}/join`, { method: 'POST', credentials: 'include' });
      user.groups.push(groupId);
      updateGroupActionButtons();
    }
    if (e.target.id === 'leaveGroupBtn') {
      await fetch(`/api/groups/${groupId}/leave`, { method: 'POST', credentials: 'include' });
      user.groups = user.groups.filter(id => id !== groupId);
      updateGroupActionButtons();
    }
    if (e.target.id === 'editGroupBtn') {
      // TODO: show edit modal
    }
    if (e.target.id === 'manageMembersBtn') {
      // TODO: show manage-members modal
    }
  });
};
